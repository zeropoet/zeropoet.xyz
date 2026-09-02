#!/usr/bin/env python3
"""Dependency-free validation for the Zeropoet static site."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []
        self.images: list[str] = []
        self.project_names: list[str] = []
        self.meta_properties: set[str] = set()
        self.meta_names: set[str] = set()
        self._in_project_name = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "a":
            self.hrefs.append(values.get("href", ""))
        elif tag == "img":
            self.images.append(values.get("src", ""))
        elif tag == "span":
            self._in_project_name = True
        elif tag == "meta":
            if values.get("property"):
                self.meta_properties.add(values["property"])
            if values.get("name"):
                self.meta_names.add(values["name"])

    def handle_endtag(self, tag: str) -> None:
        if tag == "span":
            self._in_project_name = False

    def handle_data(self, data: str) -> None:
        if self._in_project_name and data.strip():
            self.project_names.append(data.strip())


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def main() -> int:
    site_html = (DOCS / "index.html").read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(site_html)
    failures: list[str] = []

    if any(not href.strip() for href in parser.hrefs):
        fail("Every anchor must have a non-empty href.", failures)

    expected_order = sorted(parser.project_names, key=str.casefold)
    if parser.project_names != expected_order:
        fail(f"Project cards are not alphabetical: {parser.project_names}", failures)

    for source in parser.images:
        if not source or not (DOCS / source).is_file():
            fail(f"Missing image asset: {source or '(empty src)'}", failures)

    required_files = {
        "apple-touch-icon.png",
        "assets/marks/foldforge.svg",
        "assets/marks/foldportrait.svg",
        "assets/marks/the-record.svg",
        "assets/marks/zeropoet.png",
        "assets/marks/zeropoet.svg",
        "favicon-16.png",
        "favicon-32.png",
        "favicon.svg",
        "social-preview.jpg",
        "styles.css",
    }
    for filename in sorted(required_files):
        if not (DOCS / filename).is_file():
            fail(f"Missing required site file: {filename}", failures)

    required_properties = {"og:title", "og:description", "og:url", "og:type", "og:image"}
    missing_properties = required_properties - parser.meta_properties
    if missing_properties:
        fail(f"Missing Open Graph metadata: {sorted(missing_properties)}", failures)

    required_names = {"description", "twitter:card", "twitter:title", "twitter:description", "twitter:image"}
    missing_names = required_names - parser.meta_names
    if missing_names:
        fail(f"Missing standard metadata: {sorted(missing_names)}", failures)

    if "one that can be approached, turned, sounded, and slowed into orientation" not in site_html:
        fail("The Telos index relation does not describe the current interactive Living System.", failures)
    if "Every gesture remains local and unrecorded." not in site_html:
        fail("The Telos index relation does not preserve its local-interaction privacy boundary.", failures)

    if failures:
        print("\n".join(f"ERROR: {message}" for message in failures), file=sys.stderr)
        return 1

    print(f"Validated {len(parser.project_names)} alphabetized projects and all site assets.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
