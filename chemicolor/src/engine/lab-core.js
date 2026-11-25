// ================= 合成ラボ：共通の部品 =================
const ITEM = Object.fromEntries([...MATS, ...PROD].map(x => [x.k, x]));

const sideHTML = o => Object.entries(o).map(([k, n]) => `${n > 1 ? `<b style="color:var(--pink)">${n}</b>` : ""}${ITEM[k].fm}`).join(" ＋ ");
const eqHTML = r => `${sideHTML(r.inp)} → ${sideHTML(r.out)}`;
const recCat = r => { const o = Object.keys(r.out).map(k => ITEM[k]); return (o.find(x => !x.mat) || o[0]).cat; };

// --- ガチャ設定（たくさん引けるように）
const RATE = {N:.70, R:.22, SR:.08}, GACHA_COST = 100, PER_PULL = 5;
function pull(forceR) {
  const x = Math.random(), r = forceR || (x < RATE.SR ? "SR" : x < RATE.SR + RATE.R ? "R" : "N");
  const pool = MATS.filter(s => s.r === r); return pool[Math.random() * pool.length | 0];
}
function ensureInv(p) {
  if (!p.inv) { p.inv = {...STARTER}; p.made = {}; p.recipes = {}; p.coins = (p.coins || 0) + 300; }
}
function itemCard(k, n, extra = "") {
  const it = ITEM[k];
  return `<div class="st ${it.r || "P"}" ${extra}>${it.r ? `<span class="rr">${it.r}</span>` : it.cat !== LAB_TABS[0] && it.cat !== "素材" ? `<span class="rr" style="color:var(--mint)">${it.cat}</span>` : ""}${n != null ? `<span class="cnt">×${n}</span>` : ""}${drop(it.c, 16)}<div class="f">${it.fm}</div>${it.nm.length > 7 ? it.nm.slice(0, 7) + "…" : it.nm}</div>`;
}
function detailHTML(k) {
  const it = ITEM[k];
  return `<div class="det">
    <div class="det-h">${drop(it.c, 26)}<div><div class="det-f">${it.fm}</div><b>${it.nm}</b></div></div>
    <div class="tags"><span>${it.cat}</span><span>${it.st}</span><span style="background:${HEX[it.c] ? pastel(it.c) : "#eef3fb"}">${it.c}</span></div>
    <ul>${it.info.map(t => `<li>${t}</li>`).join("")}</ul></div>`;
}
function showDetail(k) {
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="box">${detailHTML(k)}<button class="btn sub" id="dOk">とじる</button></div>`;
  document.body.appendChild(m); m.querySelector("#dOk").onclick = () => m.remove();
}
function dropMats(r) {
  const p = P(); ensureInv(p); const n = {S:8, A:5, B:3}[r], got = [];
  for (let i = 0; i < n; i++) { const m = pull(); p.inv[m.k] = (p.inv[m.k] || 0) + 1; got.push(m); }
  return got;
}


