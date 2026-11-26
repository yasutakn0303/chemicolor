// ================= 構造式の描画（SVG） =================
// 教科書の書き方にそろえた構造式を、データから SVG で描く。
//   chainSVG：高分子の繰り返し単位・単量体（–[CH₂–CH(Cl)]ₙ– のように横に並べる）
//   sugarSVG：糖のハース式（六員環・五員環）。二糖はグリコシド結合でつなぐ
//   fischerSVG：鎖状構造（縦に並べる）
// 文字の下つき数字は「₂」のような Unicode の文字で書く。

const SV_FONT = `font-family="'Hiragino Sans','Zen Maru Gothic',sans-serif" font-weight="700"`;
const svText = (x, y, t, size = 15, anchor = "middle", extra = "") =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="${anchor}" ${SV_FONT} fill="#22314f" ${extra}>${t}</text>`;
const svLine = (x1, y1, x2, y2, w = 2) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#22314f" stroke-width="${w}" stroke-linecap="round"/>`;
// 文字の幅の見積もり（下つき文字は細い）
const svWidth = (t, size = 15) => [...t].reduce((a, c) => a + (/[₀-₉ₙ]/.test(c) ? .45 : /[A-Za-z0-9()=+\-]/.test(c) ? .7 : 1) * size, 0);
function svWrap(body, x0, y0, x1, y1, maxW = 320) {
  const w = x1 - x0, h = y1 - y0;
  return `<svg class="struct" viewBox="${x0.toFixed(0)} ${y0.toFixed(0)} ${w.toFixed(0)} ${h.toFixed(0)}" width="${Math.min(maxW, w * 1.75).toFixed(0)}" style="max-width:100%;height:auto">${body}</svg>`;
}
// ベンゼン環（中心 cx,cy・半径 r）。flat：左右に頂点（つながりは左右）／ pointy：上下に頂点
function svRing(cx, cy, r = 14, flat = true) {
  const a0 = flat ? 0 : -90, P = Array.from({length: 6}, (_, i) => [cx + r * Math.cos((a0 + i * 60) * Math.PI / 180), cy + r * Math.sin((a0 + i * 60) * Math.PI / 180)]);
  let s = P.map((p, i) => svLine(...p, ...P[(i + 1) % 6])).join("");
  // ケクレ構造の二重結合（内側の線を1つおきに）
  for (let i = 0; i < 6; i += 2) { const [a, b] = [P[i], P[(i + 1) % 6]], k = .72;
    s += svLine(cx + (a[0] - cx) * k, cy + (a[1] - cy) * k, cx + (b[0] - cx) * k, cy + (b[1] - cy) * k, 1.6); }
  return {s, P};
}

