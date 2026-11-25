// ================= ランキング＆報酬 =================
const SAVE_KEY = APP.saveKey;
let S = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch (e) { return null; } })() || {players:{}, rank:{}, cur:null};
const saveS = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };
const P = () => S.players[S.cur];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const lvOfXp = xp => Math.floor(Math.sqrt(xp / 300)) + 1;
const xpFor = lv => (lv - 1) * (lv - 1) * 300;
let pts = 0, runMax = 0;

function newPlayer(name) {
  S.players[name] = S.players[name] || {coins:0, xp:0, plays:0, badges:{}, best:{}, streak:0, lastDay:"", earned:0};
  ensureInv(S.players[name]);
  S.cur = name; saveS();
}

// --- スコア計算：基本点 × レベル倍率 ＋ 残り時間ボーナス ＋ コンボボーナス
function addPts(lv, LIMIT, t0) {
  if (AUTO) return;
  const remain = Math.max(0, LIMIT - (performance.now() - t0)) / LIMIT;
  const p = Math.round(100 * ({1:1, 2:1.2, 3:1.5}[lv]) + remain * 100 + (combo - 1) * 20);
  pts += p; runMax = Math.max(runMax, combo);
  const h = $("hud"); if (h) h.textContent = pts.toLocaleString() + " pt";
  const card = $("card") || $("sc"); if (!card) return;
  const r = card.getBoundingClientRect(), d = document.createElement("div");
  d.className = "ptsf"; d.textContent = "+" + p; d.style.left = r.left + r.width / 2 + "px"; d.style.top = r.top + 30 + "px";
  document.body.appendChild(d); setTimeout(() => d.remove(), 1000);
}
function hudOn() {
  if (!$("hud")) $("homeBtn").insertAdjacentHTML("beforebegin", `<span class="hud" id="hud"></span>`);
  $("hud").textContent = AUTO ? "" : "0 pt";
}

// --- バッジ
const BADGES = [
  {id:"first",   e:"🌱", nm:"はじめの一歩",   tx:"初めてクリア"},
  {id:"perfect", e:"👑", nm:"パーフェクト",   tx:"全問正解する"},
  {id:"combo5",  e:"⚡", nm:"5コンボ",        tx:"5問連続正解"},
  {id:"combo10", e:"🔥", nm:"コンボマスター", tx:"10問連続正解"},
  {id:"score2k", e:"💯", nm:"2000点突破",     tx:"1回で2000点以上"},
  {id:"all",     e:"🗺️", nm:"全単元制覇",     tx:"5単元すべてクリア"},
  {id:"plays10", e:"🎮", nm:"常連さん",       tx:"10回プレイ"},
  {id:"streak3", e:"📅", nm:"3日連続",        tx:"3日連続ログイン"},
  {id:"craft1",  e:"⚗️", nm:"はじめての合成", tx:"物質を1つ合成"},
  {id:"craft10", e:"🧪", nm:"合成マスター",   tx:"10種類の物質を合成"},
  {id:"craftAll",e:"🏅", nm:"全レシピ発見",   tx:"すべてのレシピを発見"},
  {id:"top1",    e:"🥇", nm:"ランキング1位",  tx:"どれかの単元で1位"},
  {id:"lv5",     e:"⭐", nm:"Lv.5到達",       tx:"レベル5になる"},
  {id:"rich",    e:"🪙", nm:"コイン長者",     tx:"合計1000コイン獲得"},
  ...LAB_BADGES,
];
function unlock(ids) { const p = P(), got = []; ids.forEach(id => { if (!p.badges[id]) { p.badges[id] = today(); got.push(BADGES.find(b => b.id === id)); } }); return got; }

// --- ランキング（この端末内）
function addRank(id, score) {
  const L = S.rank[id] = S.rank[id] || [];
  L.push({n:S.cur, s:score, d:today()});
  L.sort((a, b) => b.s - a.s); S.rank[id] = L.slice(0, 30);
  return S.rank[id].findIndex(e => e.n === S.cur && e.s === score) + 1;
}
function totalRank() {
  return Object.entries(S.players).map(([n, p]) => ({n, s:Object.values(p.best).reduce((a, b) => a + b, 0)})).filter(e => e.s > 0).sort((a, b) => b.s - a.s);
}

