import os
import re

files_to_check = [
    "src/sections/Footer/components/FooterLinks.tsx",
    "src/sections/Navbar/components/FeaturesDropdown.tsx",
    "src/sections/Navbar/components/NavbarLogo.tsx",
    "src/sections/ProprietaryModels/index.tsx",
    "src/sections/Footer/components/FooterBottom.tsx",
    "src/sections/GallerySection/index.tsx",
    "src/sections/FeaturesGrid/index.tsx",
    "src/sections/UISection/index.tsx",
    "src/sections/Hero/components/HeroSection.tsx",
    "src/sections/ClientsSection/index.tsx",
    "src/sections/GallerySection/components/ModelLogosMarquee.tsx",
    "src/app/(auth)/sign-in/[[...sign-in]]/page.tsx",
    "src/app/(auth)/sign-up/[[...sign-up]]/page.tsx",
    "src/sections/UseCasesSection/components/UseCasesList.tsx"
]

def replace_krea(text):
    # We want to replace Krea with NextFlow, but KEEP URLs intact.
    # URLs look like https://...krea.ai/... or c.animaapp.com/.../krea1-...
    
    # We can use a regex that looks for Krea but uses a negative lookbehind/lookahead for URL characters
    # Or just replace all, and then fix the URLs back!
    # Let's collect all URLs in the document and store them.
    urls = re.findall(r'https?://[^\s"\'<>]+', text)
    
    # Replace all variations
    new_text = re.sub(r'\bKrea 1\b', 'NextFlow 1', text)
    new_text = re.sub(r'\bKrea\.ai\b', 'NextFlow', new_text)
    new_text = re.sub(r'\bkrea\.ai\b', 'nextflow', new_text)
    new_text = re.sub(r'\bKrea\'s\b', "NextFlow's", new_text)
    new_text = re.sub(r'\bKrea\b', 'NextFlow', new_text)
    
    # Wait, some URLs might have been damaged (like https://s.NextFlow.ai)
    # Let's restore the exact URLs we found!
    for url in set(urls):
        damaged_url = re.sub(r'\bKrea 1\b', 'NextFlow 1', url)
        damaged_url = re.sub(r'\bKrea\.ai\b', 'NextFlow', damaged_url)
        damaged_url = re.sub(r'\bkrea\.ai\b', 'nextflow', damaged_url)
        damaged_url = re.sub(r'\bKrea\'s\b', "NextFlow's", damaged_url)
        damaged_url = re.sub(r'\bKrea\b', 'NextFlow', damaged_url)
        
        # Replace the damaged one back to the original
        if damaged_url != url:
            new_text = new_text.replace(damaged_url, url)
            
    # Also fix anything like "krea1-example" that might have become NextFlow1-example if \b caught it
    new_text = new_text.replace("NextFlow1-example", "krea1-example")
    
    return new_text

for filepath in files_to_check:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        modified = replace_krea(content)
        
        if content != modified:
            with open(filepath, 'w') as f:
                f.write(modified)
            print(f"Updated {filepath}")
