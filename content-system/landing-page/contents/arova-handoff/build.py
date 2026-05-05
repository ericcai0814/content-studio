#!/usr/bin/env python3
"""產生 dist/：把跨目錄相依的 base.css 攤平複製進 dist/，
並改寫 index.html 的 link 路徑成 ./*.css，讓整個 dist/ 可直接 deploy。
v2 改版後 app.css 自帶完整 design tokens，不再依賴 themes/claude.css。

執行：uv run python build.py
"""
import shutil
import pathlib
import sys

here = pathlib.Path(__file__).parent
content_system = (here / "../../..").resolve()  # content-system/
dist = here / "dist"

if dist.exists():
    shutil.rmtree(dist)
dist.mkdir()

copies = [
    (content_system / "landing-page/base.css", dist / "base.css"),
    (here / "app.css", dist / "app.css"),
    (here / "app.js", dist / "app.js"),
    (here / "responses.css", dist / "responses.css"),
    (here / "responses.js", dist / "responses.js"),
]

for src, dst in copies:
    if not src.exists():
        sys.exit(f"missing source file: {src}")
    shutil.copy(src, dst)

html = (here / "index.html").read_text(encoding="utf-8")
html = html.replace("../../base.css", "./base.css")
(dist / "index.html").write_text(html, encoding="utf-8")

rhtml = (here / "responses.html").read_text(encoding="utf-8")
rhtml = rhtml.replace("../../base.css", "./base.css")
(dist / "responses.html").write_text(rhtml, encoding="utf-8")

print(f"dist built at {dist}")
for p in sorted(dist.iterdir()):
    print(f"  {p.name}  ({p.stat().st_size} bytes)")