// --- 1回分の精算
function finishRun() {
  const p = P(), n = Q.length, r = score === n ? "S" : score / n >= .7 ? "A" : "B";
  const prevBest = p.best[cur.id] || 0, newRec = pts > prevBest;
  if (newRec) p.best[cur.id] = pts;
  const pos = addRank(cur.id, pts);
  const coins = Math.round(pts / 4) + {S:150, A:80, B:30}[r];  // 1回クリアでたっぷり
  const lv0 = lvOfXp(p.xp);
  p.coins += coins; p.earned += coins; p.xp += pts; p.plays++;
  const ids = ["first"];
  if (r === "S") ids.push("perfect");
  if (runMax >= 5) ids.push("combo5"); if (runMax >= 10) ids.push("combo10");
  if (pts >= 2000) ids.push("score2k"); if (p.plays >= 10) ids.push("plays10");
  if (CH.every(c => p.best[c.id])) ids.push("all");
  if (pos === 1) ids.push("top1"); if (lvOfXp(p.xp) >= 5) ids.push("lv5"); if (p.earned >= 1000) ids.push("rich");
  const badges = unlock(ids);
  const mats = dropMats(r);
  saveS();
  return {r, pos, coins, newRec, prevBest, badges, mats, lvUp: lvOfXp(p.xp) > lv0 ? lvOfXp(p.xp) : 0};
}
function rewardPanel(R) {
  const p = P();
  return `<div class="card-share">
      <small>${cur.no} ${cur.title}｜${S.cur}</small>
      <div class="s">${pts.toLocaleString()} pt</div>
      <small>${score}/${Q.length}問正解・最大${runMax}コンボ・${today()}</small><br>
      ${R.newRec ? `<span class="newrec">NEW RECORD!</span>` : `<small>自己ベスト ${R.prevBest.toLocaleString()} pt</small>`}
    </div>
    <div class="rw">
      🏆 この端末のランキング <b>${R.pos}位</b><br>
      🪙 コイン <b>+${R.coins}</b>（所持 ${p.coins}）<br>
      🧪 素材ドロップ <b>${R.mats.map(m => m.fm).join(" ")}</b>　→ 合成ラボで使おう<br>
      ⭐ EXP <b>+${pts}</b>${R.lvUp ? `　<span style="color:var(--pink);font-weight:900">レベルアップ！ Lv.${R.lvUp}</span>` : ""}
      ${R.badges.length ? `<br>🎖️ 新しいバッジ：${R.badges.map(b => `<b>${b.e}${b.nm}</b>`).join("、")}` : ""}
    </div>
    <div style="font-size:12px;color:var(--sub);font-weight:700">📸 この結果カードをスクショしてTeamsに投稿しよう！</div>`;
}

// --- 結果画面に報酬をはさむ
const _result = result, _swipeResult = swipeResult;
result = function () { _result(); afterRun(); };
swipeResult = function (l) { _swipeResult(l); afterRun(); };
function afterRun() {
  if (AUTO || !S.cur) return;
  const R = finishRun();
  $("res").querySelector(".score")?.remove(); $("res").querySelector(".title-b")?.remove();
  $("res").querySelector("h2").insertAdjacentHTML("afterend", `<div class="title-b pop">${R.r}ランク</div>${rewardPanel(R)}`);
  if (R.badges.length || R.lvUp) bell([1318, 1568, 2093, 2637], .08);
}

// --- 開始時のリセット
const _start = start;
start = function (ch) { pts = 0; runMax = 0; const r = _start(ch); hudOn(); return r; };
const _startSwipe = startSwipe;
startSwipe = function (ch) { pts = 0; runMax = 0; const r = _startSwipe(ch); hudOn(); return r; };

