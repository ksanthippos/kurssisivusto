#!/usr/bin/env python3
"""
sync_kertaus.py
Synkronoi kertaustehtävien ja malliratkaisujen PDF-tiedostot
yksityisestä LaTeX-repositoriosta kurssisivustolle.

TURVALLISUUSEHTO:
- Etsii VAIN kansioista '*/kertaus/'
- Etsii VAIN tiedostoja, joiden nimessä on '_kertaus_'
- Hylkää EHDOTTOMASTI kaikki '*/koe/' -tiedostot tai tiedostot, joissa on '_koe_'
"""

import os
import shutil
import json
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
LATEX_DIR = os.path.abspath(os.path.join(SITE_DIR, "..", "latex"))
DEST_DIR = os.path.join(SITE_DIR, "kertaus_tehtavat")
REVISIONS_JSON = os.path.join(SITE_DIR, "src", "data", "revisions.json")

def sync():
    if not os.path.exists(LATEX_DIR):
        print(f"❌ LaTeX-kansiota ei löytynyt polusta: {LATEX_DIR}")
        return

    os.makedirs(DEST_DIR, exist_ok=True)

    print("==================================================")
    print("🔄 SYNC: LaTeX -> Kurssisivusto (Kertaustehtävät)")
    print("==================================================")

    pattern = os.path.join(LATEX_DIR, "*", "kertaus", "*_kertaus_*.pdf")
    found_pdfs = glob.glob(pattern)

    copied_count = 0
    skipped_count = 0
    safe_files = []

    for src_path in found_pdfs:
        filename = os.path.basename(src_path)

        # Turvatarkistus: Varmistetaan ettei tiedosto liity kokeisiin
        if "_koe_" in filename.lower() or "/koe/" in src_path.lower():
            print(f"⛔ ESTETTY (koetiedosto!): {filename}")
            continue

        dest_path = os.path.join(DEST_DIR, filename)
        safe_files.append(filename)

        # Tarkistetaan onko lähdetiedosto uudempi tai puuttuuko kohde
        needs_copy = False
        if not os.path.exists(dest_path):
            needs_copy = True
        else:
            src_mtime = os.path.getmtime(src_path)
            dest_mtime = os.path.getmtime(dest_path)
            if src_mtime > dest_mtime:
                needs_copy = True

        if needs_copy:
            shutil.copy2(src_path, dest_path)
            print(f"  ✅ Päivitetty: {filename}")
            copied_count += 1
        else:
            skipped_count += 1

    print("--------------------------------------------------")
    print(f"✨ Synkronoitu: {copied_count} päivitettyä tiedostoa, {skipped_count} jo ajan tasalla.")
    print("🔒 Kaikki koetiedostot suojattu (0 koetiedostoa siirretty).")
    print("==================================================")

if __name__ == "__main__":
    sync()

