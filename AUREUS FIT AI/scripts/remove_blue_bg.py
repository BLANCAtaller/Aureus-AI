
from PIL import Image
import numpy as np
import os

# New image source provided by user
source_path = r"C:\Users\jmrod\.gemini\antigravity\brain\f0f09143-5d30-4454-b48b-6a43fa1c0f61\uploaded_image_0_1768676269702.png"
target_path = r"c:\Users\jmrod\Downloads\AUREUS FIT AI\images\logo.png"

def process_logo():
    print(f"Opening source: {source_path}")
    if not os.path.exists(source_path):
        print("Source file not found!")
        return

    img = Image.open(source_path).convert("RGBA")
    print(f"Original Dimensions: {img.size}")

    data = np.array(img)
    r, g, b, a = data.T

    # Target Blue Background Color
    # Based on the image, it's a deep blue. 
    # Let's define a range. Blue is dominant.
    # Condition: Blue > Red + 20 AND Blue > Green + 20 (Simple dominant blue check)
    # Also ensure it's darkish to avoid removing bright metallic blue highlights if any?
    # Actually the gold is Yellow/Orange, so R and G are high, B is low.
    # The Background is Blue, so B is high, R and G are low.
    
    # Goldish pixels: High R, High G, Low B.
    # Blueish pixels: Low R, Low G, High B.
    
    # Mask for Blue Background:
    # R < 100, G < 100, B > 50?
    # Let's try a simple heuristic for "Blue Dominant" 
    blue_mask = (b > r) & (b > g) & (b > 20) 
    
    # Apply transparency to blue mask
    data[..., 3][blue_mask.T] = 0
    
    # Create processed image
    img_processed = Image.fromarray(data)
    
    # Crop to content to remove excess transparent space
    bbox = img_processed.getbbox()
    if bbox:
        img_cropped = img_processed.crop(bbox)
        print(f"Cropped to content: {bbox}")
    else:
        img_cropped = img_processed

    # Add Padding to fix "cut corners" perception
    # We will place the cropped logo into a slightly larger square canvas
    w, h = img_cropped.size
    max_dim = max(w, h)
    padding = 20 # Increased padding: Reduces visual "hugeness" and gives more breathing room
    new_size = max_dim + (padding * 2)
    
    final_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
    
    # Center the logo
    paste_x = (new_size - w) // 2
    paste_y = (new_size - h) // 2
    final_img.paste(img_cropped, (paste_x, paste_y))
    
    # Save
    final_img.save(target_path)
    print(f"Saved processed logo to: {target_path}")

if __name__ == "__main__":
    process_logo()
