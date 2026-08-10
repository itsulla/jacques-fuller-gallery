#!/usr/bin/env python3
"""Build the initial web catalogue from Jacques's source artwork folders."""
from __future__ import annotations

import json
import os
import re
import shutil
import uuid
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets" / "Jacques"
PUBLIC = ROOT / "public" / "artworks"
DATA = ROOT / "src" / "data" / "artworks.json"

WORKS = [
    {
        "source": "Ship of Fools",
        "slug": "ship-of-fools",
        "title": "Ship of Fools",
        "material": None,
        "dimensions": None,
        "hero": "499160930_3045477425605054_6339533135828007446_n.jpg",
        "featured": True,
        "featuredRank": 1,
        "prototypeText": "A crowded vessel of figures, mechanisms, animals, and vertical elements, photographed from eleven viewpoints.",
    },
    {
        "source": "BLIND BUTCHER Brass on marble 80cm high",
        "slug": "blind-butcher",
        "title": "Blind Butcher",
        "material": "Brass on marble",
        "dimensions": "80 cm high",
        "hero": "487249068_2990602987759165_3224154228245091671_n.jpg",
        "featured": True,
        "featuredRank": 2,
        "prototypeText": "A tall figure mounted above a boar-like animal, with tools raised in either hand.",
    },
    {
        "source": "MERMAID Brass on mild steel. 65cm high x 50cm wide",
        "slug": "mermaid",
        "title": "Mermaid",
        "material": "Brass on mild steel",
        "dimensions": "65 cm high × 50 cm wide",
        "hero": "484168453_2974963995989731_1690432338489246222_n.jpg",
        "featured": True,
        "featuredRank": 3,
        "prototypeText": "A crowned hybrid figure presents a fish, balancing human and marine forms around a central column.",
    },
    {
        "source": "Safari",
        "slug": "safari",
        "title": "Safari",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Owl (Tap)",
        "slug": "owl-tap",
        "title": "Owl (Tap)",
        "material": None,
        "dimensions": None,
        "hero": None,
        "featured": True,
        "featuredRank": 5,
        "prototypeText": "An owl spreads hammered wings around a compact body assembled from mechanical forms.",
    },
    {
        "source": "Cricket King 22 x 20 x 13 cm Welded Brass",
        "slug": "cricket-king",
        "title": "Cricket King",
        "material": "Welded brass",
        "dimensions": "22 × 20 × 13 cm",
        "hero": None,
    },
    {
        "source": "VULTURINE",
        "slug": "vulturine",
        "title": "Vulturine",
        "material": None,
        "dimensions": None,
        "hero": None,
        "featured": True,
        "featuredRank": 6,
        "prototypeText": "A long-necked bird in a top hat stands over a compact architectural base.",
    },
    {
        "source": "Born 2B Free",
        "slug": "born-2b-free",
        "title": "Born 2B Free",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "RAM Brass 42cm High x 18cm wide",
        "slug": "ram",
        "title": "Ram",
        "material": "Brass",
        "dimensions": "42 cm high × 18 cm wide",
        "hero": "493315778_3020022014817262_4625273318356203952_n.jpg",
    },
    {
        "source": "FALCONET Brass 33cm high",
        "slug": "falconet",
        "title": "Falconet",
        "material": "Brass",
        "dimensions": "33 cm high",
        "hero": None,
    },
    {
        "source": "DEMOCRAT Brass 57cm high",
        "slug": "democrat",
        "title": "Democrat",
        "material": "Brass",
        "dimensions": "57 cm high",
        "hero": "482807693_2969293753223422_9117719955181327357_n.jpg",
    },
    {
        "source": "Kiss a Frog",
        "slug": "kiss-a-frog",
        "title": "Kiss a Frog",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Pigs on the Wing Brass 24 cm High",
        "slug": "pigs-on-the-wing",
        "title": "Pigs on the Wing",
        "material": "Brass",
        "dimensions": "24 cm high",
        "hero": None,
    },
    {
        "source": "TEACHER",
        "slug": "teacher",
        "title": "Teacher",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "SAFARI Brass 34 cm high",
        "slug": "safari-34cm",
        "title": "Safari",
        "material": "Brass",
        "dimensions": "34 cm high",
        "hero": None,
        "catalogueNote": "A second work currently sharing the title Safari. Confirmation pending.",
    },
    {
        "source": "Pleased To Meet",
        "slug": "pleased-to-meet",
        "title": "Pleased To Meet",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Owl Water Feature",
        "slug": "owl-water-feature",
        "title": "Owl Water Feature",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Tap water feature",
        "slug": "tap-water-feature",
        "title": "Tap Water Feature",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "TAPS",
        "slug": "taps",
        "title": "Taps",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Excuse Me Blind",
        "slug": "excuse-me-blind",
        "title": "Excuse Me Blind",
        "material": None,
        "dimensions": None,
        "hero": None,
    },
    {
        "source": "Beaurocrat",
        "slug": "beaurocrat",
        "title": "Beaurocrat",
        "material": None,
        "dimensions": None,
        "hero": "487304050_2633980923459458_5628672113581193763_n.jpg",
        "catalogueNote": "The title follows the supplied album name. Spelling and context are to be confirmed.",
    },
    {
        "source": "Bwana",
        "slug": "bwana",
        "title": "Bwana",
        "material": None,
        "dimensions": None,
        "hero": "43055503_892194474304787_2299902871874830336_n.jpg",
        "catalogueNote": "A different sculpture titled Bwana appears as catalogue no. 58 in the 2001 Sanlam catalogue. The title is shared; the physical works are not.",
        "relatedHistoricalRecords": [
            {
                "id": "JF2001-058",
                "catalogueNumber": 58,
                "relationship": "reused-title-different-object",
                "sourcePage": 27,
                "sourceYear": 2001,
            }
        ],
    },
    {
        "source": "King Cricket",
        "slug": "king-cricket",
        "title": "King Cricket",
        "material": None,
        "dimensions": None,
        "hero": "498653235_2687343528123197_2016065933840675848_n.jpg",
        "catalogueNote": "The album may show more than one related object. Confirmation is pending.",
    },
    {
        "source": "MALLEMEULEMERRY-GO-ROUND",
        "slug": "mallemeule-merry-go-round",
        "title": "Mallemeule Merry-Go-Round",
        "material": None,
        "dimensions": None,
        "hero": "37928865_842528482604720_8056106410926145536_n.jpg",
        "featured": True,
        "featuredRank": 4,
        "prototypeText": "A rider and mechanical animal form a compact narrative scene, balanced by wheel and crank-like elements.",
        "catalogueNote": "Title follows the two plaques visible in the supplied photographs; confirmation is pending.",
    },
    {
        "source": "Icecream NO Just Ice - I Scream NO Justice",
        "slug": "icecream-no-just-ice",
        "title": "Icecream NO Just Ice — I Scream NO Justice",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785420248108.jpg",
        "cacheVersion": "drive-import-20260801-r1",
        "prototypeText": "A tall top-hatted figure faces a smaller rabbit figure holding a framed sign, both mounted on a shared rectangular base.",
        "catalogueNote": "Title follows the supplied folder name. Punctuation and capitalization are pending confirmation.",
    },
    {
        "source": "LOAN WOLF",
        "slug": "loan-wolf",
        "title": "Loan Wolf",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785420332894.jpg",
        "cacheVersion": "drive-import-20260801-r1",
        "prototypeText": "A long-bodied canine figure with open jaws reaches one articulated foreleg forward above a compact base.",
        "catalogueNote": "Title spelling follows the supplied folder name and is pending confirmation.",
    },
    {
        "source": "Dragonet",
        "slug": "dragonet",
        "title": "Dragonet",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785419761708.jpg",
        "cacheVersion": "drive-import-20260801-r2",
        "prototypeText": "A top-hatted dragon figure with an open toothed jaw, jacket-like torso and segmented tail stands on a cylindrical base.",
        "catalogueNote": "Title follows the supplied folder name and the DRAGONET plaque visible in the photographs.",
    },
    {
        "source": "DUNCE",
        "slug": "dunce",
        "title": "Dunce",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785420117291.jpg",
        "cacheVersion": "drive-import-20260801-r2",
        "prototypeText": "A pointed-cap figure with a box-shaped pack, jacket, short trousers and tall boots stands on a cylindrical base.",
        "catalogueNote": "Title follows the supplied folder name. Capitalization is pending confirmation.",
    },
    {
        "source": "BE...",
        "slug": "be",
        "title": "BE...",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785419608304.jpg",
        "cacheVersion": "drive-import-20260801-r2",
        "prototypeText": "A winged insect figure rests on a tall B-shaped frame above a cylindrical column with plaques reading HAPPY and HEALTHY.",
        "catalogueNote": "Title and ellipsis follow the supplied folder name; visible plaques read HAPPY and HEALTHY.",
    },
    {
        "source": "HOE RY DIE BOERE",
        "slug": "hoe-ry-die-boere",
        "title": "Hoe Ry Die Boere",
        "material": "Brass",
        "dimensions": "78 × 93 cm",
        "date": "2000",
        "hero": "FB_IMG_1785420075054.jpg",
        "cacheVersion": "drive-import-20260801-r2",
        "prototypeText": "A seated figure operates an open mechanical vehicle connected to a tall wheeled compartment, with bird-like figures perched at either end.",
        "catalogueNote": "The same physical sculpture is documented as catalogue no. 10 in the 2001 Sanlam catalogue; identity was confirmed by comparing its configuration and distinctive components across both photographic sets.",
        "exhibitionHistory": "Jacques Fuller: Sculptor, 2001 (catalogue no. 10).",
        "historicalRecord": {
            "id": "JF2001-010",
            "catalogueNumber": 10,
            "relationship": "same-object",
            "inscription": "JRF 2000",
            "collectionAsOf2001": "Jacques Fuller, Bloemfontein",
            "sourcePage": 24,
            "sourceYear": 2001,
        },
    },
    {
        "source": "Government of National Unity",
        "slug": "government-of-national-unity",
        "title": "Government of National Unity",
        "material": None,
        "dimensions": None,
        "hero": "IMG20260221145149.jpg",
        "cacheVersion": "drive-import-20260803-r1",
        "prototypeText": "A top-hatted bird figure stands on the back of a four-legged animal above a plaque-bearing rectangular base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the plaque visible on the base.",
    },
    {
        "source": "Vorsprung durch Technik",
        "slug": "vorsprung-durch-technik",
        "title": "Vorsprung durch Technik",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785760848994.jpg",
        "cacheVersion": "drive-import-20260803-r1",
        "prototypeText": "An upright long-eared figure with goggles stands against a curved rod above a spring-shaped support and cylindrical base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the three-part plaque visible in the photographs.",
    },
    {
        "source": "BELLE",
        "slug": "belle",
        "title": "BELLE",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785767016456.jpg",
        "cacheVersion": "drive-import-20260803-r1",
        "prototypeText": "A tall standing figure with a bell-shaped headpiece and long handle-like finial is mounted on a pale rectangular base.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the plaque visible on the base.",
    },
    {
        "source": "Symbiosis",
        "slug": "symbiosis",
        "title": "Symbiosis",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785767406763.jpg",
        "cacheVersion": "drive-import-20260803-r1",
        "prototypeText": "A standing figure extends one arm toward a smaller four-legged figure on a wheeled body, both mounted on a shared rectangular base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the plaque visible in the photographs.",
    },
    {
        "source": "Ministry",
        "sourceUrl": "https://drive.google.com/drive/folders/19l3H2wqphzN2mPsaR-5GAdU1ZcO6yWj-",
        "slug": "ministry",
        "title": "Ministry",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785937224230.jpg",
        "expectedImageCount": 7,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A top-hatted anthropomorphic figure stands beside a smaller four-legged animal, joined by a looped metal form on a plaque-bearing wooden base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the MINISTRY plaque visible near the figure's feet.",
    },
    {
        "source": "Pelican",
        "sourceUrl": "https://drive.google.com/drive/folders/17OBfb-q1HeDPrpxu6mE-kGmCQqfQEYAn",
        "slug": "pelican",
        "title": "Pelican",
        "material": None,
        "dimensions": None,
        "hero": "IMG_20220529_121742.jpg",
        "expectedImageCount": 7,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A pelican with an open beak stands on a cylindrical plinth wrapped with an inscribed metal panel.",
        "catalogueNote": "Title follows the supplied Drive folder name. A base plaque reads HOMAGE DE LEEUW; the inscribed panel carries a pelican verse attributed in the source photographs to Dixon Lanier Merritt, 1879.",
    },
    {
        "source": "Parliamentarian",
        "sourceUrl": "https://drive.google.com/drive/folders/1IDkcsr1Rkq9-6r7ej9R7xE3bYtEx4BOT",
        "slug": "parliamentarian",
        "title": "Parliamentarian",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785938743377.jpg",
        "expectedImageCount": 6,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A top-hatted bird perches above a four-legged animal and a smaller figure on a plaque-bearing wooden base.",
        "catalogueNote": "Title follows the supplied Drive folder name. The base plaque reproduces the phrase ALL ANIMALS ARE EQUAL, BUT SOME ANIMALS ARE MORE EQUAL THAN OTHERS.",
    },
    {
        "source": "RSM",
        "sourceUrl": "https://drive.google.com/drive/folders/189Xrsrwm0SvX80tZIbTPiukEpPQB4PoB",
        "slug": "rsm",
        "title": "RSM",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785939904844.jpg",
        "expectedImageCount": 9,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A uniformed figure in a peaked cap salutes while standing on a cylindrical base.",
        "catalogueNote": "Title follows the supplied Drive folder name; three plaques on the base read REGIMENTAL, SERGEANT and MAJOR.",
    },
    {
        "source": "Tutu",
        "sourceUrl": "https://drive.google.com/drive/folders/1wAt1oljImyoM2bjpdpaEw3aLINyFhbm4",
        "slug": "tutu",
        "title": "Tutu",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785940033821.jpg",
        "expectedImageCount": 5,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A torso-like figure with outstretched hands and a circular skirt stands on a narrow column and square base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the TUTU plaque visible on the lower support.",
    },
    {
        "source": "Servamus et Servimus",
        "sourceUrl": "https://drive.google.com/drive/folders/1Svgo2G41AL4QV_Cfxn_RM16Ru8RsgaW6",
        "slug": "servamus-et-servimus",
        "title": "Servamus et Servimus",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1785939760897.jpg",
        "expectedImageCount": 4,
        "cacheVersion": "drive-import-20260804-r1",
        "prototypeText": "A uniformed, moustached figure gestures with raised arms while standing on a cylindrical base and holding a plaque.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the SERVAMUS ET SERVIMUS plaque visible in the photographs.",
    },
    {
        "source": "Jewellery",
        "sourceUrl": "https://drive.google.com/drive/folders/1UjGKX1_ibtEmDCqDogIhY-AoOXe_6Te_",
        "slug": "jewellery",
        "title": "Jewellery",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786003278410.jpg",
        "expectedImageCount": 21,
        "cacheVersion": "drive-import-20260806-r1",
        "recordType": "collection",
        "imageLabel": "image",
        "photoCredit": "Marie Girard",
        "prototypeText": "A photographic group of multiple distinct wearable pieces, shown on the body or held in hand.",
        "catalogueNote": "The supplied Drive folder groups multiple distinct pieces under the title Jewellery; the archive therefore presents it as one collection record rather than as views of a single object.",
    },
    {
        "source": "CONNOISSEUR",
        "sourceUrl": "https://drive.google.com/drive/folders/10YbPNbLhfRLu7xFU2oJnmLLMsEAHNeYh",
        "slug": "connoisseur",
        "title": "CONNOISSEUR",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786002575705.jpg",
        "expectedImageCount": 4,
        "cacheVersion": "drive-import-20260806-r1",
        "prototypeText": "A seated, long-tailed figure wearing a small hat holds a narrow object above a perforated support and cylindrical base.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the CONNOISSEUR plaque visible in the photographs.",
    },
    {
        "source": "SUMMER TIME",
        "sourceUrl": "https://drive.google.com/drive/folders/1dJLO9cKKp1YjDxk8GkEU-2-2y9G59Z9A",
        "slug": "summer-time",
        "title": "SUMMER TIME",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786001992102.jpg",
        "expectedImageCount": 5,
        "cacheVersion": "drive-import-20260806-r1",
        "prototypeText": "A seated figure in a broad hat holds a cone-shaped object while one foot extends beyond the chair-like structure.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the SUMMER TIME plaque visible in the photographs.",
    },
    {
        "source": "Tourist",
        "sourceUrl": "https://drive.google.com/drive/folders/1AQ0gTP29sdHQ_fnXWKoYV1dtRQ1-l3ea",
        "slug": "tourist",
        "title": "Tourist",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786002381746.jpg",
        "expectedImageCount": 6,
        "cacheVersion": "drive-import-20260806-r1",
        "prototypeText": "Two figures travel together beneath a small canopy, with one seated in a wheeled structure and the other walking ahead.",
        "catalogueNote": "Title follows the supplied Drive folder name and the TOURIST plaque visible on the base. One byte-identical source duplicate is preserved outside the generated view set.",
    },
    {
        "source": "Uil Spieël",
        "sourceUrl": "https://drive.google.com/drive/folders/1oXgxMweWiEsmRI_ZZOKGUPryRLG45SB-",
        "slug": "uil-spieel",
        "title": "Uil Spieël",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786002337263.jpg",
        "expectedImageCount": 5,
        "cacheVersion": "drive-import-20260806-r1",
        "prototypeText": "A bird figure perched on one raised block faces a smaller animal figure positioned on a second block.",
        "catalogueNote": "Title follows the supplied Drive folder name and the UIL SPIEËL plaque visible in the photographs.",
    },
    {
        "source": "HYPOCRITE",
        "sourceUrl": "https://drive.google.com/drive/folders/1PjshnDNy05pjxIeurhxpPRub8SN7gzFw",
        "slug": "hypocrite",
        "title": "HYPOCRITE",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786348472398.jpg",
        "expectedImageCount": 7,
        "cacheVersion": "drive-import-20260808-r1",
        "prototypeText": "A goggled figure in a square cap stands on a cylindrical base with both hands raised near the chest.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the HYPOCRITE plaque visible on the cylindrical base.",
    },
    {
        "source": "Kingfisher",
        "sourceUrl": "https://drive.google.com/drive/folders/1drqKndClAU0GY3lp5YAyI0bYxvv5o930",
        "slug": "kingfisher",
        "title": "Kingfisher",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786347622546.jpg",
        "expectedImageCount": 7,
        "cacheVersion": "drive-import-20260808-r1",
        "prototypeText": "A long-beaked bird holds a fish while perched above a tall cylindrical column fitted with small tap-like forms.",
        "catalogueNote": "Title follows the supplied Drive folder name and the KINGFISHER plaque visible in the source photographs.",
    },
    {
        "source": "MANTIS",
        "sourceUrl": "https://drive.google.com/drive/folders/1L1Cn86mVazfybVrsUHEt1jXuyg0Ry8SW",
        "slug": "mantis",
        "title": "MANTIS",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786347708694.jpg",
        "expectedImageCount": 7,
        "cacheVersion": "drive-import-20260808-r1",
        "prototypeText": "An insect-like figure with rounded eyes and raised forelimbs stands on a cylindrical base.",
        "catalogueNote": "Title and capitalization follow the supplied Drive folder name and the MANTIS plaque visible in the source photographs.",
    },
    {
        "source": "Homo erectus",
        "sourceUrl": "https://drive.google.com/drive/folders/1_28c0yuaW-O4hW-hMaFv0_0MVqKuWWIS",
        "slug": "homo-erectus",
        "title": "Homo erectus",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786352773867.jpg",
        "expectedImageCount": 4,
        "cacheVersion": "drive-import-20260810-r1",
        "prototypeText": "A skull-like head rises on a long patterned neck from a cylindrical base.",
        "catalogueNote": "Title follows the supplied Drive folder name and the HOMO ERECTUS plaque visible on the cylindrical base.",
    },
    {
        "source": "The End of the Game",
        "sourceUrl": "https://drive.google.com/drive/folders/1_t6pvDc6f3U8bg2xf1ERVzrnL9mw2mCf",
        "slug": "the-end-of-the-game",
        "title": "The End of the Game",
        "material": None,
        "dimensions": None,
        "hero": "FB_IMG_1786352213401.jpg",
        "expectedImageCount": 5,
        "cacheVersion": "drive-import-20260810-r1",
        "prototypeText": "A horned animal skull is mounted above a circular base on a narrow upright stem.",
        "catalogueNote": "Title follows the supplied Drive folder name and the THE END OF THE GAME plaque visible on the base.",
    },
]


