#!/usr/bin/env python3
"""
Generate SVG — AI-Powered SVG Generation Script

Generates clean, themeable SVG icons and illustrations using the Gemini API.
Supports both static and animated SVGs with CSS @keyframes.
Falls back to placeholder SVGs when the API is unavailable.

Usage:
    python3 generate_svg.py --prompt "warning triangle" --style line-icon --output icon.svg
    python3 generate_svg.py --prompt "shield with checkmark" --output shield.svg
    python3 generate_svg.py --prompt "simple chart" --no-animated --model flash --output chart.svg

Defaults:
    Model: Gemini 3.1 Pro (best quality for animated SVGs)
    Animation: ON (CSS @keyframes with stroke draw-on, fade-in, stagger)
    Use --no-animated for static SVGs, --model flash for faster/cheaper generation.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ---------------------------------------------------------------------------
# Style presets — appended to the user's prompt for consistent output
# ---------------------------------------------------------------------------
STYLE_PRESETS = {
    "line-icon": (
        "minimal line icon style, single uniform stroke weight (2px), "
        "no fills, rounded linecaps and linejoins, clean geometric shapes"
    ),
    "flat-fill": (
        "flat filled shapes, no strokes, geometric and bold, "
        "solid shapes with clean edges, minimal detail"
    ),
    "detailed": (
        "detailed illustration style, mix of fills and strokes, "
        "subtle depth through opacity variations, badge/emblem quality"
    ),
    "pattern": (
        "repeating geometric pattern, tileable, subtle and decorative, "
        "use varying opacity (0.05-0.3) for depth"
    ),
    "diagram": (
        "technical diagram style, clean connecting lines and arrows, "
        "precise geometry, labeled shapes, 1.5px stroke weight"
    ),
}

# ---------------------------------------------------------------------------
# Use-case templates — ready-to-use prompt prefixes per SCORM context
# ---------------------------------------------------------------------------
USE_CASE_TEMPLATES = {
    "section-bg": (
        "Abstract background illustration for an e-learning slide section. "
        "Subtle, decorative, low visual weight — content will overlay this. "
        "Use soft shapes, flowing curves, or geometric patterns. "
    ),
    "card-icon": (
        "Simple, recognizable icon for an e-learning card or button. "
        "Single concept, immediately readable at 48x48px. "
        "Minimal detail, bold shapes. "
    ),
    "content-illustration": (
        "Educational illustration explaining a concept. "
        "Clear visual hierarchy, simple enough for a learner to scan quickly. "
        "Use visual metaphors rather than literal depictions. "
    ),
    "quiz-decoration": (
        "Decorative illustration for a quiz or assessment screen. "
        "Encouraging and motivational — conveys thinking/discovery. "
        "Light, unobtrusive — the quiz questions are the star. "
    ),
    "module-header": (
        "Wide banner illustration for an e-learning module header. "
        "Landscape orientation, bold composition, thematic to the topic. "
        "Works well at 1280x400px with text overlaid on top. "
    ),
}

# ---------------------------------------------------------------------------
# Prompt patterns — battle-tested structures for different quality levels
# ---------------------------------------------------------------------------
PROMPT_PATTERNS = {
    "simple": (
        "Create a clean, minimal SVG. Focus on clarity and readability. "
        "Use 3-4 shapes maximum. Every element must serve a purpose."
    ),
    "cinematic": (
        "Create an atmospheric, layered SVG illustration. "
        "Use depth through overlapping shapes with varying opacity. "
        "Add subtle gradients for dimension. Think movie poster composition."
    ),
    "isometric": (
        "Create an isometric 3D-style SVG illustration. "
        "Use 30-degree angles for the isometric grid. "
        "Consistent lighting from top-left. Clean geometric precision."
    ),
}

# ---------------------------------------------------------------------------
# Model config — flash is default (fast + cheap), pro for complex work
# ---------------------------------------------------------------------------
MODELS = {
    "flash": {
        "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        "label": "Gemini 2.5 Flash",
        "timeout": 60,
    },
    "pro": {
        "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent",
        "label": "Gemini 3.1 Pro",
        "timeout": 90,
    },
}

DEFAULT_MODEL = "pro"


# ---------------------------------------------------------------------------
# Load API key from environment or .env file
# ---------------------------------------------------------------------------
def load_api_key() -> str:
    """Load GEMINI_API_KEY from environment, or from .env file in project root."""
    # Check environment first
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key

    # Walk up from script location looking for .env
    search_dir = Path(__file__).resolve().parent
    for _ in range(6):  # up to 6 levels
        env_file = search_dir / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line.startswith("GEMINI_API_KEY=") and not line.startswith("#"):
                    key = line.split("=", 1)[1].strip().strip("'\"")
                    if key:
                        return key
        search_dir = search_dir.parent

    return ""


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------
def build_prompt(user_prompt: str, style: str, width: int, height: int, animated: bool,
                 use_case: str = "", pattern: str = "") -> str:
    """Build the full prompt for SVG generation.

    Args:
        use_case: Optional context template (section-bg, card-icon, etc.)
        pattern: Optional quality pattern (simple, cinematic, isometric)
    """
    style_desc = STYLE_PRESETS.get(style, STYLE_PRESETS["line-icon"])
    use_case_prefix = USE_CASE_TEMPLATES.get(use_case, "")
    pattern_suffix = PROMPT_PATTERNS.get(pattern, "")

    base = f"""Create a single SVG for: {use_case_prefix}{user_prompt}

