// ================= 共通：色・ユーティリティ（全版で共有） =================
// ================= 色データ =================
const HEX = {"白":"#ffffff","無色":null,"黒":"#2b2b33","黒紫":"#3a2550","褐":"#7b4a2e","赤褐":"#a6432b","黄褐":"#c8952e",
 "赤":"#e8394a","橙赤":"#ff6a3d","紅":"#d81b5a","赤橙":"#f0662a","淡桃":"#f7c4d6","黄":"#ffd23f","淡黄":"#fff1a6",
 "緑":"#2fae5a","淡緑":"#bfe6b4","黄緑":"#b4d94a","緑白":"#dfeedb","青緑":"#19b3a6","青":"#3b82f6","淡青":"#bfe1ff",
 "青白":"#cfe2f5","深青":"#1f3fae","紫":"#8b4fd8","赤紫":"#b2338c","青紫":"#5f52cc"};
const FAM = {white:["白","無色","銀白"],black:["黒","黒紫"],brown:["褐","赤褐","黄褐"],red:["赤","橙赤","紅","赤橙"],pink:["淡桃"],
 yellow:["黄","淡黄"],green:["緑","淡緑","黄緑","緑白","青緑"],blue:["青","淡青","青白","深青"],purple:["紫","赤紫","青紫"]};
const famOf = c => Object.keys(FAM).find(k => FAM[k].includes(c));
const SIMPLE = ["白","黒","赤","黄","緑","青","紫"];
const fx = (b, sub, sup) => `${b}<span class="ss"><sup>${sup}</sup><sub>${sub}</sub></span>`;

Object.assign(HEX, {"銀白":"#dfe3ea", "赤銅":"#c4683c", "灰":"#9aa0a8", "銀":"#c9ced8", "橙黄":"#ffa62b"});
FAM.gray = ["銀","灰"]; FAM.yellow.push("橙黄");
const keyOf = q => q.ans || q.c;
function buildQ(ch) {
  if (ch.swipe) {
    const boss = pickOne(ch.q.filter(x => x.boss)), gs = new Set([boss.g]);  // ボスは候補から毎回ランダム
    const rest = ch.q.filter(x => x !== boss && !(x.g && x.g === boss.g));
    const pick = (d, n) => {
      let g = shuffle(rest.filter(x => x.d === d));
      if (ch.swipe.balance) {
        // 答えが偏らないように、答えごとに交互に並べる
        const by = {}; g.forEach(x => (by[x.ans] = by[x.ans] || []).push(x));
        const keys = shuffle(Object.keys(by)), out = [];
        for (let i = 0; out.length < g.length; i++) keys.forEach(k => { if (by[k][i]) out.push(by[k][i]); });
        g = out;
      }
      // 同じ話題（g）の問題は1回に1問まで
      const out = [];
      for (const x of g) { if (out.length >= n) break; if (x.g && gs.has(x.g)) continue; if (x.g) gs.add(x.g); out.push(x); }
      return out;
    };
    // 話題の重複チェックは難易度の順をランダムにして行う（いつも Lv.1 の問題が優先されないように）
    const got = {}; shuffle([[1, 4], [2, 3], [3, 2]]).forEach(([d, n]) => got[d] = pick(d, n));
    return [...shuffle(got[1]), ...shuffle(got[2]), ...shuffle(got[3]), boss];
  }
  return null;
}

const pickOne = a => a[Math.random() * a.length | 0];

// ================= 共通テストのカウントダウン（毎年自動で更新） =================
// 共通テスト本試験は「1月13日以降の最初の土曜日・日曜日」（2021〜2027年度すべてこの規則どおり）。
// 公式発表と違う年があれば KYOTSU_FIXED に「年: [月-1, 日]」を足せば上書きできる。
const KYOTSU_FIXED = {2027: [0, 16]};   // 2027年度：2027年1月16日(土)・17日(日)（大学入試センター発表）
function kyotsuDay1(y) {
  if (KYOTSU_FIXED[y]) return new Date(y, ...KYOTSU_FIXED[y]);
  const d = new Date(y, 0, 13); while (d.getDay() !== 6) d.setDate(d.getDate() + 1); return d;
}
function nextKyotsu() {
  const t = new Date(new Date().toDateString());
  for (let y = t.getFullYear(); ; y++) { const d1 = kyotsuDay1(y), d2 = new Date(d1); d2.setDate(d1.getDate() + 1); if (d2 >= t) return d1; }
}
const daysToKyotsu = () => Math.round((nextKyotsu() - new Date(new Date().toDateString())) / 864e5);
function kyotsuBadge() {
  const n = daysToKyotsu(), d = nextKyotsu();
  return n > 0 ? `共通テスト（${d.getMonth() + 1}/${d.getDate()}）まで あと<b>${n}</b>日` : "今日は共通テスト！ がんばれ！";
}
