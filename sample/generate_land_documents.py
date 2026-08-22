import os
import pymupdf
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = "/home/appu/sih26/sample"
os.makedirs(OUTPUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=13,
    leading=17,
    alignment=1,
    textColor=colors.HexColor('#1A365D')
)

style_subtitle = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    alignment=1,
    textColor=colors.HexColor('#2C5282')
)

style_indic_sub = ParagraphStyle(
    'DocIndic',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=8.5,
    leading=12,
    alignment=1,
    textColor=colors.HexColor('#4A5568')
)

style_th = ParagraphStyle(
    'TableHead',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.5,
    leading=9.5,
    alignment=1,
    textColor=colors.HexColor('#1A202C')
)

style_td = ParagraphStyle(
    'TableBody',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7,
    leading=9,
    alignment=0,
    textColor=colors.HexColor('#2D3748')
)

style_td_center = ParagraphStyle(
    'TableBodyCenter',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7,
    leading=9,
    alignment=1,
    textColor=colors.HexColor('#2D3748')
)

style_td_bold = ParagraphStyle(
    'TableBodyBold',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7,
    leading=9,
    alignment=0,
    textColor=colors.HexColor('#1A202C')
)

style_footer = ParagraphStyle(
    'DocFooter',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=6.5,
    leading=8.5,
    alignment=1,
    textColor=colors.HexColor('#718096')
)

def create_header(state_title, dept_title, form_title, sub_title="", doc_id=""):
    elements = []
    elements.append(Paragraph(f"<b>{state_title}</b>", style_title))
    elements.append(Spacer(1, 1.5*mm))
    elements.append(Paragraph(f"{dept_title}", style_subtitle))
    elements.append(Spacer(1, 1*mm))
    elements.append(Paragraph(f"<b>{form_title}</b>", style_subtitle))
    if sub_title:
        elements.append(Paragraph(f"{sub_title}", style_indic_sub))
    if doc_id:
        elements.append(Spacer(1, 1*mm))
        elements.append(Paragraph(f"<b>Document Ref / ULPIN / Token No:</b> {doc_id}", style_footer))
    elements.append(Spacer(1, 2*mm))
    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#1A365D'), spaceBefore=2, spaceAfter=6))
    return elements

def pdf_to_image(pdf_path, img_path):
    doc = pymupdf.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(dpi=200)
    pix.save(img_path)
    doc.close()
    print(f"Generated Image: {img_path}")

