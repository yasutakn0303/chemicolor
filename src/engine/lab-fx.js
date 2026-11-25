// ================= 合成の演出（反応の条件ごとに変える） =================
// レシピのヒント文・物質の状態（気体・液体・固体・水溶液）・レシピの条件タグ（cond）から、
// 「容器」と「効果」を決めて組み合わせる。
//   容器：beaker（液体・水溶液）／ tube（固体を試験管で加熱）／ mortar（固体をすりまぜる）／ jar（気体どうし）
//         burn（集気びんの中で燃焼）／ chain（重合：ビーズがつながる）
//   効果：heat 加熱・press 高圧・cool 冷却・light 光・spark 放電・cat 触媒・fire 燃焼・boom 激しい反応
//         ppt 沈殿・gas 気体の発生・smoke 白煙・color 色の変化
// cond（レシピの4つ目）は "heat,press,cat:Fe₃O₄" のようにカンマ区切りで書く。

function sceneOf(r) {
  const h = r.hint || "", tags = new Set(), catNames = [];
  const conds = (r.cond || "").split(",").map(t => t.trim()).filter(Boolean);
  const catKeys = Object.keys(r.inp).filter(k => r.out[k]);       // 両辺にある＝触媒
  catKeys.forEach(k => { tags.add("cat"); catNames.push(ITEM[k].fm); });
  if (/触媒/.test(h)) tags.add("cat");
  const reac = Object.keys(r.inp).filter(k => !r.out[k]).map(k => ITEM[k]);
  const prods = Object.keys(r.out).filter(k => !r.inp[k]).map(k => ITEM[k]);
  const main = prods.find(x => !x.mat) || prods[0] || ITEM[Object.keys(r.out)[0]];
  if (/以下|冷や/.test(h)) tags.add("cool");
  else if (/加熱|強熱|高温|電気炉|℃|温める|融解|熱分解/.test(h)) tags.add("heat");
  if (/高圧/.test(h)) tags.add("press");
  if (/燃え|燃焼/.test(h)) tags.add("fire");
  if (/放電/.test(h)) tags.add("spark");
  else if (/光|紫外線/.test(h)) tags.add("light");
  if (/爆発|激しく/.test(h)) tags.add("boom");
  if (/白煙/.test(h)) tags.add("smoke");
  if (/沈殿|にごる/.test(h)) tags.add("ppt");
  // レシピの条件タグ（cond）：cat:名前 ／ -ppt のように「-」で打ち消し
  conds.forEach(t => t.startsWith("-") ? tags.delete(t.slice(1)) : t.startsWith("cat:") ? (tags.add("cat"), catNames.push(t.slice(4))) : tags.add(t));
  const poly = /重合|つながる/.test(h) && Object.values(r.inp).some(n => n >= 5);
  const st = new Set(reac.map(x => x.st));
  const wet = st.has("液体") || st.has("水溶液") || tags.has("aq");   // aq：水溶液中の反応（素材が固体・気体でも）
  // 生成物の気体が出る（気体どうしの反応は除く）／ 色の変化
  if (!poly && prods.some(x => x.st === "気体") && !(st.size === 1 && st.has("気体"))) tags.add("gas");
  conds.filter(t => t.startsWith("-")).forEach(t => tags.delete(t.slice(1)));   // 打ち消し（-gas など）は最後にもう一度
  const vessel = poly ? "chain" : tags.has("fire") ? "burn" : wet ? "beaker"
    : st.size === 1 && st.has("気体") ? "jar" : st.has("固体") && (tags.has("heat") || !st.has("気体")) ? (tags.has("heat") ? "tube" : "mortar") : "jar";
  return {tags, catNames: [...new Set(catNames)], vessel, main, prods, reac, poly};
}

