import os
from PIL import Image

TARGET_DIR = r"c:\Users\jmrod\Downloads\AUREUS\AUREUS_SOFTWARE\AUREUS FIT AI\images"
MIN_SIZE_KB = 50

def convert_to_webp(root_dir):
    count = 0
    saved_bytes = 0
    print(f"Scanning {root_dir} for images > {MIN_SIZE_KB}KB...")
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')) and not file.lower().endswith('.webp'):
                filepath = os.path.join(root, file)
                # Skip if active backup or archive if possible, but path is explicit
                if "_ARCHIVE" in filepath:
                    continue

                try:
                    size_kb = os.path.getsize(filepath) / 1024
                except OSError:
                    continue
                
                if size_kb > MIN_SIZE_KB:
                    try:
                        img = Image.open(filepath)
                        webp_path = os.path.splitext(filepath)[0] + '.webp'
                        
                        # Convert
                        # Handle RGBA for PNG
                        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                            img.save(webp_path, 'WEBP', quality=80, method=6)
                        else:
                            img = img.convert("RGB")
                            img.save(webp_path, 'WEBP', quality=80, method=6)
                        
                        new_size_kb = os.path.getsize(webp_path) / 1024
                        saved = size_kb - new_size_kb
                        
                        # If webp is bigger (rare but possible), discard? No, usually keep.
                        print(f"Converted {file}: {size_kb:.1f}KB -> {new_size_kb:.1f}KB")
                        count += 1
                        saved_bytes += (saved * 1024)
                    except Exception as e:
                        print(f"Error converting {file}: {e}")

    print(f"Total converted: {count}")
    print(f"Total saved: {saved_bytes / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    convert_to_webp(TARGET_DIR)