// ---------- 高分子・単量体（横に並べる） ----------
// nodes：文字列（原子団）または {t, up, dn, b, ring}
//   up/dn：上下の置換基（文字列 ／ "=O" で C=O ／ {ring:1} でフェニル基）
//   b：前の原子団との結合（"-" 単結合・"=" 二重結合・"≡" 三重結合）
//   ring:1：主鎖の中のベンゼン環（p 位でつながる）
//   ring:"o"：OH を上にもち、両どなり（o 位）でつながるベンゼン環（フェノール樹脂）
// opt.br：かっこ［ ］ₙ をつける（高分子）
function chainSVG(nodes, opt = {}) {
  const br = opt.br !== false, BL = 16, Y = 0;
  let x = br ? 22 : 4, body = "", minY = -18, maxY = 18, prevR = null;
  const bond = (x1, x2, b = "-") => {
    if (b === "=") return svLine(x1, Y - 3, x2, Y - 3) + svLine(x1, Y + 3, x2, Y + 3);
    if (b === "≡") return svLine(x1, Y - 5, x2, Y - 5) + svLine(x1, Y, x2, Y) + svLine(x1, Y + 5, x2, Y + 5);
    return svLine(x1, Y, x2, Y);
  };
  const sub = (cx, s, dir) => {   // dir：-1 上・+1 下
    const y1 = Y + dir * 10, y2 = Y + dir * 24;
    if (s === "=O") { body += svLine(cx - 3, y1, cx - 3, y2) + svLine(cx + 3, y1, cx + 3, y2) + svText(cx, Y + dir * 31 + 5, "O"); }
    else if (s && s.ring) { body += svLine(cx, y1, cx, y2); const R = svRing(cx, y2 + dir * 14, 14, false); body += R.s; }
    else { body += svLine(cx, y1, cx, y2) + svText(cx, Y + dir * 31 + 5, s); }
    if (dir < 0) minY = Math.min(minY, s && s.ring ? -60 : -46); else maxY = Math.max(maxY, s && s.ring ? 62 : 40);
  };
  if (br) { body += svLine(4, Y, 22, Y); }
  nodes.forEach((n, i) => {
    n = typeof n === "string" ? {t: n} : n;
    if (i > 0) { body += bond(x, x + BL, n.b); x += BL; }
    else if (br) { /* 左のかっこのあとはそのまま */ }
    if (n.ring === 1) {           // 主鎖の中のベンゼン環（左右の頂点でつながる）
      const R = svRing(x + 14, Y, 14, true); body += R.s; x += 28;
    } else if (n.ring === "o") {  // フェノール樹脂：OH が上、o 位でつながる
      const cx = x + 12, cy = Y + 7, R = svRing(cx, cy, 14, false);   // 上の頂点が OH
      body += R.s + svLine(cx, cy - 14, cx, cy - 26) + svText(cx, cy - 31, "OH");
      body += svLine(x, Y, R.P[5][0], R.P[5][1]) ; // 左上の頂点へ
      minY = Math.min(minY, -40); maxY = Math.max(maxY, 26);
      x = R.P[1][0]; // 右上の頂点から右へ
    } else {
      const w = svWidth(n.t), sw = s => !s ? 0 : s.ring ? 30 : s === "=O" ? 12 : svWidth(s);
      const pad = Math.max(0, (Math.max(sw(n.up), sw(n.dn)) - w) / 2);
      x += pad; body += svText(x + w / 2, Y + 5.5, n.t);
      if (n.up) sub(x + w / 2, n.up, -1);
      if (n.dn) sub(x + w / 2, n.dn, 1);
      x += w + pad;
    }
  });
  if (br) {
    body += svLine(x, Y, x + 18, Y);
    const bh = Math.max(-minY, maxY) - 6;
    body = `<path d="M 16 ${-bh} h -5 v ${2 * bh} h 5" fill="none" stroke="#22314f" stroke-width="2"/>` + body
      + `<path d="M ${x + 8} ${-bh} h 5 v ${2 * bh} h -5" fill="none" stroke="#22314f" stroke-width="2"/>` + svText(x + 20, bh + 4, "n", 14, "start");
    x += 26; maxY = Math.max(maxY, bh + 8);
  }
  return svWrap(body, -2, minY - 4, x + 4, maxY + 6);
}

