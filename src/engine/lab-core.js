// ================= 合成ラボ：共通の部品（総合版：分野ごとに切り替え） =================
// FIELDS（無機・有機・高分子）は build.py が作る。それぞれ CH・MATS・PROD・RECIPES などをもつ。
// setField() で今の分野の表を CH・MATS・PROD・RECIPES・ITEM などにセットする。
let FIELD, MATS, PROD, RECIPES, LAB_TABS, STARTER, LAB_BADGES, ITEM = {}, POOL = [];
const FIELD_OF = Object.fromEntries(FIELDS.map(f => [f.id, f]));
const ALL_ITEM = {};
FIELDS.forEach(f => [...f.MATS, ...f.PROD].forEach(x => { if (!ALL_ITEM[x.k]) ALL_ITEM[x.k] = x; }));
FIELDS.forEach(f => {
  f.hasLab = f.RECIPES.length > 0;
  // 合成ラボのない分野（高分子）は、ラボのある分野の素材をドロップする
  if (!f.hasLab) f.POOL_FROM = FIELDS.filter(g => g.RECIPES.length).map(g => g.id);
  // ガチャに出る素材：自分の分野の素材 ＋ POOL_FROM の分野の素材
  const own = new Set(f.MATS.map(m => m.k));
  f.pool = [...f.MATS, ...f.POOL_FROM.flatMap(id => FIELD_OF[id].MATS).filter(m => !own.has(m.k) && own.add(m.k))];
  f.matSet = new Set(f.pool.map(m => m.k));
  f.item = Object.fromEntries([...f.pool, ...f.PROD].map(x => [x.k, x]));
  f.used = new Set(f.RECIPES.flatMap(r => [...Object.keys(r.inp), ...Object.keys(r.out)]));
  f.used.forEach(k => { if (!f.item[k]) f.item[k] = ALL_ITEM[k]; });
});
function setField(id) {
  FIELD = FIELD_OF[id] || FIELDS[0];
  ({CH, METH, MATS, PROD, RECIPES, LAB_TABS, STARTER, LAB_BADGES} = FIELD);
  APP = {...FIELD.APP, saveKey: APP.saveKey};
  ITEM = FIELD.item; POOL = FIELD.pool;
}

const sideHTML = o => Object.entries(o).map(([k, n]) => `${n > 1 ? `<b style="color:var(--pink)">${n}</b>` : ""}${ITEM[k].fm}`).join(" ＋ ");
const eqHTML = r => `${sideHTML(r.inp)} → ${sideHTML(r.out)}`;
// レシピ帳のタブ：主な生成物の分類（素材しかできないレシピは、その素材の tab）
// 主な生成物：触媒を除き、レシピ帳のタブに出せるもの（分類がタブにある・tab がある）を先に
const mainItem = r => { const o = Object.keys(r.out).filter(k => !r.inp[k]).map(k => ITEM[k]), inTab = x => LAB_TABS.includes(x.cat) || x.tab;
  return o.find(inTab) || o.find(x => !x.mat) || o[0] || ITEM[Object.keys(r.out)[0]]; };
const recCat = r => { const it = mainItem(r); return LAB_TABS.includes(it.cat) ? it.cat : it.tab || LAB_TABS[0]; };