def optimize(source: Path, output: Path, max_width: int, quality: int) -> tuple[int, int]:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        if image.width > max_width:
            target_height = round(image.height * max_width / image.width)
            image = image.resize((max_width, target_height), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output, "WEBP", quality=quality, method=6)
        return image.width, image.height


def transaction_path() -> Path:
    return PUBLIC.parent / ".catalogue-publish.json"


def remove_path(path: Path) -> None:
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    elif path.exists() or path.is_symlink():
        path.unlink()


def fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def fsync_file(path: Path) -> None:
    with path.open("rb") as handle:
        os.fsync(handle.fileno())


def fsync_output_parents() -> None:
    for parent in {PUBLIC.parent, DATA.parent}:
        fsync_directory(parent)


def replace_and_sync(source: Path, destination: Path) -> None:
    os.replace(source, destination)
    fsync_directory(destination.parent)
    if source.parent != destination.parent:
        fsync_directory(source.parent)


def validate_regular_file(path: Path, label: str) -> None:
    if path.is_symlink():
        raise RuntimeError(f"{label} must not be a symlink: {path}")
    if not path.is_file():
        raise RuntimeError(f"{label} is not a regular file: {path}")


def validate_directory_tree(root: Path, label: str) -> list[Path]:
    if root.is_symlink():
        raise RuntimeError(f"{label} must not be a symlink: {root}")
    if not root.is_dir():
        raise RuntimeError(f"{label} is not a directory: {root}")

    entries = list(root.rglob("*"))
    for entry in entries:
        if entry.is_symlink():
            raise RuntimeError(f"{label} contains a symlink: {entry}")
        if not entry.is_file() and not entry.is_dir():
            raise RuntimeError(f"{label} contains a non-regular entry: {entry}")
    return entries