const COND_LABEL = {heat:"🔥 加熱", press:"🔩 高圧", cool:"❄️ 冷却", light:"💡 光", spark:"⚡ 放電", cat:"⚗️ 触媒", fire:"🔥 燃焼", boom:"💥 激しい"};
function condIcons(r) {
  const sc = sceneOf(r);
  return ["fire", "heat", "press", "cool", "light", "spark", "cat"].filter(t => sc.tags.has(t) && !(t === "heat" && sc.tags.has("fire")))
    .map(t => `<span class="cnd">${COND_LABEL[t]}${t === "cat" && sc.catNames.length ? ` ${sc.catNames.join("・")}` : ""}</span>`).join("") + (sc.poly ? `<span class="cnd">🔗 重合</span>` : "");
}

const colOf = it => !it || it.c === "無色" ? "#cfe6ff" : it.c === "白" ? "#f4f6fb" : HEX[it.c] || "#cfe6ff";
function sceneSVG(sc) {
  const T = sc.tags, pc = colOf(sc.main), start = T.has("cat") || sc.vessel === "chain" ? "#e6f0ff" : "#b9c6dc";
  const bubbles = n => Array.from({length: n}, (_, i) => `<circle class="bb" cx="${70 + (i * 13) % 60}" cy="168" r="${2 + i % 3}" fill="#fff" style="animation-delay:${i * .15}s"/>`).join("");
  const ppt = Array.from({length: 22}, (_, i) => `<circle class="pp" cx="${64 + (i * 11) % 72}" cy="${120 + (i * 7) % 22}" r="${3.5 + i % 3}" fill="${pc}" stroke="#0003" style="animation-delay:${.05 + (i % 6) * .1}s"/>`).join("")
    + `<rect class="sed" x="58" y="166" width="84" height="16" fill="${pc}"/>`;
  const gasUp = Array.from({length: 6}, (_, i) => `<circle class="gu" cx="${82 + i * 7}" cy="70" r="${5 + i % 3}" fill="${T.has("smoke") ? "#fff" : pc}" opacity=".7" style="animation-delay:${i * .2}s"/>`).join("");
  let v = "";
  if (sc.vessel === "beaker") v = `
    <defs><clipPath id="vc"><path d="M58 60 V170 Q58 180 68 180 H132 Q142 180 142 170 V60 Z"/></clipPath></defs>
    <g clip-path="url(#vc)"><rect id="liq" x="50" y="112" width="100" height="80" fill="${start}"/>${T.has("ppt") ? `<g class="ppts">${ppt}</g>` : ""}<g class="bub">${bubbles(9)}</g></g>
    <path d="M54 56 H146 M58 56 V170 Q58 180 68 180 H132 Q142 180 142 170 V56" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`;
  else if (sc.vessel === "tube") v = `
    <g transform="rotate(-25 100 120)"><defs><clipPath id="vc"><path d="M88 40 V160 A12 12 0 0 0 112 160 V40 Z"/></clipPath></defs>
    <g clip-path="url(#vc)"><rect id="liq" x="80" y="140" width="40" height="40" fill="${start}"/></g>
    <path d="M88 36 V160 A12 12 0 0 0 112 160 V36" fill="none" stroke="#fff" stroke-width="5"/><rect x="84" y="30" width="32" height="8" rx="3" fill="#fff"/></g>`;
  else if (sc.vessel === "mortar") v = `
    <path d="M44 120 Q100 210 156 120 Z" fill="#f4f6fb" stroke="#fff" stroke-width="5"/>
    <ellipse id="liqE" cx="100" cy="132" rx="40" ry="8" fill="${start}"/>
    <g class="pestle"><rect x="112" y="60" width="14" height="80" rx="7" fill="#e6ecf5" stroke="#fff" stroke-width="3" transform="rotate(25 119 100)"/></g>`;
  else if (sc.vessel === "jar") v = `
    <path d="M86 40 H114 V78 A44 44 0 1 1 86 78 Z" fill="#ffffff18" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    <g class="cloud">${[0, 1, 2, 3, 4].map(i => `<circle cx="${82 + (i * 11) % 40}" cy="${118 + (i * 9) % 26}" r="${14 + i % 3 * 3}" fill="${start}" opacity=".55"/>`).join("")}</g>
    <circle id="gasC" cx="100" cy="122" r="0" fill="${pc}" opacity=".7"/>
    <rect x="82" y="32" width="36" height="10" rx="3" fill="#fff"/>`;
  else if (sc.vessel === "burn") v = `
    <path d="M60 50 H140 V172 Q140 182 130 182 H70 Q60 182 60 172 Z" fill="#ffffff14" stroke="#fff" stroke-width="5"/>
    <path d="M100 20 V120 M88 120 H112" stroke="#c9d6ea" stroke-width="4"/><rect x="74" y="44" width="52" height="8" rx="3" fill="#fff"/>
    <g class="fireS"><path d="M100 86 C112 100 114 112 100 122 C86 112 88 100 100 86Z" fill="#ffc93c"/><path d="M100 98 C106 106 106 114 100 120 C94 114 94 106 100 98Z" fill="#fff"/></g>`;
  else if (sc.vessel === "chain") v = `<g class="chain"><path class="link" d="M30 110 H170" stroke="#ffc93c" stroke-width="7" stroke-linecap="round"/>${Array.from({length: 6}, (_, i) => `<g class="bead" style="--i:${i}"><circle cx="${30 + i * 28}" cy="110" r="11" fill="#fff" stroke="${pc === "#cfe6ff" ? "#3d7cff" : "#3d7cff"}" stroke-width="4"/></g>`).join("")}
    </g>`;
  const fx = [
    T.has("heat") && sc.vessel !== "burn" ? `<g class="burner"><rect x="84" y="196" width="32" height="18" rx="4" fill="#c9d6ea"/><path class="flm" d="M100 168 C110 180 110 190 100 196 C90 190 90 180 100 168Z" fill="#3d7cff"/><path class="flm" d="M100 178 C104 184 104 190 100 194 C96 190 96 184 100 178Z" fill="#9cc6ff"/></g>` : "",
    T.has("cool") ? `<g class="ice"><rect x="30" y="160" width="20" height="20" rx="4" fill="#d9ecff" stroke="#fff"/><rect x="150" y="164" width="18" height="18" rx="4" fill="#d9ecff" stroke="#fff"/><text x="100" y="212" text-anchor="middle" font-size="18">❄️</text></g>` : "",
    T.has("light") ? `<g class="lamp"><circle cx="34" cy="34" r="14" fill="#ffe28a"/><path class="ray" d="M48 44 L72 66 M40 52 L54 80 M54 36 L84 48" stroke="#ffe28a" stroke-width="4" stroke-linecap="round"/></g>` : "",
    T.has("spark") ? `<g class="spark"><path d="M70 100 L92 112 L84 120 L108 132 L100 140 L126 150" fill="none" stroke="#fff6a8" stroke-width="4" stroke-linejoin="round"/></g>` : "",
    T.has("press") ? `<g class="gauge"><circle cx="166" cy="40" r="18" fill="#fff" stroke="#22314f" stroke-width="3"/><path class="ndl" d="M166 40 L176 30" stroke="#ff6b5b" stroke-width="3" stroke-linecap="round"/><text x="166" y="72" text-anchor="middle" font-size="11" fill="#fff" font-weight="900">高圧</text></g>` : "",
    T.has("cat") ? `<g class="catg"><circle cx="170" cy="120" r="21" fill="#18b6a4" stroke="#fff" stroke-width="3"/><text x="170" y="125" text-anchor="middle" font-size="13" fill="#fff" font-weight="900">触媒</text><path d="M150 120 H142" stroke="#8ff5e4" stroke-width="3" stroke-dasharray="3 3"/></g>` : "",
    T.has("gas") || T.has("smoke") ? `<g class="gasup">${gasUp}</g>` : "",
  ].join("");
  return `<svg class="flaskfx sc-${sc.vessel}" viewBox="0 0 200 220" width="270" height="297" style="max-height:40vh">${v}${fx}</svg>`;
}

async function mixFx(r, used, first) {
  const sc = sceneOf(r), T = sc.tags;
  const fx = document.createElement("div"); fx.className = "fx" + (first ? " gold" : "");
  const chips = Object.keys(COND_LABEL).filter(t => T.has(t)).map(t => `<span>${COND_LABEL[t]}${t === "cat" && sc.catNames.length ? ` ${sc.catNames.join("・")}` : ""}</span>`).join("");
  fx.innerHTML = `
    <div class="ings">${Object.entries(used).map(([k, n], i) => `<div class="ing" style="--i:${i}">${n > 1 ? `<b>${n}</b>` : ""}${itemCard(k)}</div>`).join("")}</div>
    ${chips ? `<div class="conds">${chips}</div>` : ""}
    ${sceneSVG(sc)}
    <div class="fxt" id="fxt">まぜまぜ…</div><div class="fx-skip">タップでスキップ</div>`;
  document.body.appendChild(fx);
  let skip = false; fx.onclick = () => skip = true;
  const wait = async ms => { const t = performance.now(); while (!skip && performance.now() - t < ms) await sleep(30); };
  const say = t => { const e = $("fxt"); if (e) e.innerHTML = t; };
  await wait(150); fx.classList.add("drop"); bell([660, 880], .08, .04);                  // 材料が容器へ
  await wait(650);
  // 反応の条件（はじめの演出）
  fx.classList.add("on");
  say(T.has("boom") ? "💥 激しく反応！" : T.has("fire") ? "🔥 燃焼！" : T.has("spark") ? "⚡ 放電！" : T.has("light") ? "💡 光を当てると…"
    : T.has("heat") && T.has("press") ? "🔥 高温・高圧で…" : T.has("heat") ? "🔥 加熱中…" : T.has("cool") ? "❄️ 冷やしながら…"
    : sc.poly ? "🔗 単量体がつながっていく…" : T.has("cat") ? `⚗️ 触媒${sc.catNames.length ? ` ${sc.catNames.join("・")}` : ""} がはたらく…` : "まぜまぜ…");
  bell(T.has("boom") || T.has("fire") ? [196, 247, 294, 392] : T.has("spark") ? [1568, 1046, 1568] : [392, 440, 494, 523, 587], .08, .035);
  if (T.has("boom")) fx.classList.add("shake");
  await wait(first ? 1100 : 750);
  // 変化（色・沈殿・気体・重合）
  fx.classList.add("react");
  const liq = $("liq"), liqE = $("liqE"), gasC = $("gasC");
  const pc = colOf(sc.main);
  if (liq) liq.style.fill = T.has("ppt") ? "#dfeaf8" : pc; if (liqE) liqE.style.fill = pc;
  if (gasC) gasC.setAttribute("r", "34");
  say(sc.poly ? "⛓️ 高分子ができた！" : T.has("ppt") ? "⬇️ 沈殿ができた！" : T.has("smoke") ? "💨 白煙が出た！" : T.has("gas") ? "🫧 気体が発生！"
    : sc.main && !["無色", "白"].includes(sc.main.c) ? `🎨 ${sc.main.c}色の物質ができた！` : first ? "反応が…はじまった！" : "反応した！");
  await wait(first ? 1100 : 800);
  if (T.has("cat")) { say("⚗️ 触媒は反応の前後で変化しない"); await wait(700); }
  fx.insertAdjacentHTML("beforeend", `<div class="flashw"></div>`); bell(first ? [1046, 1318, 1568, 2093, 2637] : [1046, 1318, 1568], .07);
  await sleep(260); burst(fx.querySelector(".flaskfx"));
  if (first) for (let i = 1; i < 3; i++) setTimeout(() => burst(fx.querySelector(".flaskfx")), i * 220);
  await sleep(first ? 500 : 250); fx.remove();
}
