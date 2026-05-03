import os
import glob
import re

# This script automatically updates all your admin pages to use the useMainWebsite hook!
# It removes the need for you to copy-paste 25 different files.

PAGES_DIR = 'src/pages' # Ensure this points to your pages folder

# We don't want to mess with the login page or pages already fully connected
EXCLUDE_PAGES = ['Login.tsx', 'Home.tsx', 'Order.tsx', 'Products.tsx']

hook_import = "import { useMainWebsite } from '../hooks/useMainWebsite';\n"

pages = glob.glob(f"{PAGES_DIR}/*.tsx")

for page_path in pages:
    filename = os.path.basename(page_path)
    if filename in EXCLUDE_PAGES:
        continue
        
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Skip if already added
    if "useMainWebsite" in content:
        continue
        
    # 1. Add the import at the top
    last_import_idx = content.rfind("import ")
    if last_import_idx != -1:
        end_of_line = content.find("\n", last_import_idx)
        content = content[:end_of_line+1] + hook_import + content[end_of_line+1:]
    else:
        content = hook_import + content
        
    # 2. Inject the hook inside the default export component
    func_match = re.search(r'export default function\s+(\w+)\s*\(\)\s*\{', content)
    
    if func_match:
        page_name = func_match.group(1)
        # Creates an endpoint based on the page name (e.g., /marketing, /analytics)
        endpoint = f"/{page_name.lower()}"
        
        hook_code = f"\n  const {{ data: liveData, loading, error, viewOnMainWebsite }} = useMainWebsite('{endpoint}');\n"
        
        insert_pos = func_match.end()
        content = content[:insert_pos] + hook_code + content[insert_pos:]
        
        # Write back the dynamically connected file
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully wired {filename} to the live API -> {endpoint}")

print("\n🎉 All static pages have been successfully wired to the main website API!")