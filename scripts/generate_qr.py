import os

import qrcode

repo_url = "https://github.com/rahat4528/prohori-ai"
out_dir = "docs"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "repo_qr.png")

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(repo_url)
qr.make(fit=True)

img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
img.save(out_path)
print(f"QR code successfully generated and saved to {out_path} pointing to {repo_url}")