// ---------- 糖のハース式 ----------
// 環の原子の位置（x：左右、z：手前が＋）。六員環は環の O が右奥、五員環は O が奥のまん中。
const HW = {
  6: {O: [.42, -.6], C1: [1, 0], C2: [.62, .6], C3: [-.62, .6], C4: [-1, 0], C5: [-.42, -.6], order: ["O", "C1", "C2", "C3", "C4", "C5"]},
  5: {O: [0, -.6], C2: [.85, -.08], C3: [.56, .6], C4: [-.56, .6], C5: [-.85, -.08], order: ["O", "C2", "C3", "C4", "C5"]},
};
// 単糖の置換基（標準の向き：上 up・下 dn）。D 型：最後の CH₂OH が上。β 型は 1位（ケトースは2位）の OH が CH₂OH と同じ側（上）
const SUGAR = {
  "α-glc": {ring: 6, C1: ["H", "OH"], C2: ["H", "OH"], C3: ["OH", "H"], C4: ["H", "OH"], C5: ["CH₂OH", "H"]},
  "β-glc": {ring: 6, C1: ["OH", "H"], C2: ["H", "OH"], C3: ["OH", "H"], C4: ["H", "OH"], C5: ["CH₂OH", "H"]},
  "α-gal": {ring: 6, C1: ["H", "OH"], C2: ["H", "OH"], C3: ["OH", "H"], C4: ["OH", "H"], C5: ["CH₂OH", "H"]},
  "β-gal": {ring: 6, C1: ["OH", "H"], C2: ["H", "OH"], C3: ["OH", "H"], C4: ["OH", "H"], C5: ["CH₂OH", "H"]},
  "β-fru": {ring: 5, C2: ["OH", "CH₂OH"], C3: ["OH", "H"], C4: ["H", "OH"], C5: ["CH₂OH", "H"]},
};
// 3次元の回転（180°）。x：上下と前後が入れかわる／y：左右と前後／z：左右と上下（紙の面の中で半回転）
const ROT = {x: ([x, y, z]) => [x, -y, -z], y: ([x, y, z]) => [-x, y, -z], z: ([x, y, z]) => [-x, -y, z]};
// rings：[{s:"α-glc", rot:"x"|"y"|"z", dx}]、links：[[環の番号, "C1", "dn"], [環の番号, "C4", "dn"]]（グリコシド結合の両はし）
function sugarSVG(rings, links = [], opt = {}) {
  const S = opt.S || 44, oy = 0, hide = new Set(links.flat().length ? links.map(l => l.map(e => e.join("/"))).flat() : []);
  let body = "", top = [], minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  const P = (pt, dx) => ({x: dx + pt[0] * S, y: oy - pt[1] * S + pt[2] * S * .75});
  const ends = {};
  rings.forEach((R, ri) => {
    const def = SUGAR[R.s], G = HW[def.ring], tf = p => R.rot ? ROT[R.rot](p) : p, dx = R.dx || 0;
    const pos = {}; G.order.forEach(a => pos[a] = P(tf([G[a][0], 0, G[a][1]]), dx));
    const zOf = a => tf([G[a][0], 0, G[a][1]])[2];
    // 環の結合（手前を太く）
    G.order.forEach((a, i) => { const b = G.order[(i + 1) % G.order.length], zf = (zOf(a) + zOf(b)) / 2;
      const p1 = pos[a], p2 = pos[b], sh = .16;   // O のまわりは文字の分だけ短く
      const q1 = a === "O" ? {x: p1.x + (p2.x - p1.x) * sh * 1.6, y: p1.y + (p2.y - p1.y) * sh * 1.6} : p1;
      const q2 = b === "O" ? {x: p2.x + (p1.x - p2.x) * sh * 1.6, y: p2.y + (p1.y - p2.y) * sh * 1.6} : p2;
      body += svLine(q1.x, q1.y, q2.x, q2.y, zf > .25 ? 5 : 2); });
    top.push(svText(pos.O.x, pos.O.y + 5, "O", 14));
    // 置換基
    G.order.filter(a => a !== "O").forEach(a => ["up", "dn"].forEach((d, k) => {
      const lab = def[a][k], key = `${ri}/${a}/${d}`, z = tf([G[a][0], 0, G[a][1]])[2], vy = tf([0, k ? -1 : 1, 0])[1];
      const inner = (z < -.2 && vy < 0) || (z > .2 && vy > 0);     // 環の内側に向く置換基は短く
      const L = inner ? .4 : .62, v = tf([G[a][0], k ? -L : L, G[a][1]]), e = P(v, dx), s = pos[a];
      const cx = Object.values(pos).reduce((t, p) => t + p.x, 0) / G.order.length;
      const tx = e.x + (inner ? Math.sign(cx - e.x) * 13 : 0);   // 内側の文字は環の中心寄りに（線は縦のまま）
      ends[key] = {s, e};
      if (hide.has(key) || lab === "H") return;   // H は省略（OH・CH₂OH だけ書く簡略形）
      const dirY = Math.sign(e.y - s.y) || 1, short = lab === "H" ? 3 : 8;
      body += svLine(s.x, s.y, e.x, e.y - dirY * short, 1.6);
      const ty = e.y + (dirY > 0 ? 10 : -2), sz = lab === "H" ? 11 : 12.5;
      top.push(svText(tx, ty, lab, sz));
      minX = Math.min(minX, e.x - svWidth(lab, sz) / 2); maxX = Math.max(maxX, e.x + svWidth(lab, sz) / 2);
      minY = Math.min(minY, ty - 12); maxY = Math.max(maxY, ty + 4);
    }));
    Object.values(pos).forEach(p => { minX = Math.min(minX, p.x - 10); maxX = Math.max(maxX, p.x + 10); minY = Math.min(minY, p.y - 10); maxY = Math.max(maxY, p.y + 10); });
  });
  // グリコシド結合：両方の置換基の先のまん中に O
  links.forEach(([a, b]) => {
    const A = ends[a.join("/")], B = ends[b.join("/")];
    const o = {x: (A.e.x + B.e.x) / 2, y: (A.e.y + B.e.y) / 2 + (Math.sign(A.e.y - A.s.y) || 1) * 6};
    body += svLine(A.s.x, A.s.y, o.x - 6, o.y) + svLine(o.x + 6, o.y, B.s.x, B.s.y);
    top.push(svText(o.x, o.y + 5, "O", 14));
    minY = Math.min(minY, o.y - 14); maxY = Math.max(maxY, o.y + 14);
  });
  return svWrap(body + top.join(""), minX - 6, minY - 4, maxX + 6, maxY + 4, opt.maxW || 330);
}
// 単糖1つ／二糖のよく使う形
const HAWORTH = {
  "α-グルコース": () => sugarSVG([{s: "α-glc"}]),
  "β-グルコース": () => sugarSVG([{s: "β-glc"}]),
  "α-ガラクトース": () => sugarSVG([{s: "α-gal"}]),
  "β-ガラクトース": () => sugarSVG([{s: "β-gal"}]),
  "β-フルクトース": () => sugarSVG([{s: "β-fru"}]),
  // マルトース：α-グルコースの1位と、グルコースの4位（α-1,4）
  "マルトース": () => sugarSVG([{s: "α-glc"}, {s: "α-glc", dx: 150}], [[[0, "C1", "dn"], [1, "C4", "dn"]]]),
  // セロビオース：β-1,4。右のグルコースは上下を裏返して（x 回転）描く
  "セロビオース": () => sugarSVG([{s: "β-glc"}, {s: "β-glc", rot: "x", dx: 150}], [[[0, "C1", "up"], [1, "C4", "dn"]]]),
  // ラクトース：β-ガラクトースの1位とグルコースの4位（β-1,4）
  "ラクトース": () => sugarSVG([{s: "β-gal"}, {s: "β-glc", rot: "x", dx: 150}], [[[0, "C1", "up"], [1, "C4", "dn"]]]),
  // スクロース：α-グルコースの1位と β-フルクトースの2位。フルクトースは紙の面で半回転（z 回転）して左側に2位をおく
  "スクロース": () => sugarSVG([{s: "α-glc"}, {s: "β-fru", rot: "z", dx: 150}], [[[0, "C1", "dn"], [1, "C2", "up"]]]),
};

