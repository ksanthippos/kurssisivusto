#!/usr/bin/env python3
"""
sync_courses.py
Synkronoi kurssisisällöt (JSON) projektien välillä:
  - kurssisivusto-new/src/data/courses/*.json
  - kurssi-portaali/src/data/*.json

Käyttötavat:
  1. python3 sync_courses.py (oletus: kurssisivusto-new -> kurssi-portaali)
  2. python3 sync_courses.py --from-portaali (kurssi-portaali -> kurssisivusto-new)
  3. python3 sync_courses.py --smart (kopioi muuttuneen/uudemman kumpaankin suuntaan)
"""

import os
import sys
import json
import glob
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PORTAALI_DIR = os.path.abspath(os.path.join(SITE_DIR, "..", "kurssi-portaali"))

NEW_COURSES_DIR = os.path.join(SITE_DIR, "src", "data", "courses")
PORTAALI_DATA_DIR = os.path.join(PORTAALI_DIR, "src", "data")

COURSE_CODES = [
    "fy_71", "fy_81", "fy_91", "fy_92",
    "ma_71", "ma_72", "ma_73", "ma_74",
    "ma_81", "ma_82", "ma_83",
    "ma_91", "ma_92", "ma_93", "ma_94",
    "vma_01"
]

def validate_json(file_path):
    """Tarkistaa että JSON on syntaktisesti ehjä."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            json.load(f)
        return True
    except Exception as err:
        print(f"❌ Syntaksivirhe tiedostossa {os.path.basename(file_path)}: {err}")
        return False

def sync():
    mode = "new_to_portaali"
    if "--from-portaali" in sys.argv or "--reverse" in sys.argv:
        mode = "portaali_to_new"
    elif "--smart" in sys.argv:
        mode = "smart"

    if not os.path.exists(PORTAALI_DATA_DIR):
        print(f"❌ Kurssiportaalin data-kansiota ei löytynyt polusta: {PORTAALI_DATA_DIR}")
        return

    os.makedirs(NEW_COURSES_DIR, exist_ok=True)

    print("==================================================")
    if mode == "new_to_portaali":
        print("🔄 SYNC: kurssisivusto-new  -->  kurssi-portaali")
    elif mode == "portaali_to_new":
        print("🔄 SYNC: kurssi-portaali    -->  kurssisivusto-new")
    else:
        print("🔄 SYNC: Älykäs synkronointi (mtime)")
    print("==================================================")

    updated_count = 0
    synced_count = 0
    skipped_count = 0

    for code in COURSE_CODES:
        new_file = os.path.join(NEW_COURSES_DIR, f"{code}.json")
        port_file = os.path.join(PORTAALI_DATA_DIR, f"{code}.json")

        new_exists = os.path.exists(new_file)
        port_exists = os.path.exists(port_file)

        src = None
        dst = None
        direction_label = ""

        if mode == "new_to_portaali":
            if not new_exists:
                continue
            src = new_file
            dst = port_file
            direction_label = "new -> portaali"
        elif mode == "portaali_to_new":
            if not port_exists:
                continue
            src = port_file
            dst = new_file
            direction_label = "portaali -> new"
        else: # smart
            if new_exists and not port_exists:
                src = new_file
                dst = port_file
                direction_label = "new -> portaali"
            elif port_exists and not new_exists:
                src = port_file
                dst = new_file
                direction_label = "portaali -> new"
            elif new_exists and port_exists:
                new_mtime = os.path.getmtime(new_file)
                port_mtime = os.path.getmtime(port_file)
                if abs(new_mtime - port_mtime) < 1.0:
                    # Sama aika tai hyvin lähellä, tarkistetaan sisältö
                    src = None
                elif new_mtime > port_mtime:
                    src = new_file
                    dst = port_file
                    direction_label = "new -> portaali"
                else:
                    src = port_file
                    dst = new_file
                    direction_label = "portaali -> new"

        if src and dst:
            if not validate_json(src):
                print(f"  ⚠️  Ohitettu virheen vuoksi: {os.path.basename(src)}")
                skipped_count += 1
                continue

            # Luetaan ja vertaillaan sisältöä
            try:
                with open(src, "r", encoding="utf-8") as f_src:
                    src_content = f_src.read()

                dst_content = None
                if os.path.exists(dst):
                    with open(dst, "r", encoding="utf-8") as f_dst:
                        dst_content = f_dst.read()

                if src_content == dst_content:
                    skipped_count += 1
                else:
                    with open(dst, "w", encoding="utf-8") as f_dst:
                        f_dst.write(src_content)
                    print(f"  ✅ Päivitetty ({direction_label}): {code}.json")
                    updated_count += 1
            except Exception as err:
                print(f"  ❌ Virhe tiedoston kopioinnissa ({code}.json): {err}")
                skipped_count += 1
        else:
            skipped_count += 1

    print("--------------------------------------------------")
    print(f"✨ Valmis: {updated_count} päivitettyä kurssia, {skipped_count} jo ajan tasalla.")
    print("==================================================")

if __name__ == "__main__":
    sync()

