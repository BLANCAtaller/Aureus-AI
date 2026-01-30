import os
import zipfile
from datetime import datetime

def create_deploy_package():
    # Timestamp for the filename
    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    zip_name = f"AUREUS_CLOUDFLARE_DEPLOY_{timestamp}.zip"
    
    source_dir = os.getcwd()
    
    # Whitelist of extensions for root files to ensure we don't grab junk
    allowed_extensions = {'.html', '.js', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.ico', '.xml'}
    allowed_filenames = {'_headers', '_redirects'} # Special config files
    
    # Directories to forcefully exclude
    exclude_dirs_prefix = {'backup', 'DEPLOY', 'AUREUS_', '.'} 
    
    print(f"Packaging for Cloudflare: {zip_name} ...")
    
    count = 0
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # FILTER DIRECTORIES
            # Remove any directory starting with excluded prefixes or hidden dirs
            dirs[:] = [d for d in dirs if not any(d.startswith(p) for p in exclude_dirs_prefix) and d != '__pycache__']
            
            for file in files:
                # FILTER FILES
                _, ext = os.path.splitext(file)
                
                # Check specifics
                is_allowed = (ext.lower() in allowed_extensions) or (file in allowed_filenames)
                
                # Double check against blacklist (just in case)
                if file.endswith('.py') or file.endswith('.zip'):
                    is_allowed = False
                    
                if is_allowed:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source_dir)
                    
                    # Extra check: Don't accidentally zip a file inside a backup folder 
                    # (logic above with dirs[:] handles recursion, but just to be safe)
                    if 'backup' in arcname.lower() or 'deploy' in arcname.lower():
                        continue
                        
                    print(f"  + Adding: {arcname}")
                    zipf.write(file_path, arcname)
                    count += 1
                    
    print(f"\nDONE! {count} files packaged into {zip_name}")
    print("Upload this file directly to Cloudflare Pages.")

if __name__ == "__main__":
    create_deploy_package()