def fsync_staged_outputs(staged_public: Path, staged_data: Path) -> None:
    entries = validate_directory_tree(staged_public, "Staged artwork tree")
    validate_regular_file(staged_data, "Staged catalogue data")

    for staged_file in sorted(entry for entry in entries if entry.is_file()):
        fsync_file(staged_file)
    fsync_file(staged_data)

    staged_directories = {staged_public}
    staged_directories.update(entry for entry in entries if entry.is_dir())
    for staged_directory in sorted(staged_directories, key=lambda path: len(path.parts), reverse=True):
        fsync_directory(staged_directory)
    fsync_directory(staged_public.parent)
    if staged_data.parent != staged_public.parent:
        fsync_directory(staged_data.parent)


def write_transaction(token: str, had_public: bool, had_data: bool) -> None:
    marker = transaction_path()
    if marker.is_symlink():
        raise RuntimeError(f"Catalogue transaction marker must not be a symlink: {marker}")
    if marker.exists():
        if not marker.is_file():
            raise RuntimeError(f"Catalogue transaction marker is not a regular file: {marker}")
        raise RuntimeError(f"Unrecovered catalogue transaction: {marker}")
    temporary = marker.with_name(f".{marker.name}.tmp-{token}")
    payload = {
        "version": 1,
        "token": token,
        "hadPublic": had_public,
        "hadData": had_data,
    }
    with temporary.open("x") as handle:
        json.dump(payload, handle, separators=(",", ":"))
        handle.write("\n")
        handle.flush()
        os.fsync(handle.fileno())
    replace_and_sync(temporary, marker)


