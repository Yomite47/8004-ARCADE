import requests
import json
import os

JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOTZiOWY5Mi01MjJmLTQxMzUtYjFjMi0xY2U5ZTc0MWNlNTIiLCJlbWFpbCI6Im9sYWZvbGFyaW40N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTg0NmQ1YWI1NzFmNmY2YjFkMjciLCJzY29wZWRLZXlTZWNyZXQiOiI4NDRjODcwNmNiNDk5MTI5MTI5YzI2ZTFiZDc3ZTY4YjdmNTA3MGRiMWNiMTdhMWQ2M2Y1NDhjZmU0NzU1NWYzIiwiZXhwIjoxODAxNDc2NTY2fQ.hclBH5qvpeXK13Ctv4EyPATH5qJRSfY1WUpj3_oKjyE'
file_path = 'images.car'
url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

# Re-open file in binary mode
with open(file_path, 'rb') as f:
    files = {
        'file': ('images.car', f, 'application/octet-stream')
    }
    data = {
        'pinataMetadata': json.dumps({"name": "Arcade8004_Images_CAR"}),
        'pinataOptions': json.dumps({"cidVersion": 1}),
        # 'car': 'true' # Try omitting it first, or use the v3 endpoint if this fails.
        # But wait, if I don't set car=true, it pins as file.
        # Let's try adding it to data as string 'true'
        'car': 'true'
    }

    headers = {
        'Authorization': f'Bearer {JWT}'
    }

    print(f"Uploading {file_path}...")
    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        print("Status Code:", response.status_code)
        print("Response:", response.text)
    except Exception as e:
        print("Request failed:", e)
