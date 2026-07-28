#!/usr/bin/env python3
"""Download the four albums added to the public Jacques Drive folder on 2026-07-28."""
from pathlib import Path
from urllib.request import Request, urlopen
import time

ROOT = Path(__file__).resolve().parents[1] / "source-assets" / "Jacques"

FILES = {
    "Beaurocrat": [
        ("1kjApGnqX1mmzmk-CGq83HSbGkJY7fsqa", "486639457_2633981186792765_8815779290814131970_n.jpg"),
        ("1pxUxm5qCfNwKNEgblABf2fPq0157nRb-", "486970932_2633980863459464_6160725069842899606_n.jpg"),
        ("1kGFiLkZ5QKNneX-wkCDvdiwp3xkCRIkT", "487084685_2633980933459457_3021032848081360803_n.jpg"),
        ("1UFUFdaJWyflVkMMA4rrkt6AoB5QdLpej", "487241194_2633981190126098_4532257610878926744_n.jpg"),
        ("1MKOhSEH2VRmAQRGMRsOqspZCgY9VxWl-", "487304050_2633980923459458_5628672113581193763_n.jpg"),
        ("1e23QNpcisprIYVuiMUOMOclbVN54VgLh", "487505090_2633980970126120_5471160332191629913_n.jpg"),
        ("13oK2xulPQGbduXl0DGjzYC8PdOjX5zYU", "487513753_2633981196792764_4796511485727596632_n.jpg"),
    ],
    "Bwana": [
        ("1CLUSmAIqmwRHayodgX5D5DXhyZ-ciFzi", "42996887_892194390971462_3153474381540229120_n.jpg"),
        ("1Cmf8TVMf-P5kjHJjdSjatxKXupKld1Nq", "43007607_892194567638111_5280511133352984576_n.jpg"),
        ("1jFMTy4JgAVIaP-LZsrVWS-EBzba9HEpf", "43007671_892194374304797_3118127479298981888_n.jpg"),
        ("1q2iGvvhTmbMbOouUUyFP4qLY2bocaae4", "43015656_892194380971463_447561563910438912_n.jpg"),
        ("1Kyr8LWmMoTjVZdy5hCzYJRqQ0uzSihbe", "43027514_892194480971453_4489115923906560000_n.jpg"),
        ("1CbBJGzXqaTAEMuGPq1eNWstJqMSerLxF", "43055503_892194474304787_2299902871874830336_n.jpg"),
        ("15yxy22TCckdtRDO38hot6cUCLIbTH6aH", "43105924_892194454304789_4735935380736442368_n.jpg"),
    ],
    "King Cricket": [
        ("1ywkT-4Wfr771ev21jD6qajovL7s1HITm", "498186858_2687343664789850_2357477928115785547_n.jpg"),
        ("1LZGzXFAZglV_PDC1ZkUEur-gd6izdgSK", "498279869_2687343244789892_1687580624827618419_n.jpg"),
        ("1E-V2gUcnZAIJQsmTsVH7kyhZIBwOgVAW", "498322108_2687343361456547_4125809474770219117_n.jpg"),
        ("1oJJ3qkCydbGyGkOGUIvB6fM1lrKkfiYm", "498653235_2687343528123197_2016065933840675848_n.jpg"),
    ],
    "MALLEMEULEMERRY-GO-ROUND": [
        ("18warTxCpOuNQfXUOawrym9ylMyVwZU_y", "37882295_842528502604718_4285885029306859520_n.jpg"),
        ("12PI8FlBx3f9YIWxiRIQxEiHYDdBpBg-K", "37893664_842528542604714_1495375078366380032_n.jpg"),
        ("1iobJ_fpffpj20hW3Ldzv7lQTGQFT-pyl", "37902375_842528355938066_1897351985405886464_n.jpg"),
        ("1smtkIFusVAsvqdfv1e3-lPsSryGGGOvU", "37914065_842528499271385_7283178813528211456_n.jpg"),
        ("1qnuZWqs9KehlWoa8kTKkTw0sQtKlyOTb", "37925507_842528325938069_2606109790694277120_n.jpg"),
        ("1Yom1t48k8C3i3oxF9ZRJUVu-wJ3YVTrX", "37928865_842528482604720_8056106410926145536_n.jpg"),
        ("1EI92vPgSgK1Z4pGd9aBya00r_2u1PNWu", "37964482_842528345938067_1339683140951605248_n.jpg"),
        ("1suzuHSa52_yYKONFGEHesNyL-eyLBAkK", "37987898_842528365938065_8514394741557690368_n.jpg"),
    ],
}


def download(file_id: str, target: Path) -> None:
    if target.exists() and target.stat().st_size > 1000:
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://lh3.googleusercontent.com/u/0/d/{file_id}=w0"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as response:
        data = response.read()
    if not data.startswith(b"\xff\xd8"):
        raise RuntimeError(f"Unexpected content for {file_id}: {data[:20]!r}")
    target.write_bytes(data)


def main() -> None:
    completed = 0
    failures = []
    for folder, entries in FILES.items():
        for file_id, filename in entries:
            target = ROOT / folder / filename
            try:
                download(file_id, target)
                completed += 1
                print(f"ok {folder}/{filename}")
            except Exception as exc:
                failures.append((folder, filename, str(exc)))
                print(f"FAILED {folder}/{filename}: {exc}")
            time.sleep(0.08)
    print(f"completed={completed} failures={len(failures)}")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
