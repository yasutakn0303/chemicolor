#!/usr/bin/env node
// 合成ラボのレシピ検査：①両辺の原子の数が一致するか ②材料・生成物が登録されているか
// ③作れない物質がないか ④同じ材料の組み合わせが重複していないか
//   使い方: node tools/check_recipes.js            （src/data/*-lab.js をすべて検査）
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "src");
const core = fs.readFileSync(path.join(SRC, "engine/lab-core.js"), "utf8").split("// --- ガチャ設定")[0];

function parse(fm) {
  let f = fm.replace(/<\/?su[bp]>/g, "").replace(/\[/g, "(").replace(/\]/g, ")").replace(/\(-/g, "(").replace(/-\)/g, ")").replace(/[-=]/g, "");
  const total = {};
  for (let part of f.split("·")) {
    let k = 1; const m = part.match(/^(\d+)([A-Z(].*)$/); if (m) { k = +m[1]; part = m[2]; }
    let i = 0;
    const grp = () => { const c = {};
      while (i < part.length && part[i] !== ")") {
        let sub;
        if (part[i] === "(") { i++; sub = grp(); i++; }
        else { const e = part.slice(i).match(/^[A-Z][a-z]?/); if (!e) throw new Error(`解析できない化学式: ${fm}`); i += e[0].length; sub = {[e[0]]: 1}; }
        const n = part.slice(i).match(/^\d+|^n/); let x = 1; if (n) { i += n[0].length; x = n[0] === "n" ? 5 : +n[0]; } // (…)n は5量体として扱う
        for (const [e, v] of Object.entries(sub)) c[e] = (c[e] || 0) + v * x;
      } return c; };
    for (const [e, v] of Object.entries(grp())) total[e] = (total[e] || 0) + v * k;
  }
  return total;
}

let failed = 0;
for (const file of fs.readdirSync(path.join(SRC, "data")).filter(f => f.endsWith("-lab.js"))) {
  const src = fs.readFileSync(path.join(SRC, "data", file), "utf8") + "\n" + core;
  const ctx = {}; new Function("ctx", src.replace(/^const /gm, "var ") + "\nctx.R = RECIPES; ctx.I = ITEM; ctx.P = PROD;")(ctx);
  const errs = [];
  for (const r of ctx.R) {
    const t = {};
    for (const [side, sg] of [[r.inp, 1], [r.out, -1]]) for (const [k, n] of Object.entries(side)) {
      if (!ctx.I[k]) { errs.push(`${r.id}: 未登録の物質 ${k}`); continue; }
      for (const [e, v] of Object.entries(parse(ctx.I[k].fm))) t[e] = (t[e] || 0) + sg * n * v;
    }
    const nz = Object.entries(t).filter(([, v]) => v);
    if (nz.length) errs.push(`${r.id}（${r.hint}）: 原子の数が合わない ${JSON.stringify(nz)}`);
  }
  const outs = new Set(ctx.R.flatMap(r => Object.keys(r.out)));
  ctx.P.filter(p => !outs.has(p.k)).forEach(p => errs.push(`作れない物質: ${p.nm}`));
  const bags = ctx.R.map(r => JSON.stringify(Object.entries(r.inp).sort()));
  bags.forEach((b, i) => { if (bags.indexOf(b) !== i) errs.push(`材料の組み合わせが重複: ${ctx.R[i].id}`); });
  console.log(`${errs.length ? "✘" : "✔"} ${file}: レシピ ${ctx.R.length}・物質 ${Object.keys(ctx.I).length}`);
  errs.forEach(e => console.log("   " + e)); failed += errs.length;
}
process.exit(failed ? 1 : 0);