def cleanup_orphaned_artifacts() -> None:
    patterns = (
        (PUBLIC.parent, f".{PUBLIC.name}.backup-*"),
        (PUBLIC.parent, f".{PUBLIC.name}.build-*"),
        (DATA.parent, f".{DATA.name}.backup-*"),
        (DATA.parent, f".{DATA.name}.build-*"),
        (transaction_path().parent, f".{transaction_path().name}.tmp-*"),
    )
    for parent, pattern in patterns:
        for artifact in parent.glob(pattern):
            remove_path(artifact)


def recover_interrupted_publish() -> bool:
    marker = transaction_path()
    if marker.is_symlink():
        raise RuntimeError(f"Catalogue transaction marker must not be a symlink: {marker}")
    if not marker.exists():
        cleanup_orphaned_artifacts()
        return False

    validate_regular_file(marker, "Catalogue transaction marker")
    state = json.loads(marker.read_text())
    token = state.get("token")
    if (
        state.get("version") != 1
        or not isinstance(token, str)
        or re.fullmatch(r"[A-Za-z0-9_-]{1,64}", token) is None
        or not isinstance(state.get("hadPublic"), bool)
        or not isinstance(state.get("hadData"), bool)
    ):
        raise RuntimeError(f"Invalid catalogue transaction marker: {marker}")

    backup_public = PUBLIC.with_name(f".{PUBLIC.name}.backup-{token}")
    backup_data = DATA.with_name(f".{DATA.name}.backup-{token}")
    staged_public = PUBLIC.with_name(f".{PUBLIC.name}.build-{token}")
    staged_data = DATA.with_name(f".{DATA.name}.build-{token}")

    backup_public_present = backup_public.exists() or backup_public.is_symlink()
    backup_data_present = backup_data.exists() or backup_data.is_symlink()
    if backup_public_present:
        validate_directory_tree(backup_public, "Artwork backup")
    if backup_data_present:
        validate_regular_file(backup_data, "Catalogue backup")

    if backup_public_present:
        remove_path(PUBLIC)
        replace_and_sync(backup_public, PUBLIC)
    elif state["hadPublic"] and not PUBLIC.exists():
        raise RuntimeError(f"Cannot recover prior artwork assets for transaction {token}")
    elif not state["hadPublic"]:
        remove_path(PUBLIC)

    if backup_data_present:
        remove_path(DATA)
        replace_and_sync(backup_data, DATA)
    elif state["hadData"] and not DATA.exists():
        raise RuntimeError(f"Cannot recover prior catalogue data for transaction {token}")
    elif not state["hadData"]:
        remove_path(DATA)

    remove_path(staged_public)
    remove_path(staged_data)
    fsync_output_parents()
    marker.unlink()
    fsync_directory(marker.parent)
    cleanup_orphaned_artifacts()
    return True


