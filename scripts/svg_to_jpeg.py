import os
import sys
import requests
import tempfile
import base64
from pathlib import Path
from PIL import Image
import cairosvg
from urllib.parse import urlparse
import re
from io import BytesIO

def download_and_encode_image(url):
    """Download external image and return base64 encoded data URI"""
    try:
        print(f"Downloading external image: {url}")
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Get content type
        content_type = response.headers.get('content-type', 'image/jpeg')
        if not content_type.startswith('image/'):
            content_type = 'image/jpeg'
        
        # Read image data
        image_data = response.content
        
        # Convert to base64
        base64_data = base64.b64encode(image_data).decode('utf-8')
        data_uri = f"data:{content_type};base64,{base64_data}"
        
        print(f"Successfully encoded image as base64 data URI")
        return data_uri
        
    except Exception as e:
        print(f"Warning: Failed to download {url}: {e}")
        return None

def process_svg_with_external_images(svg_path):
    """Process SVG file and replace external image references with base64 data URIs"""
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    
    # Find all image tags with external URLs (both href and xlink:href)
    image_patterns = [
        r'<image([^>]*?)href=["\']([^"\']+)["\']([^>]*?)>',
        r'<image([^>]*?)xlink:href=["\']([^"\']+)["\']([^>]*?)>'
    ]
    
    for pattern in image_patterns:
        matches = list(re.finditer(pattern, svg_content))
        
        for match in reversed(matches):  # Process in reverse to maintain positions
            before_href = match.group(1)
            href = match.group(2)
            after_href = match.group(3)
            
            # Check if it's an external URL
            if href.startswith(('http://', 'https://')):
                data_uri = download_and_encode_image(href)
                
                if data_uri:
                    # Replace the entire image tag with base64 version
                    if 'xlink:href' in pattern:
                        new_tag = f'<image{before_href}xlink:href="{data_uri}"{after_href}>'
                    else:
                        new_tag = f'<image{before_href}href="{data_uri}"{after_href}>'
                    
                    svg_content = svg_content.replace(match.group(0), new_tag)
                    print(f"Replaced {href} with base64 data URI")
    
    return svg_content

def svg_to_jpeg(svg_path, output_path, width=1200, height=630, quality=95):
    """Convert SVG to JPEG with high quality"""
    
    try:
        # Process SVG to handle external images
        print(f"Processing SVG and downloading external images...")
        processed_svg_content = process_svg_with_external_images(svg_path)
        
        # Convert SVG to PNG first (cairosvg handles SVG better than direct JPEG)
        print(f"Converting SVG to PNG...")
        png_data = cairosvg.svg2png(
            bytestring=processed_svg_content.encode('utf-8'),
            output_width=width,
            output_height=height,
            dpi=300
        )
        
        # Convert PNG to JPEG using PIL
        print(f"Converting PNG to JPEG...")
        with Image.open(BytesIO(png_data)) as img:
            # Convert RGBA to RGB (JPEG doesn't support transparency)
            if img.mode in ('RGBA', 'LA'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[-1])  # Use alpha channel as mask
                else:
                    background.paste(img)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as JPEG with high quality
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
        
        print(f"✅ Successfully converted {svg_path} to {output_path}")
        print(f"   Output size: {width}x{height} pixels")
        print(f"   Quality: {quality}%")
        
    except Exception as e:
        print(f"❌ Error converting SVG: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python svg_to_jpeg.py <input.svg> [output.jpg] [width] [height] [quality]")
        print("\nExamples:")
        print("  python svg_to_jpeg.py og-image-template.svg")
        print("  python svg_to_jpeg.py og-image-template.svg custom-output.jpg")
        print("  python svg_to_jpeg.py og-image-template.svg output.jpg 1200 630 95")
        sys.exit(1)
    
    # Parse arguments
    input_svg = sys.argv[1]
    output_jpg = sys.argv[2] if len(sys.argv) > 2 else input_svg.replace('.svg', '.jpg')
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 1200
    height = int(sys.argv[4]) if len(sys.argv) > 4 else 630
    quality = int(sys.argv[5]) if len(sys.argv) > 5 else 95
    
    # Validate input file
    if not os.path.exists(input_svg):
        print(f"❌ Error: Input file '{input_svg}' not found")
        sys.exit(1)
    
    if not input_svg.lower().endswith('.svg'):
        print(f"❌ Error: Input file must be an SVG file")
        sys.exit(1)
    
    # Convert
    print(f"🎨 Converting SVG to JPEG...")
    print(f"   Input: {input_svg}")
    print(f"   Output: {output_jpg}")
    
    svg_to_jpeg(input_svg, output_jpg, width, height, quality)

if __name__ == "__main__":
    main()
