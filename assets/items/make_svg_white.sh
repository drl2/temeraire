#!/bin/bash

# Target directory (defaults to current directory if none specified)
TARGET_DIR="${1:-.}"

echo "Scanning for SVG files in: $TARGET_DIR"

for file in "$TARGET_DIR"/*.svg; do
    # Skip if no .svg files are found
    [ -e "$file" ] || continue
    
    echo "Processing: $file"
    
    # 1. Inject fill="#FFFFFF" into any <path> that doesn't have a fill attribute (like FontAwesome icons)
    perl -pi -e 's/<path(?![^>]*\bfill\b)/<path fill="#FFFFFF"/gi' "$file"
    
    # 2. Replace existing fill attributes with white (ignoring 'none' or 'transparent')
    perl -pi -e 's/fill\s*=\s*"(?!none|transparent)[^"]*"/fill="#FFFFFF"/gi' "$file"
    
    # 3. Replace stroke attributes with white (ignoring 'none' or 'transparent')
    perl -pi -e 's/stroke\s*=\s*"(?!none|transparent)[^"]*"/stroke="#FFFFFF"/gi' "$file"
    
    # 4. Replace fill styles inside style="..." tags
    perl -pi -e 's/fill\s*:\s*(?!none|transparent)[^;"]+/fill: #FFFFFF/gi' "$file"
    
    # 5. Replace stroke styles inside style="..." tags
    perl -pi -e 's/stroke\s*:\s*(?!none|transparent)[^;"]+/stroke: #FFFFFF/gi' "$file"
done

echo "All SVG files (including FontAwesome) have been updated to white!"

