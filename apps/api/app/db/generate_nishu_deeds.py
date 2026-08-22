import os
import json
import logging
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

# Output directories
WEB_SAMPLE_DIR = "/home/appu/sih26/apps/web/public/sample/deeds"
API_UPLOADS_DIR = "/home/appu/sih26/apps/api/data/uploads"

os.makedirs(WEB_SAMPLE_DIR, exist_ok=True)
os.makedirs(API_UPLOADS_DIR, exist_ok=True)

NISHU_DEEDS_CONFIG = [
    # 1. Karnataka - Devanahalli
    {
        "filename": "Karnataka_RTC_Pahani_Nishu_Kumar_88_3A.jpg",
        "state": "Karnataka",
        "state_indic": "ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಕಂದಾಯ ಇಲಾಖೆ",
        "title_indic": "ಪಹಣಿ / Record of Rights, Tenancy and Crops (RTC - Form 16)",
        "district": "Bengaluru Rural",
        "taluk": "Devanahalli",
        "village": "Devanahalli Kasaba",
        "survey_number": "88/3A",
        "hissa_number": "3A",
        "area_acres": "2.60",
        "area_ha": 1.052,
        "land_tenure": "Agricultural (Dry/Khushki)",
        "owner_name": "Nishu Kumar",
        "owner_indic": "ನಿಷು ಕುಮಾರ್",
        "khata_number": "KH-8841",
        "mutation": "MR-2022-891 (Succession / ವಾರಸುದಾರಿಕೆ)",
        "encumbrance": "State Bank of India KCC Loan (₹3,50,000)",
        "tax": "₹ 145.50",
        "seal_officer": "Tahsildar, Devanahalli Taluk",
        "discrepancy": False
    },
    # 2. Karnataka - Nandagudi
    {
        "filename": "Karnataka_RTC_Pahani_Nishu_Kumar_104_1.jpg",
        "state": "Karnataka",
        "state_indic": "ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಭೂ ಕಂದಾಯ",
        "title_indic": "ಭೂಮಿ ಪಹಣಿ ಪ್ರಮಾಣಪತ್ರ (Bhoomi Digitized RTC Pahani)",
        "district": "Bengaluru Rural",
        "taluk": "Hosakote",
        "village": "Nandagudi",
        "survey_number": "104/1",
        "hissa_number": "1",
        "area_acres": "2.00",
        "area_ha": 0.809,
        "land_tenure": "Agricultural Freehold",
        "owner_name": "Nishu Kumar",
        "owner_indic": "ನಿಷು ಕುಮಾರ್",
        "khata_number": "KH-4102",
        "mutation": "MR-2023-112 (Allotment / ಮಂಜೂರಾತಿ)",
        "encumbrance": "NIL (Clear Title)",
        "tax": "₹ 110.00",
        "seal_officer": "Deputy Tahsildar, Hosakote",
        "discrepancy": False
    },
    # 3. Karnataka - Nelamangala
    {
        "filename": "Karnataka_Mutation_Extract_Nishu_Kumar_215_2.jpg",
        "state": "Karnataka",
        "state_indic": "ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ನಮೂನೆ ೧೨",
        "title_indic": "ಮ್ಯುಟೇಶನ್ ರಿಜಿಸ್ಟರ್ ಸಾರಾಂಶ (Mutation Register Extract)",
        "district": "Bengaluru Rural",
        "taluk": "Nelamangala",
        "village": "Doddabele",
        "survey_number": "215/2",
        "hissa_number": "2",
        "area_acres": "1.50",
        "area_ha": 0.607,
        "land_tenure": "Dry Agriculture",
        "owner_name": "Nishu Kumar",
        "owner_indic": "ನಿಷು ಕುಮಾರ್",
        "khata_number": "KH-9023",
        "mutation": "MR-2021-440 (Family Settlement / ಭಾಗಪತ್ರ)",
        "encumbrance": "NIL (Clear Title)",
        "tax": "₹ 95.00",
        "seal_officer": "Revenue Inspector, Nelamangala Circle",
        "discrepancy": False
    },
    # 4. Telangana - Shamshabad (Discrepancy)
    {
        "filename": "Telangana_Dharani_Passbook_Nishu_Kumar_156_AA.jpg",
        "state": "Telangana",
        "state_indic": "తెలంగాణ ప్రభుత్వం - రెవెన్యూ శాఖ",
        "title_indic": "ధరణి పట్టాదారు పాసుపుస్తకం (Dharani Pattadar Passbook - Title Deed)",
        "district": "Rangareddy",
        "taluk": "Shamshabad",
        "village": "Gollapally",
        "survey_number": "156/AA",
        "hissa_number": "AA",
        "area_acres": "2.31",
        "area_ha": 0.935,
        "land_tenure": "Pattadar Freehold (ధరణి)",
        "owner_name": "Nishu Kumar",
        "owner_indic": "నిషు కుమార్",
        "khata_number": "DH-55219",
        "mutation": "DH-2023-401 (Dharani Title Deed)",
        "encumbrance": "NIL (Unencumbered)",
        "tax": "₹ 215.00",
        "seal_officer": "Joint Sub-Registrar / Tahsildar, Shamshabad",
        "discrepancy": True  # 10.39% Cadastral GIS Area Discrepancy (0.838 Ha GIS vs 0.935 Ha Deed)
    },
    # 5. Telangana - Maheshwaram
    {
        "filename": "Telangana_Sale_Deed_Nishu_Kumar_78_B.jpg",
        "state": "Telangana",
        "state_indic": "తెలంగాణ ప్రభుత్వం - రిజిస్ట్రేషన్ శాఖ",
        "title_indic": "రిజిస్టర్డ్ సేల్ డీడ్ (Registered Absolute Sale Deed)",
        "district": "Rangareddy",
        "taluk": "Maheshwaram",
        "village": "Mankhal",
        "survey_number": "78/B",
        "hissa_number": "B",
        "area_acres": "1.80",
        "area_ha": 0.728,
        "land_tenure": "Pattadar Land",
        "owner_name": "Nishu Kumar",
        "owner_indic": "నిషు కుమార్",
        "khata_number": "DH-10492",
        "mutation": "TS-ROR-2022-771",
        "encumbrance": "NIL (Unencumbered)",
        "tax": "₹ 160.00",
        "seal_officer": "Sub-Registrar, Maheshwaram",
        "discrepancy": False
    },
    # 6. Andhra Pradesh - Tenali
    {
        "filename": "Andhra_MeeSeva_Adangal_Nishu_Kumar_412_3.jpg",
        "state": "Andhra Pradesh",
        "state_indic": "ఆంధ్రప్రదేశ్ ప్రభుత్వం - మీసేవ",
        "title_indic": "గ్రామ లెక్కల అడంగల్ / పహణీ (MeeSeva Digitized Adangal / Pahani)",
        "district": "Guntur",
        "taluk": "Tenali",
        "village": "Angalakuduru",
        "survey_number": "412/3",
        "hissa_number": "3",
        "area_acres": "1.23",
        "area_ha": 0.500,
        "land_tenure": "Ryotwari Patta",
        "owner_name": "Nishu Kumar",
        "owner_indic": "నిషు కుమార్",
        "khata_number": "AP-7718",
        "mutation": "AP-MUT-984 (Sale Deed Transfer)",
        "encumbrance": "NIL (Clear Title)",
        "tax": "₹ 120.00",
        "seal_officer": "Village Revenue Officer (VRO), Tenali",
        "discrepancy": False
    },
    # 7. Andhra Pradesh - Visakhapatnam
    {
        "filename": "Andhra_Registered_Deed_Nishu_Kumar_189_1A.jpg",
        "state": "Andhra Pradesh",
        "state_indic": "ఆంధ్రప్రదేశ్ ప్రభుత్వం - రిజిస్ట్రేషన్ మరియు స్టాంపుల శాఖ",
        "title_indic": "విక్రయ దస్తావేజు (Vikraya Dastaaveju / Conveyance Sale Deed)",
        "district": "Visakhapatnam",
        "taluk": "Anandapuram",
        "village": "Vemulavalasa",
        "survey_number": "189/1A",
        "hissa_number": "1A",
        "area_acres": "1.00",
        "area_ha": 0.405,
        "land_tenure": "Freehold Agricultural",
        "owner_name": "Nishu Kumar",
        "owner_indic": "నిషు కుమార్",
        "khata_number": "AP-3091",
        "mutation": "AP-MUT-2022-1204",
        "encumbrance": "NIL (Title Certified Clear)",
        "tax": "₹ 95.00",
        "seal_officer": "Sub-Registrar, Anandapuram",
        "discrepancy": False
    },
    # 8. Tamil Nadu - Medavakkam
    {
        "filename": "TamilNadu_Patta_Chitta_Nishu_Kumar_204_5B.jpg",
        "state": "Tamil Nadu",
        "state_indic": "தமிழ்நாடு அரசு - வருவாய்த்துறை",
        "title_indic": "பட்டா / சிட்டா சான்றிதழ் (e-Sevai Patta Chitta Extract - Form VII)",
        "district": "Chengalpattu",
        "taluk": "Tambaram",
        "village": "Medavakkam",
        "survey_number": "204/5B",
        "hissa_number": "5B",
        "area_acres": "0.31",
        "area_ha": 0.125,
        "land_tenure": "Natham Patta (நஞ்சை)",
        "owner_name": "Nishu Kumar",
        "owner_indic": "நிஷு குமார்",
        "khata_number": "TN-PATTA-662",
        "mutation": "TN-PAT-1845 (e-Patta Transfer)",
        "encumbrance": "NIL (Encumbrance Free)",
        "tax": "₹ 55.00",
        "seal_officer": "Zonal Deputy Tahsildar, Tambaram",
        "discrepancy": False
    },
    # 9. Maharashtra - Wagholi 142/2B (Discrepancy)
    {
        "filename": "Maharashtra_7_12_Satbara_Nishu_Kumar_142_2B.jpg",
        "state": "Maharashtra",
        "state_indic": "महाराष्ट्र शासन - महसूल व वन विभाग",
        "title_indic": "गाव नमुना सात-बारा (7/12 Satbara Extract - अधिकार अभिलेख पत्रक)",
        "district": "Pune",
        "taluk": "Haveli",
        "village": "Wagholi",
        "survey_number": "142/2B",
        "hissa_number": "2B",
        "gat_number": "142",
        "area_acres": "3.71",
        "area_ha": 1.500,
        "land_tenure": "Occupant Class 1 (भोगवटादार वर्ग १)",
        "owner_name": "Nishu Kumar",
        "owner_indic": "निषु कुमार व रमेश पाटील",
        "khata_number": "KH-842",
        "mutation": "फेरफार क्र. ४५१२ (बँक बोजा व वारसा)",
        "encumbrance": "Bank of Maharashtra Mortgage (₹5,00,000)",
        "tax": "₹ 210.00",
        "seal_officer": "तलाठी, सज्जा वाघोली / मंडल अधिकारी हवेली",
        "discrepancy": True  # 8.7% Cadastral GIS Area Discrepancy (1.380 Ha GIS vs 1.500 Ha Deed)
    },
    # 10. Maharashtra - Wagholi 94/1
    {
        "filename": "Maharashtra_Sale_Deed_Nishu_Kumar_94_1.jpg",
        "state": "Maharashtra",
        "state_indic": "महाराष्ट्र शासन - नोंदणी व मुद्रांक विभाग",
        "title_indic": "नोंदणीकृत खरेदीखत (Registered Sale Deed Document)",
        "district": "Pune",
        "taluk": "Haveli",
        "village": "Wagholi",
        "survey_number": "94/1",
        "hissa_number": "1",
        "gat_number": "94",
        "area_acres": "0.55",
        "area_ha": 0.223,
        "land_tenure": "Non-Agricultural Residential Freehold",
        "owner_name": "Nishu Kumar",
        "owner_indic": "निषु कुमार",
        "khata_number": "KH-1904",
        "mutation": "REG-10492-2023 (खरेदी नोंद)",
        "encumbrance": "NIL (बिन बोजा / Clear)",
        "tax": "₹ 150.00",
        "seal_officer": "दुय्यम निबंधक वर्ग-२, हवेली क्र. १२",
        "discrepancy": False
    }
]


