#!/usr/bin/env python3
"""Recover public Google Drive image files when folder-level gdown is rate-limited."""
from pathlib import Path
from urllib.request import Request, urlopen
import time

ROOT = Path(__file__).resolve().parents[1] / "source-assets" / "Jacques"

FILES = {
    "RAM Brass 42cm High x 18cm wide": [
        ("1gLnbXvaDBEI9Sl3jBDdF3t08Q3-uBUYC", "493323189_3020021974817266_970062842182878804_n.jpg"),
    ],
    "Safari": [
        ("12_wtUxLJfoVCoh5XjIcrJDmcZGm-IY4j", "506089750_3076475845838545_6110964737713144600_n.jpg"),
        ("1OeyEUdlU98H3VKWUcFY-TXep75Vb8f1b", "506212242_3076476032505193_3160082576780145007_n.jpg"),
        ("1N8uz06pXjDhj0cNK9EsyEanb9U9wBG3e", "506226344_3076475999171863_7949806593362657871_n.jpg"),
        ("1O_Qc6qshw7_mjMskoKLst5hyiHi_2h6-", "506244838_3076476052505191_6145356587915310644_n.jpg"),
        ("1y3kudXn_4E6MHyNLJDUKb83bUjkMFEJj", "506386331_3076475815838548_5534743418767407389_n.jpg"),
        ("1eyoK54vx0iYzlMAmPOupNM9BQg7drj15", "506396788_3076475922505204_2037530717421542817_n.jpg"),
        ("1EcirnYABeQ0jL7X-T0Fck_H9tddbnYa9", "506398151_3076475942505202_2398373354091209154_n.jpg"),
        ("1EBYcRkjww5ceXND3woRYJgFMW8aWPD3k", "506503297_3076476045838525_3447502943313896673_n.jpg"),
        ("1fXJJBpAoz08gfJaVG9UkfWYivv3xP_e6", "506535656_3076475992505197_343973928965089681_n.jpg"),
        ("1caZ5itXZrEl8TQuxHkCvIRhD-Q-eonQa", "506604397_3076476019171861_8624032079217220406_n.jpg"),
        ("1rSVTTsOlMzobRYSl3k0Zc4wGx2cm6JUN", "506877425_3076475799171883_5793823790433690140_n.jpg"),
    ],
    "SAFARI Brass 34 cm high": [
        ("1hZOUDf1f3krHb6eiHz7VTuBXGl1w0Cp5", "489771748_3004980549654742_7285247805281476545_n.jpg"),
        ("12BWI0Fg1lfS_ZURm3V2dILorr5jm7p2P", "489845564_3004980259654771_1210448441163506520_n.jpg"),
        ("1J3yYrBTSXLgxR3sGbvu_nOj5sWV3z07e", "490038235_3004980696321394_5264152685656524976_n.jpg"),
        ("1E96SI3FqTwn7nesf0gVDAkA4_EDGXDba", "490100249_3004980616321402_3056990530806174372_n.jpg"),
        ("1TEWXt6iiNeJ2CFk8LiXMNjdgDNBPUF3C", "490182025_3004980692988061_8660826790243118617_n.jpg"),
        ("1OXQjMkp-7skGPeeMt2pLaFrgQ7a6s8QT", "490268843_3004980519654745_5713838651178313937_n.jpg"),
        ("1KHH190ZFQE5iurgQaNO6IHB3ZBz2gZTY", "490342681_3004980516321412_1100509494883394341_n.jpg"),
        ("1QrRg1-z4iWFnW_mHvjyM4Sh7-zsIVyu_", "490377781_3004980659654731_71666684525306729_n.jpg"),
        ("1mdHQ7xMVvnnnnIqUuFQi7tV-HELIhXkT", "490387266_3004980536321410_7528503121494816899_n.jpg"),
    ],
    "Ship of Fools": [
        ("1nuInibbwzKfxIXRIw1El7y9zuWUbjETa", "498162071_3045477428938387_5668619786984119389_n.jpg"),
        ("1lDfBpt9jm_nJDZLTRZadKHWZjvTHtCnp", "498176860_3045477785605018_8597668798662127600_n.jpg"),
        ("1lxk5EZrC__ichgY1Hn9S6eVrMVdhdR3X", "498211075_3045477775605019_3343726592773764900_n.jpg"),
        ("1c5bUcKLtT3V5hPmYm7gc6ApBUNSgpaNI", "498679255_3045477438938386_7613995894634172699_n.jpg"),
        ("1FgLmE3LD_bmWjcybwixO_L9Qu_pWVdqd", "498932185_3045477458938384_7592660699466586271_n.jpg"),
        ("1GK23CPbuecaLgxUHU41lYr47NAkzBae0", "499043517_3045477442271719_375397023339516164_n.jpg"),
        ("1h07Jgs-ie3iuCNARz4wUATC6zBkQ0wXQ", "499160930_3045477425605054_6339533135828007446_n.jpg"),
        ("1zEe1-uiSiL4Pp2VqlcQ7B2HPmCMKAZZk", "499401252_3045477772271686_7234999272940123746_n.jpg"),
        ("1whlEy91KhflYLtd1IdaF0fUb6fBDu2Kz", "499549564_3045477742271689_6027213721335590778_n.jpg"),
        ("1ciHwAL8xpBBh9QcLkp2PKS5Kgad99X1G", "499695842_3045477758938354_513451530541380997_n.jpg"),
        ("1xj3P-AW5XMKjaiG-RVwVJ38kRZrGSJ67", "499761299_3045477558938374_2881334629157235379_n.jpg"),
    ],
    "Tap water feature": [
        ("1-W0KQpwOv1h0zKhOaoF0oWhWNbEy0UWC", "506039256_3077371379082325_8476065269552102187_n.jpg"),
        ("1ULQI-VAc9DQrgme9aw-f3probaskg9QR", "506532632_3077371489082314_2872393803880857798_n.jpg"),
        ("103k7126Cb52o6AL4KmPytiZrVXuQSCGH", "506716230_3077371345748995_5008209581546689468_n.jpg"),
        ("17h6pzg4ekiJllSA9IxfSBsAefOy1IBKs", "506741052_3077371402415656_5960116237349461812_n.jpg"),
        ("18HXbEcK6S_jSjMv-L6h8iRPUynLQtG2v", "506912978_3077371355748994_4881347619813810253_n.jpg"),
        ("1aIxxK0nmu-5reZnAAUjba5l3EG7ZuKCD", "506938869_3077371512415645_2284605037371865381_n.jpg"),
    ],
    "TAPS": [
        ("1lyKsKr39639RlHZME7g2BeWkCA3uHu-c", "487305907_2995064813979649_3923465497203496379_n.jpg"),
        ("1E-J0t0HXovQKjOVVYi-fXcety_SEBsE_", "487357492_2995064733979657_844954045201614912_n.jpg"),
        ("1A1gXDLBBbQXwEbotf-qqPjpMOy9u_bV-", "487755793_2995064827312981_5544286262922589152_n.jpg"),
        ("12x_hhPmIZ99on2ZkiWrLFx8TYgMKfgIa", "487956914_2995064500646347_6784723111476936008_n.jpg"),
        ("1vKv_SPdi7RDxxKOOOZuingIJhdk2LyRE", "488001212_2995064833979647_1825759066856845476_n.jpg"),
        ("1v6ZYLZyxbMIt3_q6Lk1IugGq-HQ_Ys0f", "488236580_2995064730646324_412801417125765178_n.jpg"),
        ("1iZ0LJbszbLgfJcP4xP8GkT32km5YA0M1", "488543822_2995064527313011_1826166537160808493_n.jpg"),
    ],
    "TEACHER": [
        ("1LC5h9i2zUJJwRoG4qlt6hiaAM15G-6Jb", "506533137_3077654632387333_2742251296969673178_n.jpg"),
        ("12sHQk2cNYke3mpp64NilqIvdx_nXG8T6", "506604017_3077654739053989_238719757368253294_n.jpg"),
        ("1mTwc7pm2QAT5g7AqSlyfjf-UcLyR4yML", "506635930_3077654669053996_3627057002442933639_n.jpg"),
        ("1FjY4pvzuWtdtzFXCdtSpSJb_cMutxoZb", "506642675_3077654742387322_4556452880191068856_n.jpg"),
        ("1iLaxxoNJE1i5ObWQ9xOpVM1fBMVp0-Ny", "507304782_3077654659053997_5935044257771180865_n.jpg"),
        ("1JZlsqGDArzOHVctiNedpP7av5wWKUbBJ", "507893260_3077654642387332_7105323291616930886_n.jpg"),
    ],
    "VULTURINE": [
        ("1-2Y8vQyMVMzVXy7i5uIUdpDQD7rcnOrb", "515017948_3100087836810679_2552456095243484087_n.jpg"),
        ("1282jv56_QAecWggDNPX6-HeUVqZmnu5L", "515262900_3100086400144156_3332218133305445318_n.jpg"),
        ("18kvb8iZGIbdQyGzNHMqLrlKQ3iDMzZtc", "515407931_3100084676810995_2664817409048002833_n.jpg"),
        ("1O-TrCnjjq_nWI1K-HGvzgGQn9Y1rNVEo", "515446516_3100088760143920_3982765784470936123_n.jpg"),
        ("1fxhjImXUD7e_LANrB-kc4URtmUxYuc4X", "516385500_3100085856810877_863548699208846462_n.jpg"),
        ("1KXr9LBKhkH-EktXuf4OXd9JlFhO9nwVj", "516420004_3100088806810582_5413297168900031321_n.jpg"),
        ("1A5iPYISvnHpghZKkTVTqBiBXhOLvfVpB", "516747591_3100086740144122_2947450786123043403_n.jpg"),
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