// --- メニュー拡張
const _menu = menu;
menu = function () {
  if (!S.cur) return nameEntry();
  _menu();
  ensureInv(P());
  const p = P(), lv = lvOfXp(p.xp), pr = (p.xp - xpFor(lv)) / (xpFor(lv + 1) - xpFor(lv)) * 100;
  stage.querySelector(".logo").insertAdjacentHTML("beforebegin", `<div class="pbar">
      <div class="av">${["🧑‍🔬","⚗️","🧪","🔬","🌟"][Math.min(4, Math.floor((lv - 1) / 2))]}</div>
      <div class="nm2">${esc(S.cur)}<small>Lv.${lv}　次まで ${xpFor(lv + 1) - p.xp} EXP</small><div class="xpb"><i style="width:${pr}%"></i></div></div>
      <div class="coin">🪙 ${p.coins}</div></div>`);
  stage.querySelector(".chs").insertAdjacentHTML("afterend", `<div class="navs">
      <button class="nv" id="nRank"><span class="e">🏆</span>ランキング</button>
      <button class="nv" id="nGacha"><span class="e">🎁</span>素材ガチャ</button>
      <button class="nv" id="nLab"><span class="e">⚗️</span>合成ラボ</button>
      <button class="nv" id="nMy"><span class="e">🎖️</span>バッジ・図鑑</button></div>`);
  $("nRank").onclick = () => ranking(cur?.id || "total"); $("nGacha").onclick = gacha; $("nMy").onclick = () => mypage(); $("nLab").onclick = () => lab();
  stage.querySelectorAll(".cc").forEach(b => { const c = CH[+b.dataset.i], s = p.best[c.id]; if (s) { b.querySelector(".best")?.remove(); b.insertAdjacentHTML("afterbegin", `<span class="best">${s.toLocaleString()}pt</span>`); } });
  dailyBonus();
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function nameEntry() {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  const names = Object.keys(S.players);
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <div class="logo pop" style="font-size:32px">ケミカラ！</div>
    <h2>ニックネームを入力</h2>
    <div style="font-size:12px;color:var(--sub)">ランキングに表示されます（本名はさけよう）</div>
    <input class="inp" id="nmIn" maxlength="8" placeholder="8文字まで">
    <button class="btn" id="nmOk">はじめる</button>
    ${names.length ? `<div style="margin-top:14px;font-size:12px;color:var(--sub);font-weight:700">この端末のプレイヤー</div>
      <div class="tabs" style="margin-top:6px">${names.map(n => `<button class="pl">${esc(n)}</button>`).join("")}</div>` : ""}
  </div>`;
  const go = n => { n = n.trim().slice(0, 8); if (!n) { $("nmIn").focus(); return; } newPlayer(n); menu(); };
  $("nmOk").onclick = () => go($("nmIn").value);
  $("nmIn").onkeydown = e => { if (e.key === "Enter") go($("nmIn").value); };
  stage.querySelectorAll(".pl").forEach(b => b.onclick = () => go(b.textContent));
}

function dailyBonus() {
  const p = P(), t = today();
  if (p.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yd = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  p.streak = p.lastDay === yd ? p.streak + 1 : 1; p.lastDay = t;
  ensureInv(p);
  const bonus = 300 + Math.min(p.streak, 7) * 50; p.coins += bonus; p.earned += bonus;
  const gift = p.streak % 7 === 0 ? pull("SR") : pull("R"); p.inv[gift.k] = (p.inv[gift.k] || 0) + 1;
  const b = p.streak >= 3 ? unlock(["streak3"]) : [];
  saveS();
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="box"><div style="font-size:48px">🎁</div><h2 class="pop" style="margin:4px 0">ログインボーナス</h2>
    <div style="font-weight:900">${p.streak}日連続ログイン！</div>
    <div style="font-family:Quicksand;font-size:34px;color:var(--pink)">🪙 +${bonus}</div>
    <div style="font-weight:900;margin-top:4px">おまけ素材：${gift.fm}（${gift.r}）</div>
    <div style="font-size:12px;color:var(--sub)">連続日数が多いほどボーナスアップ（7日ごとにSR素材！）</div>
    ${b.length ? `<div style="margin-top:6px;font-weight:900">🎖️ バッジ「${b[0].nm}」ゲット！</div>` : ""}
    <button class="btn" id="mOk">うけとる</button></div>`;
  document.body.appendChild(m); bell([1046, 1318, 1568]);
  m.querySelector("#mOk").onclick = () => { m.remove(); menu(); };
}

function ranking(tab) {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  const L = tab === "total" ? totalRank() : (S.rank[tab] || []).slice(0, 10);
  const medal = i => i < 3 ? `<span class="medal${i + 1}">${["🥇","🥈","🥉"][i]}</span>` : i + 1;
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">🏆 ランキング</h2>
    <div class="tabs"><button data-t="total" class="${tab === "total" ? "on" : ""}">総合</button>${CH.map(c => `<button data-t="${c.id}" class="${tab === c.id ? "on" : ""}">${c.no}</button>`).join("")}</div>
    <div style="text-align:center;font-weight:900;font-size:14px;margin-bottom:4px">${tab === "total" ? "各単元のベストの合計" : CH.find(c => c.id === tab).title}</div>
    ${L.length ? `<table class="rk">${L.map((e, i) => `<tr class="${e.n === S.cur ? "me" : ""}"><td class="no">${medal(i)}</td><td>${esc(e.n)}${e.d ? `<br><small style="color:var(--sub)">${e.d}</small>` : ""}</td><td class="sc">${e.s.toLocaleString()}</td></tr>`).join("")}</table>`
      : `<div class="empty">まだ記録がありません</div>`}
    <div style="font-size:11px;color:var(--sub);text-align:center;margin-top:8px">※ この端末で遊んだ人のランキングです</div>
    <button class="btn sub" id="bk">メニューへ</button></div>`;
  stage.querySelectorAll(".tabs button").forEach(b => b.onclick = () => ranking(b.dataset.t));
  $("bk").onclick = menu;
}

// ================= 素材ガチャ（演出つき） =================
function gacha() {
  run++; $("hdr").style.display = "none";
  const p = P(); ensureInv(p);
  const can = n => p.coins >= GACHA_COST * n;
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <h2 class="pop">🎁 素材ガチャ</h2>
    <div style="font-size:13px;color:var(--sub);font-weight:700">1回で素材カードが${PER_PULL}枚！ 合成ラボで物質を作ろう</div>
    <div class="gacha"><div class="machine" id="cap">🫧</div></div>
    <div class="coin" style="margin-bottom:6px">所持 🪙 <span id="cn">${p.coins}</span></div>
    <div style="display:flex;gap:8px"><button class="btn" id="p1">1回（🪙${GACHA_COST}）</button><button class="btn" id="p10" style="background:var(--lav);box-shadow:0 5px 0 #2557c9">10連（🪙${GACHA_COST * 10}）</button></div>
    <div style="font-size:11px;color:var(--sub);margin-top:8px">1枚ごとの確率：N 70%・R 22%・SR 8%　／　10連はSR 1枚以上確定！</div>
    <button class="btn sub" id="lb">⚗️ 合成ラボへ</button>
    <button class="btn sub" id="bk">メニューへ</button></div>`;
  $("bk").onclick = menu; $("lb").onclick = () => lab();
  const upd = () => { $("cn").textContent = p.coins; [["p1", 1], ["p10", 10]].forEach(([id, n]) => { $(id).disabled = !can(n); $(id).style.opacity = can(n) ? 1 : .5; }); };
  upd();
  const go = async n => {
    if (!can(n)) return;
    p.coins -= GACHA_COST * n; upd(); $("p1").disabled = $("p10").disabled = true;
    const got = []; for (let i = 0; i < PER_PULL * n; i++) got.push(pull());
    if (n >= 10 && !got.some(m => m.r === "SR")) got[got.length - 1] = pull("SR");
    got.forEach(m => p.inv[m.k] = (p.inv[m.k] || 0) + 1); saveS();
    await gachaFx(got); upd();
  };
  $("p1").onclick = () => go(1); $("p10").onclick = () => go(10);
}
async function gachaFx(got) {
  const sr = got.some(m => m.r === "SR"), rr = got.some(m => m.r === "R");
  const fx = document.createElement("div"); fx.className = "fx " + (sr ? "gold" : rr ? "blue" : "");
  fx.innerHTML = `<div class="orb" id="orb">🫧</div><div class="fxt">${sr ? "…！？ 光り方がちがう！" : "なにが出るかな…"}</div><div class="fx-skip">タップでスキップ</div>`;
  document.body.appendChild(fx);
  let skip = false; fx.onclick = () => skip = true;
  const wait = async ms => { const t = performance.now(); while (!skip && performance.now() - t < ms) await sleep(30); };
  bell([523, 587, 659, 698, 784], .1, .04); await wait(sr ? 1500 : 1000);
  fx.innerHTML = `<div class="flashw"></div><div class="fxgrid" style="grid-template-columns:repeat(${got.length > 5 ? 5 : got.length},1fr)">${got.map((m, i) =>
    `<div class="fc ${m.r}" style="animation-delay:${skip ? 0 : i * (got.length > 10 ? 60 : 160)}ms">${itemCard(m.k)}</div>`).join("")}</div>
    <div class="fxt">${sr ? "✨ SR ゲット！ ✨" : "素材ゲット！"}</div><button class="btn" id="fxOk" style="max-width:260px">OK</button>`;
  sr ? bell([1046, 1318, 1568, 2093, 2637], .08) : SE.ok();
  if (sr) for (let i = 0; i < 3; i++) setTimeout(() => burst(fx.querySelector(".fxgrid")), i * 300);
  await new Promise(r => fx.querySelector("#fxOk").onclick = e => { e.stopPropagation(); fx.remove(); r(); });
}

// ================= 合成ラボ =================
let slot = {}, recTab = null;
const canMake = (p, r) => Object.entries(r.inp).every(([k, n]) => (p.inv[k] || 0) >= n);
function lab(msg = "") {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  const p = P(); ensureInv(p);
  const owned = Object.keys(ITEM).filter(k => (p.inv[k] || 0) > 0);
  const found = RECIPES.filter(r => p.recipes[r.id]).length;
  const slotHTML = Object.keys(slot).length
    ? Object.entries(slot).map(([k, n]) => `<button class="slot" data-k="${k}">${n > 1 ? `<b>${n}</b>` : ""}${ITEM[k].fm}</button>`).join(`<span class="plus">＋</span>`)
    : `<span style="color:var(--sub);font-size:13px">下の素材をタップして入れよう<br>（同じ素材を2回タップ＝係数2）</span>`;
  recTab = recTab || LAB_TABS[0];
  const list = RECIPES.filter(r => recCat(r) === recTab);
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">⚗️ 合成ラボ</h2>
    <div class="flask">${slotHTML}</div>
    <div style="display:flex;gap:8px"><button class="btn" id="mix" ${Object.keys(slot).length ? "" : "disabled style='opacity:.5'"}>合成する！</button><button class="btn sub" id="clr" style="flex:none;width:96px;white-space:nowrap">クリア</button></div>
    <div id="lmsg" class="lmsg">${msg}</div>
    <div class="sec">もっている素材・物質 <small>（長押しで解説）</small></div>
    ${owned.length ? `<div class="stk">${owned.map(k => itemCard(k, p.inv[k] - (slot[k] || 0), `data-k="${k}" role="button"`)).join("")}</div>` : `<div class="empty">素材がありません。ガチャやクイズで集めよう</div>`}
    <div class="sec">レシピ帳　${found}/${RECIPES.length}</div>
    <div class="tabs">${LAB_TABS.map(t => `<button data-rt="${t}" class="${recTab === t ? "on" : ""}">${t} ${RECIPES.filter(r => recCat(r) === t && p.recipes[r.id]).length}/${RECIPES.filter(r => recCat(r) === t).length}</button>`).join("")}</div>
    <div class="recipes">${list.map(r => p.recipes[r.id]
      ? `<button class="rc ok ${canMake(p, r) ? "" : "short"}" data-r="${r.id}">${eqHTML(r)}<small>${canMake(p, r) ? "▶ タップで材料をセット" : "材料が足りない"}</small></button>`
      : `<div class="rc">${Object.keys(r.inp).map(() => "？").join(" ＋ ")} → ${Object.keys(r.out).filter(k => !ITEM[k].mat || Object.keys(r.out).length === 1).map(k => ITEM[k].nm).join(" ＋ ")}<small>💡 ${r.hint}（材料${Object.keys(r.inp).length}種類）</small></div>`).join("")}</div>
    <button class="btn sub" id="gc">🎁 素材ガチャへ</button>
    <button class="btn sub" id="bk">メニューへ</button></div>`;
  stage.querySelectorAll(".stk .st[data-k]").forEach(c => {
    let lp; c.onpointerdown = () => { lp = setTimeout(() => { lp = "done"; showDetail(c.dataset.k); }, 550); };
    c.onpointerup = c.onpointerleave = () => { if (lp !== "done") clearTimeout(lp); };
    c.onclick = () => { if (lp === "done") { lp = null; return; }
      const k = c.dataset.k; if ((p.inv[k] || 0) - (slot[k] || 0) <= 0) return;
      slot[k] = (slot[k] || 0) + 1; bell([880], .05, .04); lab(); };
  });
  stage.querySelectorAll(".slot").forEach(b => b.onclick = () => { const k = b.dataset.k; if (--slot[k] <= 0) delete slot[k]; lab(); });
  stage.querySelectorAll("[data-rt]").forEach(b => b.onclick = () => { recTab = b.dataset.rt; lab(); });
  stage.querySelectorAll(".rc[data-r]").forEach(b => b.onclick = () => { const r = RECIPES.find(x => x.id === b.dataset.r); if (!canMake(p, r)) return; slot = {...r.inp}; lab(); stage.scrollTop = 0; });
  $("clr").onclick = () => { slot = {}; lab(); };
  $("bk").onclick = () => { slot = {}; menu(); }; $("gc").onclick = () => { slot = {}; gacha(); };
  $("mix").onclick = mix;
}
function sameBag(a, b) { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => a[k] === b[k]); }

async function mix() {
  const p = P(), r = RECIPES.find(x => sameBag(x.inp, slot));
  if (!r) {
    const near = RECIPES.find(x => Object.keys(x.inp).sort().join() === Object.keys(slot).sort().join());
    SE.ng(); slot = {};
    return lab(near ? `🤏 材料は合ってる！ でも枚数（係数）がちがうよ` : `💨 反応しなかった… 組み合わせを変えてみよう`);
  }
  const used = {...slot};
  Object.entries(r.inp).forEach(([k, n]) => p.inv[k] -= n);
  Object.entries(r.out).forEach(([k, n]) => { p.inv[k] = (p.inv[k] || 0) + n; p.made[k] = (p.made[k] || 0) + n; });
  const first = !p.recipes[r.id]; p.recipes[r.id] = today();
  if (first) { p.coins += 50; p.earned += 50; }
  const ids = ["craft1"]; if (PROD.filter(x => p.made[x.k]).length >= 10) ids.push("craft10");
  if (RECIPES.every(x => p.recipes[x.id])) ids.push("craftAll");
  LAB_BADGES.forEach(b => { if (b.test(p, r)) ids.push(b.id); });
  const b = unlock(ids); saveS(); slot = {};
  await mixFx(r, used, first);
  // 結果
  const prods = Object.keys(r.out).filter(k => !ITEM[k].mat), main = prods[0] || Object.keys(r.out)[0];
  const again = canMake(p, r);
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="box res-box">${first ? `<div class="newtag pop">NEW!</div>` : ""}
    <div class="pop" style="font-size:22px;color:var(--pink)">${first ? "新しい物質を発見！" : "合成成功！"}</div>
    <div class="eqbig">${eqHTML(r)}</div>
    <div class="flipin">${detailHTML(main)}</div>
    ${prods.slice(1).map(k => `<div class="sub2">＋ ${ITEM[k].nm}（${ITEM[k].c}）もできた</div>`).join("")}
    ${first ? `<div class="bonus">はじめての発見ボーナス 🪙+50</div>` : ""}
    ${b.length ? `<div class="bonus">🎖️ バッジ「${b.map(x => x.nm).join("」「")}」ゲット！</div>` : ""}
    <div style="display:flex;gap:8px">${again ? `<button class="btn" id="mAgain" style="font-size:15px;white-space:nowrap">もう一度つくる</button>` : ""}<button class="btn ${again ? "sub" : ""}" id="mOk" style="font-size:15px;white-space:nowrap">ラボにもどる</button></div></div>`;
  document.body.appendChild(m);
  m.querySelector("#mOk").onclick = () => { m.remove(); lab(); };
  if (again) m.querySelector("#mAgain").onclick = () => { m.remove(); slot = {...r.inp}; mix(); };
}

async function mixFx(r, used, first) {
  const outKeys = Object.keys(r.out), main = outKeys.find(k => !ITEM[k].mat) || outKeys[0], it = ITEM[main];
  const col = it.c === "無色" ? "#cfe6ff" : it.c === "白" ? "#f4f6fb" : HEX[it.c];
  const fx = document.createElement("div"); fx.className = "fx" + (first ? " gold" : "");
  fx.innerHTML = `
    <div class="ings">${Object.entries(used).map(([k, n], i) => `<div class="ing" style="--i:${i}">${n > 1 ? `<b>${n}</b>` : ""}${itemCard(k)}</div>`).join("")}</div>
    <svg class="flaskfx" viewBox="0 0 120 150" width="150" height="188">
      <defs><clipPath id="fc"><path d="M48 8 H72 V52 L108 128 Q112 140 100 140 H20 Q8 140 12 128 L48 52 Z"/></clipPath></defs>
      <g clip-path="url(#fc)"><rect id="liq" x="0" y="96" width="120" height="60" fill="#b9c6dc"/>
        <g id="bub">${Array.from({length: 9}, (_, i) => `<circle cx="${25 + i * 9}" cy="140" r="${2 + (i % 3)}" fill="#fff" opacity=".8" style="animation-delay:${i * .17}s"/>`).join("")}</g></g>
      <path d="M48 8 H72 V52 L108 128 Q112 140 100 140 H20 Q8 140 12 128 L48 52 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
      <rect x="44" y="2" width="32" height="9" rx="4" fill="#fff"/></svg>
    <div class="fxt" id="fxt">まぜまぜ…</div><div class="fx-skip">タップでスキップ</div>`;
  document.body.appendChild(fx);
  let skip = false; fx.onclick = () => skip = true;
  const wait = async ms => { const t = performance.now(); while (!skip && performance.now() - t < ms) await sleep(30); };
  await wait(150); fx.classList.add("drop"); bell([660, 880], .08, .04);          // 材料がフラスコへ
  await wait(700); fx.classList.add("boil"); bell([392, 440, 494, 523, 587], .09, .03); // ぐつぐつ
  $("liq").style.fill = col; $("fxt").textContent = first ? "反応が…はじまった！" : "反応中…";
  await wait(first ? 1400 : 900);
  fx.insertAdjacentHTML("beforeend", `<div class="flashw"></div>`); bell(first ? [1046, 1318, 1568, 2093, 2637] : [1046, 1318, 1568], .07);
  await sleep(260); burst(fx.querySelector(".flaskfx"));
  if (first) for (let i = 1; i < 3; i++) setTimeout(() => burst(fx.querySelector(".flaskfx")), i * 220);
  await sleep(first ? 500 : 250); fx.remove();
}

// ================= マイページ（バッジ・図鑑） =================
function mypage(tab = "badge") {
  run++; $("hdr").style.display = "none";
  const p = P(); ensureInv(p);
  const bn = Object.keys(p.badges).length;
  const book = c => PROD.filter(x => x.cat === c), cnt = c => book(c).filter(x => p.made[x.k]).length;
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">${esc(S.cur)} のコレクション</h2>
    <div class="tabs"><button data-t="badge" class="${tab === "badge" ? "on" : ""}">バッジ ${bn}/${BADGES.length}</button>
      ${LAB_TABS.map(t => `<button data-t="${t}" class="${tab === t ? "on" : ""}">${t} ${cnt(t)}/${book(t).length}</button>`).join("")}
      <button data-t="mat" class="${tab === "mat" ? "on" : ""}">素材</button></div>
    ${tab === "badge" ? `<div class="bgs">${BADGES.map(b => `<div class="bg ${p.badges[b.id] ? "" : "lock"}"><span class="e">${b.e}</span>${b.nm}<br><span style="font-weight:500;color:var(--sub)">${b.tx}</span></div>`).join("")}</div>`
      : tab === "mat" ? `<div class="stk">${MATS.map(x => itemCard(x.k, p.inv[x.k] || 0, `data-d="${x.k}" role="button"`)).join("")}</div>`
      : `<div class="stk">${book(tab).map(x => p.made[x.k] ? itemCard(x.k, null, `data-d="${x.k}" role="button"`) : `<div class="st no">?</div>`).join("")}</div>`}
    ${tab !== "badge" ? `<div style="font-size:11px;color:var(--sub);margin-top:6px">カードをタップすると解説が見られます</div>` : ""}
    <div style="display:flex;gap:8px;margin-top:6px"><button class="btn sub" id="sw" style="font-size:13px">プレイヤー切替</button><button class="btn sub" id="bk">メニューへ</button></div></div>`;
  stage.querySelectorAll(".tabs button").forEach(b => b.onclick = () => mypage(b.dataset.t));
  stage.querySelectorAll("[data-d]").forEach(c => c.onclick = () => showDetail(c.dataset.d));
  $("bk").onclick = menu; $("sw").onclick = () => { S.cur = null; saveS(); nameEntry(); };
}