def publish(staged_public: Path, staged_data: Path, token: str) -> None:
    backup_public = PUBLIC.with_name(f".{PUBLIC.name}.backup-{token}")
    backup_data = DATA.with_name(f".{DATA.name}.backup-{token}")
    had_public = PUBLIC.exists() or PUBLIC.is_symlink()
    had_data = DATA.exists() or DATA.is_symlink()

    if had_public:
        validate_directory_tree(PUBLIC, "Current artwork tree")
    if had_data:
        validate_regular_file(DATA, "Current catalogue data")

    fsync_staged_outputs(staged_public, staged_data)
    write_transaction(token, had_public, had_data)
    try:
        if had_public:
            replace_and_sync(PUBLIC, backup_public)
        if had_data:
            replace_and_sync(DATA, backup_data)
        replace_and_sync(staged_public, PUBLIC)
        replace_and_sync(staged_data, DATA)
    except Exception:
        recover_interrupted_publish()
        raise
    fsync_output_parents()
    transaction_path().unlink()
    fsync_directory(transaction_path().parent)
    remove_path(backup_public)
    remove_path(backup_data)
    fsync_output_parents()


def main() -> None:
    recover_interrupted_publish()
    prepared = []
    missing = []
    for work in WORKS:
        folder = SOURCE / work["source"]
        cache_version = work.get("cacheVersion")
        if cache_version is not None and (
            not isinstance(cache_version, str)
            or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,63}", cache_version) is None
        ):
            raise ValueError(f"Invalid cache version for {work['slug']}: {cache_version!r}")
        if not folder.exists():
            missing.append(str(folder))
            continue
        files = sorted(folder.glob("*.jpg"))
        if not files:
            missing.append(f"No JPEG files: {folder}")
            continue

        expected_image_count = work.get("expectedImageCount")
        if expected_image_count is not None:
            if type(expected_image_count) is not int or expected_image_count < 1:
                raise ValueError(
                    f"Invalid expected image count for {work['slug']}: {expected_image_count!r}"
                )
            if len(files) != expected_image_count:
                missing.append(
                    f"Expected {expected_image_count} JPEG files for {folder}, found {len(files)}"
                )
                continue

        hero_name = work.get("hero")
        if hero_name:
            hero = folder / hero_name
            if hero not in files:
                raise FileNotFoundError(f"Configured hero not found: {hero}")
            files = [hero] + [item for item in files if item != hero]
        for source in files:
            with Image.open(source) as image:
                image.verify()
        prepared.append((work, files))

    if missing:
        raise RuntimeError("Catalogue source problems:\n" + "\n".join(missing))

    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    DATA.parent.mkdir(parents=True, exist_ok=True)
    token = uuid.uuid4().hex
    staged_public = PUBLIC.with_name(f".{PUBLIC.name}.build-{token}")
    staged_data = DATA.with_name(f".{DATA.name}.build-{token}")

    catalogue = []
    try:
        for position, (work, files) in enumerate(prepared, start=1):

            images = []
            cache_suffix = f"?v={work['cacheVersion']}" if work.get("cacheVersion") else ""
            image_label = work.get("imageLabel", "view")
            for index, source in enumerate(files, start=1):
                basename = f"view-{index:02d}.webp"
                full_out = staged_public / work["slug"] / basename
                thumb_out = staged_public / work["slug"] / f"thumb-{index:02d}.webp"
                width, height = optimize(source, full_out, max_width=1600, quality=86)
                optimize(source, thumb_out, max_width=520, quality=78)
                images.append(
                    {
                        "src": f"/artworks/{work['slug']}/{basename}{cache_suffix}",
                        "thumb": f"/artworks/{work['slug']}/thumb-{index:02d}.webp{cache_suffix}",
                        "width": width,
                        "height": height,
                        "alt": f"{work['title']}, {image_label} {index}",
                    }
                )

            record = {
                    "id": work["slug"],
                    "archiveNumber": f"JF-{position:03d}",
                    "title": work["title"],
                    "material": work.get("material"),
                    "dimensions": work.get("dimensions"),
                    "date": work.get("date"),
                    "availability": None,
                    "featured": bool(work.get("featured")),
                    "featuredRank": work.get("featuredRank"),
                    "catalogueNote": work.get("catalogueNote"),
                    "prototypeText": work.get("prototypeText"),
                    "story": work.get("story"),
                    "exhibitionHistory": work.get("exhibitionHistory"),
                    "provenance": work.get("provenance"),
                    "historicalRecord": work.get("historicalRecord"),
                    "relatedHistoricalRecords": work.get("relatedHistoricalRecords"),
                    "imageCount": len(images),
                    "images": images,
                }
            for field in ("photoCredit", "recordType", "imageLabel"):
                if work.get(field) is not None:
                    record[field] = work[field]
            catalogue.append(record)
        staged_data.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2) + "\n")
        publish(staged_public, staged_data, token)
    finally:
        if staged_public.exists():
            shutil.rmtree(staged_public)
        if staged_data.exists():
            staged_data.unlink()
    print(f"Built {len(catalogue)} artwork records and {sum(x['imageCount'] for x in catalogue)} image sets")
    print(f"Data: {DATA}")
    print(f"Images: {PUBLIC}")


if __name__ == "__main__":
    main()
