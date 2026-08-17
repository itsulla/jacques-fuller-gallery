from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from typing import Any, cast
from unittest.mock import patch

from PIL import Image, UnidentifiedImageError


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build_catalogue.py"


def load_builder() -> Any:
    spec = importlib.util.spec_from_file_location("catalogue_builder_under_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return cast(Any, module)


class CatalogueBuildSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="jf-catalogue-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.builder = load_builder()
        self.builder.SOURCE = self.root / "source"
        self.builder.PUBLIC = self.root / "public" / "artworks"
        self.builder.DATA = self.root / "data" / "artworks.json"
        self.builder.PUBLIC.mkdir(parents=True)
        self.builder.DATA.parent.mkdir(parents=True)
        self.marker = self.builder.PUBLIC / "existing.webp"
        self.marker.write_bytes(b"existing artwork")
        self.original_data = b'{"catalogue":"existing"}\n'
        self.builder.DATA.write_bytes(self.original_data)

    def test_previous_drive_records_remain_in_supplied_order(self):
        expected = [
            ("Dragonet", "dragonet", "Dragonet", "FB_IMG_1785419761708.jpg"),
            ("DUNCE", "dunce", "Dunce", "FB_IMG_1785420117291.jpg"),
            ("BE...", "be", "BE...", "FB_IMG_1785419608304.jpg"),
            ("HOE RY DIE BOERE", "hoe-ry-die-boere", "Hoe Ry Die Boere", "FB_IMG_1785420075054.jpg"),
            ("Government of National Unity", "government-of-national-unity", "Government of National Unity", "IMG20260221145149.jpg"),
            ("Vorsprung durch Technik", "vorsprung-durch-technik", "Vorsprung durch Technik", "FB_IMG_1785760848994.jpg"),
            ("BELLE", "belle", "BELLE", "FB_IMG_1785767016456.jpg"),
            ("Symbiosis", "symbiosis", "Symbiosis", "FB_IMG_1785767406763.jpg"),
        ]

        expected_sources = {item[0] for item in expected}
        actual = [
            (work["source"], work["slug"], work["title"], work["hero"])
            for work in self.builder.WORKS
            if work["source"] in expected_sources
        ]

        self.assertEqual(actual, expected)

        for work in self.builder.WORKS:
            if work["source"] not in {"Government of National Unity", "Vorsprung durch Technik", "BELLE", "Symbiosis"}:
                continue
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)

    def test_20260804_drive_records_are_defined_in_supplied_order(self):
        expected = [
            ("Ministry", "ministry", "Ministry", "FB_IMG_1785937224230.jpg", 7),
            ("Pelican", "pelican", "Pelican", "IMG_20220529_121742.jpg", 7),
            (
                "Parliamentarian",
                "parliamentarian",
                "Parliamentarian",
                "FB_IMG_1785938743377.jpg",
                6,
            ),
            ("RSM", "rsm", "RSM", "FB_IMG_1785939904844.jpg", 9),
            ("Tutu", "tutu", "Tutu", "FB_IMG_1785940033821.jpg", 5),
            (
                "Servamus et Servimus",
                "servamus-et-servimus",
                "Servamus et Servimus",
                "FB_IMG_1785939760897.jpg",
                4,
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (work["source"], work["slug"], work["title"], work["hero"], work["expectedImageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260804-r1")

    def test_20260806_drive_records_are_defined_in_supplied_order(self):
        expected = [
            ("Jewellery", "jewellery", "Jewellery", "FB_IMG_1786003278410.jpg", 21),
            ("CONNOISSEUR", "connoisseur", "CONNOISSEUR", "FB_IMG_1786002575705.jpg", 4),
            ("SUMMER TIME", "summer-time", "SUMMER TIME", "FB_IMG_1786001992102.jpg", 5),
            ("Tourist", "tourist", "Tourist", "FB_IMG_1786002381746.jpg", 6),
            ("Uil Spieël", "uil-spieel", "Uil Spieël", "FB_IMG_1786002337263.jpg", 5),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (work["source"], work["slug"], work["title"], work["hero"], work["expectedImageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260806-r1")
        jewellery = batch[0]
        self.assertEqual(jewellery["photoCredit"], "Marie Girard")
        self.assertEqual(jewellery["recordType"], "collection")
        self.assertEqual(jewellery["imageLabel"], "image")

    def test_20260808_drive_records_are_defined_in_supplied_order(self):
        expected = [
            ("HYPOCRITE", "hypocrite", "HYPOCRITE", "FB_IMG_1786348472398.jpg", 7),
            ("Kingfisher", "kingfisher", "Kingfisher", "FB_IMG_1786347622546.jpg", 7),
            ("MANTIS", "mantis", "MANTIS", "FB_IMG_1786347708694.jpg", 7),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (work["source"], work["slug"], work["title"], work["hero"], work["expectedImageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260808-r1")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))
        self.assertEqual(
            supplied_urls.count(
                "https://drive.google.com/drive/folders/1dJLO9cKKp1YjDxk8GkEU-2-2y9G59Z9A"
            ),
            1,
        )

    def test_20260810_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "Homo erectus",
                "homo-erectus",
                "Homo erectus",
                "FB_IMG_1786352773867.jpg",
                4,
                "https://drive.google.com/drive/folders/1_28c0yuaW-O4hW-hMaFv0_0MVqKuWWIS",
            ),
            (
                "The End of the Game",
                "the-end-of-the-game",
                "The End of the Game",
                "FB_IMG_1786352213401.jpg",
                5,
                "https://drive.google.com/drive/folders/1_t6pvDc6f3U8bg2xf1ERVzrnL9mw2mCf",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260810-r1")

    def test_20260811_drive_record_is_defined(self):
        matches = [item for item in self.builder.WORKS if item["source"] == "PANZER"]

        self.assertEqual(len(matches), 1)
        work = matches[0]
        self.assertEqual(work["slug"], "panzer")
        self.assertEqual(work["title"], "PANZER")
        self.assertEqual(work["hero"], "FB_IMG_1786352200775.jpg")
        self.assertEqual(work["expectedImageCount"], 4)
        self.assertEqual(
            work["sourceUrl"],
            "https://drive.google.com/drive/folders/1Lg1CaVnsfVLZi_0sJy9p8KIQkZalu29U",
        )
        self.assertIsNone(work["material"])
        self.assertIsNone(work["dimensions"])
        self.assertNotIn("date", work)
        self.assertEqual(work["cacheVersion"], "drive-import-20260811-r1")

    def test_20260811_second_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "Juggle-HER",
                "juggle-her",
                "Juggle-HER",
                "FB_IMG_1786379982155.jpg",
                5,
                "https://drive.google.com/drive/folders/1RDGsB5KC02j5jFJA-Cuf4wCYqiCURrTd",
            ),
            (
                "Surf and Turf",
                "surf-and-turf",
                "Surf and Turf",
                "FB_IMG_1786379708860.jpg",
                3,
                "https://drive.google.com/drive/folders/1MT_Oq4zDXiea7EkOPfqAcfBkMrCLtnUf",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260811-r2")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))

    def test_20260811_third_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "NEXT",
                "next",
                "NEXT",
                "FB_IMG_1786379829920.jpg",
                5,
                "https://drive.google.com/drive/folders/17mhkGvw-0Nx064ghtvHMszxoimuCMwUR",
            ),
            (
                "Last Judgment",
                "last-judgment",
                "Last Judgment",
                "FB_IMG_1786379322136.jpg",
                5,
                "https://drive.google.com/drive/folders/1Tq19Dy-GogsjGqJaHgH6YffMwdMOIDD9",
            ),
            (
                "PREDATOR",
                "predator",
                "PREDATOR",
                "FB_IMG_1786379403470.jpg",
                3,
                "https://drive.google.com/drive/folders/1PqTVWyBkYGqi5zEl4ttDfoFpUaSAINY7",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260811-r3")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))

    def test_20260811_fourth_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "Blues",
                "blues",
                "Blues",
                "FB_IMG_1786380098722.jpg",
                3,
                "https://drive.google.com/drive/folders/18MEkN-00cReQgxnwGSovb-klS60yErhf",
            ),
            (
                "VETERAN",
                "veteran",
                "VETERAN",
                "FB_IMG_1786379196790.jpg",
                6,
                "https://drive.google.com/drive/folders/1L7FvqPd-H_hgPtFRv0tYYOF9-byVwx87",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260811-r4")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))

    def test_20260811_fifth_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "Weidmannsheil",
                "weidmannsheil",
                "Weidmannsheil",
                "FB_IMG_1786379723681.jpg",
                2,
                "https://drive.google.com/drive/folders/17034TqoCGy1t_h02YVY0arePdgFqzoDC",
            ),
            (
                "HOCHSITZE",
                "hochsitze",
                "HOCHSITZE",
                "FB_IMG_1786379628255.jpg",
                5,
                "https://drive.google.com/drive/folders/15Kk7ZG8NNiA66hGPKrwHEqLh4N-xb7a5",
            ),
            (
                "STRECKE",
                "strecke",
                "STRECKE",
                "FB_IMG_1786379589353.jpg",
                3,
                "https://drive.google.com/drive/folders/1V0W1olWE8MkLSsVup780CUyQGyiBEJGi",
            ),
            (
                "REFEREE",
                "referee",
                "REFEREE",
                "FB_IMG_1786379125975.jpg",
                4,
                "https://drive.google.com/drive/folders/1rW26fg8QSTKBOoMSVm3RJKMMlL0x0nP_",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260811-r5")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))

    def test_20260811_sixth_drive_records_are_defined_in_supplied_order(self):
        expected = [
            (
                "Homage to M C Escher",
                "homage-to-m-c-escher",
                "Homage to M C Escher",
                "FB_IMG_1786379295166.jpg",
                3,
                "https://drive.google.com/drive/folders/1a0ZQsgdggnAr8olsf9CoHSl1Ka-waTKR",
            ),
            (
                "Sunshine",
                "sunshine",
                "Sunshine",
                "FB_IMG_1786352789785.jpg",
                6,
                "https://drive.google.com/drive/folders/1xKNJ7PDdb6v-pGZKZVYwYD6RnIHzuNzS",
            ),
            (
                "Scale Libra",
                "scale-libra",
                "Scale Libra",
                "FB_IMG_1786352917056.jpg",
                3,
                "https://drive.google.com/drive/folders/1-DsUJeiffyABR3TkB536SeGA1hL96Rn2",
            ),
            (
                "Falco peregrinus",
                "falco-peregrinus",
                "Falco peregrinus",
                "FB_IMG_1786348417219.jpg",
                3,
                "https://drive.google.com/drive/folders/1pGI1-B1Eal_5vE7kPGUHuI9hM_-vMWRj",
            ),
        ]

        expected_sources = {item[0] for item in expected}
        batch = [work for work in self.builder.WORKS if work["source"] in expected_sources]
        actual = [
            (
                work["source"],
                work["slug"],
                work["title"],
                work["hero"],
                work["expectedImageCount"],
                work["sourceUrl"],
            )
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertNotIn("date", work)
            self.assertEqual(work["cacheVersion"], "drive-import-20260811-r6")

        supplied_urls = [work.get("sourceUrl") for work in self.builder.WORKS if work.get("sourceUrl")]
        self.assertEqual(len(supplied_urls), len(set(supplied_urls)))

    def test_optional_record_metadata_is_emitted(self):
        folder = self.builder.SOURCE / "Collection"
        folder.mkdir(parents=True)
        Image.new("RGB", (8, 8), "white").save(folder / "view.jpg")
        self.builder.WORKS = [
            {
                "source": "Collection",
                "slug": "collection",
                "title": "Collection",
                "material": None,
                "dimensions": None,
                "photoCredit": "Marie Girard",
                "recordType": "collection",
                "imageLabel": "image",
            }
        ]

        self.builder.main()

        record = json.loads(self.builder.DATA.read_text())[0]
        self.assertEqual(record["photoCredit"], "Marie Girard")
        self.assertEqual(record["recordType"], "collection")
        self.assertEqual(record["imageLabel"], "image")
        self.assertEqual(record["images"][0]["alt"], "Collection, image 1")

    def test_missing_source_preserves_existing_outputs(self):
        self.builder.WORKS = [
            {
                "source": "Missing work",
                "slug": "missing-work",
                "title": "Missing Work",
                "material": None,
                "dimensions": None,
            }
        ]

        with self.assertRaisesRegex(RuntimeError, "Catalogue source problems"):
            self.builder.main()

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)

    def test_invalid_image_preserves_existing_outputs(self):
        folder = self.builder.SOURCE / "Broken work"
        folder.mkdir(parents=True)
        (folder / "broken.jpg").write_bytes(b"not a jpeg")
        self.builder.WORKS = [
            {
                "source": "Broken work",
                "slug": "broken-work",
                "title": "Broken Work",
                "material": None,
                "dimensions": None,
            }
        ]

        with self.assertRaises(UnidentifiedImageError):
            self.builder.main()

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)

    def test_unexpected_image_count_preserves_existing_outputs(self):
        folder = self.builder.SOURCE / "Incomplete work"
        folder.mkdir(parents=True)
        Image.new("RGB", (8, 8), "white").save(folder / "only-view.jpg")
        self.builder.WORKS = [
            {
                "source": "Incomplete work",
                "slug": "incomplete-work",
                "title": "Incomplete Work",
                "material": None,
                "dimensions": None,
                "expectedImageCount": 2,
            }
        ]

        with self.assertRaisesRegex(RuntimeError, "Expected 2 JPEG files"):
            self.builder.main()

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)

    def test_conversion_failure_preserves_existing_outputs(self):
        folder = self.builder.SOURCE / "Valid work"
        folder.mkdir(parents=True)
        Image.new("RGB", (8, 8), "white").save(folder / "valid.jpg")
        self.builder.WORKS = [
            {
                "source": "Valid work",
                "slug": "valid-work",
                "title": "Valid Work",
                "material": None,
                "dimensions": None,
            }
        ]

        with patch.object(self.builder, "optimize", side_effect=RuntimeError("conversion failed")):
            with self.assertRaisesRegex(RuntimeError, "conversion failed"):
                self.builder.main()

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)

    def test_publish_failure_restores_existing_outputs(self):
        staged_public = self.builder.PUBLIC.with_name(".artworks.build-test")
        staged_public.mkdir()
        (staged_public / "new.webp").write_bytes(b"new artwork")
        staged_data = self.builder.DATA.with_name(".artworks.json.build-test")
        staged_data.write_bytes(b'{"catalogue":"new"}\n')
        real_replace = self.builder.os.replace

        def fail_data_install(source, destination):
            if Path(source) == staged_data and Path(destination) == self.builder.DATA:
                raise OSError("data install failed")
            return real_replace(source, destination)

        with patch.object(self.builder.os, "replace", side_effect=fail_data_install):
            with self.assertRaisesRegex(OSError, "data install failed"):
                self.builder.publish(staged_public, staged_data, "test")

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)
        self.assertFalse(self.builder.PUBLIC.with_name(".artworks.backup-test").exists())
        self.assertFalse(self.builder.DATA.with_name(".artworks.json.backup-test").exists())

    def test_interrupted_publish_recovers_previous_pair_at_every_replace_boundary(self):
        class SimulatedProcessInterruption(BaseException):
            pass

        for boundary in range(1, 6):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory(prefix="jf-catalogue-interrupt-") as temp:
                root = Path(temp)
                builder = load_builder()
                builder.PUBLIC = root / "public" / "artworks"
                builder.DATA = root / "data" / "artworks.json"
                builder.PUBLIC.mkdir(parents=True)
                builder.DATA.parent.mkdir(parents=True)
                (builder.PUBLIC / "old.webp").write_bytes(b"old artwork")
                builder.DATA.write_bytes(b'{"catalogue":"old"}\n')
                staged_public = builder.PUBLIC.with_name(".artworks.build-interrupt")
                staged_public.mkdir()
                (staged_public / "new.webp").write_bytes(b"new artwork")
                staged_data = builder.DATA.with_name(".artworks.json.build-interrupt")
                staged_data.write_bytes(b'{"catalogue":"new"}\n')
                real_replace = builder.os.replace
                replacements = 0

                def interrupt_after_replace(source, destination):
                    nonlocal replacements
                    result = real_replace(source, destination)
                    replacements += 1
                    if replacements == boundary:
                        raise SimulatedProcessInterruption()
                    return result

                with patch.object(builder.os, "replace", side_effect=interrupt_after_replace):
                    with self.assertRaises(SimulatedProcessInterruption):
                        builder.publish(staged_public, staged_data, "interrupt")

                builder.recover_interrupted_publish()
                self.assertEqual((builder.PUBLIC / "old.webp").read_bytes(), b"old artwork")
                self.assertFalse((builder.PUBLIC / "new.webp").exists())
                self.assertEqual(builder.DATA.read_bytes(), b'{"catalogue":"old"}\n')
                self.assertFalse(builder.transaction_path().exists())

    def test_next_build_recovers_interruption_before_source_validation(self):
        class SimulatedProcessInterruption(BaseException):
            pass

        staged_public = self.builder.PUBLIC.with_name(".artworks.build-restart")
        staged_public.mkdir()
        (staged_public / "new.webp").write_bytes(b"new artwork")
        staged_data = self.builder.DATA.with_name(".artworks.json.build-restart")
        staged_data.write_bytes(b'{"catalogue":"new"}\n')
        real_replace = self.builder.os.replace
        replacements = 0

        def interrupt_after_public_install(source, destination):
            nonlocal replacements
            result = real_replace(source, destination)
            replacements += 1
            if replacements == 4:
                raise SimulatedProcessInterruption()
            return result

        with patch.object(self.builder.os, "replace", side_effect=interrupt_after_public_install):
            with self.assertRaises(SimulatedProcessInterruption):
                self.builder.publish(staged_public, staged_data, "restart")

        self.builder.WORKS = [{"source": "separately-missing-source"}]
        with self.assertRaises(RuntimeError):
            self.builder.main()

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)
        self.assertFalse(self.builder.transaction_path().exists())

    def test_publish_syncs_staged_contents_before_first_replace(self):
        staged_public = self.builder.PUBLIC.with_name(".artworks.build-sync")
        staged_folder = staged_public / "work"
        staged_folder.mkdir(parents=True)
        staged_files = [staged_folder / "view.webp", staged_folder / "thumb.webp"]
        for staged_file in staged_files:
            staged_file.write_bytes(b"generated image")
        staged_data = self.builder.DATA.with_name(".artworks.json.build-sync")
        staged_data.write_bytes(b'{"catalogue":"new"}\n')
        events = []
        real_fsync_file = self.builder.fsync_file
        real_fsync_directory = self.builder.fsync_directory
        real_replace = self.builder.os.replace

        def trace_file(path):
            events.append(("fsync-file", Path(path)))
            return real_fsync_file(path)

        def trace_directory(path):
            events.append(("fsync-directory", Path(path)))
            return real_fsync_directory(path)

        def trace_replace(source, destination):
            events.append(("replace", Path(source), Path(destination)))
            return real_replace(source, destination)

        with (
            patch.object(self.builder, "fsync_file", side_effect=trace_file),
            patch.object(self.builder, "fsync_directory", side_effect=trace_directory),
            patch.object(self.builder.os, "replace", side_effect=trace_replace),
        ):
            self.builder.publish(staged_public, staged_data, "sync")

        first_replace = next(index for index, event in enumerate(events) if event[0] == "replace")
        before_replace = events[:first_replace]
        synced_files = {event[1] for event in before_replace if event[0] == "fsync-file"}
        synced_directories = {event[1] for event in before_replace if event[0] == "fsync-directory"}
        self.assertEqual(synced_files, {*staged_files, staged_data})
        self.assertTrue({staged_folder, staged_public, staged_public.parent, staged_data.parent} <= synced_directories)

    def test_staged_sync_failure_preserves_existing_outputs(self):
        staged_public = self.builder.PUBLIC.with_name(".artworks.build-sync-failure")
        staged_public.mkdir()
        (staged_public / "new.webp").write_bytes(b"new artwork")
        staged_data = self.builder.DATA.with_name(".artworks.json.build-sync-failure")
        staged_data.write_bytes(b'{"catalogue":"new"}\n')

        with patch.object(self.builder, "fsync_file", side_effect=OSError("staged sync failed")):
            with self.assertRaisesRegex(OSError, "staged sync failed"):
                self.builder.publish(staged_public, staged_data, "sync-failure")

        self.assertEqual(self.marker.read_bytes(), b"existing artwork")
        self.assertEqual(self.builder.DATA.read_bytes(), self.original_data)
        self.assertFalse(self.builder.transaction_path().exists())

    def test_publish_rejects_symlinked_staging_boundaries(self):
        for boundary in ("artwork root", "catalogue data"):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory(prefix="jf-catalogue-symlink-") as temp:
                root = Path(temp)
                builder = load_builder()
                builder.PUBLIC = root / "public" / "artworks"
                builder.DATA = root / "data" / "artworks.json"
                builder.PUBLIC.mkdir(parents=True)
                builder.DATA.parent.mkdir(parents=True)
                (builder.PUBLIC / "old.webp").write_bytes(b"old artwork")
                builder.DATA.write_bytes(b'{"catalogue":"old"}\n')
                staged_public = builder.PUBLIC.with_name(".artworks.build-symlink")
                staged_data = builder.DATA.with_name(".artworks.json.build-symlink")

                if boundary == "artwork root":
                    attacker_directory = root / "attacker-assets"
                    attacker_directory.mkdir()
                    (attacker_directory / "new.webp").write_bytes(b"attacker artwork")
                    staged_public.symlink_to(attacker_directory, target_is_directory=True)
                    staged_data.write_bytes(b'{"catalogue":"new"}\n')
                else:
                    staged_public.mkdir()
                    (staged_public / "new.webp").write_bytes(b"new artwork")
                    attacker_data = root / "attacker.json"
                    attacker_data.write_bytes(b'{"catalogue":"attacker"}\n')
                    staged_data.symlink_to(attacker_data)

                with self.assertRaisesRegex(RuntimeError, "symlink"):
                    builder.publish(staged_public, staged_data, "symlink")

                self.assertEqual((builder.PUBLIC / "old.webp").read_bytes(), b"old artwork")
                self.assertEqual(builder.DATA.read_bytes(), b'{"catalogue":"old"}\n')
                self.assertFalse(builder.transaction_path().exists())

    def test_recovery_rejects_symlinked_backup_boundaries(self):
        for boundary in ("artwork backup", "catalogue backup"):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory(prefix="jf-backup-symlink-") as temp:
                root = Path(temp)
                builder = load_builder()
                builder.PUBLIC = root / "public" / "artworks"
                builder.DATA = root / "data" / "artworks.json"
                builder.PUBLIC.mkdir(parents=True)
                builder.DATA.parent.mkdir(parents=True)
                (builder.PUBLIC / "current.webp").write_bytes(b"current artwork")
                builder.DATA.write_bytes(b'{"catalogue":"current"}\n')
                builder.write_transaction("backup-symlink", True, True)

                if boundary == "artwork backup":
                    attacker_directory = root / "attacker-assets"
                    attacker_directory.mkdir()
                    (attacker_directory / "attacker.webp").write_bytes(b"attacker artwork")
                    builder.PUBLIC.with_name(".artworks.backup-backup-symlink").symlink_to(
                        attacker_directory, target_is_directory=True
                    )
                else:
                    attacker_data = root / "attacker.json"
                    attacker_data.write_bytes(b'{"catalogue":"attacker"}\n')
                    builder.DATA.with_name(".artworks.json.backup-backup-symlink").symlink_to(attacker_data)

                with self.assertRaisesRegex(RuntimeError, "symlink"):
                    builder.recover_interrupted_publish()

                self.assertEqual((builder.PUBLIC / "current.webp").read_bytes(), b"current artwork")
                self.assertEqual(builder.DATA.read_bytes(), b'{"catalogue":"current"}\n')
                self.assertTrue(builder.transaction_path().exists())

    def test_publish_rejects_symlinked_current_boundaries(self):
        for boundary in ("artwork root", "catalogue data"):
            with self.subTest(boundary=boundary), tempfile.TemporaryDirectory(prefix="jf-current-symlink-") as temp:
                root = Path(temp)
                builder = load_builder()
                builder.PUBLIC = root / "public" / "artworks"
                builder.DATA = root / "data" / "artworks.json"
                builder.PUBLIC.parent.mkdir(parents=True)
                builder.DATA.parent.mkdir(parents=True)
                staged_public = builder.PUBLIC.with_name(".artworks.build-current-symlink")
                staged_public.mkdir()
                (staged_public / "new.webp").write_bytes(b"new artwork")
                staged_data = builder.DATA.with_name(".artworks.json.build-current-symlink")
                staged_data.write_bytes(b'{"catalogue":"new"}\n')

                if boundary == "artwork root":
                    current_directory = root / "current-assets"
                    current_directory.mkdir()
                    (current_directory / "current.webp").write_bytes(b"current artwork")
                    builder.PUBLIC.symlink_to(current_directory, target_is_directory=True)
                    builder.DATA.write_bytes(b'{"catalogue":"current"}\n')
                else:
                    builder.PUBLIC.mkdir()
                    (builder.PUBLIC / "current.webp").write_bytes(b"current artwork")
                    current_data = root / "current.json"
                    current_data.write_bytes(b'{"catalogue":"current"}\n')
                    builder.DATA.symlink_to(current_data)

                with self.assertRaisesRegex(RuntimeError, "symlink"):
                    builder.publish(staged_public, staged_data, "current-symlink")

                self.assertFalse(builder.transaction_path().exists())

    def test_transaction_marker_symlinks_are_rejected_before_read_or_replace(self):
        for operation in ("recover", "write"):
            for target_kind in ("valid", "dangling"):
                with (
                    self.subTest(operation=operation, target=target_kind),
                    tempfile.TemporaryDirectory(prefix="jf-marker-symlink-") as temp,
                ):
                    root = Path(temp)
                    builder = load_builder()
                    builder.PUBLIC = root / "public" / "artworks"
                    builder.DATA = root / "data" / "artworks.json"
                    builder.PUBLIC.mkdir(parents=True)
                    builder.DATA.parent.mkdir(parents=True)
                    (builder.PUBLIC / "current.webp").write_bytes(b"current artwork")
                    builder.DATA.write_bytes(b'{"catalogue":"current"}\n')
                    external_marker = root / "external-marker.json"
                    marker_contents = b'{"version":1,"token":"external","hadPublic":true,"hadData":true}\n'
                    if target_kind == "valid":
                        external_marker.write_bytes(marker_contents)
                    builder.transaction_path().symlink_to(external_marker)

                    with self.assertRaisesRegex(RuntimeError, "must not be a symlink"):
                        if operation == "recover":
                            builder.recover_interrupted_publish()
                        else:
                            builder.write_transaction("marker-test", True, True)

                    self.assertTrue(builder.transaction_path().is_symlink())
                    if target_kind == "valid":
                        self.assertEqual(external_marker.read_bytes(), marker_contents)
                    else:
                        self.assertFalse(external_marker.exists())

    def test_each_replace_is_directory_synced_before_the_next_replace(self):
        staged_public = self.builder.PUBLIC.with_name(".artworks.build-replace-sync")
        staged_public.mkdir()
        (staged_public / "new.webp").write_bytes(b"new artwork")
        staged_data = self.builder.DATA.with_name(".artworks.json.build-replace-sync")
        staged_data.write_bytes(b'{"catalogue":"new"}\n')
        events = []
        real_fsync_directory = self.builder.fsync_directory
        real_replace = self.builder.os.replace

        def trace_directory(path):
            events.append(("fsync-directory", Path(path)))
            return real_fsync_directory(path)

        def trace_replace(source, destination):
            events.append(("replace", Path(source), Path(destination)))
            return real_replace(source, destination)

        with (
            patch.object(self.builder, "fsync_directory", side_effect=trace_directory),
            patch.object(self.builder.os, "replace", side_effect=trace_replace),
        ):
            self.builder.publish(staged_public, staged_data, "replace-sync")

        replacement_indexes = [index for index, event in enumerate(events) if event[0] == "replace"]
        self.assertEqual(len(replacement_indexes), 5)
        for position, replacement_index in enumerate(replacement_indexes):
            next_index = replacement_indexes[position + 1] if position + 1 < len(replacement_indexes) else len(events)
            destination_parent = events[replacement_index][2].parent
            synced_parents = {
                event[1] for event in events[replacement_index + 1 : next_index] if event[0] == "fsync-directory"
            }
            self.assertIn(destination_parent, synced_parents)

    def test_cache_version_changes_urls_without_changing_output_filenames(self):
        folder = self.builder.SOURCE / "Versioned work"
        folder.mkdir(parents=True)
        Image.new("RGB", (8, 8), "white").save(folder / "view.jpg")
        self.builder.WORKS = [
            {
                "source": "Versioned work",
                "slug": "versioned-work",
                "title": "Versioned Work",
                "material": None,
                "dimensions": None,
                "cacheVersion": "drive-import-20260801",
            }
        ]

        self.builder.main()

        record = json.loads(self.builder.DATA.read_text())[0]
        self.assertEqual(record["images"][0]["src"], "/artworks/versioned-work/view-01.webp?v=drive-import-20260801")
        self.assertEqual(record["images"][0]["thumb"], "/artworks/versioned-work/thumb-01.webp?v=drive-import-20260801")
        self.assertTrue((self.builder.PUBLIC / "versioned-work" / "view-01.webp").is_file())
        self.assertTrue((self.builder.PUBLIC / "versioned-work" / "thumb-01.webp").is_file())

    def test_historical_relationships_survive_generated_catalogue_output(self):
        folder = self.builder.SOURCE / "Documented work"
        folder.mkdir(parents=True)
        Image.new("RGB", (8, 8), "white").save(folder / "view.jpg")
        historical_record = {
            "id": "JF2001-010",
            "catalogueNumber": 10,
            "relationship": "same-object",
            "inscription": "JRF 2000",
            "collectionAsOf2001": "Jacques Fuller, Bloemfontein",
            "sourcePage": 24,
            "sourceYear": 2001,
        }
        related_records = [
            {
                "id": "JF2001-058",
                "catalogueNumber": 58,
                "relationship": "reused-title-different-object",
                "sourcePage": 27,
                "sourceYear": 2001,
            }
        ]
        self.builder.WORKS = [
            {
                "source": "Documented work",
                "slug": "documented-work",
                "title": "Documented Work",
                "material": "Brass",
                "dimensions": "78 × 93 cm",
                "date": "2000",
                "historicalRecord": historical_record,
                "relatedHistoricalRecords": related_records,
            }
        ]

        self.builder.main()

        record = json.loads(self.builder.DATA.read_text())[0]
        self.assertEqual(record["date"], "2000")
        self.assertEqual(record["material"], "Brass")
        self.assertEqual(record["dimensions"], "78 × 93 cm")
        self.assertEqual(record["historicalRecord"], historical_record)
        self.assertEqual(record["relatedHistoricalRecords"], related_records)


if __name__ == "__main__":
    unittest.main()
