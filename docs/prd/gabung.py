"""Menggabungkan prd/NN-*.md menjadi satu berkas PRD lengkap.

Jalankan dari folder mana saja:  python prd/gabung.py
Hasil: "PRD RanahMenulis v0.2.md" di folder induk (jangan diedit langsung).
"""
import os, re

DI = os.path.dirname(os.path.abspath(__file__))
KELUAR = os.path.join(os.path.dirname(DI), "PRD RanahMenulis v0.2.md")

berkas = sorted(f for f in os.listdir(DI) if re.match(r"\d\d-.*\.md$", f))
bagian = [open(os.path.join(DI, f), encoding="utf8").read() for f in berkas]
with open(KELUAR, "w", encoding="utf8", newline="\n") as h:
    h.write("\n".join(bagian))
print("Digabung", len(berkas), "berkas ->", KELUAR)
