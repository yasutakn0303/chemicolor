#!/usr/bin/env python3
"""ケミカラのビルド：src/ の部品を組み合わせて、1ファイルで動く HTML を dist/ に出力する。

  python3 build.py          … 全エディションをビルド（＋トップページ src/index.html を dist/ にコピー）
各エディション = エンジン(base.html) ＋ 共通データ ＋ 単元データ ＋（ごほうび版なら）合成ラボ＆報酬
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"

EDITIONS = [
    # 出力ファイル名,          タイトル,                          クイズデータ,          ラボデータ（None=ごほうびなし）
    ("inorganic.html",        "ケミカラ！無機の色クイズ",             "inorganic.js",       None),
    ("inorganic-rank.html",   "ケミカラ！ランキング＆ごほうび版",      "inorganic.js",       "inorganic-lab.js"),
    ("organic.html",          "ケミカラ！有機版",                    "organic.js",         "organic-lab.js"),
]

def read(p): return (SRC / p).read_text(encoding="utf-8")

def must_replace(s, old, new, count=1):
    assert s.count(old) >= count, f"置換対象が見つかりません: {old[:60]}"
    return s.replace(old, new)

def build(out, title, data, lab):
    s = read("engine/base.html")
    s = s.replace("/*TITLE*/", title)
    s = must_replace(s, "/*COMMON*/", read("data/common.js"))
    s = must_replace(s, "/*DATA*/", read("data/" + data))
    if lab:
        s = must_replace(s, "/*LAB*/", read("data/" + lab) + "\n" + read("engine/lab-core.js"))
        # スコア計算のフック
        s = must_replace(s, "const LIMIT = AUTO ? 3200 : 8000;", "const LIMIT = AUTO ? 3200 : 8000, t0 = performance.now();")
        s = must_replace(s, "const LIMIT = AUTO ? 3000 : 9000;", "const LIMIT = AUTO ? 3000 : 9000, t0 = performance.now();")
        s = must_replace(s, "got.push(ok); if (ok) { score++; combo++; } else combo = 0;",
                         "got.push(ok); if (ok) { score++; combo++; addPts(lv, LIMIT, t0); } else combo = 0;", 2)
        s = must_replace(s, "</style>", read("engine/rewards.css") + "</style>")
        s = must_replace(s, "\nmenu();\n</script>", "\n" + read("engine/rewards.js") + "\nmenu();\n</script>")
        s = must_replace(s, '$("homeBtn").onclick = menu;', '$("homeBtn").onclick = () => menu();')
    else:
        s = s.replace("/*LAB*/", "")
    DIST.mkdir(exist_ok=True)
    (DIST / out).write_text(s, encoding="utf-8")
    print(f"✔ dist/{out}  ({len(s)//1024} KB)")

if __name__ == "__main__":
    for e in EDITIONS:
        if (SRC / "data" / e[2]).exists():
            build(*e)
    # トップページ（各エディションへのリンク集）はそのままコピー
    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(read("index.html"), encoding="utf-8")
    print("✔ dist/index.html")
