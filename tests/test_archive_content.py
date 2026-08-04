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
        self.assertEqual(current_event["date"], "1989 – present")
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

    def test_archive_states_use_one_defined_public_taxonomy(self):
        self.assertIn("Not recorded", self.app_source)
        self.assertIn("Research pending.", self.app_source)
        self.assertIn("Awaiting artist/family account.", self.app_source)
        self.assertNotIn("Pending description.", self.app_source)
        self.assertNotIn("Pending catalogue research.", self.app_source)

    def test_process_loading_copy_identifies_the_numbered_photograph(self):
        self.assertIn("Photograph ${photo.number} loading", self.app_source)


if __name__ == "__main__":
    unittest.main()
