#!/usr/bin/env python3
"""
Nano Banana Pro - AI Image Generation Script

This script provides a template for AI image generation.
Replace the placeholder implementation with your preferred
image generation API (DALL-E, Midjourney, Stable Diffusion, etc.)

Usage:
    python3 generate_image.py --prompt "description" --output "path.png" --width 1280 --height 720
"""

import argparse
import os
import sys
from pathlib import Path

# Style presets with additional prompt modifiers
STYLE_PRESETS = {
    "professional": "professional corporate style, clean lines, modern aesthetic, high quality",
    "illustration": "flat design illustration, vector art style, clean shapes, vibrant colors",
    "isometric": "isometric 3D illustration, geometric shapes, clean perspective, modern",
    "minimal": "minimalist design, simple shapes, lots of whitespace, clean",
    "vibrant": "bold colors, high contrast, dynamic composition, energetic",
    "technical": "technical diagram style, precise lines, schematic look, professional",
    "friendly": "warm and friendly illustration, soft colors, approachable, welcoming"
}


def generate_image(prompt: str, output_path: str, width: int, height: int, style: str = None) -> bool:
    """
    Generate an image from a text prompt.

    Args:
        prompt: Text description of the desired image
        output_path: Where to save the generated image
        width: Image width in pixels
        height: Image height in pixels
        style: Optional style preset to apply

    Returns:
        True if successful, False otherwise
    """
    # Apply style preset if specified
    if style and style in STYLE_PRESETS:
        prompt = f"{prompt}, {STYLE_PRESETS[style]}"

    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    print(f"Generating image...")
    print(f"  Prompt: {prompt[:100]}...")
    print(f"  Size: {width}x{height}")
    print(f"  Output: {output_path}")

    # ================================================================
    # PLACEHOLDER: Replace with your image generation implementation
    # ================================================================
    #
    # Option 1: OpenAI DALL-E
    # -----------------------
    # from openai import OpenAI
    # client = OpenAI()
    # response = client.images.generate(
    #     model="dall-e-3",
    #     prompt=prompt,
    #     size=f"{width}x{height}",
    #     quality="standard",
    #     n=1,
    # )
    # image_url = response.data[0].url
    # # Download and save image from URL
    #
    # Option 2: Stability AI
    # ----------------------
    # import stability_sdk
    # # Use Stability AI SDK
    #
    # Option 3: Replicate
    # -------------------
    # import replicate
    # output = replicate.run(
    #     "stability-ai/sdxl:...",
    #     input={"prompt": prompt, "width": width, "height": height}
    # )
    #
    # Option 4: Local Stable Diffusion
    # --------------------------------
    # from diffusers import StableDiffusionPipeline
    # pipe = StableDiffusionPipeline.from_pretrained("...")
    # image = pipe(prompt).images[0]
    # image.save(output_path)
    #
    # ================================================================

    # For now, create a placeholder image
    try:
        # Try using PIL to create a placeholder
        from PIL import Image, ImageDraw, ImageFont

        # Create image with primary color background
        img = Image.new('RGB', (width, height), color='#2563eb')
        draw = ImageDraw.Draw(img)

        # Add placeholder text
        text = f"[Placeholder]\n{prompt[:50]}..."
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            font = ImageFont.load_default()

        # Center text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (width - text_width) // 2
        y = (height - text_height) // 2

        draw.text((x, y), text, fill='white', font=font)

        # Save
        img.save(output_path)
        print(f"  Created placeholder image: {output_path}")
        return True

    except ImportError:
        # PIL not available, create empty file
        Path(output_path).touch()
        print(f"  Created empty placeholder (PIL not available): {output_path}")
        print("  Install Pillow for better placeholders: pip install Pillow")
        return True

    except Exception as e:
        print(f"  Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate AI images for e-learning content")
    parser.add_argument("--prompt", "-p", required=True, help="Text description of the image")
    parser.add_argument("--output", "-o", required=True, help="Output file path")
    parser.add_argument("--width", "-W", type=int, default=1280, help="Image width (default: 1280)")
    parser.add_argument("--height", "-H", type=int, default=720, help="Image height (default: 720)")
    parser.add_argument("--style", "-s", choices=list(STYLE_PRESETS.keys()),
                        help="Style preset to apply")

    args = parser.parse_args()

    success = generate_image(
        prompt=args.prompt,
        output_path=args.output,
        width=args.width,
        height=args.height,
        style=args.style
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