Requirements:
- Clean, minimal SVG code
- Use viewBox="0 0 {width} {height}"
- All colors must use currentColor (for CSS theming)
- No <text> elements (use paths for any text-like shapes)
- No embedded images or external references
- Simplify paths to use minimal anchor points while maintaining the shape
- Style: {style_desc}
- The SVG must start with <svg and end with </svg>"""

    if animated:
        base += """

Animation requirements:
- Add a <style> tag inside the SVG with CSS @keyframes
- Use stroke-dasharray + stroke-dashoffset for path draw-on effects
- Stagger animations with animation-delay so elements appear sequentially
- Use ease-in-out or ease-out easing
- Total animation duration: 1-2 seconds
- animation-fill-mode: forwards (hold final state)"""

    if pattern_suffix:
        base += f"\n\nQuality direction: {pattern_suffix}"

    base += "\n\nOutput ONLY the raw SVG code. No markdown fences, no explanation."
    return base


# ---------------------------------------------------------------------------
# API call
# ---------------------------------------------------------------------------
def call_gemini_api(prompt: str, api_key: str, model: str) -> tuple[str, str]:
    """Call Gemini API and return (response_text, finish_reason)."""
    model_config = MODELS.get(model, MODELS[DEFAULT_MODEL])

    payload = json.dumps({
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 8192,
        }
    }).encode("utf-8")

    request = Request(
        f"{model_config['endpoint']}?key={api_key}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=model_config["timeout"]) as response:
            data = json.loads(response.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if candidates:
                candidate = candidates[0]
                finish_reason = candidate.get("finishReason", "UNKNOWN")
                parts = candidate.get("content", {}).get("parts", [])
                text = parts[0].get("text", "") if parts else ""
                return text, finish_reason
    except HTTPError as e:
        print(f"  API error: {e.code} {e.reason}", file=sys.stderr)
    except URLError as e:
        reason = str(e.reason)
        if "timed out" in reason.lower():
            print(f"  Timeout ({model_config['timeout']}s) — try a simpler prompt or --model flash", file=sys.stderr)
        else:
            print(f"  Network error: {reason}", file=sys.stderr)
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)

    return "", "ERROR"


# ---------------------------------------------------------------------------
# SVG extraction and validation
# ---------------------------------------------------------------------------
def extract_svg(raw_text: str) -> str:
    """Extract clean SVG from API response, stripping markdown fences."""
    text = raw_text.strip()
    # Strip markdown code fences (```svg, ```xml, ```)
    text = re.sub(r'^```(?:svg|xml|html)?\s*\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n?```\s*$', '', text, flags=re.MULTILINE)
    text = text.strip()

    # Find the SVG element (greedy — captures nested tags)
    svg_match = re.search(r'(<svg[\s\S]*</svg>)', text)
    if svg_match:
        return svg_match.group(1)

    return ""


def validate_svg(svg_text: str) -> bool:
    """Basic validation that the output is a valid SVG."""
    if not svg_text.strip().startswith("<svg"):
        return False
    if "</svg>" not in svg_text:
        return False
    if "viewBox" not in svg_text:
        return False
    return True


# ---------------------------------------------------------------------------
# Placeholder fallback
# ---------------------------------------------------------------------------
def create_placeholder_svg(prompt: str, width: int, height: int, animated: bool) -> str:
    """Create a placeholder SVG when API is unavailable."""
    cx = width / 2
    cy = height / 2
    r = min(width, height) * 0.35

    anim_note = " (animated)" if animated else ""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- PLACEHOLDER{anim_note}: {prompt} -->
  <!-- Replace with AI-generated SVG or set GEMINI_API_KEY -->
  <circle cx="{cx}" cy="{cy}" r="{r}" stroke-dasharray="4 4" opacity="0.5"/>
  <line x1="{cx - r*0.3}" y1="{cy - r*0.3}" x2="{cx + r*0.3}" y2="{cy + r*0.3}" opacity="0.3"/>
  <line x1="{cx + r*0.3}" y1="{cy - r*0.3}" x2="{cx - r*0.3}" y2="{cy + r*0.3}" opacity="0.3"/>
</svg>"""


