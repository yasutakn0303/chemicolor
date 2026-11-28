#!/usr/bin/env node
// コンプまでのペースのシミュレーション（総合版の素材の配り方が目標どおりか確かめる）
//   使い方: node tools/sim_collect.js
// 3つの遊び方で、全分野の全レシピを発見するまでを 200 回ずつ試して平均をとる。
//   ① 周回だけ   … 全分野の全単元を順に遊ぶ（ログインボーナスなし）→ 何周でコンプ？
//   ② ログインだけ … 毎日ログインボーナスだけ（クイズは遊ばない）→ 何日でコンプ？
//   ③ 毎日1回    … 毎日ログインして、どれか1単元を1回遊ぶ → 何日でコンプ？
// クイズの結果は S:A:B ＝ 3:5:2、1回のスコアは 1800 点と仮定。コインはすべてガチャに使い、作れるものはすぐ作る。
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "src");
const read = p => fs.readFileSync(path.join(SRC, p), "utf8");
const FIELDS_SRC = [["inorg", "inorganic", 1], ["org", "organic", 1], ["poly", "polymer", 0]];   // 3つ目：合成ラボがあるか

// build.py と同じ形で分野のデータを組み立てる（画面用の関数はダミー）
const code = `
const drop = () => "", illust = () => "", molecules = () => "", $ = () => null;
${read("data/common.js")}
${read("engine/struct.js")}
const FIELDS = [];
${FIELDS_SRC.map(([id, f, lab]) => `FIELDS.push((() => {\n${read(`data/${f}.js`)}\n${lab ? read(`data/${f}-lab.js`) : "const MATS = [], PROD = [], RECIPES = [], LAB_TABS = [], STARTER = {}, LAB_BADGES = [];"}
return {id:"${id}", name:"${id}", APP, CH, METH, MATS, PROD, RECIPES, LAB_TABS, STARTER, LAB_BADGES, POOL_FROM: typeof POOL_FROM === "undefined" ? [] : POOL_FROM};})());`).join("\n")}
let APP = {...FIELDS[0].APP, saveKey:"x"}, CH, METH;
${read("engine/lab-core.js")}
return {FIELDS, planNeed, needNow, totalNeed, dropHelp, loginHelp, pull, ensureInv, giveNeeded, setField, GACHA_COST, PER_PULL, GOAL_LAPS, GOAL_DAYS, loginCoins, runCoins, helpField, LAB_FIELDS};`;
const L = new Function(code)();
const {FIELDS} = L;

// 実際に作れるか試し、作れたら在庫を減らしてレシピを発見済みにする（中間体も作る）
function tryMake(F, p, r) {
  const inv = {...p.inv}, found = {...p.recipes}, made = [];
  const prodBy = k => F.RECIPES.find(x => x.out[k] && !x.inp[k]);
  let ok = true;
  const get = (k, n, d) => {
    while ((inv[k] || 0) < n) { const q = F.matSet.has(k) || d > 6 ? null : prodBy(k); if (!q) { ok = false; return; } make(q, d + 1); if (!ok) return; }
    inv[k] -= n;
  };
  const make = (q, d) => { for (const [k, n] of Object.entries(q.inp)) { get(k, n, d); if (!ok) return; }
    for (const [k, n] of Object.entries(q.out)) inv[k] = (inv[k] || 0) + n; found[q.id] = 1; made.push(q); };
  make(r, 0);
  if (ok) { p.inv = inv; p.recipes = found; }
  return ok;
}
function craftAll(p) {
  for (const F of FIELDS) { if (!p.started[F.id]) continue;
    let prog = true;
    while (prog) { prog = false; for (const r of F.RECIPES) if (!p.recipes[r.id] && tryMake(F, p, r)) prog = true; }
  }
}
const done = (p, F) => F.RECIPES.every(r => p.recipes[r.id]);
const allDone = p => FIELDS.every(F => done(p, F));
const remain = (p, F) => L.needNow(p, F).length;
function gacha(p, F) {
  while (p.coins >= L.GACHA_COST) { p.coins -= L.GACHA_COST; for (let i = 0; i < L.PER_PULL; i++) { const m = L.pull(null, F); p.inv[m.k] = (p.inv[m.k] || 0) + 1; } }
}
function newP() { const p = {coins:0}; FIELDS.forEach(F => L.ensureInv(p, F)); return p; }
function playRun(p, F) {
  const x = Math.random(), r = x < .3 ? "S" : x < .8 ? "A" : "B";
  p.coins += L.runCoins(1800, r);
  for (let i = 0; i < {S:8, A:5, B:3}[r]; i++) { const m = L.pull(null, F); p.inv[m.k] = (p.inv[m.k] || 0) + 1; }
  const HF = L.helpField(p, F), h = L.dropHelp(F.hasLab ? F : HF); L.giveNeeded(p, HF, r === "B" ? Math.ceil(h / 2) : h);
  gacha(p, F); craftAll(p);
}
function login(p, day) {
  p.coins += L.loginCoins(day);
  const F = [...L.LAB_FIELDS].sort((a, b) => remain(p, b) - remain(p, a))[0];
  L.giveNeeded(p, F, L.loginHelp());
  const g = L.pull(day % 7 === 0 ? "SR" : "R", F); p.inv[g.k] = (p.inv[g.k] || 0) + 1;
  gacha(p, F); craftAll(p);
}
const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
const N = +process.argv[2] || 200, laps = [], loginOnly = [], daily = [], lapsField = {};
for (let t = 0; t < N; t++) {
  // ① 周回
  // 全分野の単元を順に1回ずつ遊ぶ（クリア回数で数える）
  let p = newP(), runs = 0; const order = FIELDS.flatMap(F => F.CH.map(() => F));
  while (!allDone(p) && runs < 2000) { playRun(p, order[runs % order.length]); runs++; }
  laps.push(runs);
  // ② ログインだけ
  p = newP(); let day = 0; while (!allDone(p) && day < 200) login(p, ++day); loginOnly.push(day);
  // ③ 毎日ログイン＋1回
  p = newP(); day = 0;
  while (!allDone(p) && day < 200) { login(p, ++day); const left = FIELDS.filter(F => !done(p, F)); if (left.length) playRun(p, left[day % left.length]); }
  daily.push(day);
}
console.log(`目標：遊ぶだけならクリア 約30 回（全単元を約1周） ／ 毎日ログインで 3〜5 週`);
L.LAB_FIELDS.forEach(F => console.log(`  ${F.id}: レシピ ${F.RECIPES.length}・単元 ${F.CH.length}・必要な素材 ${L.totalNeed(F)} 枚 → クリア1回のおたすけ ${L.dropHelp(F)} 枚`));
console.log(`  ログイン1日のおたすけ ${L.loginHelp()} 枚`);
const units = FIELDS.reduce((a, F) => a + F.CH.length, 0);
console.log(`① 遊ぶだけ　　　　：平均 ${avg(laps)} 回クリア（全${units}単元の約 ${(avg(laps) / units).toFixed(1)} 周）`);
console.log(`② ログインだけ　　：平均 ${avg(loginOnly)} 日（約 ${(avg(loginOnly) / 7).toFixed(1)} 週）`);
console.log(`③ 毎日ログイン＋1回：平均 ${avg(daily)} 日（約 ${(avg(daily) / 7).toFixed(1)} 週）`);
