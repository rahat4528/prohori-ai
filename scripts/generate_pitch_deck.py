"""
Script to generate the official 8-slide presentation deck for Prohori AI
in Microsoft PowerPoint (.pptx) format.

Theme: Modern Cyber SOC Dark Mode (16:9 Widescreen)
"""
import os

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


def create_deck(output_path="docs/Prohori_AI_Pitch_Deck.pptx"):
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Blank layout
    blank_layout = prs.slide_layouts[6]

    # Palette
    BG_COLOR = RGBColor(11, 15, 25)        # Deep Charcoal Navy
    CARD_BG = RGBColor(22, 30, 46)         # Dark Slate Card
    CARD_BORDER = RGBColor(38, 52, 79)     # Border Blue-Slate
    CYAN_ACCENT = RGBColor(0, 220, 255)    # Neon Cyan
    GREEN_ACCENT = RGBColor(0, 230, 153)   # Cyber Emerald
    RED_ACCENT = RGBColor(255, 75, 75)     # Threat Red
    AMBER_ACCENT = RGBColor(255, 185, 0)   # Warning Gold
    TEXT_WHITE = RGBColor(245, 248, 255)   # Crisp White
    TEXT_MUTED = RGBColor(156, 163, 175)   # Muted Slate

    def set_bg(slide):
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = BG_COLOR
        bg_shape.line.fill.background() # no line

    def add_header(slide, tag, title):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.5), Inches(0.4))
        tf = tag_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = tag.upper()
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = CYAN_ACCENT

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.5), Inches(0.8))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
        p2 = tf2.paragraphs[0]
        p2.text = title
        p2.font.name = "Arial"
        p2.font.size = Pt(28)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE

    def add_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # -------------------------------------------------------------------------
    # SLIDE 1: Hook & User Persona
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)
    add_header(s1, "Team Orionids · International AI Builders Congress 2026 · SecureAI", "The Midnight Alarm")

    # Card 1: Persona
    c1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = CARD_BORDER
    tf = c1.text_frame
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.4)
    p = tf.paragraphs[0]
    p.text = "USER PERSONA: ARIF"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER_ACCENT

    p_sub = tf.add_paragraph()
    p_sub.text = "Sole IT Officer · 150-Person Gazipur RMG Exporter"
    p_sub.font.size = Pt(12)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.space_after = Pt(20)

    p_body = tf.add_paragraph()
    p_body.text = "• Arif, lone IT officer in Gazipur\n• 1,000 cryptic English alerts nightly\n• Breaches missed amidst noise"
    p_body.font.size = Pt(16)
    p_body.font.bold = True
    p_body.font.color.rgb = TEXT_WHITE

    # Card 2: Visual Metaphor (The Reality)
    c2 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = CARD_BORDER
    tf2 = c2.text_frame
    tf2.vertical_anchor = MSO_ANCHOR.TOP
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = Inches(0.4)
    p2 = tf2.paragraphs[0]
    p2.text = "ALERT OVERLOAD: 02:14 AM"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = RED_ACCENT

    p2_body = tf2.add_paragraph()
    p2_body.text = "> sshd[9012]: Failed password for root\n> pam_unix: authentication failure\n> 1,420 unread alerts in backlog\n> Critical credential stuffing active\n> No 24/7 security analyst available"
    p2_body.font.size = Pt(14)
    p2_body.font.name = "Consolas"
    p2_body.font.color.rgb = TEXT_MUTED

    add_notes(s1, "Meet Arif. He is the sole IT officer at a 150-person export garment factory in Gazipur. It is 2:00 AM. His firewall is firing thousands of cryptic alerts in technical English. Arif isn't a certified cybersecurity specialist. He has no twenty-person SOC team. Buried inside that noise is an active credential stuffing attack. By morning, his servers are locked. This story repeats every single night across emerging markets.")

    # -------------------------------------------------------------------------
    # SLIDE 2: Why Existing Tools Fall Short
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "The Market Failure", "Legacy Tools Fail Emerging Markets")

    items = [
        ("EXORBITANT COST", "Six-figure enterprise licensing costs", RED_ACCENT, "Traditional SIEM & SOC platforms demand massive annual enterprise budgets that small organizations and public offices cannot afford."),
        ("DATA SOVEREIGNTY TRAP", "Sovereign telemetry exported overseas", AMBER_ACCENT, "Cloud SOCs force local institutions to ship sensitive national security logs abroad, creating regulatory and sovereignty violations."),
        ("LANGUAGE BARRIER", "Cryptic English-only jargon", CYAN_ACCENT, "Security alerts arrive in cryptic English acronyms with zero native Bengali translation, preventing rapid local triage.")
    ]

    for i, (tag, body, color, desc) in enumerate(items):
        cx = Inches(0.8 + i * 3.95)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.8), Inches(3.7), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        tf = card.text_frame
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.35)
        
        p = tf.paragraphs[0]
        p.text = tag
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(14)

        p2 = tf.add_paragraph()
        p2.text = body
        p2.font.size = Pt(18)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_after = Pt(14)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_MUTED

    add_notes(s2, "Why can't Arif defend his network? First, legacy enterprise SIEMs cost six figures annually in licensing alone. Second, modern cloud SOCs force organizations to stream sensitive infrastructure logs overseas to third-party data centers, creating severe sovereignty and compliance risks. Third, every commercial tool communicates in impenetrable foreign security jargon. Small organizations are left completely defenseless.")

    # -------------------------------------------------------------------------
    # SLIDE 3: The Solution — Prohori AI
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Introducing Prohori AI (প্রহরী)", "Prohori AI: Sovereign Bilingual Analyst")

    c_sol = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))
    c_sol.fill.solid()
    c_sol.fill.fore_color.rgb = CARD_BG
    c_sol.line.color.rgb = GREEN_ACCENT
    tf = c_sol.text_frame
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.4)

    p = tf.paragraphs[0]
    p.text = "CORE VALUE PROPOSITION (90% FOCUS)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GREEN_ACCENT
    p.space_after = Pt(16)

    p2 = tf.add_paragraph()
    p2.text = "• Autonomous AI SOC analyst core\n• Fluent Bengali and plain English\n• 100% self-hosted on-premises"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(24)

    p3 = tf.add_paragraph()
    p3.text = "A complete, self-hostable Security Operations Center in a single box.\nTriages events in milliseconds, correlates multi-stage attacks, and explains threats in clear Bengali and English.\nZero cloud lock-in: default offline mode guarantees 100% data sovereignty on local hardware."
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED

    add_notes(s3, "This is Prohori AI ('প্রহরী') — an AI-native, self-hostable SOC analyst built specifically to solve this crisis. Prohori ingests raw alerts and acts as a tireless digital analyst. In seconds, it explains complex cyber threats in clear, jargon-free English and native Bengali. In local mode, Prohori runs entirely inside the organization on local hardware: zero cloud egress, zero third-party dependency, and full national data sovereignty.")

    # -------------------------------------------------------------------------
    # SLIDE 4: Architecture & 3 Sensors
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "System Pipeline", "Unified Defensive Ingestion Architecture")

    # 3 sensors box
    c_sens = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8))
    c_sens.fill.solid()
    c_sens.fill.fore_color.rgb = CARD_BG
    c_sens.line.color.rgb = CARD_BORDER
    tf = c_sens.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "3 DEFENSIVE SENSORS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(10)
    p_body = tf.add_paragraph()
    p_body.text = "1. Honeypot Decoy (8081)\n   Isolated credential trap\n\n2. API Abuse Guard (8082)\n   Sliding-window 429 limiter\n\n3. Allowlisted Scanner (8083)\n   Strictly authorized checks"
    p_body.font.size = Pt(13)
    p_body.font.color.rgb = TEXT_WHITE

    # Core engine box
    c_eng = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.7), Inches(1.8), Inches(4.2), Inches(4.8))
    c_eng.fill.solid()
    c_eng.fill.fore_color.rgb = CARD_BG
    c_eng.line.color.rgb = GREEN_ACCENT
    tf2 = c_eng.text_frame
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = Inches(0.3)
    p2 = tf2.paragraphs[0]
    p2.text = "AI ANALYST & RAG ENGINE"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = GREEN_ACCENT
    p2.space_after = Pt(10)
    p2_body = tf2.add_paragraph()
    p2_body.text = "• 3 sensors feed unified bus\n• Scrubbed telemetry into pgvector RAG\n• Real-time operator WebSocket stream"
    p2_body.font.size = Pt(16)
    p2_body.font.bold = True
    p2_body.font.color.rgb = TEXT_WHITE
    p2_body.space_after = Pt(14)
    p2_sub = tf2.add_paragraph()
    p2_sub.text = "Automated PII scrubber removes secrets.\nDense pgvector similarity search over MITRE ATT&CK & CVE intelligence."
    p2_sub.font.size = Pt(12)
    p2_sub.font.color.rgb = TEXT_MUTED

    # Console box
    c_con = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(1.8), Inches(3.333), Inches(4.8))
    c_con.fill.solid()
    c_con.fill.fore_color.rgb = CARD_BG
    c_con.line.color.rgb = CARD_BORDER
    tf3 = c_con.text_frame
    tf3.margin_left = tf3.margin_top = tf3.margin_right = tf3.margin_bottom = Inches(0.3)
    p3 = tf3.paragraphs[0]
    p3.text = "OPERATOR CONSOLE"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = CYAN_ACCENT
    p3.space_after = Pt(10)
    p3_body = tf3.add_paragraph()
    p3_body.text = "React 19 + Vite Interface\n\n• Live WebSocket feed\n• Incident correlation banner\n• Ask-the-Analyst panel\n• One-click HITL approval\n• Append-only audit trail"
    p3_body.font.size = Pt(13)
    p3_body.font.color.rgb = TEXT_WHITE

    add_notes(s4, "Here is our architecture. Three lightweight defensive sensors feed our unified bus: an isolated deception honeypot, an API abuse guard, and an allowlisted scanner. Telemetry passes through an automated PII and credential scrubber before entering our local knowledge base. The AI Analyst correlates the data against local MITRE ATT&CK intelligence and streams prioritized incidents to the operator console in real time.")

    # -------------------------------------------------------------------------
    # SLIDE 5: Live Incident Triage Demo
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Demonstration & Verification", "Live Incident Triage in Native Bengali")

    c_demo = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))
    c_demo.fill.solid()
    c_demo.fill.fore_color.rgb = CARD_BG
    c_demo.line.color.rgb = CYAN_ACCENT
    tf = c_demo.text_frame
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.4)

    p = tf.paragraphs[0]
    p.text = "VERIFIED DEMO WORKFLOW"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(14)

    p2 = tf.add_paragraph()
    p2.text = "• Credential stuffing detected instantly\n• MITRE T1110 cited in Bengali\n• One-click containment approval"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(20)

    p3 = tf.add_paragraph()
    p3.text = "Live Triage Stream Preview:\nOperator Prompt: 'কী ঘটেছে? কতটা বিপজ্জনক?'\nAnalyst Verdict: 'প্রহরী এআই ডিকয় সারফেসে একাধিক অননুমোদিত ক্রেডেনশিয়াল স্টাফিং শনাক্ত করেছে। এটি MITRE ATT&CK [T1110.001] এর সাথে মিলে যায়...'\nAction Recommended: Block source IP at perimeter firewall [Approve Defense]"
    p3.font.size = Pt(13)
    p3.font.name = "Consolas"
    p3.font.color.rgb = GREEN_ACCENT

    add_notes(s5, "Let's look at the console. We trigger a credential stuffing burst against our decoy. Within 30 milliseconds, Prohori detects the threshold anomaly, aggregates the events, and correlates them into Incident 2026-0001. Look at the explanation panel: Arif can ask in Bengali: 'কী ঘটেছে? কতটা বিপজ্জনক?' The analyst explains in natural Bengali: 'এটি MITRE ATT&CK T1110.001 টেকনিকের সাথে মিলে যায়—পাসওয়ার্ড অনুমানের চেষ্টা।' Arif clicks 'Approve Defense' to enforce the firewall block. Complex defense, executed in thirty seconds.")

    # -------------------------------------------------------------------------
    # SLIDE 6: Responsible AI & Differentiators
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Safety, Compliance & Governance", "Grounded, Auditable, Sovereign AI")

    diffs = [
        ("GROUNDED THREAT RAG", "Strict MITRE/CVE citation grounding", GREEN_ACCENT, "Every incident summary is cited with MITRE ATT&CK techniques and NVD CVE IDs. Grounded retrieval eliminates speculative hallucinations."),
        ("NATIONAL DATA SOVEREIGNTY", "Zero cloud egress in offline mode", CYAN_ACCENT, "Runs entirely on-premises using local Ollama or deterministic offline models. Sensitive telemetry never leaves local organizational servers."),
        ("HUMAN-IN-THE-LOOP CONTROL", "Append-only cryptographic audit trail", AMBER_ACCENT, "AI recommends firewall or rate-limit countermeasures, but cannot execute them unilaterally. Every action requires human approval and is permanently logged.")
    ]

    for i, (tag, body, color, desc) in enumerate(diffs):
        cx = Inches(0.8 + i * 3.95)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.8), Inches(3.7), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        tf = card.text_frame
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.35)
        
        p = tf.paragraphs[0]
        p.text = tag
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = color
        p.space_after = Pt(14)

        p2 = tf.add_paragraph()
        p2.text = body
        p2.font.size = Pt(17)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_after = Pt(14)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = TEXT_MUTED

    add_notes(s6, "Prohori is built on strict Responsible AI principles. First, strict grounding: our model is anchored to a retrieved vector database of MITRE ATT&CK and CVE records, citing exact technique IDs. Second, data privacy: in local mode, zero bytes leave the premises. Third, human safety: the AI recommends actions, but only an authorized operator can approve containment. Every decision is preserved in an append-only audit log.")

    # -------------------------------------------------------------------------
    # SLIDE 7: Team Orionids & Execution Credentials
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Execution Discipline", "Team Orionids: Mission & Execution")

    c_team = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8))
    c_team.fill.solid()
    c_team.fill.fore_color.rgb = CARD_BG
    c_team.line.color.rgb = CARD_BORDER
    tf = c_team.text_frame
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.4)

    p = tf.paragraphs[0]
    p.text = "TEAM ORIONIDS — CROSS-FUNCTIONAL BUILDERS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT
    p.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "• Dedicated cross-functional technical builders\n• Direct local domain experience\n• Production-tested hackathon delivery"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(20)

    p3 = tf.add_paragraph()
    p3.text = "Team Orionids — Department of CSE, Daffodil International University (DIU)\n• Member 1: [FILL: name] — [FILL: role] ([FILL: credibility])\n• Member 2: [FILL: name] — [FILL: role] ([FILL: credibility])\n• Member 3: [FILL: name] — [FILL: role] ([FILL: credibility])"
    p3.font.size = Pt(12)
    p3.font.color.rgb = TEXT_MUTED

    add_notes(s7, "We are Team Orionids, a focused team of builders from the Department of CSE at Daffodil International University. We built Prohori specifically to address the security deficit in emerging markets, delivering a battle-tested prototype backed by 35 passing automated tests and production-ready microservice packaging.")

    # -------------------------------------------------------------------------
    # SLIDE 8: Commercial Hypothesis & Next Steps (with QR Code)
    # -------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Roadmap & Repository Access", "Scalable Impact & Deployment Roadmap")

    # Commercial Model Card (Left)
    c_comm = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.8))
    c_comm.fill.solid()
    c_comm.fill.fore_color.rgb = CARD_BG
    c_comm.line.color.rgb = CARD_BORDER
    tf = c_comm.text_frame
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = Inches(0.4)

    p = tf.paragraphs[0]
    p.text = "COMMERCIAL HYPOTHESIS & SCALING"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GREEN_ACCENT
    p.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "• Free community open-source tier\n• Enterprise bank on-premise hypothesis\n• Scan to inspect repository"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.space_after = Pt(16)

    p3 = tf.add_paragraph()
    p3.text = "1. Community Edition (OSS): Free self-hostable core for SMEs, universities, and devs.\n2. Commercial Hypothesis: $1,200/node/year on-premises license for banks & defense with 24/7 SLA.\n3. Managed SOC SaaS: $99/mo cloud telemetry option for remote distributed companies.\n\nNote: Commercial pricing represents an unvalidated hackathon hypothesis pending customer discovery."
    p3.font.size = Pt(12)
    p3.font.color.rgb = TEXT_MUTED

    # QR Code Card (Right)
    c_qr = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.7), Inches(1.8), Inches(3.833), Inches(4.8))
    c_qr.fill.solid()
    c_qr.fill.fore_color.rgb = CARD_BG
    c_qr.line.color.rgb = GREEN_ACCENT
    tf_qr = c_qr.text_frame
    tf_qr.vertical_anchor = MSO_ANCHOR.TOP
    tf_qr.margin_left = tf_qr.margin_top = tf_qr.margin_right = tf_qr.margin_bottom = Inches(0.3)

    p_qrt = tf_qr.paragraphs[0]
    p_qrt.text = "SCAN FOR REPO & DEMO"
    p_qrt.font.size = Pt(12)
    p_qrt.font.bold = True
    p_qrt.font.color.rgb = CYAN_ACCENT
    p_qrt.alignment = PP_ALIGN.CENTER

    qr_path = "docs/repo_qr.png" if os.path.exists("docs/repo_qr.png") else "docs/assets/repo_qr_code.png"
    if os.path.exists(qr_path):
        s8.shapes.add_picture(qr_path, Inches(9.2), Inches(2.6), Inches(2.8), Inches(2.8))

    p_url = tf_qr.add_paragraph()
    p_url.text = "\n\n\n\n\n\n\n\ngithub.com/rahat4528/prohori-ai\nTested with 35 Passing Tests"
    p_url.font.size = Pt(10)
    p_url.font.color.rgb = CYAN_ACCENT
    p_url.alignment = PP_ALIGN.CENTER

    add_notes(s8, "Our rollout strategy centers on a dual-tier model: a free, self-hostable Community Edition to empower local universities and SMEs, alongside a commercial hypothesis of $1,200 per node annually for regulated institutions requiring custom compliance support. Prohori AI transforms cybersecurity from an exclusive luxury into an accessible, sovereign shield. Scan the QR code to review our repository and live demo. Thank you.")

    # Save presentation
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_deck()