def generate_deed_image(config: dict) -> str:
    """Generate a crisp, authentic Indian revenue deed scan with stamps and official seals."""
    width, height = 1200, 1650
    # Antique off-white parchment paper tone
    img = Image.new("RGB", (width, height), color=(253, 252, 248))
    draw = ImageDraw.Draw(img)

    # 1. Outer Double Security Border
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(30, 41, 59), width=4)
    draw.rectangle([(28, 28), (width - 28, height - 28)], outline=(148, 163, 184), width=1)

    # Corner security florets
    for cx, cy in [(35, 35), (width - 35, 35), (35, height - 35), (width - 35, height - 35)]:
        draw.rectangle([(cx - 8, cy - 8), (cx + 8, cy + 8)], outline=(71, 85, 105), width=2)

    # 2. Header Emblem Banner
    draw.rectangle([(40, 40), (width - 40, 190)], fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    
    # State Emblem Placeholder Stamp
    draw.ellipse([(60, 55), (170, 165)], outline=(15, 23, 42), width=3)
    draw.ellipse([(70, 65), (160, 155)], outline=(79, 70, 229), width=2)
    draw.text((115, 95), "सत्यमेव\nजयते", fill=(30, 41, 59), anchor="mm", font=None)

    # State & Government Heading
    draw.text((width // 2, 70), f"GOVERNMENT OF {config['state'].upper()}", fill=(15, 23, 42), anchor="mm", font=None)
    draw.text((width // 2, 100), config["state_indic"], fill=(51, 65, 85), anchor="mm", font=None)
    draw.text((width // 2, 135), config["title_indic"], fill=(67, 56, 202), anchor="mm", font=None)
    draw.text((width // 2, 165), "DIGITAL INDIA LAND RECORDS MODERNIZATION PROGRAMME (DILRMP)", fill=(100, 116, 139), anchor="mm", font=None)

    # Right Security Barcode Box
    draw.rectangle([(width - 180, 55), (width - 60, 165)], fill=(255, 255, 255), outline=(203, 213, 225), width=1)
    for bx in range(width - 170, width - 70, 4):
        draw.line([(bx, 65), (bx, 135)], fill=(15, 23, 42), width=2 if bx % 8 == 0 else 1)
    draw.text((width - 120, 150), f"{config['khata_number']}", fill=(71, 85, 105), anchor="mm", font=None)

    # 3. Location Metadata Grid
    draw.rectangle([(40, 210), (width - 40, 310)], fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    
    col1_x, col2_x, col3_x, col4_x = 60, 360, 660, 960
    y_row1, y_row2 = 235, 275

    draw.text((col1_x, y_row1), f"District: {config['district']}", fill=(15, 23, 42), font=None)
    draw.text((col2_x, y_row1), f"Taluk / Tehsil: {config['taluk']}", fill=(15, 23, 42), font=None)
    draw.text((col3_x, y_row1), f"Village: {config['village']}", fill=(15, 23, 42), font=None)
    draw.text((col4_x, y_row1), f"State: {config['state']}", fill=(15, 23, 42), font=None)

    draw.text((col1_x, y_row2), f"Survey No: {config['survey_number']}", fill=(67, 56, 202), font=None)
    draw.text((col2_x, y_row2), f"Hissa / Gat: {config['hissa_number']}", fill=(15, 23, 42), font=None)
    draw.text((col3_x, y_row2), f"Khata No: {config['khata_number']}", fill=(15, 23, 42), font=None)
    draw.text((col4_x, y_row2), f"Land Assessment: {config['tax']}", fill=(16, 185, 129), font=None)

    # 4. Primary Cadastral Ownership Table
    table_top = 330
    draw.rectangle([(40, table_top), (width - 40, 720)], outline=(15, 23, 42), width=2)
    
    # Header Row
    draw.rectangle([(40, table_top), (width - 40, table_top + 45)], fill=(224, 231, 255), outline=(15, 23, 42), width=2)
    headers = [
        (40, 160, "Survey / Hissa"),
        (160, 480, "Recorded Titleholder Name"),
        (480, 680, "Total Area (Extent)"),
        (680, 920, "Land Class & Tenure"),
        (920, width - 40, "Mutation / Succession Entry")
    ]
    for x1, x2, htext in headers:
        draw.line([(x1, table_top), (x1, 720)], fill=(15, 23, 42), width=1)
        draw.text(((x1 + x2) // 2, table_top + 22), htext, fill=(15, 23, 42), anchor="mm", font=None)

    # Main Row 1 (Nishu Kumar)
    r1_y = table_top + 55
    draw.text((100, r1_y + 35), config['survey_number'], fill=(15, 23, 42), anchor="mm", font=None)
    
    # Prominent Owner Text
    draw.text((320, r1_y + 20), f"1. {config['owner_name']} (100% Share)", fill=(15, 23, 42), anchor="mm", font=None)
    draw.text((320, r1_y + 45), f"({config['owner_indic']})", fill=(67, 56, 202), anchor="mm", font=None)
    draw.text((320, r1_y + 70), "Self-Acquired / Ancestral Possession", fill=(100, 116, 139), anchor="mm", font=None)

    draw.text((580, r1_y + 25), f"{config['area_acres']} Acres", fill=(5, 150, 105), anchor="mm", font=None)
    draw.text((580, r1_y + 55), f"({config['area_ha']} Hectares)", fill=(100, 116, 139), anchor="mm", font=None)

    draw.text((800, r1_y + 35), config['land_tenure'], fill=(15, 23, 42), anchor="mm", font=None)

    draw.text((1050, r1_y + 35), config['mutation'], fill=(15, 23, 42), anchor="mm", font=None)

    # Divider lines
    draw.line([(40, table_top + 160), (width - 40, table_top + 160)], fill=(203, 213, 225), width=1)
    
    # 5. Encumbrance & Mortgage Details Section
    draw.rectangle([(40, 740), (width - 40, 890)], fill=(248, 250, 252), outline=(203, 213, 225), width=1)
    draw.rectangle([(40, 740), (width - 40, 775)], fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    draw.text((60, 757), "ENCUMBRANCE / MORTGAGE / LIEN REGISTER (इतर हक्क व बोजा)", fill=(15, 23, 42), font=None)

    draw.text((60, 800), f"Financial Liability / Bank Charge: {config['encumbrance']}", fill=(185, 28, 28) if "Lien" in config['encumbrance'] or "₹" in config['encumbrance'] else (16, 185, 129), font=None)
    draw.text((60, 835), "Sub-Registrar Index-II Entry: Digitally Cross-Verified under Central Revenue Database.", fill=(71, 85, 105), font=None)
    draw.text((60, 865), f"Verification Timestamp: 2026-08-22 10:30:00 IST • DILRMP Digital Certificate #CERT-{config['khata_number']}", fill=(100, 116, 139), font=None)

    # 6. Physical Boundary Measurements (Chauhad / Four Boundaries)
    draw.rectangle([(40, 910), (width - 40, 1080)], fill=(255, 255, 255), outline=(203, 213, 225), width=1)
    draw.rectangle([(40, 910), (width - 40, 945)], fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    draw.text((60, 927), "CADASTRAL SPATIAL BOUNDARIES (चतुःसीमा / Four Boundaries)", fill=(15, 23, 42), font=None)

    draw.text((60, 970), f"• North (उत्तर): Survey {config['survey_number']} Adjacent (Gram Panchayat Road)", fill=(51, 65, 85), font=None)
    draw.text((60, 1000), f"• South (दक्षिण): Survey Boundary (Irrigation Canal Channel)", fill=(51, 65, 85), font=None)
    draw.text((60, 1030), f"• East (पूर्व): Survey {config['survey_number']} Sub-division remaining portion", fill=(51, 65, 85), font=None)
    draw.text((60, 1060), "• West (पश्चिम): State Highway Revenue Boundary", fill=(51, 65, 85), font=None)

    # 7. AI Verification Stamp & Discrepancy Callout
    stamp_y = 1110
    if config["discrepancy"]:
        draw.rectangle([(40, stamp_y), (width - 40, stamp_y + 110)], fill=(254, 243, 199), outline=(245, 158, 11), width=2)
        draw.text((60, stamp_y + 25), "⚠ REVENUE WARNING: CADASTRAL GIS AREA MISMATCH FLAGGED (>5% VARIANCE)", fill=(180, 83, 9), font=None)
        draw.text((60, stamp_y + 55), "The physical satellite polygon on ground calculates to a deviation from deed.", fill=(146, 64, 14), font=None)
        draw.text((60, stamp_y + 85), "Status: Marked for Field Survey Joint Inspection by Tehsildar & DILRMP Officer.", fill=(180, 83, 9), font=None)
    else:
        draw.rectangle([(40, stamp_y), (width - 40, stamp_y + 110)], fill=(236, 253, 245), outline=(16, 185, 129), width=2)
        draw.text((60, stamp_y + 25), "✓ STATUTORILY AUTHENTICATED: LAND AI CADASTRAL VERIFICATION CLEAR", fill=(4, 120, 87), font=None)
        draw.text((60, stamp_y + 55), "Ground Satellite Cadastral Polygon matches deed dimensions with 98.4% geometric confidence.", fill=(6, 95, 70), font=None)
        draw.text((60, stamp_y + 85), "Digitally Signed and Certified by Revenue Authority under Information Technology Act 2000.", fill=(4, 120, 87), font=None)

    # 8. Signatures, Seals, & Watermark
    seal_y = 1270
    # Revenue Stamp Box
    draw.rectangle([(80, seal_y), (300, seal_y + 180)], fill=(254, 242, 242), outline=(220, 38, 38), width=2)
    draw.text((190, seal_y + 35), "COURT FEE / REVENUE", fill=(185, 28, 28), anchor="mm", font=None)
    draw.text((190, seal_y + 70), "₹ 100", fill=(185, 28, 28), anchor="mm", font=None)
    draw.text((190, seal_y + 105), "SPECIAL ADHESIVE", fill=(185, 28, 28), anchor="mm", font=None)
    draw.text((190, seal_y + 140), "INDIAN REVENUE STAMP", fill=(185, 28, 28), anchor="mm", font=None)

    # Circular Officer Seal
    draw.ellipse([(450, seal_y + 10), (610, seal_y + 170)], outline=(30, 58, 138), width=3)
    draw.ellipse([(460, seal_y + 20), (600, seal_y + 160)], outline=(30, 58, 138), width=1)
    draw.text((530, seal_y + 70), f"SEAL OF\nTAHSILDAR", fill=(30, 58, 138), anchor="mm", font=None)
    draw.text((530, seal_y + 120), config["district"].upper(), fill=(30, 58, 138), anchor="mm", font=None)

    # Authorized Signatory Block
    draw.line([(width - 360, seal_y + 110), (width - 80, seal_y + 110)], fill=(15, 23, 42), width=2)
    draw.text((width - 220, seal_y + 80), "P. V. Rajesh", fill=(30, 58, 138), anchor="mm", font=None)
    draw.text((width - 220, seal_y + 130), config["seal_officer"], fill=(15, 23, 42), anchor="mm", font=None)
    draw.text((width - 220, seal_y + 155), f"Digital Token ID: DILRMP-{config['khata_number']}-2026", fill=(100, 116, 139), anchor="mm", font=None)

    # Footer
    draw.line([(40, height - 60), (width - 40, height - 60)], fill=(203, 213, 225), width=1)
    draw.text((width // 2, height - 40), "This is a tamper-evident computer generated certified revenue extract issued under the Land AI Platform.", fill=(148, 163, 184), anchor="mm", font=None)

    # Save to Web public sample and API data uploads
    web_path = os.path.join(WEB_SAMPLE_DIR, config["filename"])
    api_path = os.path.join(API_UPLOADS_DIR, config["filename"])

    img.save(web_path, quality=95)
    img.save(api_path, quality=95)

    return web_path


def generate_all():
    print(f"Generating 10 authentic Land Deed images for Nishu Kumar...")
    for idx, c in enumerate(NISHU_DEEDS_CONFIG, start=1):
        path = generate_deed_image(c)
        print(f"[{idx}/10] Generated: {c['filename']} -> {path}")
    print("All 10 deed images generated successfully!")


if __name__ == "__main__":
    generate_all()
