import requests
import json

JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOTZiOWY5Mi01MjJmLTQxMzUtYjFjMi0xY2U5ZTc0MWNlNTIiLCJlbWFpbCI6Im9sYWZvbGFyaW40N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTg0NmQ1YWI1NzFmNmY2YjFkMjciLCJzY29wZWRLZXlTZWNyZXQiOiI4NDRjODcwNmNiNDk5MTI5MTI5YzI2ZTFiZDc3ZTY4YjdmNTA3MGRiMWNiMTdhMWQ2M2Y1NDhjZmU0NzU1NWYzIiwiZXhwIjoxODAxNDc2NTY2fQ.hclBH5qvpeXK13Ctv4EyPATH5qJRSfY1WUpj3_oKjyE'
file_path = 'images.car'
url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

print(f"Uploading {file_path} to Pinata...")

try:
    with open(file_path, 'rb') as f:
        files = {
            'file': ('images.car', f, 'application/octet-stream')
        }
        # Note: pinataMetadata and pinataOptions must be JSON strings
        data = {
            'pinataMetadata': json.dumps({"name": "Arcade8004_Images_CAR"}),
            'pinataOptions': json.dumps({"cidVersion": 1}),
            # 'car': 'true' # Try adding this as a form field
        }
        # IMPORTANT: Pinata documentation is slightly ambiguous on where 'car=true' goes for this endpoint.
        # Some docs say query param, some say form field. 
        # But 'https://uploads.pinata.cloud/v3/files' is the new API.
        # We are using the legacy 'pinFileToIPFS' which might NOT support 'car=true'.
        # However, let's try appending it to URL if this fails, or use the v3 endpoint if possible.
        # But v3 requires signed URLs or different auth? No, same JWT.
        # Let's try to append ?unpack=true (unofficial) or just upload.
        
        # Actually, let's use the query param just in case, AND the form field.
        
        # Updating to use the form field as per search result 2 (though that was v3).
        # data['car'] = 'true' 
        
        headers = {
            'Authorization': f'Bearer {JWT}'
        }
        
        # Let's try the V3 endpoint? 
        # url_v3 = "https://uploads.pinata.cloud/v3/files"
        # But let's stick to pinFileToIPFS first but with the car param if possible.
        # If I simply upload the CAR to pinFileToIPFS, I get the file CID.
        
        # Let's try to upload to pinFileToIPFS but assume I can use the CID locally.
        
        response = requests.post(url, headers=headers, files=files, data=data)
        
        print("Status Code:", response.status_code)
        print("Response:", response.text)
        
except Exception as e:
    print("Error:", e)
