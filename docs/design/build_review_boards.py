#!/usr/bin/env python3
"""Extend the supplied editable SVG boards with verified recovery states.

Run with Pillow installed. Originals are copied into review/source on the first
run and kept unchanged. All additions use the project's existing vector renderer,
palette, typography and source icons. This script never modifies application data.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
import shutil
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "review"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
spec = importlib.util.spec_from_file_location("stay_design", ROOT / "generate_design.py")
design = importlib.util.module_from_spec(spec)
spec.loader.exec_module(design)


def alert(s, x, y, width, message):
    s.rect(x, y, width, 70, "error", radius=6)
    s.icon("ReceiptText", x + 16, y + 18, 20, "terracotta")
    s.text(x + 50, y + 17, message, 12, "terracotta", max_width=width - 70)


def card(s, key, x, y, w, h, title):
    s.panel(key, x, y, w, h, title)


def page_state(s, missing=False):
    s.shell("Page not found" if missing else "Browse", "44,911.00")
    s.panel("page-recovery", 430, 270, 800, 570)
    s.icon("Leaf", 802, 328, 36)
    s.text(770, 403, "404" if missing else "SCREEN ERROR", 12, "muted", True)
    s.text(500, 455, "That page could not be found" if missing else "Something went wrong", 35, serif=True)
    message = "Choose a screen from the sidebar or return to Browse." if missing else "This screen could not be displayed. Try again or return to Browse."
    s.text(500, 525, message, 15, "muted", max_width=640)
    if missing:
        s.button(734, 620, 170, "Go to Browse", False)
    else:
        s.button(645, 620, 140, "Try again")
        s.button(805, 620, 170, "Go to Browse", False)
    s.footer("Recovery · invalid links get 404; render failures keep a recovery screen. Retry does not replay a booking.")


def details_states(s):
    s.shell("Browse", "44,911.00")
    s.heading("RECORD DETAILS", "A response inside the dialog.", "Independent loading and failure examples; the dialog opens immediately and remains closable.")
    for x, key, title in [(262, "detail-loading", "Loading record"), (842, "detail-failure", "Unavailable record")]:
        card(s, key, x, 290, 556, 620, title)
        s.text(x + 30, 360, "Your stay, at a glance", 21, bold=True)
        s.icon("X", x + 505, 360, 20, "muted")
        if key == "detail-loading":
            s.icon("RefreshCw", x + 265, 500, 25)
            s.text(x + 145, 565, "Getting everything ready…", 16)
            s.text(x + 30, 720, "Close dialog and Escape still work while the request runs.", 14, "muted", max_width=480)
        else:
            alert(s, x + 28, 472, 500, "Record not found.")
            s.button(x + 190, 580, 150, "Try again", False)
            s.text(x + 30, 720, "The same dialog handles missing records and read failures. Retry repeats only the GET.", 14, "muted", max_width=480)
    s.footer("Member 1 · PropertyDetails + DataState · same modal, focus handling and read-only retry; no new detail endpoint.")


def field_states(s):
    s.shell("Book a stay", "44,911.00")
    s.heading("VALIDATION", "Keep the field and the fix together.", "Invalid input stays editable; invalid requests are paused instead of replacing the screen.")
    cases = [
        ("nights", "Booking · whole nights", "Number of nights", "0", "Enter a whole number of nights from 1 to 365.", "Confirm booking is disabled until the value is valid."),
        ("audit", "Audit · reversed dates", "From / To", "2026-10-20  /  2026-10-15", "From date must be on or before To date.", "Date fields stay visible. No request is sent for the invalid range."),
        ("analytics", "Analytics · long date range", "From / To", "2026-01-01  /  2026-10-15", "Choose an analytics period of 90 days or fewer.", "Keep the last valid chart and totals; Refresh totals is disabled."),
    ]
    for i, (key, title, label, value, error, note) in enumerate(cases):
        y = 280 + i * 275
        card(s, key, 262, y, 1136, 250, title)
        s.field(290, y + 70, 370, label, value)
        alert(s, 700, y + 65, 665, error)
        s.text(290, y + 178, note, 14, "muted", max_width=1040)
    s.footer("Members 1–3 · validateNights / validateDateRange · inline messages are linked to their inputs for assistive tools.")


def empty_states(s):
    s.shell("Browse", "44,911.00")
    s.heading("EMPTY RESULTS", "An empty result should have a next step.", "Each example is a separate data-region state; the surrounding screen remains usable.")
    cases = [
        ("browse", "Browse", "No bookings found", "Try another search or clear the filters to see more results.", "Clear filters"),
        ("picker", "Guest / property picker", "No guests found", "Try another search or clear it to see available choices.", "Clear search"),
        ("audit", "Audit trail", "No wallet activity", "No wallet entries match this date range.", "Clear dates"),
        ("map", "Search map", "No recent searches nearby", "Try another area or a longer time window. Older search pins expire after two hours.", "Show last 2 hours"),
    ]
    for i, (key, title, heading, message, action) in enumerate(cases):
        x, y = 262 + (i % 2) * 580, 280 + (i // 2) * 410
        card(s, key, x, y, 556, 380, title)
        s.icon("Leaf", x + 261, y + 78, 30)
        s.text(x + 30, y + 145, heading, 21, serif=True)
        s.text(x + 30, y + 191, message, 14, "muted", max_width=490)
        s.button(x + 30, y + 290, 180, action, False)
    s.footer("Shared DataState · contextual empty messages and reset actions; no automatic creation of bookings, guests or pins.")


def connection_states(s):
    s.shell("Search map", "44,911.00")
    for item in s.items:
        if item.get("text") == "Live databases":
            item.update(text="Offline", x=973)
        if item["kind"] == "ellipse" and item.get("x") == 1096:
            item.update(x=961, fill="terracotta")
    s.button(1050, 24, 155, "Retry connection", False)
    s.heading("RECOVERY", "A failed service keeps a useful screen.", "Read retries and map-tile retries are explicit. No write request is replayed automatically.")
    card(s, "guest-retry", 262, 285, 1136, 205, "Guest unavailable")
    alert(s, 290, 355, 865, "No demo guests are available yet.")
    s.button(1180, 365, 175, "Try again", False)
    card(s, "tile-error", 262, 530, 700, 545, "Search activity")
    alert(s, 290, 595, 645, "Map tiles could not be loaded. Nearby searches are listed separately.")
    s.button(290, 690, 180, "Retry map tiles", False)
    s.rect(290, 755, 645, 275, "sage")
    s.ellipse(455, 785, 250, 220, "transparent", "forest", True)
    s.icon("MapPin", 560, 870, 30, "terracotta")
    card(s, "nearby-list", 990, 530, 408, 545, "Nearby searches")
    s.text(1020, 603, "Nearest 100 pins · sorted by distance", 11, "muted")
    for i, distance in enumerate([0, 29, 189]):
        s.icon("MapPin", 1020, 675 + i * 95, 20)
        s.text(1058, 675 + i * 95, f"Search pin {i+1}", 16)
        s.text(1284, 675 + i * 95, f"{distance} m", 13, "muted")
    s.footer("Members 1 + 4 · Retry connection rechecks health/guest reads; tile failure does not replace the search-results list.")


def review_states(s):
    s.shell("Reviews", "44,911.00")
    s.heading("THE LITTLE THINGS PEOPLE LOVE", "Every stay has a story.", "Guest impressions, favorite details, and a closer look at what’s included.")
    s.button(1200, 200, 198, "Property #2000", False)
    card(s, "score", 262, 285, 350, 350, "THE GUEST VERDICT")
    s.text(300, 385, "— / 5", 52, "forest", serif=True)
    s.text(292, 510, "From 0 reviews in the past year", 13, "muted")
    card(s, "ratings", 636, 285, 370, 350, "A little more detail")
    for i in range(5):
        s.text(662, 375 + i * 43, str(5-i), 13)
        s.rect(710, 378 + i * 43, 210, 7, "sage", "transparent", 3)
        s.text(950, 375 + i * 43, "0", 13, "muted")
    card(s, "tags", 1030, 285, 368, 350, "Words that keep coming up")
    s.text(1060, 415, "No tags yet.", 16, "muted")
    s.text(262, 685, "No reviews for this property in the past year. Its catalog can still be explored below.", 14, "muted")
    card(s, "catalog", 262, 750, 1136, 315, "Small comforts. Thoughtful details.")
    s.text(300, 895, "No amenities catalog is available for this property.", 16, "muted")
    s.footer("Member 4 · independent zero-review / missing-catalog example; catalogs still display when only reviews are empty.")


def pending_states(s):
    s.shell("Analytics", "44,911.00")
    s.heading("BACKGROUND UPDATES", "Keep context while a request finishes.", "Independent examples of analytics refresh and booking submission; pending controls prevent duplicate actions.")
    card(s, "refresh", 262, 285, 1136, 400, "Analytics · refreshing")
    s.button(1170, 310, 195, "Refresh totals", False, "RefreshCw")
    for i, (name, value) in enumerate([("Gross booked revenue", "₹67,98,00,241"), ("Nights booked", "1,99,802"), ("Total bookings", "50,013"), ("Properties", "2,000")]):
        x = 290 + i * 272
        s.rect(x, 395, 250, 150)
        s.text(x + 15, 420, name, 12, "muted")
        s.text(x + 15, 470, value, 24, "forest", True)
    s.text(290, 590, "Previous totals and chart remain visible. Last refreshed changes after the refresh succeeds.", 15, "muted", max_width=1050)
    card(s, "pending-booking", 262, 725, 1136, 365, "Booking · submitting")
    s.field(290, 805, 470, "Number of nights", "1")
    s.field(800, 805, 560, "Starting status", "Reserve for later", True)
    s.button(290, 900, 1070, "Booking your stay…", True, "RefreshCw", 48)
    s.text(290, 990, "Form controls are disabled while this request runs. Error recovery never automatically retries a booking.", 14, "muted", max_width=1050)
    s.footer("Members 2 + 3 · busy controls, retained analytics snapshot, manual correction after failures; API contracts unchanged.")


SCREENS = [
    ("11", "Page not found", lambda s: page_state(s, True)),
    ("12", "Screen error recovery", lambda s: page_state(s, False)),
    ("13", "Record loading and unavailable", details_states),
    ("14", "Invalid fields and date ranges", field_states),
    ("15", "Contextual empty results", empty_states),
    ("16", "Connection and map tile failure", connection_states),
    ("17", "No reviews and missing amenities", review_states),
    ("18", "Pending and background refresh", pending_states),
]


def text_value(node):
    return "".join(node.itertext()).strip()


def update_original_examples(root):
    """Correct stale display text while preserving all original screen groups."""
    for node in root.iter(f"{{{NS}}}text"):
        value = text_value(node)
        changed = value.replace("8 properties · up to 20 records", "8 properties · up to 8 records").replace("1 nights", "1 night")
        if changed != value:
            for child in list(node):
                node.remove(child)
            node.text = changed
    for frame in list(root):
        if frame.attrib.get("id", "").startswith("05 "):
            table = next((g for g in frame.iter() if g.attrib.get("data-section") == "audit-table"), None)
            if table is not None:
                children = list(table)
                starts = [i for i, n in enumerate(children) if n.tag.endswith("text") and re.fullmatch(r"#\d+", text_value(n))]
                for row_index, start in enumerate(starts):
                    row = ET.SubElement(table, f"{{{NS}}}g", {"data-review": "newest-first-row", "transform": f"translate(0,{(len(starts)-1-2*row_index)*52})"})
                    for node in children[start:start+7]:
                        table.remove(node)
                        row.append(node)
            for node in frame.iter(f"{{{NS}}}text"):
                if text_value(node).startswith("DESIGN NOTE"):
                    for child in list(node): node.remove(child)
                    node.text = "DESIGN NOTE · Member 2 · newest-first sample rows; stored balances are unchanged; invalid dates stay editable."
        if frame.attrib.get("id", "").startswith("10 "):
            for node in frame.iter():
                if node.tag.rsplit("}",1)[-1] in ("text", "rect"):
                    x, y = float(node.attrib.get("x",0)), float(node.attrib.get("y",0))
                    if x >= 1008 and 838 <= y < 976:
                        index = min(3, int((y-838)//36))
                        node.set("transform", f"translate(0,{(3-2*index)*36})")


def validate_svg(root):
    ids = [n.attrib["id"] for n in root.iter() if "id" in n.attrib]
    assert len(ids) == len(set(ids)), "Duplicate SVG IDs"
    assert not any(n.tag.rsplit("}",1)[-1] in ("script", "foreignObject") for n in root.iter())


def write_preview():
    cards = []
    for ident, name, _ in SCREENS:
        cards.append(f'<article><h2>{ident} · {name}</h2><img src="ui/{ident}.svg" alt="{name}, UI reference"><details><summary>Wireframe</summary><img src="wireframes/{ident}.svg" alt="{name}, wireframe"></details></article>')
    (OUT / "preview.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>StaySpot design review</title><style>body{font:16px system-ui;background:#f7f6f2;color:#283229;margin:32px}h1{font:38px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:24px}article{background:white;border:1px solid #e6e8e0;padding:16px;border-radius:9px}img{width:100%;height:auto}summary{cursor:pointer;margin:12px 0}a{color:#244c38}</style><h1>StaySpot · recovery and edge cases</h1><p>Updated UI and wireframe states. Existing screen groups are preserved in the complete boards.</p><p><a href="StaySpot_ALL_UI_Updated.svg">Complete UI board</a> · <a href="StaySpot_ALL_Wireframes_Updated.svg">Complete wireframe board</a></p><main>' + ''.join(cards) + '</main></html>')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-ui", type=Path)
    parser.add_argument("--source-wireframes", type=Path)
    args = parser.parse_args()
    for folder in ["source", "ui", "wireframes", "previews"]:
        (OUT / folder).mkdir(parents=True, exist_ok=True)
    provenance = {}
    for kind, source_arg, original_name, updated_name in [
        ("ui", args.source_ui, "StaySpot_ALL_UI.svg", "StaySpot_ALL_UI_Updated.svg"),
        ("wireframes", args.source_wireframes, "StaySpot_ALL_Wireframes.svg", "StaySpot_ALL_Wireframes_Updated.svg"),
    ]:
        source = OUT / "source" / original_name
        if source_arg:
            shutil.copyfile(source_arg, source)
        root = ET.parse(source).getroot()
        validate_svg(root)
        originals = [node.attrib["id"] for node in root if "id" in node.attrib]
        update_original_examples(root)
        scenes, previews = [], []
        for i, (ident, name, builder) in enumerate(SCREENS):
            scene = design.Scene({"id": ident, "name": name}, wire=kind == "wireframes")
            builder(scene)
            design.validate_scene(scene)
            vector = design.svg(scene)
            (OUT / kind / f"{ident}.svg").write_text(vector)
            design.png(scene).save(OUT / "previews" / f"{kind}_{ident}.png")
            frame = ET.SubElement(root, f"{{{NS}}}g", {"id": f"{ident} {name} · reviewed", "transform": f"translate({(i%4)*1640},{6360+(i//4)*1590})"})
            title = ET.SubElement(frame, f"{{{NS}}}text", {"x":"0", "y":"62", "font-family":"Arial, sans-serif", "font-size":"28", "fill":"#283229"})
            title.text = f"{ident}  {name}"
            label = ET.SubElement(frame, f"{{{NS}}}text", {"x":"0", "y":"96", "font-family":"Arial, sans-serif", "font-size":"16", "fill":"#7b8176"})
            label.text = "Reviewed · implemented UI state"
            content = ET.SubElement(frame, f"{{{NS}}}g", {"transform":"translate(0,110)"})
            content.extend(copy.deepcopy(list(ET.fromstring(vector)))[1:])
            scenes.append(scene)
            previews.append(design.png(scene))
        root.set("height", "9340")
        root.set("viewBox", "0 0 6360 9340")
        validate_svg(root)
        assert all(any(n.attrib.get("id") == ident for n in root) for ident in originals)
        ET.ElementTree(root).write(OUT / updated_name, encoding="utf-8", xml_declaration=True)
        sheet = design.Image.new("RGB", (1440, 4 * 660), "#f7f6f2")
        for i, preview in enumerate(previews):
            preview.thumbnail((700, 625))
            sheet.paste(preview, (10 + (i%2)*720, 20 + (i//2)*660))
        sheet.save(OUT / "previews" / f"{kind}_overview.png")
        provenance[kind] = {"source": f"source/{original_name}", "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "original_groups": len(originals), "added_groups": len(SCREENS)}
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    write_preview()
    print("Updated both boards, preserved all original groups, added eight state frames each, validated SVGs and text bounds.")


if __name__ == "__main__":
    main()