# ---------------------------------------------------------------------------
# Main generation function
# ---------------------------------------------------------------------------
def generate_svg(
    prompt: str,
    output_path: str,
    width: int,
    height: int,
    style: str,
    animated: bool,
    model: str,
    use_case: str = "",
    pattern: str = "",
) -> bool:
    """Generate an SVG from a text prompt using the Gemini API."""
    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    model_config = MODELS.get(model, MODELS[DEFAULT_MODEL])
    anim_label = " (animated)" if animated else ""

    print(f"Generating SVG{anim_label}...")
    print(f"  Prompt: {prompt}")
    print(f"  Style: {style}")
    print(f"  Size: {width}x{height}")
    print(f"  Model: {model_config['label']}")
    print(f"  Output: {output_path}")

    # Load API key
    api_key = load_api_key()

    if api_key:
        # Build and send prompt
        full_prompt = build_prompt(prompt, style, width, height, animated, use_case, pattern)
        raw_response, finish_reason = call_gemini_api(full_prompt, api_key, model)

        if finish_reason == "MAX_TOKENS":
            print(f"  Warning: Response truncated (MAX_TOKENS). Try a simpler prompt.", file=sys.stderr)

        if raw_response:
            svg_text = extract_svg(raw_response)

            if validate_svg(svg_text):
                Path(output_path).write_text(svg_text, encoding="utf-8")
                size_kb = len(svg_text) / 1024
                print(f"  Generated SVG: {output_path} ({size_kb:.1f} KB)")
                return True
            else:
                print(f"  API returned invalid SVG, falling back to placeholder", file=sys.stderr)
    else:
        print(f"  No GEMINI_API_KEY found (checked env + .env), creating placeholder")

    # Fallback: create placeholder
    placeholder = create_placeholder_svg(prompt, width, height, animated)
    Path(output_path).write_text(placeholder, encoding="utf-8")
    print(f"  Created placeholder SVG: {output_path}")
    return True


