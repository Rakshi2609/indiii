import logging
import os
import math
from pathlib import Path
from typing import Any, Dict, Tuple, Optional, List
import cv2
import numpy as np
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

class DocumentImagePipeline:
    """
    Production-grade pipeline for assessing document image quality and
    applying adaptive computer vision preprocessing filters using OpenCV.
    """

    def load_document_as_image(self, file_path: str, page_num: int = 0) -> Tuple[np.ndarray, Optional[str]]:
        """
        Load a document (PDF or Image) into a NumPy BGR image.
        Returns: (image_numpy_array, error_message_or_none)
        """
        path = Path(file_path)
        if not path.exists():
            return np.zeros((100, 100, 3), dtype=np.uint8), "File not found"

        suffix = path.suffix.lower()
        try:
            if suffix == ".pdf":
                # Extract first page using PyMuPDF
                doc = fitz.open(str(path))
                if len(doc) == 0:
                    return np.zeros((100, 100, 3), dtype=np.uint8), "Empty PDF"
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                img_data = pix.tobytes("png")
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                return img, None
            else:
                # Load image directly via OpenCV
                img = cv2.imread(str(path), cv2.IMREAD_COLOR)
                if img is None:
                    return np.zeros((100, 100, 3), dtype=np.uint8), "Failed to read image via OpenCV"
                return img, None
        except Exception as e:
            logger.error(f"Error loading document as image {file_path}: {e}")
            return np.zeros((100, 100, 3), dtype=np.uint8), f"Loading error: {str(e)}"

    def assess_quality(self, img: np.ndarray) -> Dict[str, Any]:
        """
        Calculate measurable signal scores from the document image and classify quality:
        - blur_score / sharpness (Laplacian variance)
        - contrast_score (std dev of gray levels)
        - brightness_score (mean of gray levels)
        - noise_level (variance of difference between image and blurred version)
        - resolution (width, height, area)
        - skew_angle (in degrees)
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape[:2]

        # 1. Blur score & Sharpness (Variance of Laplacian)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        blur_score = float(laplacian.var())

        # 2. Contrast score (Standard deviation of pixel intensities normalized to [0, 1])
        contrast_score = float(np.std(gray) / 255.0)

        # 3. Brightness score (Mean intensity normalized to [0, 1])
        brightness_score = float(np.mean(gray) / 255.0)

        # 4. Noise estimation
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        noise_level = float(np.std(gray.astype(np.float64) - blurred.astype(np.float64)) / 255.0)

        # 5. Skew detection using Hough Lines
        skew_angle = self._detect_skew_angle(gray)

        # Determine if resolution is acceptable (e.g., at least 1 megapixel)
        resolution_ok = bool((h * w) >= 800000)

        # Determine perspective distortion (simple aspect ratio check or corner detection heuristic)
        # Here we check if the image has normal bounds
        perspective_distortion = False
        if w > 0 and h > 0:
            aspect_ratio = float(w) / float(h)
            if aspect_ratio < 0.2 or aspect_ratio > 5.0:
                perspective_distortion = True

        # Classify the document quality based on multiple signals
        # Good threshold: blur > 120, contrast > 0.15, brightness in [0.35, 0.85]
        # Critical threshold: blur < 20, contrast < 0.05
        if blur_score < 20 or contrast_score < 0.05 or (h * w) < 200000:
            quality = "CRITICAL"
        elif blur_score < 70 or contrast_score < 0.10:
            quality = "POOR"
        elif blur_score < 130 or contrast_score < 0.15 or brightness_score < 0.25 or brightness_score > 0.90:
            quality = "FAIR"
        else:
            quality = "GOOD"

        return {
            "quality": quality,
            "blur_score": round(blur_score, 2),
            "contrast_score": round(contrast_score, 3),
            "brightness_score": round(brightness_score, 3),
            "noise_level": round(noise_level, 4),
            "width": w,
            "height": h,
            "resolution_ok": resolution_ok,
            "skew_detected": abs(skew_angle) > 0.5,
            "skew_angle": round(skew_angle, 2),
            "perspective_distortion": perspective_distortion,
            "crop_quality": "GOOD" if not perspective_distortion else "POOR"
        }

    def _detect_skew_angle(self, gray: np.ndarray) -> float:
        """Helper to compute skew angle in degrees using Radon/Hough-based text alignment."""
        try:
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
            if lines is None:
                return 0.0

            angles = []
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
                # We focus on near horizontal lines (-45 to 45 deg)
                if -45 < angle < 45:
                    angles.append(angle)
                elif angle > 45:
                    angles.append(angle - 90)
                elif angle < -45:
                    angles.append(angle + 90)

            if not angles:
                return 0.0
            return float(np.median(angles))
        except Exception:
            return 0.0

    def preprocess_image(self, img: np.ndarray, quality_metrics: Dict[str, Any]) -> Tuple[np.ndarray, List[str]]:
        """
        Apply adaptive preprocessing filters based on detected document image conditions.
        Returns: (preprocessed_image, list_of_applied_filters)
        """
        processed = img.copy()
        applied_filters = []

        # 1. Grayscale Conversion
        if len(processed.shape) == 3:
            gray = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
        else:
            gray = processed.copy()

        # 2. Deskew if needed
        skew_angle = quality_metrics.get("skew_angle", 0.0)
        if abs(skew_angle) > 0.5:
            gray = self._rotate_image(gray, skew_angle)
            applied_filters.append(f"deskew_{skew_angle}deg")

        # 3. Denoising if noise is high
        noise = quality_metrics.get("noise_level", 0.0)
        if noise > 0.03:
            gray = cv2.fastNlMeansDenoising(gray, None, h=3, templateWindowSize=7, searchWindowSize=21)
            applied_filters.append("fast_nl_means_denoising")

        # 4. Contrast Enhancement / CLAHE
        contrast = quality_metrics.get("contrast_score", 1.0)
        if contrast < 0.15:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)
            applied_filters.append("clahe_contrast_enhancement")

        # 5. Sharpening if blurry
        blur = quality_metrics.get("blur_score", 200.0)
        if blur < 100:
            kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            gray = cv2.filter2D(gray, -1, kernel)
            applied_filters.append("laplacian_sharpening")

        # Convert back to BGR for standard rendering/OCR consumption
        processed = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

        return processed, applied_filters

    def _rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        """Rotate image by the given angle around its center."""
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated

    def process_file(self, file_path: str) -> Tuple[Dict[str, Any], str, List[str]]:
        """
        High-level pipeline method: load file, assess quality, apply preprocessing, and write back.
        Returns: (quality_metrics, path_to_processed_image, applied_filters)
        """
        img, err = self.load_document_as_image(file_path)
        if err:
            raise ValueError(f"Failed to load file: {err}")

        metrics = self.assess_quality(img)
        processed, filters = self.preprocess_image(img, metrics)

        # Save the preprocessed image into a temp file/processed location
        path = Path(file_path)
        processed_filename = f"processed_{path.stem}.png"
        processed_path = path.parent / processed_filename
        
        cv2.imwrite(str(processed_path), processed)

        return metrics, str(processed_path), filters

# Singleton instance
document_image_pipeline = DocumentImagePipeline()
