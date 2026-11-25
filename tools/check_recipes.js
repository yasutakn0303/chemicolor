#!/usr/bin/env node
// 合成ラボのレシピ検査：①両辺の原子の数が一致するか ②材料・生成物が登録されているか
// ③作れない物質がないか ④同じ材料の組み合わせが重複していないか
//   使い方: node tools/check_recipes.js            （src/data/*-lab.js をすべて検査）
// 高分子のように、ほかの分野の素材を使うファイルもあるので、物質は全ファイルから探す（自分のファイルの定義を優先）。
const fs = require("fs"), path = require("path");
const DATA = path.join(__dirname, "..", "src", "data");

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

// 各ファイルを読み込む（const は var にして1つの関数の中で評価する）
const files = fs.readdirSync(DATA).filter(f => f.endsWith("-lab.js"));
const labs = files.map(file => {
  const ctx = {}; const src = fs.readFileSync(path.join(DATA, file), "utf8");
  new Function("ctx", "const recCat = () => '';\n" + src.replace(/^const /gm, "var ") + "\nctx.M = MATS; ctx.P = PROD; ctx.R = RECIPES;")(ctx);
  return {file, ...ctx};
});
const ALL = {};
labs.forEach(l => [...l.M, ...l.P].forEach(x => { if (!ALL[x.k]) ALL[x.k] = x; }));

let failed = 0;
for (const l of labs) {
  const own = Object.fromEntries([...l.M, ...l.P].map(x => [x.k, x])), item = k => own[k] || ALL[k];
  const errs = [];
  for (const r of l.R) {
    const t = {};
    for (const [side, sg] of [[r.inp, 1], [r.out, -1]]) for (const [k, n] of Object.entries(side)) {
      if (!item(k)) { errs.push(`${r.id}: 未登録の物質 ${k}`); continue; }
      for (const [e, v] of Object.entries(parse(item(k).fm))) t[e] = (t[e] || 0) + sg * n * v;
    }
    const nz = Object.entries(t).filter(([, v]) => v);
    if (nz.length) errs.push(`${r.id}（${r.hint}）: 原子の数が合わない ${JSON.stringify(nz)}`);
  }
  const outs = new Set(l.R.flatMap(r => Object.keys(r.out)));
  l.P.filter(p => !outs.has(p.k)).forEach(p => errs.push(`作れない物質: ${p.nm}`));
  const bags = l.R.map(r => JSON.stringify(Object.entries(r.inp).sort()));
  bags.forEach((b, i) => { if (bags.indexOf(b) !== i) errs.push(`材料の組み合わせが重複: ${l.R[i].id}`); });
  // 同じキーなのに化学式がちがう（別の物質を同じキーで登録してしまった）
  [...l.M, ...l.P].forEach(x => { const a = ALL[x.k]; if (a && JSON.stringify(parse(a.fm)) !== JSON.stringify(parse(x.fm))) errs.push(`キー ${x.k} の化学式がファイルごとにちがう`); });
  console.log(`${errs.length ? "✘" : "✔"} ${l.file}: レシピ ${l.R.length}・物質 ${new Set([...l.M, ...l.P].map(x => x.k)).size}`);
  errs.forEach(e => console.log("   " + e)); failed += errs.length;
}
process.exit(failed ? 1 : 0);