// --- ガチャ設定（たくさん引けるように）。素材は今の分野のもの（高分子は無機・有機の素材も出る）
const RATE = {N:.70, R:.22, SR:.08}, GACHA_COST = 50, PER_PULL = 5;
function pull(forceR, F = FIELD) {
  const x = Math.random(), r = forceR || (x < RATE.SR ? "SR" : x < RATE.SR + RATE.R ? "R" : "N");
  const pool = F.pool.filter(s => s.r === r); return pool.length ? pool[Math.random() * pool.length | 0] : F.pool[Math.random() * F.pool.length | 0];
}
function ensureInv(p, F = FIELD) {
  if (!p.inv) { p.inv = {}; p.made = {}; p.recipes = {}; p.coins = (p.coins || 0) + 300; p.started = {}; }
  p.started = p.started || {inorg:1};   // 分野を分ける前の記録は無機のスタートセットをもらい済み
  if (F && !p.started[F.id]) { p.started[F.id] = 1; Object.entries(F.STARTER).forEach(([k, n]) => p.inv[k] = (p.inv[k] || 0) + n); }
}
// info：ⓘ ボタンをつけて、名前を省略せずに出す（合成ラボ用）
function itemCard(k, n, extra = "", info = false) {
  const it = ITEM[k] || ALL_ITEM[k];
  const name = info ? it.nm.replace(/（触媒）/, "") : it.nm.length > 7 ? it.nm.slice(0, 7) + "…" : it.nm;
  return `<div class="st ${it.r || "P"}" ${extra}>${it.r ? `<span class="rr">${it.r}</span>` : it.cat !== LAB_TABS[0] && it.cat !== "素材" ? `<span class="rr" style="color:var(--mint)">${it.cat}</span>` : ""}${n != null ? `<span class="cnt">×${n}</span>` : ""}${info ? `<span class="inf">i</span>` : ""}${drop(it.c, 16)}<div class="f">${it.fm}</div><div class="nmx">${name}</div></div>`;
}
function detailHTML(k) {
  const it = ITEM[k] || ALL_ITEM[k];
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

// ================= コンプまでの目安（素材の配り方） =================
// 「全単元を GOAL_LAPS 周」または「毎日ログインで GOAL_DAYS 日」で、全分野のレシピがそろうように、
// 未発見のレシピに足りない素材（おたすけ素材）を、クリアごと・ログインごとに配る。
// 配る枚数はデータから自動で計算するので、レシピや単元を増やしても目安は変わらない。
// 実際のペースは tools/sim_collect.js で確かめられる。
const GOAL_LAPS = 4, GOAL_DAYS = 28;
// おたすけ素材：クリアでは配らない（遊ぶだけなら約1周でコンプ）。ログインだけでも 3〜5 週でそろうように、ログインで配る（tools/sim_collect.js で調整した値）
const HELP = {drop:0, login:.2};
// クリア1回のコイン（スコアとランクで決まる）。単元が増えたらここで調整する
const RUN_COIN = 4;
const runCoins = (pts, r) => Math.round(pts / RUN_COIN) + {S:150, A:80, B:30}[r];
const loginCoins = streak => 120 + Math.min(streak, 7) * 20;   // ログインボーナスのコイン（連続日数で増える）

// 未発見のレシピを順に作るとしたら、足りない素材は何か（中間体は作り方までさかのぼる）
function planNeed(F, inv0, found0) {
  const inv = {...inv0}, found = {...found0}, need = [];
  const prodBy = k => F.RECIPES.find(r => r.out[k] && !r.inp[k]);
  const lackOf = (k, n) => { for (let i = 0; i < n; i++) need.push(k); };
  const get = (k, n, d) => {
    const have = inv[k] || 0;
    if (have >= n) { inv[k] = have - n; return; }
    inv[k] = 0; let lack = n - have;
    const r = F.matSet.has(k) || d > 6 ? null : prodBy(k);
    if (!r) return lackOf(k, lack);
    while (lack > 0) { make(r, d + 1); const g = Math.min(lack, inv[k] || 0); inv[k] -= g; lack -= g; }
  };
  const make = (r, d) => {
    Object.entries(r.inp).forEach(([k, n]) => get(k, n, d));
    Object.entries(r.out).forEach(([k, n]) => inv[k] = (inv[k] || 0) + n); found[r.id] = 1;
  };
  F.RECIPES.forEach(r => { if (!found[r.id]) make(r, 0); });
  return need.filter(k => F.matSet.has(k));
}
const needNow = (p, F = FIELD) => planNeed(F, p.inv || {}, p.recipes || {});
const totalNeed = F => F._total ?? (F._total = planNeed(F, F.STARTER, {}).length);
const dropHelp = F => Math.ceil(totalNeed(F) / (F.CH.length * GOAL_LAPS) * HELP.drop);          // クリア1回あたり
const loginHelp = () => Math.ceil(LAB_FIELDS.reduce((a, f) => a + totalNeed(f), 0) / GOAL_DAYS * HELP.login); // ログイン1日あたり
const fieldDone = (p, F) => F.RECIPES.filter(r => p.recipes && p.recipes[r.id]).length;
const LAB_FIELDS = FIELDS.filter(f => f.hasLab);
// おたすけ素材を配る分野：ラボのない分野では、未発見のレシピがいちばん多く残っている分野へ
const helpField = (p, F) => F.hasLab ? F : [...LAB_FIELDS].sort((a, b) => needNow(p, b).length - needNow(p, a).length)[0];
function giveNeeded(p, F, n) {
  const got = needNow(p, F).slice(0, n);
  got.forEach(k => p.inv[k] = (p.inv[k] || 0) + 1);
  return got.map(k => F.item[k]);
}
// クリアの報酬：ランダム素材 ＋ おたすけ素材（未発見レシピに足りないもの）
function dropMats(r) {
  const p = P(); ensureInv(p); const n = {S:8, A:5, B:3}[r], got = [];
  for (let i = 0; i < n; i++) { const m = pull(); p.inv[m.k] = (p.inv[m.k] || 0) + 1; got.push(m); }
  const HF = helpField(p, FIELD), h = dropHelp(FIELD.hasLab ? FIELD : HF);
  const help = giveNeeded(p, HF, r === "B" ? Math.ceil(h / 2) : h);
  return {got, help};
}