# ---------------------------------------------------------------------------
# Batch generation from a JSON manifest
# ---------------------------------------------------------------------------
def batch_generate(manifest_path: str, output_dir: str, style: str, animated: bool, model: str) -> int:
    """Generate all SVGs listed in a manifest JSON file.

    Manifest format (array of objects):
    [
      {"name": "hero-bg", "prompt": "...", "use_case": "section-bg", "width": 1280, "height": 400},
      {"name": "quiz-icon", "prompt": "...", "use_case": "card-icon", "width": 64, "height": 64}
    ]

    Returns the number of successfully generated SVGs.
    """
    manifest_file = Path(manifest_path)
    if not manifest_file.exists():
        print(f"Error: Manifest file not found: {manifest_path}", file=sys.stderr)
        return 0

    try:
        items = json.loads(manifest_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in manifest: {e}", file=sys.stderr)
        return 0

    if not isinstance(items, list):
        print(f"Error: Manifest must be a JSON array", file=sys.stderr)
        return 0

    success_count = 0
    total = len(items)
    print(f"\nBatch generating {total} SVGs from {manifest_path}\n")

    for i, item in enumerate(items):
        name = item.get("name", f"svg_{i:02d}")
        prompt = item.get("prompt", "")
        use_case = item.get("use_case", "")
        pattern = item.get("pattern", "")
        w = item.get("width", 64)
        h = item.get("height", 64)
        item_style = item.get("style", style)

        if not prompt:
            print(f"  [{i+1}/{total}] Skipping {name} — no prompt")
            continue

        output_path = os.path.join(output_dir, f"{name}.svg")
        print(f"  [{i+1}/{total}] {name}...")

        ok = generate_svg(
            prompt=prompt,
            output_path=output_path,
            width=w,
            height=h,
            style=item_style,
            animated=animated,
            model=model,
            use_case=use_case,
            pattern=pattern,
        )
        if ok:
            success_count += 1

    print(f"\nBatch complete: {success_count}/{total} generated successfully")
    return success_count


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Generate AI-powered SVG icons and illustrations via Gemini API"
    )
    parser.add_argument(
        "--prompt", "-p", default="",
        help="Text description of the SVG to generate (required unless using --batch)"
    )
    parser.add_argument(
        "--output", "-o", default="",
        help="Output file path (.svg) (required unless using --batch)"
    )
    parser.add_argument(
        "--style", "-s",
        choices=list(STYLE_PRESETS.keys()),
        default="line-icon",
        help="Style preset (default: line-icon)"
    )
    parser.add_argument(
        "--width", "-W", type=int, default=64,
        help="viewBox width (default: 64)"
    )
    parser.add_argument(
        "--height", "-H", type=int, default=64,
        help="viewBox height (default: 64)"
    )
    parser.add_argument(
        "--animated", "-a", action="store_true", default=True,
        help="Add CSS @keyframes animation (default: on)"
    )
    parser.add_argument(
        "--no-animated", dest="animated", action="store_false",
        help="Disable CSS animation (static SVG only)"
    )
    parser.add_argument(
        "--model", "-m",
        choices=list(MODELS.keys()),
        default=DEFAULT_MODEL,
        help=f"Gemini model (default: {DEFAULT_MODEL}). 'flash' is fast+cheap, 'pro' for complex work"
    )
    parser.add_argument(
        "--use-case", "-u",
        choices=list(USE_CASE_TEMPLATES.keys()),
        default="",
        help="Context template: section-bg, card-icon, content-illustration, quiz-decoration, module-header"
    )
    parser.add_argument(
        "--pattern",
        choices=list(PROMPT_PATTERNS.keys()),
        default="",
        help="Quality pattern: simple (minimal), cinematic (layered), isometric (3D)"
    )
    parser.add_argument(
        "--batch", "-b",
        default="",
        help="Path to a JSON manifest file for batch generation. Overrides --prompt and --output."
    )
    parser.add_argument(
        "--batch-output-dir",
        default="",
        help="Output directory for batch mode (default: same directory as manifest)"
    )

    args = parser.parse_args()

    # Batch mode
    if args.batch:
        output_dir = args.batch_output_dir or os.path.dirname(args.batch) or "."
        count = batch_generate(
            manifest_path=args.batch,
            output_dir=output_dir,
            style=args.style,
            animated=args.animated,
            model=args.model,
        )
        sys.exit(0 if count > 0 else 1)

    # Single file mode
    if not args.prompt or not args.output:
        parser.error("--prompt and --output are required (unless using --batch)")

    success = generate_svg(
        prompt=args.prompt,
        output_path=args.output,
        width=args.width,
        height=args.height,
        style=args.style,
        animated=args.animated,
        model=args.model,
        use_case=args.use_case,
        pattern=args.pattern,
    )

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
