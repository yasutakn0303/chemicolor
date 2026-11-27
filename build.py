#!/usr/bin/env python3
"""ケミカラのビルド：src/ の部品を組み合わせて、1ファイルで動く HTML を dist/ に出力する。

  python3 build.py          … 全エディションをビルド（＋トップページ src/index.html を dist/ にコピー）

・基本版   = エンジン(base.html) ＋ 共通データ ＋ 無機の単元データ
・総合版   = エンジン ＋ 共通データ ＋ 分野（無機・有機・高分子）ごとの単元＆合成ラボ ＋ 報酬（ランキング・ガチャ・ラボ）
              分野はメニューのタブで切り替える。各分野のデータは別々の関数の中に入れるので、同じ名前の定数があってもぶつからない。
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"

# 総合版の分野：(id, タブの名前, 絵文字, クイズデータ, ラボデータ)
FIELDS = [
    ("inorg", "無機",   "🧪", "inorganic.js", "inorganic-lab.js"),
    ("org",   "有機",   "⚗️", "organic.js",   "organic-lab.js"),
    ("poly",  "高分子", "🧬", "polymer.js",   None),   # 高分子はクイズだけ（合成ラボなし）
]
SAVE_KEY = "chemicolor-rank-v1"   # 変えない（生徒の記録が消える）
# 合言葉を忘れたときに使う「先生用コード」のハッシュ（SHA-256。コードそのものはここに書かない）
#   変えるとき： python3 -c "import hashlib;print(hashlib.sha256(('chemicolor-teacher|'+'新しいコード').encode()).hexdigest())"
TEACHER_CODE_SHA256 = "f390e3d6bb1b409a2afa9eef9f670a141c64094c068030ae7edf4d17422a6c00"

EDITIONS = [
    # 出力ファイル名,     タイトル,                                種類
    ("inorganic.html",  "ケミカラ！無機の色クイズ",                 "basic"),
    ("chemicolor.html", "ケミカラ！総合版（無機・有機・高分子）",   "fields"),
]
# 以前の URL は総合版へ転送する（ブックマーク・Teams のリンク用）
REDIRECTS = [("inorganic-rank.html", "chemicolor.html"), ("organic.html", "chemicolor.html#org")]

def read(p): return (SRC / p).read_text(encoding="utf-8")

def must_replace(s, old, new, count=1):
    assert s.count(old) >= count, f"置換対象が見つかりません: {old[:60]}"
    return s.replace(old, new)

def fields_js():
    out = ["const FIELDS = [];"]
    for fid, name, em, quiz, lab in FIELDS:
        out.append(f"""FIELDS.push((() => {{
{read("data/" + quiz)}
{read("data/" + lab) if lab else "const MATS = [], PROD = [], RECIPES = [], LAB_TABS = [], STARTER = {}, LAB_BADGES = [];"}
return {{id:"{fid}", name:"{name}", em:"{em}", APP, CH, METH, MATS, PROD, RECIPES, LAB_TABS, STARTER, LAB_BADGES,
  POOL_FROM: typeof POOL_FROM === "undefined" ? [] : POOL_FROM}};
}})());""")
    out.append(f'let APP = {{...FIELDS[0].APP, saveKey:"{SAVE_KEY}"}}, CH = FIELDS[0].CH, METH = FIELDS[0].METH;')
    return "\n".join(out)

def build(out, title, kind):
    s = read("engine/base.html")
    s = s.replace("/*TITLE*/", title)
    # 構造式の部品は総合版だけで使う（基本版には入れない）
    s = must_replace(s, "/*COMMON*/", read("data/common.js") + "\n" + read("data/schedule.js") + "\n" + read("engine/playtime.js")
                     + ("" if kind == "basic" else "\n" + read("engine/struct.js")))
    if kind == "basic":
        s = must_replace(s, "/*DATA*/", read("data/inorganic.js"))
        s = s.replace("/*LAB*/", "")
    else:
        s = must_replace(s, "/*DATA*/", fields_js())
        s = must_replace(s, "/*LAB*/", read("engine/lab-core.js"))
        # スコア計算のフック
        s = must_replace(s, "const LIMIT = AUTO ? 3200 : 10500;", "const LIMIT = AUTO ? 3200 : 10500, t0 = performance.now();")
        s = must_replace(s, "const LIMIT = AUTO ? 3000 : 11500;", "const LIMIT = AUTO ? 3000 : 11500, t0 = performance.now();")
        s = must_replace(s, "got.push(ok); if (ok) { score++; combo++; } else combo = 0;",
                         "got.push(ok); if (ok) { score++; combo++; addPts(lv, LIMIT, t0); } else combo = 0;", 2)
        s = must_replace(s, "</style>", read("engine/rewards.css") + "</style>")
        s = must_replace(s, "\nmenu();\n</script>", "\n" + read("engine/rewards.js") + "\n" + read("engine/lab-fx.js") + "\nmenu();\n</script>")
        s = must_replace(s, '$("homeBtn").onclick = menu;', '$("homeBtn").onclick = () => menu();')
        s = must_replace(s, "/*TEACHER_HASH*/", TEACHER_CODE_SHA256)
    s = minify(s)
    DIST.mkdir(exist_ok=True)
    (DIST / out).write_text(s, encoding="utf-8")
    print(f"✔ dist/{out}  ({len(s)//1024} KB)")

def minify(s):
    """配信するファイルを軽くする（安全な範囲だけ）：行頭の字下げ・空行・行全体の // コメントを取りのぞく。
    行の中身は変えないので、プログラムの動きは変わらない。"""
    out = []
    for line in s.split("\n"):
        t = line.strip()
        if not t or t.startswith("// "):
            continue
        out.append(t)
    return "\n".join(out) + "\n"

def redirect(out, to):
    (DIST / out).write_text(f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ケミカラ！</title><meta http-equiv="refresh" content="0; url={to}">
<script>location.replace("{to}");</script></head>
<body style="font-family:sans-serif;text-align:center;padding:40px">ケミカラは総合版にまとまりました。<br><a href="{to}">こちらから開いてください</a></body></html>
""", encoding="utf-8")
    print(f"✔ dist/{out}  → {to}")

if __name__ == "__main__":
    for e in EDITIONS:
        build(*e)
    for r in REDIRECTS:
        redirect(*r)
    # トップページ（各エディションへのリンク集）はそのままコピー
    (DIST / "index.html").write_text(read("index.html"), encoding="utf-8")
    print("✔ dist/index.html")
