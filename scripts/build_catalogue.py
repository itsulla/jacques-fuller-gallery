#!/usr/bin/env python3
"""Build the initial web catalogue from Jacques's source artwork folders."""
from __future__ import annotations

import json
import re
import shutil
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
        "catalogueNote": "Historical and narrative context for the title and subject is to be confirmed before publication.",
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


def main() -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    DATA.parent.mkdir(parents=True, exist_ok=True)

    catalogue = []
    missing = []
    for position, work in enumerate(WORKS, start=1):
        folder = SOURCE / work["source"]
        if not folder.exists():
            missing.append(str(folder))
            continue
        files = sorted(folder.glob("*.jpg"))
        if not files:
            missing.append(f"No JPEG files: {folder}")
            continue

        hero_name = work.get("hero")
        if hero_name:
            hero = folder / hero_name
            if hero not in files:
                raise FileNotFoundError(f"Configured hero not found: {hero}")
            files = [hero] + [item for item in files if item != hero]

        images = []
        for index, source in enumerate(files, start=1):
            basename = f"view-{index:02d}.webp"
            full_out = PUBLIC / work["slug"] / basename
            thumb_out = PUBLIC / work["slug"] / f"thumb-{index:02d}.webp"
            width, height = optimize(source, full_out, max_width=1600, quality=86)
            optimize(source, thumb_out, max_width=520, quality=78)
            images.append(
                {
                    "src": f"/artworks/{work['slug']}/{basename}",
                    "thumb": f"/artworks/{work['slug']}/thumb-{index:02d}.webp",
                    "width": width,
                    "height": height,
                    "alt": f"{work['title']}, view {index}",
                }
            )

        catalogue.append(
            {
                "id": work["slug"],
                "archiveNumber": f"JF-{position:03d}",
                "title": work["title"],
                "material": work.get("material"),
                "dimensions": work.get("dimensions"),
                "date": None,
                "availability": None,
                "featured": bool(work.get("featured")),
                "featuredRank": work.get("featuredRank"),
                "catalogueNote": work.get("catalogueNote"),
                "prototypeText": work.get("prototypeText"),
                "story": None,
                "imageCount": len(images),
                "images": images,
            }
        )

    if missing:
        raise RuntimeError("Catalogue source problems:\n" + "\n".join(missing))

    DATA.write_text(json.dumps(catalogue, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {len(catalogue)} artwork records and {sum(x['imageCount'] for x in catalogue)} image sets")
    print(f"Data: {DATA}")
    print(f"Images: {PUBLIC}")


if __name__ == "__main__":
    main()