# 1. MAHARASHTRA 7/12 SATBARA EXTRACT
def generate_01_satbara():
    pdf_path = os.path.join(OUTPUT_DIR, "01_Maharashtra_7_12_Satbara_Extract.pdf")
    img_path = os.path.join(OUTPUT_DIR, "01_Maharashtra_7_12_Satbara_Extract.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF MAHARASHTRA / महसूल व वन विभाग",
        "REVENUE DEPARTMENT - MAHABHULEKH CADASTRAL PORTAL",
        "VILLAGE FORM VII-XII (गाव नमुना ७ आणि १२ - अधिकार अभिलेख पत्रक)",
        "(Record of Rights, Tenancy & Cultivation Register)",
        "MH-PUN-HAV-WAG-142-2B-2024"
    )
    
    admin_data = [
        [Paragraph("<b>State:</b> Maharashtra (महाराष्ट्र)", style_td), Paragraph("<b>District:</b> Pune (पुणे)", style_td)],
        [Paragraph("<b>Taluk:</b> Haveli (हवेली)", style_td), Paragraph("<b>Village:</b> Wagholi (वाघोली)", style_td)],
        [Paragraph("<b>Gat / Survey No:</b> 142", style_td), Paragraph("<b>Hissa No:</b> 2B", style_td)],
        [Paragraph("<b>ULPIN:</b> MH272514202B0001", style_td), Paragraph("<b>Revenue Circle:</b> Wagholi-4", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>PART I: FORM VII (गाव नमुना ७ - अधिकार व क्षेत्र तपशील)</b>", style_subtitle))
    story.append(Spacer(1, 1.5*mm))
    
    f7_data = [
        [
            Paragraph("<b>Land Classification & Area<br/>(क्षेत्र Hectare-Are)</b>", style_th),
            Paragraph("<b>Occupants & Khatedar Details<br/>(खातेदार व भोगवटादाराचे नाव)</b>", style_th),
            Paragraph("<b>Mutation Entries<br/>(फेरफार क्र.)</b>", style_th),
            Paragraph("<b>Other Rights & Liabilities<br/>(इतर हक्क व बोजा)</b>", style_th)
        ],
        [
            Paragraph(
                "<b>Total Extent:</b> 1.5000 Ha<br/>"
                "<b>Cultivable (जिरायत):</b> 1.4500 Ha<br/>"
                "<b>Pot Kharaba (पोटखराबा-A):</b> 0.0500 Ha<br/>"
                "<b>Assessment Tax:</b> ₹ 18.75<br/>"
                "<b>Tenure:</b> Occupant Class 1 (भोगवटा वर्ग १)",
                style_td
            ),
            Paragraph(
                "1. <b>Ramesh Shankarrao Patil</b> (1/2 Share)<br/>"
                "&nbsp;&nbsp;&nbsp;<i>(रमेश शंकरराव पाटील)</i><br/><br/>"
                "2. <b>Suresh Shankarrao Patil</b> (1/2 Share)<br/>"
                "&nbsp;&nbsp;&nbsp;<i>(सुरेश शंकरराव पाटील)</i><br/><br/>"
                "<b>Khata Number:</b> 412",
                style_td
            ),
            Paragraph(
                "<b>M-3410</b> (वारस नोंद)<br/>"
                "<b>M-4105</b> (विभाजन)<br/>"
                "<b>M-4512</b> (कर्ज बोजा)",
                style_td_center
            ),
            Paragraph(
                "<b>1. Bank Mortgage (बँक बोजा):</b><br/>"
                "Bank of Maharashtra, Wagholi<br/>"
                "Loan Amount: ₹ 5,00,000/-<br/>"
                "Reg. Date: 15-Apr-2021<br/>"
                "Status: <b>Active (सक्रिय)</b><br/><br/>"
                "<b>2. Electricity Easement:</b> 11KV line.",
                style_td
            )
        ]
    ]
    t_f7 = Table(f7_data, colWidths=[135, 155, 90, 160])
    t_f7.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_f7)
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>PART II: FORM XII (गाव नमुना १२ - पिकांची नोंदवही / Crop Inspection Register)</b>", style_subtitle))
    story.append(Spacer(1, 1.5*mm))
    
    f12_data = [
        [Paragraph("<b>Year</b>", style_th), Paragraph("<b>Season</b>", style_th), Paragraph("<b>Crop Name (पिकाचे नाव)</b>", style_th), Paragraph("<b>Area (Ha)</b>", style_th), Paragraph("<b>Irrigation</b>", style_th), Paragraph("<b>Cultivator</b>", style_th)],
        [Paragraph("2023-24", style_td_center), Paragraph("Kharif", style_td_center), Paragraph("Soybean (सोयाबीन)", style_td), Paragraph("0.9000", style_td_center), Paragraph("Rainfed (जिरायत)", style_td), Paragraph("Self (स्वतः)", style_td)],
        [Paragraph("2023-24", style_td_center), Paragraph("Rabi", style_td_center), Paragraph("Wheat (गहू)", style_td), Paragraph("0.5500", style_td_center), Paragraph("Well / Open Well", style_td), Paragraph("Self (स्वतः)", style_td)],
        [Paragraph("2023-24", style_td_center), Paragraph("Perennial", style_td_center), Paragraph("Pot Kharaba (पडीक)", style_td), Paragraph("0.0500", style_td_center), Paragraph("Uncultivable", style_td), Paragraph("-", style_td_center)]
    ]
    t_f12 = Table(f12_data, colWidths=[60, 75, 120, 75, 110, 100])
    t_f12.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_f12)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Statutory Certification:</b> Digitally signed electronic Record of Rights (e-Mahabhulekh) issued pursuant to Section 148 "
        "of Maharashtra Land Revenue Code, 1966. Authenticated by Digital Key: SHA256:7f89d0e21a34bc89901ef23a.<br/>"
        "<b>Talathi / Village Officer:</b> Saja Wagholi, Circle Haveli | <b>Date of Issue:</b> 12-Feb-2024"
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 2. KARNATAKA RTC PAHANI (BHOOMI PORTAL)
def generate_02_rtc_pahani():
    pdf_path = os.path.join(OUTPUT_DIR, "02_Karnataka_RTC_Pahani_Bhoomi.pdf")
    img_path = os.path.join(OUTPUT_DIR, "02_Karnataka_RTC_Pahani_Bhoomi.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF KARNATAKA / ಕಂದಾಯ ಇಲಾಖೆ",
        "REVENUE DEPARTMENT - BHOOMI MONITORING CELL",
        "FORM NO. 16 - RECORD OF RIGHTS, TENANCY AND CROPS (RTC / ಪಹಣಿ)",
        "(Issued under Karnataka Land Revenue Rules, 1966)",
        "BHM-BLR-DEV-KAS-088-3A-2024"
    )
    
    admin_data = [
        [Paragraph("<b>District:</b> Bengaluru Rural (ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ)", style_td), Paragraph("<b>Taluk:</b> Devanahalli (ದೇವನಹಳ್ಳಿ)", style_td)],
        [Paragraph("<b>Hobli:</b> Kasaba (ಕಸಬಾ)", style_td), Paragraph("<b>Village:</b> Devanahalli (ದೇವನಹಳ್ಳಿ ಗ್ರಾಮಾಂತರ)", style_td)],
        [Paragraph("<b>Survey No:</b> 88", style_td), Paragraph("<b>Hissa No:</b> 3A", style_td)],
        [Paragraph("<b>Khata No:</b> 512", style_td), Paragraph("<b>Land Type:</b> Dry Agriculture (ಖುಷ್ಕಿ)", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>COLUMN 1 TO 8: EXTENT, ASSESSMENT & KHATEDAR DETAILS</b>", style_subtitle))
    story.append(Spacer(1, 1.5*mm))
    
    extent_data = [
        [
            Paragraph("<b>Total Extent (ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ)</b>", style_th),
            Paragraph("<b>Kharab Land (ಖರಾಬು)</b>", style_th),
            Paragraph("<b>Remaining Extent (ಉಳಿಕೆ)</b>", style_th),
            Paragraph("<b>Assessment Tax (ಕಂದಾಯ)</b>", style_th),
            Paragraph("<b>Water Rate (ನೀರಿನ ದರ)</b>", style_th)
        ],
        [
            Paragraph("<b>2 Acres 24 Guntas</b><br/>(2.60 Acres / 1.052 Ha)", style_td_center),
            Paragraph("<b>0-04 Guntas (A-Kharab)</b>", style_td_center),
            Paragraph("<b>2 Acres 20 Guntas</b>", style_td_center),
            Paragraph("₹ 142.50 / annum", style_td_center),
            Paragraph("Nil", style_td_center)
        ]
    ]
    t_ext = Table(extent_data, colWidths=[120, 110, 110, 100, 100])
    t_ext.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ext)
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>COLUMN 9 TO 12: OWNERSHIP, MUTATION & LIABILITIES</b>", style_subtitle))
    story.append(Spacer(1, 1.5*mm))
    
    owners_data = [
        [
            Paragraph("<b>Owner / Khatedar Name (ಖಾತೆದಾರರ ಹೆಸರು)</b>", style_th),
            Paragraph("<b>Acquisition Mode (ಸ್ವಾಧೀನದ ವಿವರ)</b>", style_th),
            Paragraph("<b>Mutation Number (ಎಂ.ಆರ್ ಸಂಖ್ಯೆ)</b>", style_th),
            Paragraph("<b>Liabilities & Encumbrances (ಋಣಭಾರಗಳು)</b>", style_th)
        ],
        [
            Paragraph(
                "<b>Manjunath Gowda s/o Krishnappa</b><br/>"
                "<i>(ಮಂಜುನಾಥ್ ಗೌಡ ಬಿನ್ ಕೃಷ್ಣಪ್ಪ)</i><br/>"
                "Extent: 2 Acres 20 Guntas<br/>"
                "Share: Absolute 1/1",
                style_td
            ),
            Paragraph("Inheritance / Hakku Badalaavane (ವಾರಸುದಾರಿಕೆ)", style_td),
            Paragraph("<b>MR-2022-891</b><br/>Dt: 14/06/2022<br/>Cert. by Shirastedar", style_td_center),
            Paragraph(
                "<b>State Bank of India, Devanahalli</b><br/>"
                "KCC Agricultural Loan<br/>"
                "Charge Amount: ₹ 3,50,000/-<br/>"
                "Entry No: J-1092/2022-23",
                style_td
            )
        ]
    ]
    t_own = Table(owners_data, colWidths=[160, 110, 110, 160])
    t_own.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_own)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Bhoomi Digital Verification Note:</b> Generated through Karnataka Bhoomi Land Records System. "
        "Digitally signed under Section 6 of IT Act 2000. Verified by Tahsildar, Devanahalli."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 3. UP BHULEKH KHASRA KHATAUNI
def generate_03_khasra_khatauni():
    pdf_path = os.path.join(OUTPUT_DIR, "03_UP_Bhulekh_Khasra_Khatauni.pdf")
    img_path = os.path.join(OUTPUT_DIR, "03_UP_Bhulekh_Khasra_Khatauni.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF UTTAR PRADESH / राजस्व परिषद उत्तर प्रदेश",
        "UP BHULEKH - COMPUTERIZED LAND RECORDS SYSTEM",
        "KHATAUNI (RECORD OF RIGHTS) / खतौनी (अधिकार अभिलेख) - FORM R-6",
        "(Under UP Revenue Code, 2006 - Fasli Year 1430-1435 / फसली वर्ष १४३०-१४३५)",
        "UP-LKO-MOH-312-1-2024"
    )
    
    admin_data = [
        [Paragraph("<b>Janpad (District):</b> Lucknow (लखनऊ)", style_td), Paragraph("<b>Tehsil:</b> Mohanlalganj (मोहनलालगंज)", style_td)],
        [Paragraph("<b>Gram (Village):</b> Mohanlalganj (मोहनलालगंज)", style_td), Paragraph("<b>Pargana:</b> Mohanlalganj", style_td)],
        [Paragraph("<b>Khata Number:</b> 00184", style_td), Paragraph("<b>Fasli Year:</b> 1430 to 1435", style_td)],
        [Paragraph("<b>Unique Gata Code:</b> 0928301420312100", style_td), Paragraph("<b>Status:</b> संक्रमणीय भूमिधर (Transferable Bhumidhar)", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    khat_data = [
        [
            Paragraph("<b>Khatedar Name & Parentage<br/>(खातेदार का नाम / पिता का नाम)</b>", style_th),
            Paragraph("<b>Khasra / Gata<br/>(खसरा संख्या)</b>", style_th),
            Paragraph("<b>Area (हेक्टेयर)<br/>(Rakba)</b>", style_th),
            Paragraph("<b>Tax<br/>(लगान)</b>", style_th),
            Paragraph("<b>Orders & Mutations<br/>(आदेश / नामांतरण विवरण)</b>", style_th)
        ],
        [
            Paragraph(
                "<b>1. Ram Prakash Sharma</b><br/>"
                "&nbsp;&nbsp;&nbsp;s/o Ganga Ram Sharma<br/>"
                "&nbsp;&nbsp;&nbsp;<i>(राम प्रकाश शर्मा / गंगा राम)</i><br/>"
                "&nbsp;&nbsp;&nbsp;Share: 1/1 (पूर्ण अंश)<br/>"
                "&nbsp;&nbsp;&nbsp;Resident: Gram Mohanlalganj",
                style_td
            ),
            Paragraph("<b>312/1</b><br/>(गाटा ३१२/१)", style_td_center),
            Paragraph("<b>0.8540 Ha</b><br/>(8,540 sq.m / 2.11 Acre)", style_td_center),
            Paragraph("₹ 24.50", style_td_center),
            Paragraph(
                "<b>आदेश तहसीलदार मोहनलालगंज:</b><br/>"
                "वाद संख्या: T2023084920 | Dt: 18-08-2023<br/>"
                "बैनामा पंजीकरण सं. 4591 दिनांक 02-08-2023 अनुसार विक्रेता दिनेश कुमार का नाम निरस्त कर क्रेता राम प्रकाश शर्मा का नाम बतौर संक्रमणीय भूमिधर अंकित हो।",
                style_td
            )
        ]
    ]
    t_khat = Table(khat_data, colWidths=[150, 70, 75, 55, 190])
    t_khat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_khat)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Bhulekh Electronic Verification:</b> यह उद्धरण भूलेख उत्तर प्रदेश की आधिकारिक डेटाबेस से प्रमाणित है। "
        "डिजिटल हस्ताक्षर: राजस्व परिषद, उत्तर प्रदेश। निर्गमन तिथि: 15-03-2024"
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 4. REGISTERED DEED OF ABSOLUTE SALE
def generate_04_sale_deed():
    pdf_path = os.path.join(OUTPUT_DIR, "04_Registered_Land_Sale_Deed.pdf")
    img_path = os.path.join(OUTPUT_DIR, "04_Registered_Land_Sale_Deed.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF MAHARASHTRA - REGISTRATION & STAMPS DEPARTMENT",
        "OFFICE OF THE SUB-REGISTRAR OF ASSURANCES (HAVELI-4, PUNE)",
        "DEED OF ABSOLUTE SALE (विक्रय विलेख / खरेदी खत)",
        "(Registered under Section 17 & 18 of the Indian Registration Act, 1908)",
        "REG-DEED-HAV4-10492-2023"
    )
    
    reg_summary = [
        [Paragraph("<b>Registration Document No:</b> 10492/2023", style_td), Paragraph("<b>Book No:</b> 1 (Volume 8412, Pages 101-118)", style_td)],
        [Paragraph("<b>Market Value:</b> ₹ 60,00,000/-", style_td), Paragraph("<b>Consideration Amount:</b> ₹ 60,00,000/-", style_td)],
        [Paragraph("<b>Stamp Duty Paid (e-Challan):</b> ₹ 3,60,000/- (6%)", style_td), Paragraph("<b>Registration Fee:</b> ₹ 30,000/-", style_td)],
        [Paragraph("<b>Execution Date:</b> 18th November 2023", style_td), Paragraph("<b>Registration Date:</b> 18th November 2023", style_td)]
    ]
    t_reg = Table(reg_summary, colWidths=[270, 270])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEFCBF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#D69E2E')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#ECC94B')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 3*mm))
    
    parties_data = [
        [Paragraph("<b>PARTY 1: VENDOR / SELLER (विक्रेता)</b>", style_th), Paragraph("<b>PARTY 2: PURCHASER / BUYER (खरेदीदार)</b>", style_th)],
        [
            Paragraph(
                "<b>Mr. Anand Balwant Kulkarni</b><br/>"
                "Age: 52 Years, Occupation: Business<br/>"
                "PAN: ABCPK4819M | Aadhaar: XXXX-XXXX-4812<br/>"
                "Address: Row House 4, Kothrud, Pune - 411038",
                style_td
            ),
            Paragraph(
                "<b>Mrs. Rajeshwari Natarajan</b><br/>"
                "Age: 44 Years, Occupation: Consultant<br/>"
                "PAN: BNRPN1902E | Aadhaar: XXXX-XXXX-9104<br/>"
                "Address: Flat 402, Viman Nagar, Pune - 411014",
                style_td
            )
        ]
    ]
    t_parties = Table(parties_data, colWidths=[270, 270])
    t_parties.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_parties)
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>SCHEDULE OF PROPERTY (मिळकतीचे वर्णन)</b>", style_subtitle))
    story.append(Spacer(1, 1.5*mm))
    
    sched_text = (
        "All that piece and parcel of Non-Agricultural Residential Freehold Land Bearing <b>Plot No. 18</b>, carved out of "
        "<b>Survey No. 94, Hissa No. 1 (Gat No. 94/1)</b>, admeasuring <b>2,400 sq.ft. (222.96 sq.meters)</b>, situated within "
        "the revenue limits of <b>Village Wagholi, Taluka Haveli, District Pune</b>, and bounded by:<br/>"
        "• <b>East:</b> 9-Meter Wide Layout Internal Road | • <b>West:</b> Plot No. 19 (R. Deshmukh)<br/>"
        "• <b>North:</b> Survey Boundary Line of S.No. 95 | • <b>South:</b> Plot No. 17 (M. Kulkarni)<br/>"
        "Together with all rights of easements, water connections, and appurtenant rights."
    )
    story.append(Paragraph(sched_text, style_td))
    story.append(Spacer(1, 3*mm))
    
    witness_data = [
        [Paragraph("<b>Witness 1:</b> Shri Vijay Shinde (Pune)", style_td), Paragraph("<b>Witness 2:</b> Shri Sandeep Mane (Pune)", style_td)],
        [Paragraph("<b>Sub-Registrar Signature:</b> SRO Haveli-4, Pune", style_td), Paragraph("<b>Biometric Verification:</b> Matched (18-Nov-2023)", style_td)]
    ]
    t_wit = Table(witness_data, colWidths=[270, 270])
    t_wit.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#A0AEC0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_wit)
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 5. TAMIL NADU PATTA CHITTA EXTRACT
def generate_05_tamil_nadu_patta():
    pdf_path = os.path.join(OUTPUT_DIR, "05_Tamil_Nadu_Patta_Chitta_Extract.pdf")
    img_path = os.path.join(OUTPUT_DIR, "05_Tamil_Nadu_Patta_Chitta_Extract.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF TAMIL NADU / தமிழ்நாடு அரசு",
        "REVENUE & DISASTER MANAGEMENT DEPARTMENT - ANYTIME ANYWHERE E-SERVICES",
        "PATTA CHITTA EXTRACT (பட்டா / சிட்டா - நில உரிமை ஆவணம்)",
        "(Issued under Tamil Nadu Patta Pass Book Act, 1983)",
        "TN-CHG-TAM-MED-204-5B-2024"
    )
    
    admin_data = [
        [Paragraph("<b>District:</b> Chengalpattu (செங்கல்பட்டு)", style_td), Paragraph("<b>Taluk:</b> Tambaram (தாம்பரம்)", style_td)],
        [Paragraph("<b>Village:</b> Medavakkam (மேடவாக்கம்)", style_td), Paragraph("<b>Patta Number:</b> 1845", style_td)],
        [Paragraph("<b>Survey / Subdivision No:</b> 204/5B", style_td), Paragraph("<b>Land Classification:</b> நஞ்சை (Wet Land / Agriculture)", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    patta_details = [
        [
            Paragraph("<b>Survey / Sub-Div<br/>(புல எண்)</b>", style_th),
            Paragraph("<b>Land Type<br/>(நில வகை)</b>", style_th),
            Paragraph("<b>Irrigation<br/>(பாசனம்)</b>", style_th),
            Paragraph("<b>Extent (ஹெக் - ஏர்)<br/>(Hectare - Are)</b>", style_th),
            Paragraph("<b>Tax (தீர்வை)<br/>(INR)</b>", style_th),
            Paragraph("<b>Pattadar Name & Share<br/>(பட்டாதாரர் பெயர்)</b>", style_th)
        ],
        [
            Paragraph("<b>204/5B</b>", style_td_center),
            Paragraph("Wet Land (நஞ்சை)", style_td_center),
            Paragraph("Eri / Tank", style_td_center),
            Paragraph("<b>0.12.50 Ha</b><br/>(1,250 sq.m / 13,455 sq.ft)", style_td_center),
            Paragraph("₹ 16.20", style_td_center),
            Paragraph(
                "1. <b>Subramanian Ramanathan</b> (50%)<br/>"
                "&nbsp;&nbsp;&nbsp;<i>(சுப்பிரமணியன் ராமநாதன்)</i><br/>"
                "2. <b>Valli Ramanathan</b> (50%)<br/>"
                "&nbsp;&nbsp;&nbsp;<i>(வள்ளி ராமநாதன்)</i>",
                style_td
            )
        ]
    ]
    t_patta = Table(patta_details, colWidths=[70, 70, 75, 100, 50, 175])
    t_patta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_patta)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>e-Services Tamil Nadu Verification:</b> Generated electronically from Tamil Nadu Land Records Portal (eservices.tn.gov.in). "
        "Valid without physical signature under G.O. Ms. No. 118 Revenue Department."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 6. TELANGANA DHARANI PATTADAR PASSBOOK
def generate_06_dharani_passbook():
    pdf_path = os.path.join(OUTPUT_DIR, "06_Telangana_Dharani_Pattadar_Passbook.pdf")
    img_path = os.path.join(OUTPUT_DIR, "06_Telangana_Dharani_Pattadar_Passbook.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF TELANGANA / తెలంగాణ ప్రభుత్వం",
        "REVENUE DEPARTMENT - INTEGRATED LAND RECORDS MANAGEMENT SYSTEM (DHARANI / ధరణి)",
        "E-PATTADAR PASSBOOK-CUM-TITLE DEED / పట్టాదారు పాస్ పుస్తకం (RoR-1B)",
        "(Under Telangana Rights in Land and Pattadar Pass Books Act, 2020)",
        "TG-RRD-SHA-GOL-156-AA-2024"
    )
    
    admin_data = [
        [Paragraph("<b>District:</b> Rangareddy (రంగారెడ్డి)", style_td), Paragraph("<b>Mandal:</b> Shamshabad (శంషాబాద్)", style_td)],
        [Paragraph("<b>Village:</b> Gollapally (గొల్లపల్లి)", style_td), Paragraph("<b>Passbook No:</b> T2819004021", style_td)],
        [Paragraph("<b>Khata No:</b> 4021", style_td), Paragraph("<b>Pattadar Aadhaar:</b> XXXX-XXXX-7128", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    pattadar_data = [
        [
            Paragraph("<b>Survey / Sub-Div<br/>(సర్వే నంబర్)</b>", style_th),
            Paragraph("<b>Total Extent<br/>(విస్తీర్ణం - Ac.Gts)</b>", style_th),
            Paragraph("<b>Land Nature / Type<br/>(భూమి స్వభావం)</b>", style_th),
            Paragraph("<b>Pattadar Name & Relation<br/>(పట్టాదారు పేరు)</b>", style_th),
            Paragraph("<b>Market Value & Tax<br/>(మార్కెట్ విలువ)</b>", style_th)
        ],
        [
            Paragraph("<b>156/AA</b>", style_td_center),
            Paragraph("<b>Ac. 1-35 Gts</b><br/>(1.875 Acres / 0.758 Ha)", style_td_center),
            Paragraph("Pattadar / Dry Land (మెట్ట)", style_td_center),
            Paragraph(
                "<b>K. Venkat Reddy</b><br/>"
                "Father: Narayana Reddy<br/>"
                "<i>(కె. వెంకట్ రెడ్డి / తండ్రి: నారాయణ రెడ్డి)</i>",
                style_td
            ),
            Paragraph("Assessment: ₹ 38.00<br/>Land Value: ₹ 45,00,000/-", style_td_center)
        ]
    ]
    t_pat = Table(pattadar_data, colWidths=[80, 110, 100, 150, 100])
    t_pat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_pat)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Dharani Portal QR & Digital Signature:</b> Authenticated by Chief Commissioner of Land Administration (CCLA), Hyderabad, Telangana."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 7. PUNJAB / HARYANA JAMABANDI ROR
def generate_07_jamabandi():
    pdf_path = os.path.join(OUTPUT_DIR, "07_Punjab_Haryana_Jamabandi_RoR.pdf")
    img_path = os.path.join(OUTPUT_DIR, "07_Punjab_Haryana_Jamabandi_RoR.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF HARYANA / राजस्व एवं आपदा प्रबंधन विभाग",
        "JAMABANDI WEB PORTAL - RECORD OF RIGHTS / जमाबंदी (नकल)",
        "JAMABANDI FOR THE YEAR 2021-2022 (जमाबंदी साल २०२१-२२)",
        "(Under Punjab Land Revenue Act, 1887 as applicable to Haryana)",
        "HR-KAR-NIL-014-12-2-2024"
    )
    
    admin_data = [
        [Paragraph("<b>District:</b> Karnal (करनाल)", style_td), Paragraph("<b>Tehsil:</b> Nilokheri (नीलोखेड़ी)", style_td)],
        [Paragraph("<b>Hadbast / Village:</b> Nilokheri (हड़बस्त नं. 45)", style_td), Paragraph("<b>Fasli Year:</b> 2021-2022", style_td)],
        [Paragraph("<b>Khewat No:</b> 45", style_td), Paragraph("<b>Khatauni No:</b> 88", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    jama_data = [
        [
            Paragraph("<b>Owner Details & Shares<br/>(मालिक का नाम व विवरण)</b>", style_th),
            Paragraph("<b>Cultivator<br/>(काश्तकार)</b>", style_th),
            Paragraph("<b>Means of Irrigation<br/>(साधन आबपाशी)</b>", style_th),
            Paragraph("<b>Khasra No & Area<br/>(खसरा नं. व रकबा - K-M)</b>", style_th),
            Paragraph("<b>Rent / Revenue<br/>(लगान)</b>", style_th)
        ],
        [
            Paragraph(
                "1. <b>Gurpreet Singh</b> (1/2 Share)<br/>"
                "&nbsp;&nbsp;&nbsp;s/o Jaspal Singh<br/>"
                "2. <b>Harinder Singh</b> (1/2 Share)<br/>"
                "&nbsp;&nbsp;&nbsp;s/o Jaspal Singh",
                style_td
            ),
            Paragraph("<b>Khudkasht</b><br/>(खुदकाश्त - Self)", style_td_center),
            Paragraph("Tubewell / Canal (नहरी)", style_td_center),
            Paragraph(
                "<b>Murabba: 14 // Khasra: 12/2</b><br/>"
                "Area: <b>4 Kanals 16 Marlas</b><br/>"
                "(4-16 K-M = 0.60 Acre)",
                style_td_center
            ),
            Paragraph("₹ 18.50 / annum<br/>No Arrears", style_td_center)
        ]
    ]
    t_jama = Table(jama_data, colWidths=[140, 90, 100, 120, 90])
    t_jama.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_jama)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Halqa Patwari Certification:</b> Certified copy of Jamabandi entry authenticated by Halqa Patwari & Kanungo, Nilokheri, Karnal."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 8. ENCUMBRANCE CERTIFICATE (EC / FORM 15)
def generate_08_encumbrance_certificate():
    pdf_path = os.path.join(OUTPUT_DIR, "08_Encumbrance_Certificate_EC.pdf")
    img_path = os.path.join(OUTPUT_DIR, "08_Encumbrance_Certificate_EC.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "DEPARTMENT OF REGISTRATION AND INSPECTION",
        "GOVERNMENT OF MAHARASHTRA / IGR MAHARASHTRA",
        "CERTIFICATE OF ENCUMBRANCE ON PROPERTY (FORM NO. 15 / भार प्रमाणपत्र)",
        "(Search Certificate under Section 57 of the Registration Act, 1908)",
        "EC-PNE-HAV-BAN-76-2-2024"
    )
    
    admin_data = [
        [Paragraph("<b>Application Ref No:</b> EC/2024/098412", style_td), Paragraph("<b>Search Period:</b> 01-Jan-1994 to 20-Aug-2024 (30 Years)", style_td)],
        [Paragraph("<b>Village:</b> Baner, Taluka: Haveli, Pune", style_td), Paragraph("<b>Survey / Gat No:</b> 76/2 (Plot No. 12)", style_td)],
        [Paragraph("<b>Applicant Name:</b> Rajeshwari Natarajan", style_td), Paragraph("<b>Purpose:</b> Bank Loan / Title Verification", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    ec_table = [
        [
            Paragraph("<b>Sr.</b>", style_th),
            Paragraph("<b>Reg. Date</b>", style_th),
            Paragraph("<b>Doc No & Book</b>", style_th),
            Paragraph("<b>Nature of Transaction & Parties</b>", style_th),
            Paragraph("<b>Consideration</b>", style_th),
            Paragraph("<b>Status</b>", style_th)
        ],
        [
            Paragraph("1", style_td_center),
            Paragraph("12-Mar-1998", style_td_center),
            Paragraph("Doc 1420/1998<br/>Book 1", style_td_center),
            Paragraph("<b>Sale Deed:</b> M. G. Kulkarni to Anand B. Kulkarni", style_td),
            Paragraph("₹ 4,50,000/-", style_td_center),
            Paragraph("Discharged", style_td_center)
        ],
        [
            Paragraph("2", style_td_center),
            Paragraph("18-Nov-2023", style_td_center),
            Paragraph("Doc 10492/2023<br/>Book 1", style_td_center),
            Paragraph("<b>Absolute Sale Deed:</b> Anand B. Kulkarni to Rajeshwari Natarajan", style_td),
            Paragraph("₹ 60,00,000/-", style_td_center),
            Paragraph("<b>Clear Title</b>", style_td_center)
        ],
        [
            Paragraph("3", style_td_center),
            Paragraph("20-Aug-2024", style_td_center),
            Paragraph("-", style_td_center),
            Paragraph("<b>Current Encumbrance Status: NIL ENCUMBRANCE</b><br/>No registered mortgage, charge or court decree found.", style_td_bold),
            Paragraph("Nil", style_td_center),
            Paragraph("<font color='green'><b>NIL / CLEAR</b></font>", style_td_center)
        ]
    ]
    t_ec = Table(ec_table, colWidths=[25, 80, 80, 205, 75, 75])
    t_ec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_ec)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Certificate of Non-Encumbrance:</b> Examined Book 1 registers for 30 years. Certified free from prior encumbrance. Sub-Registrar Haveli-4, Pune."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 9. MUTATION REGISTER EXTRACT (FERFAR)
def generate_09_mutation_register():
    pdf_path = os.path.join(OUTPUT_DIR, "09_Mutation_Register_Extract_Ferfar.pdf")
    img_path = os.path.join(OUTPUT_DIR, "09_Mutation_Register_Extract_Ferfar.jpg")
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "GOVERNMENT OF MAHARASHTRA / महसूल विभाग",
        "VILLAGE ACCOUNT FORM VI - REGISTER OF MUTATIONS (गाव नमुना ६ - फेरफार नोंदवही)",
        "MUTATION ENTRY NO. 7894 (फेरफार नोंद क्रमांक ७८९४)",
        "(Under Section 148 to 150 of Maharashtra Land Revenue Code, 1966)",
        "MH-PUN-HAV-WAG-FER-7894"
    )
    
    admin_data = [
        [Paragraph("<b>Village:</b> Wagholi (वाघोली)", style_td), Paragraph("<b>Taluka:</b> Haveli (हवेली)", style_td)],
        [Paragraph("<b>District:</b> Pune (पुणे)", style_td), Paragraph("<b>Mutation Type:</b> वारस नोंद (Succession/Inheritance)", style_td)],
        [Paragraph("<b>Survey / Gat No:</b> 142/2B", style_td), Paragraph("<b>Date of Entry:</b> 10-Jan-2022", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 3*mm))
    
    mut_details = [
        [
            Paragraph("<b>Entry No & Date<br/>(नोंद क्र. व तारीख)</b>", style_th),
            Paragraph("<b>Nature of Right Acquired & Mutation Details<br/>(हक्काचे स्वरूप व फेरफाराचा तपशील)</b>", style_th),
            Paragraph("<b>Survey / Gat Nos<br/>(बाधित गट नंबर)</b>", style_th),
            Paragraph("<b>Sanctioning Officer & Date<br/>(मंजुरी आदेश व दिनांक)</b>", style_th)
        ],
        [
            Paragraph("<b>7894</b><br/>10-01-2022", style_td_center),
            Paragraph(
                "<b>वारस नोंद (Legal Heir Succession):</b><br/>"
                "खातेदार <b>स्व. शंकर विष्णू पाटील</b> यांचे दिनांक १५-११-२०२१ रोजी निधन झाल्याने, "
                "वारसदार म्हणून खालील नावे अधिकार अभिलेखात समाविष्ट करणेबाबत:<br/><br/>"
                "१. <b>रमेश शंकरराव पाटील</b> (मुलगा - हिस्सा १/२)<br/>"
                "२. <b>सुरेश शंकरराव पाटील</b> (मुलगा - हिस्सा १/२)<br/>"
                "मृत्यू दाखला क्र. D-2021-984 ग्रामपंचायत वाघोली सादर.",
                style_td
            ),
            Paragraph("<b>गट क्र. १४२/२B</b><br/>क्षेत्र: १.५० हेक्टर", style_td_center),
            Paragraph(
                "<b>प्रमाणित / मंजूर (Sanctioned):</b><br/>"
                "आदेश क्र. फेरफार/१०२/२०२२<br/>"
                "दिनांक: 28-01-2022<br/>"
                "मंडळ अधिकारी, वाघोली<br/>"
                "(Circle Officer, Wagholi)",
                style_td
            )
        ]
    ]
    t_mut = Table(mut_details, colWidths=[80, 240, 100, 120])
    t_mut.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_mut)
    story.append(Spacer(1, 4*mm))
    
    verif_text = (
        "<b>Talathi Saja Wagholi:</b> Notice under Section 150(2) served without any objections received within 15 days statutory period."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

# 10. CADASTRAL SURVEY MAP / BHU-NAKSHA / TIPPAN
def generate_10_cadastral_survey():
    fig_path = "/tmp/cadastral_sketch.png"
    plt.figure(figsize=(6, 4), dpi=150)
    plt.style.use('default')
    
    p1 = np.array([[10, 10], [50, 12], [48, 50], [10, 48], [10, 10]])
    p2a = np.array([[50, 12], [85, 14], [83, 35], [49, 32], [50, 12]])
    p2b = np.array([[49, 32], [83, 35], [82, 55], [48, 50], [49, 32]])
    p3 = np.array([[10, 48], [48, 50], [82, 55], [80, 85], [12, 80], [10, 48]])
    
    plt.plot(p1[:,0], p1[:,1], 'b-', lw=1.5)
    plt.plot(p2a[:,0], p2a[:,1], 'g-', lw=1.5)
    plt.plot(p2b[:,0], p2b[:,1], 'r-', lw=2.5)
    plt.plot(p3[:,0], p3[:,1], 'm-', lw=1.5)
    
    plt.fill(p2b[:,0], p2b[:,1], color='#FED7D7', alpha=0.6)
    plt.fill(p1[:,0], p1[:,1], color='#EBF8FF', alpha=0.3)
    plt.fill(p2a[:,0], p2a[:,1], color='#F0FFF4', alpha=0.3)
    plt.fill(p3[:,0], p3[:,1], color='#FAF5FF', alpha=0.3)
    
    plt.text(28, 30, "Gat 142/1\n(1.20 Ha)", fontsize=8, fontweight='bold', ha='center')
    plt.text(66, 22, "Gat 142/2A\n(0.95 Ha)", fontsize=8, fontweight='bold', ha='center')
    plt.text(65, 42, "Gat 142/2B\n(1.50 Ha)\n[Patil Brothers]", fontsize=8, fontweight='bold', ha='center', color='#9B2C2C')
    plt.text(45, 66, "Gat 142/3\n(2.10 Ha)", fontsize=8, fontweight='bold', ha='center')
    
    plt.title("Cadastral Field Survey Measurement (Gat No. 142 Tippan Sketch)", fontsize=10, fontweight='bold', pad=8)
    plt.xlabel("Easting Coordinates (Meters)", fontsize=7)
    plt.ylabel("Northing Coordinates (Meters)", fontsize=7)
    plt.grid(True, linestyle='--', alpha=0.4)
    plt.annotate("NORTH ^", xy=(80, 78), fontsize=9, fontweight='bold', color='#1A365D')
    
    plt.tight_layout()
    plt.savefig(fig_path, bbox_inches='tight')
    plt.close()
    
    pdf_path = os.path.join(OUTPUT_DIR, "10_Cadastral_Survey_Tippan_BhuNaksha.pdf")
    img_path = os.path.join(OUTPUT_DIR, "10_Cadastral_Survey_Tippan_BhuNaksha.jpg")
    
    from reportlab.platypus import Image as RLImage
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    story = []
    
    story += create_header(
        "LAND RECORDS & SURVEY DEPARTMENT / भूमि अभिलेख विभाग",
        "DISTRICT INSPECTOR OF LAND RECORDS (DILR PUNE) - BHU-NAKSHA GIS",
        "CADASTRAL SURVEY PARCEL SKETCH (टिप्पण व भू-नक्शा मोजणी नकाशा)",
        "(Field Survey Measurement & Boundary Verification Sheet)",
        "CAD-MAP-PUN-HAV-WAG-142-2B"
    )
    
    admin_data = [
        [Paragraph("<b>Village:</b> Wagholi, Taluka: Haveli, Dist: Pune", style_td), Paragraph("<b>Gat / Survey Number:</b> 142", style_td)],
        [Paragraph("<b>Subject Parcel:</b> 142/2B (Area: 1.50 Ha / 15,000 sq.m)", style_td), Paragraph("<b>Scale:</b> 1:1000 (Metric Chain)", style_td)],
        [Paragraph("<b>Surveyor:</b> DILR Haveli Cadastral Team", style_td), Paragraph("<b>GPS Datum:</b> WGS 84 (EPSG:4326)", style_td)]
    ]
    t_admin = Table(admin_data, colWidths=[270, 270])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F7FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 2*mm))
    
    story.append(RLImage(fig_path, width=460, height=220))
    story.append(Spacer(1, 2*mm))
    
    coords_data = [
        [Paragraph("<b>Boundary Point</b>", style_th), Paragraph("<b>Latitude (WGS-84)</b>", style_th), Paragraph("<b>Longitude (WGS-84)</b>", style_th), Paragraph("<b>Boundary Marker</b>", style_th)],
        [Paragraph("Corner A (NW)", style_td_center), Paragraph("18.579412° N", style_td_center), Paragraph("73.984210° E", style_td_center), Paragraph("Stone Boundary Pillar (दगडी खूण)", style_td)],
        [Paragraph("Corner B (NE)", style_td_center), Paragraph("18.579540° N", style_td_center), Paragraph("73.986840° E", style_td_center), Paragraph("Stone Boundary Pillar", style_td)],
        [Paragraph("Corner C (SE)", style_td_center), Paragraph("18.578120° N", style_td_center), Paragraph("73.986790° E", style_td_center), Paragraph("Field Bund Mark (बांध)", style_td)],
        [Paragraph("Corner D (SW)", style_td_center), Paragraph("18.577990° N", style_td_center), Paragraph("73.984180° E", style_td_center), Paragraph("Field Bund Mark", style_td)]
    ]
    t_coords = Table(coords_data, colWidths=[90, 130, 130, 190])
    t_coords.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4A5568')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_coords)
    story.append(Spacer(1, 3*mm))
    
    verif_text = (
        "<b>DILR Technical Certification:</b> Cadastral boundaries verified on ground using DGPS & ETS. Matched with PostGIS spatial polygon records."
    )
    story.append(Paragraph(verif_text, style_footer))
    doc.build(story)
    pdf_to_image(pdf_path, img_path)

if __name__ == "__main__":
    print("Generating 10 Indian Land Revenue Documents...")
    generate_01_satbara()
    generate_02_rtc_pahani()
    generate_03_khasra_khatauni()
    generate_04_sale_deed()
    generate_05_tamil_nadu_patta()
    generate_06_dharani_passbook()
    generate_07_jamabandi()
    generate_08_encumbrance_certificate()
    generate_09_mutation_register()
    generate_10_cadastral_survey()
    print("Done! All 10 Land Documents generated in PDF and Scanned Image formats.")
