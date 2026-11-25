// ================= ランキング＆報酬 =================
const SAVE_KEY = APP.saveKey;
let S = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch (e) { return null; } })() || {players:{}, rank:{}, cur:null};
const saveS = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };
const P = () => S.players[S.cur];

// --- 以前の「有機版」（別ファイル）の記録を、総合版に一度だけ引き継ぐ（元の記録は消さない）
(function mergeOrganic() {
  if (S.mergedOrg) return;
  Object.values(S.players).forEach(p => { if (p.inv && !p.started) p.started = {inorg:1}; });
  let O = null; try { O = JSON.parse(localStorage.getItem("chemicolor-organic-v1")); } catch (e) {}
  S.mergedOrg = 1;
  if (O && O.players) {
    const add = (a, b) => { Object.entries(b || {}).forEach(([k, v]) => a[k] = (a[k] || 0) + v); return a; };
    for (const [n, q] of Object.entries(O.players)) {
      if (q.inv && !q.started) q.started = {org:1};
      const p = S.players[n];
      if (!p) { S.players[n] = q; continue; }
      ["coins", "xp", "plays", "earned"].forEach(k => p[k] = (p[k] || 0) + (q[k] || 0));
      p.streak = Math.max(p.streak || 0, q.streak || 0);
      p.badges = {...q.badges, ...p.badges}; p.best = p.best || {};
      Object.entries(q.best || {}).forEach(([k, v]) => p.best[k] = Math.max(p.best[k] || 0, v));
      if (q.inv) { p.inv = add(p.inv || {}, q.inv); p.made = add(p.made || {}, q.made); p.recipes = {...q.recipes, ...p.recipes}; p.started = {...q.started, ...p.started}; }
    }
    Object.entries(O.rank || {}).forEach(([id, L]) => S.rank[id] = [...(S.rank[id] || []), ...L].sort((a, b) => b.s - a.s).slice(0, 30));
  }
  saveS();
})();
// --- 分野（#org などの URL で指定できる。前回の分野を覚えておく）
setField(FIELD_OF[location.hash.slice(1)] ? location.hash.slice(1) : S.field);

