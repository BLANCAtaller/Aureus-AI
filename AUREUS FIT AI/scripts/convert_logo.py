import codecs
import os

try:
    with codecs.open('base64_logo.txt', 'r', 'utf-16-le') as f:
        data = f.read().strip()
    
    # Remove any potential markers at the start
    if data.startswith('\ufeff'):
        data = data[1:]

    js_content = f'const AUREUS_LOGO_BASE64 = "data:image/png;base64,{data}";'
    
    with open('logo-base64.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Successfully created logo-base64.js")
except Exception as e:
    print(f"Error: {e}")