// ---------- 鎖状構造（縦に並べる） ----------
// rows：[左, 中央, 右]。中央どうしを縦の結合でつなぐ。中央の "C=O" は右に =O を描く
function fischerSVG(rows) {
  const H = 30; let body = "";
  rows.forEach(([l, c, r], i) => {
    const y = i * H;
    if (i > 0) body += svLine(0, y - H + 10, 0, y - 10);
    if (c === "C=O") { body += svText(0, y + 5, "C") + svLine(8, y - 3, 26, y - 3) + svLine(8, y + 3, 26, y + 3) + svText(34, y + 5, "O"); }
    else body += svText(0, y + 5, c);
    if (l) body += svLine(-8, y, -22, y) + svText(-24, y + 5, l, 14, "end");
    if (r) body += svLine(8, y, 22, y) + svText(24, y + 5, r, 14, "start");
  });
  return svWrap(body, -62, -16, 62, rows.length * H - 10, 160);
}
const CHAINFORM = {
  "グルコース": () => fischerSVG([["", "CHO", ""], ["H", "C", "OH"], ["HO", "C", "H"], ["H", "C", "OH"], ["H", "C", "OH"], ["", "CH₂OH", ""]]),
  "フルクトース": () => fischerSVG([["", "CH₂OH", ""], ["", "C=O", ""], ["HO", "C", "H"], ["H", "C", "OH"], ["H", "C", "OH"], ["", "CH₂OH", ""]]),
  "ガラクトース": () => fischerSVG([["", "CHO", ""], ["H", "C", "OH"], ["HO", "C", "H"], ["HO", "C", "H"], ["H", "C", "OH"], ["", "CH₂OH", ""]]),
};