// --- 合言葉（4けた）。この端末に保存するのはハッシュだけ
const pinHash = (name, pin) => { let h = 2166136261; for (const c of `chemicolor|${name}|${pin}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
const isReg = n => !!(S.players[n] && S.players[n].pin);
// クラス全体のランキングの送り先（未設定）。サーバーを決めたら submit / fetch を実装する
const CLASS_RANK = null;
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const lvOfXp = xp => Math.floor(Math.sqrt(xp / 300)) + 1;
const xpFor = lv => (lv - 1) * (lv - 1) * 300;
let pts = 0, runMax = 0;

function newPlayer(name, pin) {
  S.players[name] = S.players[name] || {coins:0, xp:0, plays:0, badges:{}, best:{}, streak:0, lastDay:"", earned:0};
  if (pin) S.players[name].pin = pinHash(name, pin);
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
// --- バッジ（cat：マイページでの見出し）。test があるものは、記録を見て自動で判定する（autoBadges）
//     test がないものは、クリアした瞬間の出来事で判定する（finishRun など）
const madeN = p => Object.keys(p.made || {}).length;
const fieldUnits = id => p => FIELD_OF[id].CH.every(c => p.best[c.id]);
const fieldComp = id => p => FIELD_OF[id].RECIPES.every(r => p.recipes && p.recipes[r.id]);
const BADGES = [
  // プレイ
  {cat:"プレイ", id:"first",   e:"🌱", nm:"はじめの一歩",   tx:"初めてクリア"},
  {cat:"プレイ", id:"plays10", e:"🎮", nm:"常連さん",       tx:"10回プレイ",   test:p => p.plays >= 10},
  {cat:"プレイ", id:"plays30", e:"🕹️", nm:"化学好き",       tx:"30回プレイ",   test:p => p.plays >= 30},
  {cat:"プレイ", id:"plays100",e:"👹", nm:"化学の鬼",       tx:"100回プレイ",  test:p => p.plays >= 100},
  {cat:"プレイ", id:"lv5",     e:"⭐", nm:"Lv.5到達",       tx:"レベル5になる",  test:p => lvOfXp(p.xp) >= 5},
  {cat:"プレイ", id:"lv10",    e:"🌟", nm:"Lv.10到達",      tx:"レベル10になる", test:p => lvOfXp(p.xp) >= 10},
  {cat:"プレイ", id:"lv20",    e:"💫", nm:"Lv.20到達",      tx:"レベル20になる", test:p => lvOfXp(p.xp) >= 20},
  {cat:"プレイ", id:"streak3", e:"📅", nm:"3日連続",        tx:"3日連続ログイン",  test:p => p.streak >= 3},
  {cat:"プレイ", id:"streak7", e:"🗓️", nm:"1週間皆勤",      tx:"7日連続ログイン",  test:p => p.streak >= 7},
  {cat:"プレイ", id:"streak14",e:"📆", nm:"2週間皆勤",      tx:"14日連続ログイン", test:p => p.streak >= 14},
  {cat:"プレイ", id:"streak30",e:"🏆", nm:"30日皆勤",       tx:"30日連続ログイン", test:p => p.streak >= 30},
  // 記録
  {cat:"記録", id:"perfect", e:"👑", nm:"パーフェクト",   tx:"全問正解する"},
  {cat:"記録", id:"combo5",  e:"⚡", nm:"5コンボ",        tx:"5問連続正解"},
  {cat:"記録", id:"combo10", e:"🔥", nm:"コンボマスター", tx:"10問連続正解"},
  {cat:"記録", id:"score2k", e:"💯", nm:"2000点突破",     tx:"1回で2000点以上"},
  {cat:"記録", id:"score25", e:"🚀", nm:"2500点突破",     tx:"1回で2500点以上"},
  {cat:"記録", id:"sRank10", e:"🎯", nm:"Sランク10回",    tx:"Sランクを10回とる", test:p => (p.sCount || 0) >= 10},
  {cat:"記録", id:"sRank50", e:"🏹", nm:"Sランク50回",    tx:"Sランクを50回とる", test:p => (p.sCount || 0) >= 50},
  {cat:"記録", id:"sUnits8", e:"🎖️", nm:"Sランクコレクター", tx:"8つの単元でSランク", test:p => Object.keys(p.sUnits || {}).length >= 8},
  {cat:"記録", id:"top1",    e:"🥇", nm:"ランキング1位",  tx:"どれかの単元で1位"},
  {cat:"記録", id:"all",     e:"🗺️", nm:"全単元制覇",     tx:"どれかの分野の全単元をクリア", test:p => FIELDS.some(f => fieldUnits(f.id)(p))},
  {cat:"記録", id:"allInorg",e:"🧪", nm:"無機の旅人",     tx:"無機の全単元をクリア",   test:fieldUnits("inorg")},
  {cat:"記録", id:"allOrg",  e:"⚗️", nm:"有機の旅人",     tx:"有機の全単元をクリア",   test:fieldUnits("org")},
  {cat:"記録", id:"allPoly", e:"🧬", nm:"高分子の旅人",   tx:"高分子の全単元をクリア", test:fieldUnits("poly")},
  {cat:"記録", id:"allField",e:"🌍", nm:"3分野制覇",      tx:"無機・有機・高分子の全単元をクリア", test:p => FIELDS.every(f => fieldUnits(f.id)(p))},
  // コイン・ガチャ
  {cat:"コイン・ガチャ", id:"rich",    e:"🪙", nm:"コイン長者",   tx:"合計1000コイン獲得",  test:p => p.earned >= 1000},
  {cat:"コイン・ガチャ", id:"rich5k",  e:"💰", nm:"大金持ち",     tx:"合計5000コイン獲得",  test:p => p.earned >= 5000},
  {cat:"コイン・ガチャ", id:"rich20k", e:"🤑", nm:"コイン王",     tx:"合計20000コイン獲得", test:p => p.earned >= 20000},
  {cat:"コイン・ガチャ", id:"gacha1",  e:"🎁", nm:"はじめてのガチャ", tx:"ガチャを1回引く",  test:p => (p.pulls || 0) >= 1},
  {cat:"コイン・ガチャ", id:"gacha30", e:"🎰", nm:"ガチャ好き",   tx:"ガチャを30回引く",   test:p => (p.pulls || 0) >= 30},
  {cat:"コイン・ガチャ", id:"gacha100",e:"🎡", nm:"ガチャマスター", tx:"ガチャを100回引く", test:p => (p.pulls || 0) >= 100},
  {cat:"コイン・ガチャ", id:"sr1",     e:"✨", nm:"はじめてのSR", tx:"SR素材を引く",       test:p => (p.srGot || 0) >= 1},
  {cat:"コイン・ガチャ", id:"sr20",    e:"💎", nm:"SRコレクター", tx:"SR素材を20枚引く",   test:p => (p.srGot || 0) >= 20},
  {cat:"コイン・ガチャ", id:"hint1",   e:"🔍", nm:"ヒントで一歩", tx:"レシピのヒントを見る", test:p => (p.hintUsed || 0) >= 1},
  // 合成
  {cat:"合成", id:"craft1",   e:"⚗️", nm:"はじめての合成", tx:"物質を1つ合成"},
  {cat:"合成", id:"craft10",  e:"🧪", nm:"合成マスター",   tx:"10種類の物質を合成",  test:p => madeN(p) >= 10},
  {cat:"合成", id:"craft30",  e:"🔬", nm:"物質ハンター",   tx:"30種類の物質を合成",  test:p => madeN(p) >= 30},
  {cat:"合成", id:"craft80",  e:"📚", nm:"物質博士",       tx:"80種類の物質を合成",  test:p => madeN(p) >= 80},
  {cat:"合成", id:"crafts50", e:"🔁", nm:"合成50回",       tx:"合成を50回する",      test:p => (p.crafts || 0) >= 50},
  {cat:"合成", id:"crafts200",e:"🏭", nm:"合成工場",       tx:"合成を200回する",     test:p => (p.crafts || 0) >= 200},
  {cat:"合成", id:"self10",   e:"💡", nm:"ひらめき",       tx:"ヒントなしで10レシピ発見", test:p => (p.selfFound || 0) >= 10},
  {cat:"合成", id:"self50",   e:"🧠", nm:"ひらめきの天才", tx:"ヒントなしで50レシピ発見", test:p => (p.selfFound || 0) >= 50},
  {cat:"合成", id:"craftAll", e:"🏅", nm:"全レシピ発見",   tx:"どれかの分野の全レシピを発見", test:p => FIELDS.some(f => fieldComp(f.id)(p))},
  {cat:"合成", id:"compInorg",e:"🥉", nm:"無機コンプリート",   tx:"無機の全レシピを発見",   test:fieldComp("inorg")},
  {cat:"合成", id:"compOrg",  e:"🥈", nm:"有機コンプリート",   tx:"有機の全レシピを発見",   test:fieldComp("org")},
  {cat:"合成", id:"compPoly", e:"🥇", nm:"高分子コンプリート", tx:"高分子の全レシピを発見", test:fieldComp("poly")},
  {cat:"合成", id:"compAll",  e:"🌈", nm:"全分野コンプリート", tx:"無機・有機・高分子の全レシピを発見", test:p => FIELDS.every(f => fieldComp(f.id)(p))},
  // 分野ごとの物質（src/data/*-lab.js の LAB_BADGES）
  ...FIELDS.flatMap(f => f.LAB_BADGES.map(b => ({cat:f.name, ...b}))),
];
// 記録から判定できるバッジをまとめてチェック（test(p, r) のように合成したレシピを使うものは合成のときだけ）
function autoBadges() { const p = P(); return unlock(BADGES.filter(b => b.test && b.test.length < 2 && !p.badges[b.id] && b.test(p)).map(b => b.id)); }
function badgeToast(list) {
  if (!list || !list.length) return;
  const d = document.createElement("div"); d.className = "btoast pop";
  d.innerHTML = `🎖️ バッジゲット！<br>${list.map(b => `${b.e} ${b.nm}`).join("<br>")}`;
  document.body.appendChild(d); bell([1318, 1568, 2093], .08); setTimeout(() => d.remove(), 2800);
}
function unlock(ids) { const p = P(), got = []; ids.forEach(id => { if (!p.badges[id]) { p.badges[id] = today(); got.push(BADGES.find(b => b.id === id)); } }); return got; }

// --- ランキング（この端末内）
function addRank(id, score) {
  const L = S.rank[id] = S.rank[id] || [];
  L.push({n:S.cur, s:score, d:today()});
  L.sort((a, b) => b.s - a.s); S.rank[id] = L.slice(0, 30);
  return S.rank[id].findIndex(e => e.n === S.cur && e.s === score) + 1;
}
function totalRank() {   // 今の分野の各単元のベストの合計（登録ユーザーのみ）
  return Object.entries(S.players).filter(([n]) => isReg(n)).map(([n, p]) => ({n, s:CH.reduce((a, c) => a + (p.best[c.id] || 0), 0)})).filter(e => e.s > 0).sort((a, b) => b.s - a.s);
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
  if (pts >= 2000) ids.push("score2k"); if (pts >= 2500) ids.push("score25");
  if (r === "S") { p.sCount = (p.sCount || 0) + 1; p.sUnits = {...p.sUnits, [cur.id]: 1}; }
  if (pos === 1) ids.push("top1");
  const mats = dropMats(r);
  const badges = [...unlock(ids), ...autoBadges()];
  saveS();
  return {r, pos, coins, newRec, prevBest, badges, mats, lvUp: lvOfXp(p.xp) > lv0 ? lvOfXp(p.xp) : 0};
}
function rewardPanel(R) {
  const p = P();
  return `<div class="card-share">
      <small>${FIELD.name}｜${cur.no} ${cur.title}｜${esc(S.cur)}</small>
      <div class="s">${pts.toLocaleString()} pt</div>
      <small>${score}/${Q.length}問正解・最大${runMax}コンボ・${today()}</small><br>
      ${R.newRec ? `<span class="newrec">NEW RECORD!</span>` : `<small>自己ベスト ${R.prevBest.toLocaleString()} pt</small>`}
    </div>
    <div class="rw">
      🏆 この端末のランキング <b>${R.pos}位</b>${isReg(S.cur) ? "" : `<small>（合言葉を登録すると表示）</small>`}<br>
      🪙 コイン <b>+${R.coins}</b>（所持 ${p.coins}）<br>
      🧪 素材ドロップ <b>${R.mats.got.map(m => m.nm).join("・")}</b><br>
      ${R.mats.help.length ? `🤝 おたすけ素材 <b>${R.mats.help.map(m => m.nm).join("・")}</b>（まだ作っていないレシピ用）<br>` : ""}
      　→ 合成ラボで使おう<br>
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
  if (!S.cur || !S.players[S.cur]) return nameEntry();
  _menu();
  ensureInv(P());
  const p = P(), lv = lvOfXp(p.xp), pr = (p.xp - xpFor(lv)) / (xpFor(lv + 1) - xpFor(lv)) * 100;
  stage.querySelector(".logo").insertAdjacentHTML("beforebegin", `<div class="ftabs">${FIELDS.map(f => { ensureInv(p, f);
      const pc = Math.floor(fieldDone(p, f) / f.RECIPES.length * 100);
      return `<button data-f="${f.id}" class="${f === FIELD ? "on" : ""}"><span>${f.em}</span>${f.name}<small>${pc === 100 ? "👑 COMP" : `コンプ ${pc}%`}</small></button>`; }).join("")}</div>`);
  stage.querySelector(".ftabs").insertAdjacentHTML("beforebegin", `<div class="pbar">
      <div class="av">${["🧑‍🔬","⚗️","🧪","🔬","🌟"][Math.min(4, Math.floor((lv - 1) / 2))]}</div>
      <div class="nm2">${esc(S.cur)}<small>Lv.${lv}　次まで ${xpFor(lv + 1) - p.xp} EXP</small><div class="xpb"><i style="width:${pr}%"></i></div></div>
      <div class="coin">🪙 ${p.coins}</div></div>`);
  stage.querySelector(".chs").insertAdjacentHTML("afterend", `<div class="navs">
      <button class="nv" id="nRank"><span class="e">🏆</span>ランキング</button>
      <button class="nv" id="nGacha"><span class="e">🎁</span>素材ガチャ</button>
      <button class="nv" id="nLab"><span class="e">⚗️</span>合成ラボ</button>
      <button class="nv" id="nMy"><span class="e">🎖️</span>バッジ・図鑑</button></div>`);
  stage.querySelectorAll(".ftabs button").forEach(b => b.onclick = () => { setField(b.dataset.f); S.field = FIELD.id; saveS(); slot = {}; recTab = null; menu(); });
  $("nRank").onclick = () => ranking(cur && CH.includes(cur) ? cur.id : "total"); $("nGacha").onclick = gacha; $("nMy").onclick = () => mypage(); $("nLab").onclick = () => lab();
  stage.querySelectorAll(".cc").forEach(b => { const c = CH[+b.dataset.i], s = p.best[c.id]; if (s) { b.querySelector(".best")?.remove(); b.insertAdjacentHTML("afterbegin", `<span class="best">${s.toLocaleString()}pt</span>`); } });
  dailyBonus();
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// ================= プレイヤー登録（ニックネーム＋4けたの合言葉） =================
function nameEntry(msg = "") {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  const names = Object.keys(S.players);
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <div class="logo pop" style="font-size:32px">ケミカラ！</div>
    ${names.length ? `<h2>だれが遊ぶ？</h2>
      <div class="plist">${names.map(n => `<button class="pl" data-n="${esc(n)}">${isReg(n) ? "🔒" : "👤"} ${esc(n)}</button>`).join("")}</div>
      <div style="font-size:11px;color:var(--sub);margin-top:4px">🔒＝合言葉を登録ずみ</div>` : `<h2>ようこそ！</h2>`}
    <div class="lmsg">${msg}</div>
    <button class="btn" id="reg">＋ 新しく登録する</button>
  </div>`;
  stage.querySelectorAll(".pl").forEach(b => b.onclick = () => pinEntry(b.dataset.n));
  $("reg").onclick = () => regEntry();
}
const pinInput = (id, ph = "4けたの数字") => `<input class="inp pin" id="${id}" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="${ph}" autocomplete="off">`;
const pinOk = v => /^\d{4}$/.test(v);
function regEntry(msg = "") {
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <h2>新しく登録</h2>
    <div class="flab">ニックネーム <small>（ランキングに出ます。本名はさけよう）</small></div>
    <input class="inp" id="nmIn" maxlength="8" placeholder="8文字まで" autocomplete="off">
    <div class="flab">合言葉 <small>（4けたの数字。わすれないようにメモ！）</small></div>
    ${pinInput("pin1")}${pinInput("pin2", "もう一度")}
    <div class="lmsg" id="rmsg">${msg}</div>
    <button class="btn" id="ok">登録してはじめる</button>
    <button class="btn sub" id="bk">もどる</button></div>`;
  $("bk").onclick = () => nameEntry();
  $("ok").onclick = () => {
    const n = $("nmIn").value.trim().slice(0, 8), a = $("pin1").value, b = $("pin2").value;
    const err = !n ? "ニックネームを入れてね" : S.players[n] ? "その名前はこの端末で使われています" : !pinOk(a) ? "合言葉は4けたの数字にしてね" : a !== b ? "合言葉が一致しません" : "";
    if (err) { $("rmsg").textContent = err; SE.ng(); return; }
    newPlayer(n, a); menu();
  };
}
function pinEntry(n) {
  const reg = isReg(n);
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <h2>${esc(n)}</h2>
    ${reg ? `<div class="flab">合言葉を入れてね</div>${pinInput("pin1")}`
      : `<div class="flab">合言葉（4けたの数字）を決めよう<br><small>登録するとランキングにのります</small></div>${pinInput("pin1")}${pinInput("pin2", "もう一度")}`}
    <div class="lmsg" id="rmsg"></div>
    <button class="btn" id="ok">${reg ? "はじめる" : "登録してはじめる"}</button>
    <button class="btn sub" id="bk">もどる</button></div>`;
  $("pin1").focus();
  $("bk").onclick = () => nameEntry();
  const go = () => {
    const a = $("pin1").value;
    if (reg) {
      if (pinHash(n, a) !== S.players[n].pin) { $("rmsg").textContent = "合言葉がちがいます"; SE.ng(); $("pin1").value = ""; return; }
      newPlayer(n);
    } else {
      const err = !pinOk(a) ? "合言葉は4けたの数字にしてね" : a !== $("pin2").value ? "合言葉が一致しません" : "";
      if (err) { $("rmsg").textContent = err; SE.ng(); return; }
      newPlayer(n, a);
    }
    menu();
  };
  $("ok").onclick = go;
  stage.querySelectorAll(".pin").forEach(i => i.onkeydown = e => { if (e.key === "Enter") go(); });
}

function dailyBonus() {
  const p = P(), t = today();
  if (p.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yd = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  p.streak = p.lastDay === yd ? p.streak + 1 : 1; p.lastDay = t;
  ensureInv(p);
  const bonus = loginCoins(p.streak); p.coins += bonus; p.earned += bonus;
  // おたすけ素材：まだ作っていないレシピがいちばん多く残っている分野へ
  const F = [...FIELDS].sort((a, b) => needNow(p, b).length - needNow(p, a).length)[0];
  const help = giveNeeded(p, F, loginHelp());
  const gift = p.streak % 7 === 0 ? pull("SR", F) : pull("R", F); p.inv[gift.k] = (p.inv[gift.k] || 0) + 1;
  const b = autoBadges();
  saveS();
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="box"><div style="font-size:48px">🎁</div><h2 class="pop" style="margin:4px 0">ログインボーナス</h2>
    <div style="font-weight:900">${p.streak}日連続ログイン！</div>
    <div style="font-family:Quicksand;font-size:34px;color:var(--pink)">🪙 +${bonus}</div>
    <div style="font-weight:900;margin-top:4px">おまけ素材（${F.name}）：${gift.nm}（${gift.r}）</div>
    ${help.length ? `<div style="font-weight:900;margin-top:4px">🤝 おたすけ素材（${F.name}）：${help.map(x => x.nm).join("・")}</div>` : ""}
    <div style="font-size:12px;color:var(--sub)">毎日ログインすると素材が集まる！（7日ごとにSR素材）</div>
    ${b.length ? `<div style="margin-top:6px;font-weight:900">🎖️ バッジ「${b.map(x => x.nm).join("」「")}」ゲット！</div>` : ""}
    <button class="btn" id="mOk">うけとる</button></div>`;
  document.body.appendChild(m); bell([1046, 1318, 1568]);
  m.querySelector("#mOk").onclick = () => { m.remove(); menu(); };
}

// ================= ランキング（登録ユーザー） =================
function ranking(tab, mode = "local") {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  const L = tab === "total" ? totalRank() : (S.rank[tab] || []).filter(e => isReg(e.n)).slice(0, 10);
  const medal = i => i < 3 ? `<span class="medal${i + 1}">${["🥇","🥈","🥉"][i]}</span>` : i + 1;
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">🏆 ランキング <small style="font-size:14px">${FIELD.em}${FIELD.name}</small></h2>
    <div class="tog" style="margin:0 auto 10px"><button data-m="local" class="${mode === "local" ? "on" : ""}">この端末</button><button data-m="class" class="${mode === "class" ? "on" : ""}">クラス全体</button></div>
    <div class="tabs"><button data-t="total" class="${tab === "total" ? "on" : ""}">総合</button>${CH.map(c => `<button data-t="${c.id}" class="${tab === c.id ? "on" : ""}">${c.no}</button>`).join("")}</div>
    <div style="text-align:center;font-weight:900;font-size:14px;margin-bottom:4px">${tab === "total" ? `${FIELD.name}の各単元のベストの合計` : CH.find(c => c.id === tab).title}</div>
    ${mode === "class" ? `<div class="empty">🛠️ クラス全体のランキングは準備中です<br><small>先生が記録の送り先を設定すると、ここに表示されます</small></div>`
      : L.length ? `<table class="rk">${L.map((e, i) => `<tr class="${e.n === S.cur ? "me" : ""}"><td class="no">${medal(i)}</td><td>${esc(e.n)}${e.d ? `<br><small style="color:var(--sub)">${e.d}</small>` : ""}</td><td class="sc">${e.s.toLocaleString()}</td></tr>`).join("")}</table>`
      : `<div class="empty">まだ記録がありません</div>`}
    <div style="font-size:11px;color:var(--sub);text-align:center;margin-top:8px">※ 合言葉を登録したプレイヤーだけがのります${isReg(S.cur) ? "" : "（あなたはまだ未登録：プレイヤー切替から登録できます）"}</div>
    <button class="btn sub" id="bk">メニューへ</button></div>`;
  stage.querySelectorAll(".tabs button").forEach(b => b.onclick = () => ranking(b.dataset.t, mode));
  stage.querySelectorAll("[data-m]").forEach(b => b.onclick = () => ranking(tab, b.dataset.m));
  $("bk").onclick = menu;
}

// ================= 素材ガチャ（演出つき） =================
function gacha() {
  run++; $("hdr").style.display = "none";
  const p = P(); ensureInv(p);
  const can = n => p.coins >= GACHA_COST * n;
  stage.innerHTML = `<div class="panel" style="text-align:center">
    <h2 class="pop">🎁 素材ガチャ <small style="font-size:14px">${FIELD.em}${FIELD.name}</small></h2>
    <div style="font-size:13px;color:var(--sub);font-weight:700">1回で素材カードが${PER_PULL}枚！ ${FIELD.POOL_FROM.length ? "無機・有機の素材も出るよ" : `${FIELD.name}の素材が出るよ`}</div>
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
    got.sort((a, b) => "NRS".indexOf(b.r[0]) - "NRS".indexOf(a.r[0]));   // レアの高い順（SR → R → N）に出す
    got.forEach(m => p.inv[m.k] = (p.inv[m.k] || 0) + 1);
    p.pulls = (p.pulls || 0) + n; p.srGot = (p.srGot || 0) + got.filter(m => m.r === "SR").length;
    const b = autoBadges(); saveS();
    await gachaFx(got); upd(); badgeToast(b);
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
  const owned = Object.keys(ITEM).filter(k => (p.inv[k] || 0) > 0 && FIELD.used.has(k));   // この分野のレシピで使うものだけ
  const found = RECIPES.filter(r => p.recipes[r.id]).length;
  const slotHTML = Object.keys(slot).length
    ? Object.entries(slot).map(([k, n]) => `<button class="slot" data-k="${k}">${n > 1 ? `<b>${n}</b>` : ""}${ITEM[k].fm}</button>`).join(`<span class="plus">＋</span>`)
    : `<span style="color:var(--sub);font-size:13px">下の素材をタップして入れよう<br>（同じ素材を2回タップ＝係数2）</span>`;
  if (!LAB_TABS.includes(recTab)) recTab = LAB_TABS[0];
  const list = RECIPES.filter(r => recCat(r) === recTab);
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">⚗️ 合成ラボ <small style="font-size:14px">${FIELD.em}${FIELD.name}</small></h2>
    <div class="flask">${slotHTML}</div>
    <div style="display:flex;gap:8px"><button class="btn" id="mix" ${Object.keys(slot).length ? "" : "disabled style='opacity:.5'"}>合成する！</button><button class="btn sub" id="clr" style="flex:none;width:96px;white-space:nowrap">クリア</button></div>
    <div id="lmsg" class="lmsg">${msg}</div>
    <div class="sec">もっている素材・物質 <small>（長押しで解説）</small></div>
    ${owned.length ? `<div class="stk">${owned.map(k => itemCard(k, p.inv[k] - (slot[k] || 0), `data-k="${k}" role="button"`)).join("")}</div>` : `<div class="empty">素材がありません。ガチャやクイズで集めよう</div>`}
    <div class="sec">レシピ帳　${found}/${RECIPES.length}</div>
    <div class="tabs">${LAB_TABS.map(t => `<button data-rt="${t}" class="${recTab === t ? "on" : ""}">${t} ${RECIPES.filter(r => recCat(r) === t && p.recipes[r.id]).length}/${RECIPES.filter(r => recCat(r) === t).length}</button>`).join("")}</div>
    <div class="recipes">${list.map(r => p.recipes[r.id]
      ? `<button class="rc ok ${canMake(p, r) ? "" : "short"}" data-r="${r.id}">${eqHTML(r)}<div>${condIcons(r)}</div><small>${canMake(p, r) ? "▶ タップで材料をセット" : "材料が足りない"}</small></button>`
      : p.hints && p.hints[r.id]
      ? `<button class="rc hinted ${canMake(p, r) ? "" : "short"}" data-r="${r.id}">${sideHTML(r.inp)} → ${outNames(r)}<div>${condIcons(r)}</div><small>💡 ${r.hint}　${canMake(p, r) ? "▶ タップで材料をセット" : "材料が足りない"}</small></button>`
      : `<div class="rc">${Object.keys(r.inp).map(() => "？").join(" ＋ ")} → ${outNames(r)}<small>💡 ${r.hint}（材料${Object.keys(r.inp).length}種類）</small>
          <button class="hbtn" data-h="${r.id}">🔍 材料と係数を見る（🪙${HINT_COST}）</button></div>`).join("")}</div>
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
  stage.querySelectorAll(".hbtn").forEach(b => b.onclick = () => buyHint(RECIPES.find(x => x.id === b.dataset.h)));
  $("clr").onclick = () => { slot = {}; lab(); };
  $("bk").onclick = () => { slot = {}; menu(); }; $("gc").onclick = () => { slot = {}; gacha(); };
  $("mix").onclick = mix;
}
const HINT_COST = 50;
const outNames = r => Object.keys(r.out).filter(k => !ITEM[k].mat || Object.keys(r.out).length === 1).map(k => ITEM[k].nm).join(" ＋ ");
// ヒント：コイン50で、未発見レシピの材料と係数を見せる（ほぼ答え）
function buyHint(r) {
  const p = P(), ok = p.coins >= HINT_COST;
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="box"><div style="font-size:40px">🔍</div>
    <div style="font-weight:900">「${outNames(r)}」の材料と係数を見る？</div>
    <div style="font-size:13px;color:var(--sub);margin-top:4px">🪙${HINT_COST} 使います（所持 🪙${p.coins}）</div>
    ${ok ? `<button class="btn" id="hOk">見る（🪙${HINT_COST}）</button>` : `<div class="lmsg">コインが足りません。クイズで集めよう</div>`}
    <button class="btn sub" id="hNo">やめる</button></div>`;
  document.body.appendChild(m);
  m.querySelector("#hNo").onclick = () => m.remove();
  if (ok) m.querySelector("#hOk").onclick = () => {
    p.coins -= HINT_COST; p.hints = p.hints || {}; p.hints[r.id] = today(); p.hintUsed = (p.hintUsed || 0) + 1;
    const b = autoBadges(); saveS(); m.remove(); bell([880, 1175]); lab(`🔍 ヒント：${sideHTML(r.inp)} → ${outNames(r)}`); badgeToast(b);
  };
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
  p.crafts = (p.crafts || 0) + 1; if (first && !(p.hints && p.hints[r.id])) p.selfFound = (p.selfFound || 0) + 1;
  if (first) { p.coins += 50; p.earned += 50; }
  const ids = ["craft1"]; if (PROD.filter(x => p.made[x.k]).length >= 10) ids.push("craft10");
  if (RECIPES.every(x => p.recipes[x.id])) ids.push("craftAll");
  if (FIELDS.every(f => f.RECIPES.every(x => p.recipes[x.id]))) ids.push("compAll");
  LAB_BADGES.forEach(b => { if (b.test(p, r)) ids.push(b.id); });
  const b = [...unlock(ids), ...autoBadges()]; saveS(); slot = {};
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

// ================= マイページ（バッジ・図鑑） =================
function mypage(tab = "badge") {
  run++; $("hdr").style.display = "none";
  const p = P(); ensureInv(p);
  const bn = Object.keys(p.badges).length;
  const book = c => PROD.filter(x => x.cat === c), cnt = c => book(c).filter(x => p.made[x.k]).length;
  stage.innerHTML = `<div class="panel">
    <h2 class="pop">${esc(S.cur)} のコレクション <small style="font-size:14px">${FIELD.em}${FIELD.name}</small></h2>
    <div class="tabs"><button data-t="badge" class="${tab === "badge" ? "on" : ""}">バッジ ${bn}/${BADGES.length}</button>
      ${LAB_TABS.map(t => `<button data-t="${t}" class="${tab === t ? "on" : ""}">${t} ${cnt(t)}/${book(t).length}</button>`).join("")}
      <button data-t="mat" class="${tab === "mat" ? "on" : ""}">素材</button></div>
    ${tab === "badge" ? [...new Set(BADGES.map(b => b.cat))].map(c => { const L = BADGES.filter(b => b.cat === c);
        return `<div class="sec">${c}　${L.filter(b => p.badges[b.id]).length}/${L.length}</div><div class="bgs">${L.map(b => `<div class="bg ${p.badges[b.id] ? "" : "lock"}"><span class="e">${b.e}</span>${b.nm}<br><span style="font-weight:500;color:var(--sub)">${b.tx}</span></div>`).join("")}</div>`; }).join("")
      : tab === "mat" ? `<div class="stk">${POOL.map(x => itemCard(x.k, p.inv[x.k] || 0, `data-d="${x.k}" role="button"`)).join("")}</div>`
      : `<div class="stk">${book(tab).map(x => p.made[x.k] ? itemCard(x.k, null, `data-d="${x.k}" role="button"`) : `<div class="st no">?</div>`).join("")}</div>`}
    ${tab !== "badge" ? `<div style="font-size:11px;color:var(--sub);margin-top:6px">カードをタップすると解説が見られます</div>` : ""}
    <div style="display:flex;gap:8px;margin-top:6px"><button class="btn sub" id="sw" style="font-size:13px">プレイヤー切替</button><button class="btn sub" id="bk">メニューへ</button></div></div>`;
  stage.querySelectorAll(".tabs button").forEach(b => b.onclick = () => mypage(b.dataset.t));
  stage.querySelectorAll("[data-d]").forEach(c => c.onclick = () => showDetail(c.dataset.d));
  $("bk").onclick = menu; $("sw").onclick = () => { S.cur = null; saveS(); nameEntry(); };
}
