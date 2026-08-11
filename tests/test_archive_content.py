from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path
from typing import Any, cast


ROOT = Path(__file__).resolve().parents[1]
HISTORICAL_DATA = ROOT / "src" / "data" / "historicalCatalogue.json"
ARTIST_DATA = ROOT / "src" / "data" / "artist.json"
ARTWORKS_DATA = ROOT / "src" / "data" / "artworks.json"
APP_SOURCE = ROOT / "src" / "App.jsx"
BUILDER = ROOT / "scripts" / "build_catalogue.py"
DESIGN_DOC = ROOT / "DESIGN.md"
PRODUCT_DOC = ROOT / "PRODUCT.md"
HOMEPAGE_MOSAIC_DATA = ROOT / "src" / "data" / "homepageMosaic.json"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text())


def load_builder() -> Any:
    spec = importlib.util.spec_from_file_location("catalogue_builder_content_test", BUILDER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {BUILDER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return cast(Any, module)


class HistoricalCatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalogue = load_json(HISTORICAL_DATA)
        cls.records = cls.catalogue["records"]
        cls.by_number = {record["catalogueNumber"]: record for record in cls.records}

    def test_catalogue_is_complete_and_continuous(self):
        self.assertEqual(len(self.records), 61)
        self.assertEqual([record["catalogueNumber"] for record in self.records], list(range(1, 62)))
        self.assertEqual([record["id"] for record in self.records], [f"JF2001-{number:03d}" for number in range(1, 62)])

    def test_every_record_is_bound_to_the_dated_source(self):
        source = self.catalogue["source"]
        self.assertEqual(source["title"], "Jacques Fuller: Sculptor")
        self.assertEqual(source["publisher"], "Sanlam Art Collection")
        self.assertEqual(source["year"], 2001)
        self.assertIn("historical", self.catalogue["scopeNote"].lower())
        self.assertIn("2001", self.catalogue["scopeNote"])

        expected_pages = {
            number: 24 if number <= 16 else 25 if number <= 34 else 26 if number <= 50 else 27
            for number in range(1, 62)
        }
        for record in self.records:
            with self.subTest(record=record["id"]):
                self.assertEqual(record["sourcePage"], expected_pages[record["catalogueNumber"]])
                self.assertTrue(record["title"])
                self.assertIn("collectionAsOf2001", record)

    def test_confirmed_and_reused_title_relationships_remain_distinct(self):
        hoe_ry = self.by_number[10]
        self.assertEqual(hoe_ry["title"], "Hoe Ry die Boere")
        self.assertEqual(hoe_ry["relationship"]["type"], "same-object")
        self.assertEqual(hoe_ry["relationship"]["currentWorkId"], "hoe-ry-die-boere")

        bwana = self.by_number[58]
        self.assertEqual(bwana["title"], "Bwana")
        self.assertEqual(bwana["relationship"]["type"], "reused-title-different-object")
        self.assertEqual(bwana["relationship"]["currentWorkId"], "bwana")

    def test_new_page_26_records_are_present(self):
        self.assertEqual(self.by_number[35]["title"], "Ox")
        self.assertEqual(self.by_number[42]["title"], "Owl Lady")
        self.assertEqual(self.by_number[49]["title"], "Jan Taks")
        self.assertEqual(self.by_number[50]["title"], "Monnik")
        self.assertTrue(all(self.by_number[number]["sourcePage"] == 26 for number in range(35, 51)))


class ArtistSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artist = load_json(ARTIST_DATA)

    def test_biography_and_timeline_distinguish_historical_and_current_sources(self):
        self.assertEqual(self.artist["biography"]["asRecorded"], 2001)
        self.assertGreaterEqual(len(self.artist["biography"]["paragraphs"]), 2)
        self.assertGreaterEqual(len(self.artist["timeline"]), 5)
        historical_events = self.artist["timeline"][:-1]
        current_event = self.artist["timeline"][-1]
        self.assertTrue(all(event["source"]["year"] == 2001 for event in historical_events))
        self.assertEqual(current_event["date"], "1989-present")
        self.assertEqual(current_event["title"], "Full-time sculptor")
        self.assertEqual(current_event["source"]["year"], 2026)
        self.assertEqual(current_event["source"]["type"], "current website update")

    def test_every_artist_quote_has_speaker_interviewer_and_date(self):
        self.assertGreaterEqual(len(self.artist["quotes"]), 3)
        for quote in self.artist["quotes"]:
            with self.subTest(quote=quote["id"]):
                self.assertEqual(quote["speaker"], "Jacques Fuller")
                self.assertEqual(quote["source"]["interviewer"], "Sharon Crampton")
                self.assertEqual(quote["source"]["date"], "August 2001")
                self.assertTrue(quote["text"])


class CurrentCatalogueLinkTests(unittest.TestCase):
    def test_homepage_mosaic_uses_the_six_user_selected_photos(self):
        mosaic = load_json(HOMEPAGE_MOSAIC_DATA)
        actual = [
            (
                item.get("workId"),
                item.get("imageIndex"),
                item.get("opensArchive", False),
                item.get("image", {}).get("src"),
            )
            for item in mosaic
        ]

        self.assertEqual(
            actual,
            [
                (None, None, True, "/homepage/reference-04.webp"),
                ("beaurocrat", 6, False, None),
                ("ship-of-fools", 6, False, None),
                ("kingfisher", 0, False, None),
                ("government-of-national-unity", 0, False, None),
                (None, None, True, "/homepage/reference-06.webp"),
            ],
        )

    def test_documentation_counts_match_the_generated_catalogue(self):
        artworks = load_json(ARTWORKS_DATA)
        work_count = len(artworks)
        photograph_count = sum(work["imageCount"] for work in artworks)
        sculpture_count = sum(work.get("recordType") != "collection" for work in artworks)
        design = DESIGN_DOC.read_text()
        product = PRODUCT_DOC.read_text()

        self.assertIn(f"gallery of {work_count} works and {photograph_count} photographs", design)
        self.assertIn(f"gallery: {work_count} square-edged", design)
        self.assertIn(
            f"presents {sculpture_count} photographed sculptures plus one explicitly labelled Jewellery collection",
            product,
        )
        self.assertIn(f"gallery with {work_count} current records and {photograph_count} photographs", product)
        self.assertIn(
            f"contains {work_count} current-record folders: {sculpture_count} sculptures and one Jewellery collection",
            product,
        )

    def test_20260804_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("ministry", "JF-035", "Ministry", 7),
            ("pelican", "JF-036", "Pelican", 7),
            ("parliamentarian", "JF-037", "Parliamentarian", 6),
            ("rsm", "JF-038", "RSM", 9),
            ("tutu", "JF-039", "Tutu", 5),
            ("servamus-et-servimus", "JF-040", "Servamus et Servimus", 4),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260806_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("jewellery", "JF-041", "Jewellery", 21),
            ("connoisseur", "JF-042", "CONNOISSEUR", 4),
            ("summer-time", "JF-043", "SUMMER TIME", 5),
            ("tourist", "JF-044", "Tourist", 6),
            ("uil-spieel", "JF-045", "Uil Spieël", 5),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])
        jewellery = next(work for work in batch if work["id"] == "jewellery")
        self.assertEqual(jewellery["photoCredit"], "Marie Girard")
        self.assertEqual(jewellery["recordType"], "collection")
        self.assertEqual(jewellery["imageLabel"], "image")

    def test_20260808_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("hypocrite", "JF-046", "HYPOCRITE", 7),
            ("kingfisher", "JF-047", "Kingfisher", 7),
            ("mantis", "JF-048", "MANTIS", 7),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260810_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("homo-erectus", "JF-049", "Homo erectus", 4),
            ("the-end-of-the-game", "JF-050", "The End of the Game", 5),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260811_drive_record_is_generated(self):
        artworks = load_json(ARTWORKS_DATA)
        matches = [item for item in artworks if item["id"] == "panzer"]

        self.assertEqual(len(matches), 1)
        work = matches[0]
        self.assertEqual(work["archiveNumber"], "JF-051")
        self.assertEqual(work["title"], "PANZER")
        self.assertEqual(work["imageCount"], 4)
        self.assertIsNone(work["material"])
        self.assertIsNone(work["dimensions"])
        self.assertIsNone(work["date"])

    def test_20260811_second_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("juggle-her", "JF-052", "Juggle-HER", 5),
            ("surf-and-turf", "JF-053", "Surf and Turf", 3),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260811_third_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("next", "JF-054", "NEXT", 5),
            ("last-judgment", "JF-055", "Last Judgment", 5),
            ("predator", "JF-056", "PREDATOR", 3),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260811_fourth_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("blues", "JF-057", "Blues", 3),
            ("veteran", "JF-058", "VETERAN", 6),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_20260811_fifth_drive_records_are_generated_in_stable_order(self):
        artworks = load_json(ARTWORKS_DATA)
        expected = [
            ("weidmannsheil", "JF-059", "Weidmannsheil", 2),
            ("hochsitze", "JF-060", "HOCHSITZE", 5),
            ("strecke", "JF-061", "STRECKE", 3),
            ("referee", "JF-062", "REFEREE", 4),
        ]

        expected_ids = {item[0] for item in expected}
        batch = [work for work in artworks if work["id"] in expected_ids]
        actual = [
            (work["id"], work["archiveNumber"], work["title"], work["imageCount"])
            for work in batch
        ]

        self.assertEqual(len(artworks), 62)
        self.assertEqual(sum(item["imageCount"] for item in artworks), 389)
        self.assertEqual(actual, expected)
        for work in batch:
            self.assertIsNone(work["material"])
            self.assertIsNone(work["dimensions"])
            self.assertIsNone(work["date"])

    def test_current_and_generator_records_carry_the_same_confirmed_link(self):
        artworks = load_json(ARTWORKS_DATA)
        current = next(work for work in artworks if work["id"] == "hoe-ry-die-boere")
        self.assertEqual(current["archiveNumber"], "JF-030")
        self.assertEqual(current["material"], "Brass")
        self.assertEqual(current["date"], "2000")
        self.assertEqual(current["dimensions"], "78 × 93 cm")
        self.assertEqual(current["historicalRecord"]["id"], "JF2001-010")
        self.assertEqual(current["historicalRecord"]["relationship"], "same-object")
        self.assertEqual(current["historicalRecord"]["collectionAsOf2001"], "Jacques Fuller, Bloemfontein")

        builder = load_builder()
        source_record = next(work for work in builder.WORKS if work["slug"] == "hoe-ry-die-boere")
        for field in ("material", "date", "dimensions", "historicalRecord"):
            self.assertEqual(source_record[field], current[field])

    def test_current_bwana_does_not_inherit_historical_bwana_facts(self):
        artworks = load_json(ARTWORKS_DATA)
        current = next(work for work in artworks if work["id"] == "bwana")
        self.assertIsNone(current["material"])
        self.assertIsNone(current["date"])
        self.assertIsNone(current["dimensions"])
        relation = current["relatedHistoricalRecords"][0]
        self.assertEqual(relation["id"], "JF2001-058")
        self.assertEqual(relation["relationship"], "reused-title-different-object")


class PresentationLanguageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app_source = APP_SOURCE.read_text()
        cls.artist = load_json(ARTIST_DATA)

    def test_public_interface_is_artist_led_and_uses_works_language(self):
        for phrase in (
            "Archive 2001",
            "Historical exhibition catalogue",
            "Open archive index",
            "Explore the archive",
            "Current archive",
            "Archive states",
            "Catalogue note",
            "Historical catalogue record",
            "Source:",
            "2001",
        ):
            with self.subTest(phrase=phrase):
                self.assertNotIn(phrase, self.app_source)

        for phrase in ("Works", "View works", "View all {artworks.length} works", "archive-index__gallery"):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, self.app_source)

        self.assertNotIn("historicalCatalogue", self.app_source)
        self.assertNotIn("Search works", self.app_source)
        self.assertNotIn('type="search"', self.app_source)
        self.assertNotIn("archive-index__tools", self.app_source)
        self.assertIn("archive-index__artwork", self.app_source)

        self.assertNotIn("View</span>", self.app_source)
        self.assertNotIn("{work.archiveNumber}</p>", self.app_source)

    def test_biography_does_not_expose_catalogue_provenance_copy(self):
        biography = self.artist["biography"]
        self.assertNotIn("note", biography["source"])
        self.assertTrue(all("catalogue" not in paragraph.lower() for paragraph in biography["paragraphs"]))

    def test_public_about_uses_supported_biography_and_timeline(self):
        biography = self.artist["biography"]
        self.assertGreaterEqual(len(biography["paragraphs"]), 3)
        self.assertEqual(len(self.artist["timeline"]), 6)
        self.assertEqual([event["date"] for event in self.artist["timeline"]], ["1979", "1981-82", "1983", "1984", "1988", "1989-present"])
        self.assertIn("works directly in metal", biography["paragraphs"][-1])
        self.assertIn("<p>Biography</p>", self.app_source)
        self.assertIn("About Jacques", self.app_source)
        self.assertIn("artist.timeline.map", self.app_source)
        self.assertNotIn("artist.biography.facts.map", self.app_source)

    def test_optional_photo_credit_is_rendered_as_a_record_fact(self):
        self.assertIn("Photo credit", self.app_source)
        self.assertIn("work.photoCredit", self.app_source)

    def test_process_loading_copy_identifies_the_numbered_photograph(self):
        self.assertIn("Photograph ${photo.number} loading", self.app_source)


if __name__ == "__main__":
    unittest.main()