// ---------- 高分子の繰り返し単位・単量体 ----------
const PH = {ring: 1};
const POLY = {
  "ポリエチレン": [["CH₂", "CH₂"]],
  "ポリプロピレン": [["CH₂", {t: "CH", dn: "CH₃"}]],
  "ポリ塩化ビニル": [["CH₂", {t: "CH", dn: "Cl"}]],
  "ポリスチレン": [["CH₂", {t: "CH", dn: PH}]],
  "ポリ酢酸ビニル": [["CH₂", {t: "CH", dn: "OCOCH₃"}]],
  "ポリビニルアルコール": [["CH₂", {t: "CH", dn: "OH"}]],
  "ポリアクリロニトリル": [["CH₂", {t: "CH", dn: "CN"}]],
  "ポリメタクリル酸メチル": [["CH₂", {t: "C", up: "CH₃", dn: "COOCH₃"}]],
  "ポリテトラフルオロエチレン": [["CF₂", "CF₂"]],
  "ポリ塩化ビニリデン": [["CH₂", {t: "C", up: "Cl", dn: "Cl"}]],
  "ポリアクリル酸ナトリウム": [["CH₂", {t: "CH", dn: "COONa"}]],
  "ブタジエンゴム": [["CH₂", "CH", {t: "CH", b: "="}, "CH₂"]],
  "天然ゴム（ポリイソプレン）": [["CH₂", {t: "C", up: "CH₃"}, {t: "CH", b: "="}, "CH₂"]],
  "クロロプレンゴム": [["CH₂", {t: "C", up: "Cl"}, {t: "CH", b: "="}, "CH₂"]],
  "スチレン-ブタジエンゴム": [["CH₂", "CH", {t: "CH", b: "="}, "CH₂", "CH₂", {t: "CH", dn: PH}]],
  "ナイロン66": [[{t: "N", up: "H"}, "(CH₂)₆", {t: "N", up: "H"}, {t: "C", up: "=O"}, "(CH₂)₄", {t: "C", up: "=O"}]],
  "ナイロン6": [[{t: "N", up: "H"}, "(CH₂)₅", {t: "C", up: "=O"}]],
  "ポリエチレンテレフタラート": [[{t: "C", up: "=O"}, PH, {t: "C", up: "=O"}, "O", "(CH₂)₂", "O"]],
  "ポリ乳酸": [["O", {t: "CH", dn: "CH₃"}, {t: "C", up: "=O"}]],
  "アラミド（ポリ-p-フェニレンテレフタルアミド）": [[{t: "N", up: "H"}, PH, {t: "N", up: "H"}, {t: "C", up: "=O"}, PH, {t: "C", up: "=O"}]],
  "フェノール樹脂": [[{ring: "o"}, "CH₂"]],
};
const MONO_S = {
  "エチレン": [["CH₂", {t: "CH₂", b: "="}]],
  "プロペン": [["CH₂", {t: "CH", b: "=", dn: "CH₃"}]],
  "塩化ビニル": [["CH₂", {t: "CH", b: "=", dn: "Cl"}]],
  "スチレン": [["CH₂", {t: "CH", b: "=", dn: PH}]],
  "酢酸ビニル": [["CH₂", {t: "CH", b: "=", dn: "OCOCH₃"}]],
  "アクリロニトリル": [["CH₂", {t: "CH", b: "=", dn: "CN"}]],
  "メタクリル酸メチル": [["CH₂", {t: "C", b: "=", up: "CH₃", dn: "COOCH₃"}]],
  "1,3-ブタジエン": [["CH₂", {t: "CH", b: "="}, "CH", {t: "CH₂", b: "="}]],
  "イソプレン": [["CH₂", {t: "C", b: "=", up: "CH₃"}, "CH", {t: "CH₂", b: "="}]],
  "クロロプレン": [["CH₂", {t: "C", b: "=", up: "Cl"}, "CH", {t: "CH₂", b: "="}]],
  "テレフタル酸": [["HOOC", PH, "COOH"]],
  "エチレングリコール": [["HO", "CH₂", "CH₂", "OH"]],
  "アジピン酸": [["HOOC", "(CH₂)₄", "COOH"]],
  "ヘキサメチレンジアミン": [["H₂N", "(CH₂)₆", "NH₂"]],
  "乳酸": [[{t: "CH₃"}, {t: "CH", dn: "OH"}, "COOH"]],
};
const polySVG = name => chainSVG(...POLY[name]);
const monoSVG = name => chainSVG(MONO_S[name][0], {br: false});
