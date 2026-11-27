// ================= 遊べる時間のチェック（src/data/schedule.js の PLAYTIME を使う） =================
// 時刻は配信元（GitHub Pages）の時計を使う（iPad の時計を変えてもすり抜けられないように）。
// 取れないとき（電波がない・ファイルを直接開いたとき）は iPad の時計を使う。
const PT = {offset: 0, ready: false, waiting: null};
const WD = "日月火水木金土";
async function syncTime() {
  try {
    if (!/^https?:/.test(location.protocol)) throw 0;
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 3000), t0 = Date.now();
    const r = await fetch(location.href.split("#")[0], {method: "HEAD", cache: "no-store", signal: ac.signal});
    clearTimeout(t);
    const d = Date.parse(r.headers.get("Date"));
    if (!isNaN(d)) PT.offset = d - (t0 + Date.now()) / 2;
  } catch (e) {}
  PT.ready = true;
  if (PT.waiting) { const f = PT.waiting; PT.waiting = null; f(); }
}
// 日本時間の「曜日・日付・分」
function jstNow() {
  const j = new Date(Date.now() + PT.offset + 9 * 3600e3);
  return {wd: j.getUTCDay(), min: j.getUTCHours() * 60 + j.getUTCMinutes(),
    date: `${j.getUTCFullYear()}-${String(j.getUTCMonth() + 1).padStart(2, "0")}-${String(j.getUTCDate()).padStart(2, "0")}`, ms: j.getTime()};
}
const hm = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const hmText = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
const dayOK = (days, wd) => days === "毎日" || (days === "平日" && wd >= 1 && wd <= 5) || (days === "土日" && (wd === 0 || wd === 6)) || days.includes(WD[wd]);
// その日の遊べる時間帯（[開始分, 終了分] の配列）
function windowsOf(wd, date) {
  if ((PLAYTIME.off || []).includes(date)) return [];
  return [...PLAYTIME.weekly.filter(w => dayOK(w.days, wd)), ...(PLAYTIME.extra || []).filter(w => w.date === date)]
    .map(w => [hm(w.from), hm(w.to)]).sort((a, b) => a[0] - b[0]);
}
// 今遊べるか。遊べるときは残り時間（分）、遊べないときは次に遊べる日時
function playStatus() {
  if (!PLAYTIME.enabled) return {ok: true};
  const n = jstNow(), now = windowsOf(n.wd, n.date).find(([a, b]) => n.min >= a && n.min < b);
  if (now) return {ok: true, left: now[1] - n.min, until: now[1]};
  for (let k = 0; k < 8; k++) {
    const d = new Date(n.ms + k * 864e5), wd = d.getUTCDay();
    const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const w = windowsOf(wd, date).find(([a]) => k > 0 || a > n.min);
    if (w) return {ok: false, next: `${k === 0 ? "今日" : k === 1 ? "明日" : WD[wd] + "曜"} ${hmText(w[0])}`};
  }
  return {ok: false, next: ""};
}
// 時間割の文（メニュー・ロック画面に出す）
// 毎週の時間に加えて、これからの特定の日（extra）も出す
const hmS = t => t.replace(/^0/, "");
const scheduleText = () => {
  const n = jstNow();   // 終わった日・時間は出さない
  const ex = (PLAYTIME.extra || []).filter(w => w.date > n.date || w.date === n.date && hm(w.to) > n.min).map(w => { const [y, m, d] = w.date.split("-").map(Number);
    return `${m}/${d}(${WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}) ${hmS(w.from)}〜${hmS(w.to)}`; });
  const wk = PLAYTIME.weekly.map(w => `${w.days === "毎日" || w.days.length > 1 && /日$|平日/.test(w.days) ? w.days : w.days + "曜"} ${hmS(w.from)}〜${hmS(w.to)}`);
  return [...wk, ...ex].join("　／　");
};
function playBadge() {
  if (!PLAYTIME.enabled) return "";
  const s = playStatus();
  return `<div class="ptime">⏰ 遊べる時間：${scheduleText()}${s.ok && s.left != null ? `<b>あと ${s.left >= 60 ? `${Math.floor(s.left / 60)}時間${s.left % 60}分` : `${s.left}分`}（${hmText(s.until)} まで）</b>` : ""}</div>`;
}
// 遊べない時間なら「お休み画面」を出して true を返す（メニュー・単元・ガチャ・ラボの入口で呼ぶ）
function playLocked() {
  if (!PLAYTIME.enabled) return false;
  if (!PT.ready) { PT.waiting = () => menu(); showLock(null); return true; }
  const s = playStatus();
  if (s.ok) return false;
  showLock(s); return true;
}
function showLock(s) {
  run++; $("hdr").style.display = "none"; $("tint").style.opacity = 0;
  stage.innerHTML = s ? `<div class="result" style="text-align:center">
      <div style="font-size:54px">🌙</div>
      <h2 class="pop">今は遊べない時間です</h2>
      ${s.next ? `<div class="title-b">次は <b>${s.next}</b> から</div>` : `<div class="title-b">次に遊べる日は、先生からのお知らせを待ってね</div>`}
      ${scheduleText() ? `<div class="ptime" style="margin-top:8px">⏰ 遊べる時間<br>${scheduleText().replace(/　／　/g, "<br>")}</div>` : ""}
      <div style="font-size:12px;color:var(--sub);margin-top:10px">記録はこの端末に残っています。時間になったら、また遊ぼう！</div>
      <button class="btn sub" id="ptRe">もう一度たしかめる</button></div>`
    : `<div class="result" style="text-align:center"><div style="font-size:40px">⏳</div><h2>時刻を確認しています…</h2></div>`;
  if (s) $("ptRe").onclick = () => { PT.ready = false; PT.waiting = () => menu(); syncTime(); showLock(null); };
}
// 開いたままの画面にもどってきたとき・10分ごとに時刻を取りなおす
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncTime(); });
setInterval(syncTime, 10 * 60e3);
syncTime();
