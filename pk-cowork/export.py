#!/usr/bin/env python3
"""Export each .page in index.html to a 1080x1350 PNG."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
HTML = HERE / "index.html"
OUT = HERE / "exports"
OUT.mkdir(exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 1080, "height": 1350},
            device_scale_factor=2,
        )
        page = await ctx.new_page()
        await page.goto(f"file://{HTML}")
        # Wait for fonts
        await page.wait_for_load_state("networkidle")
        await page.evaluate("document.fonts.ready")
        # Force body to single-column, no padding, so each .page is standalone
        await page.add_style_tag(content="""
            body { padding:0 !important; gap:0 !important; display:block !important; background:transparent !important; }
            .page { box-shadow:none !important; margin:0 !important; }
        """)
        count = await page.locator(".page").count()
        print(f"Found {count} pages")
        for i in range(count):
            el = page.locator(".page").nth(i)
            out = OUT / f"p{i+1:02d}.png"
            await el.screenshot(path=str(out))
            print(f"  → {out.name}")
        await browser.close()

asyncio.run(main())
