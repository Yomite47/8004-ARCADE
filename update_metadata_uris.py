import os
import sys
import json

def update_metadata(cid):
    metadata_dir = os.path.join("public", "ready_for_upload", "metadata")
    
    if not os.path.exists(metadata_dir):
        print(f"Error: Directory {metadata_dir} not found.")
        return

    count = 0
    for filename in os.listdir(metadata_dir):
        if filename.endswith(".json"):
            file_path = os.path.join(metadata_dir, filename)
            
            # Extract ID from filename (e.g. 1.json -> 1)
            try:
                file_id = os.path.splitext(filename)[0]
                # Assuming images have .png extension and same ID
                image_uri = f"ipfs://{cid}/{file_id}.png"
                
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                data['image'] = image_uri
                
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)
                
                count += 1
                if count % 1000 == 0:
                    print(f"Updated {count} files...")
                    
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    print(f"Successfully updated {count} metadata files with CID: {cid}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_metadata_uris.py <CID>")
    else:
        update_metadata(sys.argv[1])
