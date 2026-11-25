// ================= ケミカラ 無機版：クイズデータ =================
const APP = {logo:"ケミカラ！", sub:"無機の色クイズ", tag:"無機の定番カラーをまとめてマスター！", saveKey:"chemicolor-rank-v1"};
// ================= 単元データ =================
const CH = [
 {id:"subst", no:"♯1", title:"頻出物質の色", rpg:"頻出物質の洞窟", em:"🧪", kind:"solid", prompt:"何色？", prompts:["何色？","この物質の色は？","見た目は何色？","色を答えよ！"], bg:"#ffe1d6",
  allow:["白","黒","黒紫","褐","赤褐","黄褐","赤","黄","淡黄","緑","緑白","青","青白","紫"], cap:{"白":3},
  q:[
  {fm:"AgCl",nm:"塩化銀",c:"白",d:1},
  {fm:"AgBr",nm:"臭化銀",c:"淡黄",d:2,trap:"白",hint:"AgCl 白 → AgBr 淡黄 → AgI 黄"},
  {fm:"AgI",nm:"ヨウ化銀",c:"黄",d:2,trap:"淡黄",hint:"AgCl 白 → AgBr 淡黄 → AgI 黄"},
  {fm:"CuO",nm:"酸化銅(Ⅱ)",c:"黒",d:1},
  {fm:"Cu<sub>2</sub>O",nm:"酸化銅(Ⅰ)",c:"赤",d:2,trap:"黒",hint:"CuO は黒 ／ Cu₂O は赤"},
  {fm:"CuSO<sub>4</sub>·5H<sub>2</sub>O",nm:"硫酸銅(Ⅱ)五水和物",c:"青",d:1,sz:"l"},
  {fm:"CuSO<sub>4</sub>",nm:"硫酸銅(Ⅱ)無水物",c:"白",d:3,trap:"青",hint:"五水和物は青 ／ 無水物は白"},
  {fm:"Fe(OH)<sub>3</sub>",nm:"水酸化鉄(Ⅲ)",c:"赤褐",d:2,sz:"m"},
  {fm:"Fe(OH)<sub>2</sub>",nm:"水酸化鉄(Ⅱ)",c:"緑白",d:3,trap:"赤褐",hint:"Fe(OH)₃ は赤褐 ／ Fe(OH)₂ は緑白",sz:"m"},
  {fm:"Cu(OH)<sub>2</sub>",nm:"水酸化銅(Ⅱ)",c:"青白",d:2,trap:"青",sz:"m"},
  {fm:"PbCrO<sub>4</sub>",nm:"クロム酸鉛(Ⅱ)",c:"黄",d:2,sz:"m"},
  {fm:"Ag<sub>2</sub>CrO<sub>4</sub>",nm:"クロム酸銀",c:"赤褐",d:3,trap:"黄",hint:"PbCrO₄・BaCrO₄ は黄 ／ Ag₂CrO₄ は赤褐",sz:"m"},
  {fm:"BaSO<sub>4</sub>",nm:"硫酸バリウム",c:"白",d:1,sz:"m"},
  {fm:"CuS",nm:"硫化銅(Ⅱ)",c:"黒",d:1},
  {fm:"ZnS",nm:"硫化亜鉛",c:"白",d:2,trap:"黒",hint:"硫化物はほぼ黒 ／ ZnS は白・CdS は黄"},
  {fm:"CdS",nm:"硫化カドミウム",c:"黄",d:3,trap:"黒",hint:"硫化物はほぼ黒 ／ ZnS は白・CdS は黄"},
  {fm:"MnO<sub>2</sub>",nm:"酸化マンガン(Ⅳ)",c:"黒",d:1},
  {fm:"Ag<sub>2</sub>O",nm:"酸化銀",c:"褐",d:3,trap:"黒"},
  {fm:"Fe<sub>2</sub>O<sub>3</sub>",nm:"酸化鉄(Ⅲ)",c:"赤褐",d:2},
  {fm:"Fe<sub>3</sub>O<sub>4</sub>",nm:"四酸化三鉄",c:"黒",d:3,trap:"赤褐",hint:"Fe₂O₃ は赤褐 ／ Fe₃O₄ は黒"},
  {fm:"PbI<sub>2</sub>",nm:"ヨウ化鉛(Ⅱ)",c:"黄",d:2},
  {fm:"Al(OH)<sub>3</sub>",nm:"水酸化アルミニウム",c:"白",d:1,sz:"m"},
  {fm:"S",nm:"硫黄（斜方硫黄）",c:"黄",d:1},
  {fm:"I<sub>2</sub>",nm:"ヨウ素（固体）",c:"黒紫",d:2,trap:"紫"},
 ]},
 {id:"gas", no:"♯2", title:"気体・ハロゲンの色", rpg:"ハロゲンの塔", em:"💨", kind:"gas", prompt:"何色？", prompts:["何色？","この物質の色は？","色はどれ？"], bg:"#d9ecff",
  allow:["無色","黄緑","淡黄","黄","赤褐","褐","淡青","青","青紫","紫","黒紫","赤","緑"], cap:{"無色":1},
  q:[
  {fm:"Cl<sub>2</sub>",nm:"塩素",c:"黄緑",d:1},
  {fm:"NO<sub>2</sub>",nm:"二酸化窒素",c:"赤褐",d:1},
  {fm:"HCl",nm:"塩化水素",c:"無色",d:1},
  {fm:"NH<sub>3</sub>",nm:"アンモニア",c:"無色",d:1},
  {fm:"O<sub>2</sub>",nm:"酸素",c:"無色",d:1},
  {fm:"H<sub>2</sub>S",nm:"硫化水素",c:"無色",d:2},
  {fm:"SO<sub>2</sub>",nm:"二酸化硫黄",c:"無色",d:2},
  {fm:"F<sub>2</sub>",nm:"フッ素",c:"淡黄",d:2,trap:"黄緑",hint:"Cl₂ は黄緑 ／ F₂ は淡黄"},
  {fm:"O<sub>3</sub>",nm:"オゾン",c:"淡青",d:2,trap:"無色",hint:"O₂ は無色 ／ O₃ は淡青"},
  {fm:"NO",nm:"一酸化窒素",c:"無色",d:3,trap:"赤褐",hint:"NO₂ は赤褐 ／ NO は無色"},
  {fm:"Br<sub>2</sub>",nm:"臭素（蒸気）",c:"赤褐",d:3,trap:"黄緑",hint:"Cl₂ 黄緑 ／ Br₂ 赤褐 ／ I₂（気体）紫"},
  {fm:"I<sub>2</sub>",nm:"ヨウ素（気体）",c:"紫",d:3,trap:"黒紫",hint:"固体は黒紫 ／ 気体は紫"},
  {fm:"I<sub>2</sub>",nm:"ヨウ素（固体）",c:"黒紫",d:1,k:"solid"},
  {fm:"I<sub>2</sub> + デンプン",nm:"ヨウ素デンプン反応",c:"青紫",d:1,k:"ion",sz:"m"},
  {fm:"KI + I<sub>2</sub>",nm:"ヨウ素ヨウ化カリウム水溶液",c:"褐",d:2,k:"ion",trap:"紫",sz:"m"},
 ]},
 {id:"flame", no:"♯3", title:"炎色反応", rpg:"炎色の火山", em:"🔥", kind:"flame", prompt:"炎色反応は？", prompts:["炎色反応は？","炎の色は？","炎に入れると何色？"], n:7, capAll:1, bg:"#fff0c2",
  allow:["赤","橙赤","紅","黄","黄緑","緑","青緑","青","赤紫","紫"], cap:{},
  q:[
  {fm:"Li",nm:"リチウム",c:"赤",d:1},
  {fm:"Na",nm:"ナトリウム",c:"黄",d:1},
  {fm:"K",nm:"カリウム",c:"赤紫",d:2,trap:"紫"},
  {fm:"Cu",nm:"銅",c:"青緑",d:2,trap:"緑"},
  {fm:"Ba",nm:"バリウム",c:"黄緑",d:2,trap:"緑"},
  {fm:"Ca",nm:"カルシウム",c:"橙赤",d:3,trap:"赤",hint:"Li 赤 ／ Ca 橙赤 ／ Sr 紅（深赤）"},
  {fm:"Sr",nm:"ストロンチウム",c:"紅",d:3,trap:"橙赤",hint:"リアカー無きK村、動力借るとうするもくれない"},
  {fm:"LiCl",nm:"塩化リチウム水溶液",c:"赤",d:1},
  {fm:"Li<sub>2</sub>CO<sub>3</sub>",nm:"炭酸リチウム",c:"赤",d:1},
  {fm:"NaCl",nm:"塩化ナトリウム水溶液",c:"黄",d:1},
  {fm:"Na<sub>2</sub>CO<sub>3</sub>",nm:"炭酸ナトリウム",c:"黄",d:1},
  {fm:"KCl",nm:"塩化カリウム水溶液",c:"赤紫",d:2,trap:"紫"},
  {fm:"KNO<sub>3</sub>",nm:"硝酸カリウム",c:"赤紫",d:2,trap:"紫"},
  {fm:"CuSO<sub>4</sub>",nm:"硫酸銅(Ⅱ)水溶液",c:"青緑",d:2,trap:"緑"},
  {fm:"CuCl<sub>2</sub>",nm:"塩化銅(Ⅱ)水溶液",c:"青緑",d:2,trap:"緑"},
  {fm:"BaCl<sub>2</sub>",nm:"塩化バリウム水溶液",c:"黄緑",d:2,trap:"緑"},
  {fm:"CaCl<sub>2</sub>",nm:"塩化カルシウム水溶液",c:"橙赤",d:3,trap:"赤",hint:"Li 赤 ／ Ca 橙赤 ／ Sr 紅（深赤）"},
  {fm:"SrCl<sub>2</sub>",nm:"塩化ストロンチウム水溶液",c:"紅",d:3,trap:"橙赤",hint:"Li 赤 ／ Ca 橙赤 ／ Sr 紅（深赤）"},
 ]},
 {id:"ion", no:"♯4", title:"イオンの色", rpg:"イオンの湖", em:"💧", kind:"ion", prompt:"水溶液は何色？", prompts:["水溶液は何色？","水溶液の色は？","溶かすと何色？"], bg:"#d3f3ea",
  allow:["無色","青","深青","黄","淡黄","黄褐","淡緑","緑","赤橙","赤紫","淡桃","紫","赤"], cap:{"無色":1},
  q:[
  {fm:"Cu<sup>2+</sup>",nm:"銅(Ⅱ)イオン",c:"青",d:1},
  {fm:"Fe<sup>3+</sup>",nm:"鉄(Ⅲ)イオン",c:"黄褐",d:1},
  {fm:"Ni<sup>2+</sup>",nm:"ニッケル(Ⅱ)イオン",c:"緑",d:1},
  {fm:fx("CrO","4","2−"),nm:"クロム酸イオン",c:"黄",d:1},
  {fm:fx("MnO","4","−"),nm:"過マンガン酸イオン",c:"赤紫",d:1},
  {fm:"Al<sup>3+</sup>",nm:"アルミニウムイオン",c:"無色",d:1},
  {fm:fx("Cr<sub>2</sub>O","7","2−"),nm:"二クロム酸イオン",c:"赤橙",d:2,sz:"m"},
  {fm:"Fe<sup>2+</sup>",nm:"鉄(Ⅱ)イオン",c:"淡緑",d:2,trap:"黄褐",hint:"Fe³⁺ は黄褐 ／ Fe²⁺ は淡緑"},
  {fm:"[Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup>",nm:"テトラアンミン銅(Ⅱ)イオン",c:"深青",d:2,trap:"青",sz:"l"},
  {fm:"[Ag(NH<sub>3</sub>)<sub>2</sub>]<sup>+</sup>",nm:"ジアンミン銀(Ⅰ)イオン",c:"無色",d:2,sz:"l"},
  {fm:"Mn<sup>2+</sup>",nm:"マンガン(Ⅱ)イオン",c:"淡桃",d:3,trap:"赤紫",hint:"MnO₄⁻ は赤紫 ／ Mn²⁺ は淡桃"},
  {fm:"Cr<sup>3+</sup>",nm:"クロム(Ⅲ)イオン",c:"緑",d:3,trap:"赤橙",hint:"Cr₂O₇²⁻ は赤橙 ／ Cr³⁺ は緑"},
  {fm:"[Zn(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup>",nm:"テトラアンミン亜鉛(Ⅱ)イオン",c:"無色",d:3,trap:"深青",hint:"Cu のアンミン錯イオンは深青 ／ Zn は無色",sz:"l"},
  {fm:"[Fe(CN)<sub>6</sub>]<sup>4−</sup>",nm:"ヘキサシアニド鉄(Ⅱ)酸イオン",c:"淡黄",d:3,trap:"黄",hint:"[Fe(CN)₆]³⁻ は黄 ／ ⁴⁻ は淡黄",sz:"l"},
 ]},
];

// ================= ♯5 気体の捕集法 =================
const METH = {"水上置換":{col:"#3d7cff"},"上方置換":{col:"#ff8a3d"},"下方置換":{col:"#14a37a"}};
CH.push({id:"collect", no:"♯5", title:"気体の捕集法", em:"🫧", mode:"collect", prompt:"どうやって集める？", bg:"#e3ecff", cap:{},
 swipe:{title:"捕集法スワイプ", big:"捕集法", note:"捕集法を選ぶ", opts:METH,
   pick:(q, lv) => collectOpts(q, lv).sort((a, b) => Object.keys(METH).indexOf(a) - Object.keys(METH).indexOf(b)), /* 左右は固定（水上→上方→下方の順） */ badge:q => `分子量 ${q.M}`,
   chips:[["水に？", q => `水に：${q.sol}`], ["空気より？", q => `空気より：${airText(q)}`]],
   why:q => `水に${q.sol}・空気より${airText(q)}`},
 q:[
  {fm:"H<sub>2</sub>",nm:"水素",M:2,sol:"溶けにくい",gc:"無色",ans:"水上置換",d:1,at:2,desc:"無色・無臭。いちばん軽い気体。"},
  {fm:"O<sub>2</sub>",nm:"酸素",M:32,sol:"溶けにくい",gc:"無色",ans:"水上置換",d:1,at:2,desc:"無色・無臭。ものが燃えるのを助ける。"},
  {fm:"N<sub>2</sub>",nm:"窒素",M:28,sol:"溶けにくい",gc:"無色",ans:"水上置換",d:1,at:2,desc:"無色・無臭。空気の約8割をしめる。"},
  {fm:"NH<sub>3</sub>",nm:"アンモニア",M:17,sol:"非常によく溶ける",gc:"無色",ans:"上方置換",d:1,at:4,desc:"刺激臭。水溶液は塩基性。"},
  {fm:"HCl",nm:"塩化水素",M:36.5,sol:"非常によく溶ける",gc:"無色",ans:"下方置換",d:1,at:2,desc:"刺激臭。NH₃ と出会うと白煙。"},
  {fm:"CO<sub>2</sub>",nm:"二酸化炭素",M:44,sol:"少し溶ける",gc:"無色",ans:"下方置換",alt:"上方置換",d:1,at:3,desc:"無色・無臭。石灰水を白くにごらせる。",hint:"CO₂ は下方置換（水上置換で集めることもある）"},
  {fm:"CH<sub>4</sub>",nm:"メタン",M:16,sol:"溶けにくい",gc:"無色",ans:"水上置換",trap:"上方置換",d:2,at:5,desc:"無色・無臭。天然ガスの主成分。",hint:"軽くても水に溶けにくければ水上置換"},
  {fm:"CO",nm:"一酸化炭素",M:28,sol:"溶けにくい",gc:"無色",ans:"水上置換",d:2,at:2,desc:"無色・無臭。とても有毒。"},
  {fm:"NO<sub>2</sub>",nm:"二酸化窒素",M:46,sol:"よく溶ける",gc:"赤褐",ans:"下方置換",trap:"水上置換",d:2,at:3,desc:"赤褐色・刺激臭。銅と濃硝酸から発生。",hint:"NO は水上置換 ／ NO₂ は水に溶けるので下方置換"},
  {fm:"H<sub>2</sub>S",nm:"硫化水素",M:34,sol:"溶ける",gc:"無色",ans:"下方置換",d:2,at:3,desc:"無色・腐卵臭。有毒。"},
  {fm:"SO<sub>2</sub>",nm:"二酸化硫黄",M:64,sol:"よく溶ける",gc:"無色",ans:"下方置換",d:2,at:3,desc:"無色・刺激臭。還元性・漂白作用。"},
  {fm:"NO",nm:"一酸化窒素",M:30,sol:"溶けにくい",gc:"無色",ans:"水上置換",trap:"下方置換",d:3,boss:1,at:2,desc:"無色。銅と希硝酸から発生。",hint:"NO は空気中の O₂ とすぐ反応 → 水上置換しか使えない"},
  {fm:"C<sub>2</sub>H<sub>4</sub>",nm:"エチレン",M:28,sol:"溶けにくい",gc:"無色",ans:"水上置換",trap:"上方置換",d:3,at:6,desc:"無色・かすかに甘いにおい。"},
  {fm:"C<sub>2</sub>H<sub>2</sub>",nm:"アセチレン",M:26,sol:"溶けにくい",gc:"無色",ans:"水上置換",trap:"上方置換",d:3,at:4,desc:"無色。炭化カルシウムと水から発生。"},
  {fm:"Cl<sub>2</sub>",nm:"塩素",M:71,sol:"溶ける",gc:"黄緑",ans:"下方置換",trap:"水上置換",d:3,at:2,boss:1,desc:"黄緑色・刺激臭。漂白・殺菌作用。",hint:"Cl₂ は水に溶けるので下方置換"},
 ]});
function collectOpts(q, lv) {
  // 不正解の選択肢は毎回ランダム（後半ほど「ひっかけ」が出やすい）
  const others = Object.keys(METH).filter(m => m !== q.ans && m !== q.alt);
  let d;
  if (q.alt) d = Math.random() < .7 ? q.alt : others[Math.random() * others.length | 0];
  else if (lv >= 2 && q.trap && Math.random() < .7) d = q.trap;
  else d = others[Math.random() * others.length | 0];
  return Math.random() < .5 ? [q.ans, d] : [d, q.ans];
}
const airText = q => q.M < 29 ? `軽い（${q.M} ＜ 29）` : `重い（${q.M} ＞ 29）`;

// ================= ♯6 沈殿の色：白？白以外？（共通テスト頻出） =================
const tubeSVG = (fill, dots) => s => `<svg width="${s}" height="${s}" viewBox="0 0 48 48">
  <path d="M17 4 V38 A7 7 0 0 0 31 38 V4" fill="#fff" stroke="#22314f" stroke-width="3"/>
  <path d="M18.5 30 V38 A5.5 5.5 0 0 0 29.5 38 V30 Z" fill="${fill}" ${fill === "#fff" ? 'stroke="#9fb0cc" stroke-width="1"' : ""}/>
  ${dots ? `<circle cx="22" cy="24" r="2" fill="${dots}"/><circle cx="26" cy="19" r="1.6" fill="${dots}"/>` : ""}</svg>`;
function pptTop(q) {
  const col = HEX[q.c], white = q.c === "白";
  const parts = Array.from({length: 14}, (_, i) => `<circle cx="${156 + (i * 7) % 28}" cy="${104 + (i % 3) * 5 - (i % 4) * 3}" r="${2.5 + (i % 3)}" fill="${col}" ${white ? 'stroke="#c9d6ea"' : ""}/>`).join("");
  return `<div class="sc-top tube-top"><svg viewBox="0 0 340 140">
    <path d="M150 6 V112 A20 20 0 0 0 190 112 V6" fill="#ffffff18" stroke="#fff" stroke-width="4"/>
    <path d="M153 40 V112 A17 17 0 0 0 187 112 V40 Z" fill="#cfe6ff" opacity=".55"/>
    <rect x="163" y="0" width="14" height="22" rx="4" fill="#ff6b5b"/><path d="M170 22 V34" stroke="#ff6b5b" stroke-width="3"/>
    <g class="ppt" id="ppt"><path d="M154 116 Q170 96 186 116 A16 16 0 0 1 154 116 Z" fill="${col}" ${white ? 'stroke="#c9d6ea" stroke-width="1.5"' : ""}/>${parts}</g>
  </svg><span class="pcol" id="pcol" style="color:${white ? "#22314f" : col};${["白","淡黄","淡桃","緑白","青白"].includes(q.c) ? "background:#22314f;color:#fff" : ""}">${q.c}色</span></div>`;
}
CH.push({id:"ppt", no:"♯6", title:"沈殿の色：白？白以外？", em:"🧪", mode:"swipe", prompt:"沈殿の色は白？", bg:"#ffe3dc", cap:{},
 swipe:{title:"白？白以外？", big:"その沈殿、<br>白？白以外？", note:"白か白以外かを選ぶ",
   opts:{"白":{col:"#6b7a99", icon:tubeSVG("#fff")}, "白以外":{col:"#ff8a3d", icon:tubeSVG("#2b2b33", "#ffd23f")}},
   pick:() => ["白", "白以外"], /* 左右は固定 */ badge:() => "共通テスト頻出", top:pptTop,
   reveal:() => { $("ppt")?.classList.add("on"); $("pcol")?.classList.add("on"); },
   chips:[["何のなかま？", q => `${q.grp}のなかま`]], balance:1,
   right:q => `${q.nm} は ${q.c}色`, why:q => `${q.nm} は ${q.c}色。${q.memo}`},
 q:[
  {nm:"塩化銀",grp:"ハロゲン化銀",fm:"AgCl",c:"白",d:1,ion:"Ag⁺ ＋ Cl⁻",memo:"AgCl 白・AgBr 淡黄・AgI 黄"},
  {nm:"硫酸バリウム",grp:"硫酸塩",fm:"BaSO<sub>4</sub>",c:"白",d:1,ion:"Ba²⁺ ＋ SO₄²⁻",memo:"BaSO₄・CaSO₄・PbSO₄ は白"},
  {nm:"炭酸カルシウム",grp:"炭酸塩",fm:"CaCO<sub>3</sub>",c:"白",d:1,ion:"Ca²⁺ ＋ CO₃²⁻",memo:"炭酸塩の沈殿は白"},
  {nm:"水酸化アルミニウム",grp:"水酸化物",fm:"Al(OH)<sub>3</sub>",c:"白",d:1,ion:"Al³⁺ ＋ OH⁻",memo:"白色ゲル状。過剰の NaOH 水溶液に溶ける"},
  {nm:"硫化銅(Ⅱ)",grp:"硫化物",fm:"CuS",c:"黒",d:1,ion:"Cu²⁺ ＋ S²⁻",memo:"硫化物は黒が多い"},
  {nm:"硫化鉛(Ⅱ)",grp:"硫化物",fm:"PbS",c:"黒",d:1,ion:"Pb²⁺ ＋ S²⁻",memo:"硫化物は黒が多い"},
  {nm:"ヨウ化銀",grp:"ハロゲン化銀",fm:"AgI",c:"黄",d:1,ion:"Ag⁺ ＋ I⁻",memo:"AgCl 白・AgBr 淡黄・AgI 黄"},
  {nm:"水酸化鉄(Ⅲ)",grp:"水酸化物",fm:"Fe(OH)<sub>3</sub>",c:"赤褐",d:1,ion:"Fe³⁺ ＋ OH⁻",memo:"Fe³⁺ の沈殿は赤褐色"},
  {nm:"クロム酸鉛(Ⅱ)",grp:"クロム酸塩",fm:"PbCrO<sub>4</sub>",c:"黄",d:1,ion:"Pb²⁺ ＋ CrO₄²⁻",memo:"PbCrO₄・BaCrO₄ は黄、Ag₂CrO₄ は赤褐"},
  {nm:"硫酸鉛(Ⅱ)",grp:"硫酸塩",fm:"PbSO<sub>4</sub>",c:"白",d:2,ion:"Pb²⁺ ＋ SO₄²⁻",memo:"BaSO₄・CaSO₄・PbSO₄ は白"},
  {nm:"塩化鉛(Ⅱ)",grp:"塩化物",fm:"PbCl<sub>2</sub>",c:"白",d:2,ion:"Pb²⁺ ＋ Cl⁻",memo:"白色。熱水に溶ける"},
  {nm:"水酸化亜鉛",grp:"水酸化物",fm:"Zn(OH)<sub>2</sub>",c:"白",d:2,ion:"Zn²⁺ ＋ OH⁻",memo:"白色。過剰の NaOH 水溶液・アンモニア水に溶ける"},
  {nm:"水酸化マグネシウム",grp:"水酸化物",fm:"Mg(OH)<sub>2</sub>",c:"白",d:2,ion:"Mg²⁺ ＋ OH⁻",memo:"白色。過剰の NaOH 水溶液には溶けない"},
  {nm:"硫化カドミウム",grp:"硫化物",fm:"CdS",c:"黄",d:2,trap:1,ion:"Cd²⁺ ＋ S²⁻",memo:"硫化物の例外：CdS は黄、ZnS は白"},
  {nm:"ヨウ化鉛(Ⅱ)",grp:"ヨウ化物",fm:"PbI<sub>2</sub>",c:"黄",d:2,ion:"Pb²⁺ ＋ I⁻",memo:"黄色の沈殿"},
  {nm:"クロム酸バリウム",grp:"クロム酸塩",fm:"BaCrO<sub>4</sub>",c:"黄",d:2,ion:"Ba²⁺ ＋ CrO₄²⁻",memo:"PbCrO₄・BaCrO₄ は黄、Ag₂CrO₄ は赤褐"},
  {nm:"クロム酸銀",grp:"クロム酸塩",fm:"Ag<sub>2</sub>CrO<sub>4</sub>",c:"赤褐",d:2,ion:"Ag⁺ ＋ CrO₄²⁻",memo:"Ag₂CrO₄ だけ赤褐（Pb・Ba は黄）"},
  {nm:"酸化銀",grp:"酸化物",fm:"Ag<sub>2</sub>O",c:"褐",d:2,ion:"Ag⁺ ＋ OH⁻",memo:"水酸化物ではなく Ag₂O（褐色）になる"},
  {nm:"水酸化銅(Ⅱ)",grp:"水酸化物",fm:"Cu(OH)<sub>2</sub>",c:"青白",d:2,trap:1,ion:"Cu²⁺ ＋ OH⁻",memo:"「白」がつくけど青白色 → 白以外"},
  {nm:"硫化亜鉛",grp:"硫化物",fm:"ZnS",c:"白",d:3,trap:1,boss:1,ion:"Zn²⁺ ＋ S²⁻",memo:"硫化物は黒が多いが、ZnS は白！"},
  {nm:"水酸化鉄(Ⅱ)",grp:"水酸化物",fm:"Fe(OH)<sub>2</sub>",c:"緑白",d:3,trap:1,boss:1,ion:"Fe²⁺ ＋ OH⁻",memo:"「白」がつくけど緑白色 → 白以外"},
  {nm:"硫化マンガン(Ⅱ)",grp:"硫化物",fm:"MnS",c:"淡桃",d:3,trap:1,ion:"Mn²⁺ ＋ S²⁻",memo:"MnS は淡桃色（淡赤色）。黒ではない"},
  {nm:"硫化銀",grp:"硫化物",fm:"Ag<sub>2</sub>S",c:"黒",d:3,ion:"Ag⁺ ＋ S²⁻",memo:"硫化物は黒が多い"},
  {nm:"臭化銀",grp:"ハロゲン化銀",fm:"AgBr",c:"淡黄",d:3,boss:1,ion:"Ag⁺ ＋ Br⁻",memo:"白っぽいけど淡黄色 → 白以外"},
 ].map(q => ({...q, ans:q.c === "白" ? "白" : "白以外", desc:`${q.ion} でできる沈殿`}))});

// ================= スワイプ共通：カード上部にラベルを出す（答えたあとに表示） =================
const labeledTop = key => q => molecules(q).replace(/<\/div>$/, `<span class="pcol" id="pcol" style="background:#22314f;color:#fff">${q[key]}</span></div>`);
const showLabel = () => { $("pcol")?.classList.add("on"); };

// ================= ♯7 気体・物質のにおい（4択：においの種類まで覚える） =================
const SMELL = {"刺激臭":{e:"⚡", t:"#ffe0dc", c:"#ff6b5b"}, "腐卵臭":{e:"🥚", t:"#f3ead0", c:"#a8771c"}, "無臭":{e:"⭕", t:"#e9eef7", c:"#9fb0cc"},
  "特異臭":{e:"🌀", t:"#e6e0ff", c:"#5f52cc"}, "果実の香り":{e:"🍎", t:"#ffefd6", c:"#ff8a3d"}};
function smellArt(c) {
  const s = SMELL[c] || SMELL["無臭"], none = c === "無臭";
  return `<svg width="96" height="110" viewBox="0 0 96 110">
    <path d="M18 34 H78 V96 Q78 104 70 104 H26 Q18 104 18 96 Z" fill="#fff" stroke="#6b7a99" stroke-width="3"/>
    <rect x="14" y="26" width="68" height="10" rx="4" fill="#c9d6ea"/>
    <circle cx="38" cy="74" r="6" fill="${s.c}" opacity=".5"/><circle cx="56" cy="64" r="6" fill="${s.c}" opacity=".5"/><circle cx="50" cy="88" r="5" fill="${s.c}" opacity=".5"/>
    ${none ? `<text x="48" y="20" text-anchor="middle" font-size="16" fill="#9fb0cc" font-weight="900">においなし</text>`
      : `<path d="M30 22 q6 -8 0 -16 M48 22 q6 -8 0 -16 M66 22 q6 -8 0 -16" stroke="${s.c}" stroke-width="4" fill="none" stroke-linecap="round"/>`}</svg>`;
}
CH.push({id:"smell", no:"♯7", title:"気体・物質のにおい", em:"👃", kind:"smell", isNew:1, prompt:"どんなにおい？", prompts:["どんなにおい？","においは？","においを答えよ！"],
  bg:"#efe3ff", allow:Object.keys(SMELL), cap:{"刺激臭":3, "無臭":3}, noSim:1,
  icon:o => `<span style="font-size:18px">${SMELL[o].e}</span>`, tints:Object.fromEntries(Object.entries(SMELL).map(([k, v]) => [k, v.t])),
  q:[
  {fm:"NH<sub>3</sub>",nm:"アンモニア",c:"刺激臭",d:1,hint:"鼻をつく刺激臭。水によく溶ける"},
  {fm:"H<sub>2</sub>S",nm:"硫化水素",c:"腐卵臭",d:1,hint:"卵が腐ったようなにおい（有毒）"},
  {fm:"H<sub>2</sub>",nm:"水素",c:"無臭",d:1},
  {fm:"O<sub>2</sub>",nm:"酸素",c:"無臭",d:1},
  {fm:"CO<sub>2</sub>",nm:"二酸化炭素",c:"無臭",d:1},
  {fm:"Cl<sub>2</sub>",nm:"塩素",c:"刺激臭",d:1,hint:"黄緑色・刺激臭（有毒）"},
  {fm:"HCl",nm:"塩化水素",c:"刺激臭",d:1},
  {fm:"SO<sub>2</sub>",nm:"二酸化硫黄",c:"刺激臭",d:2,trap:"腐卵臭",hint:"硫黄をふくむが、H₂S（腐卵臭）とはちがって刺激臭"},
  {fm:"NO<sub>2</sub>",nm:"二酸化窒素",c:"刺激臭",d:2,hint:"赤褐色・刺激臭（有毒）"},
  {fm:"N<sub>2</sub>",nm:"窒素",c:"無臭",d:2},
  {fm:"CH<sub>4</sub>",nm:"メタン",c:"無臭",d:2,hint:"都市ガスのにおいは、もれに気づくために後から付けたもの"},
  {fm:"CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub>",nm:"酢酸エチル",c:"果実の香り",d:2,sz:"l",hint:"エステルは果実のような香り"},
  {fm:"HF",nm:"フッ化水素",c:"刺激臭",d:2},
  {fm:"Br<sub>2</sub>",nm:"臭素",c:"刺激臭",d:2,hint:"赤褐色の液体。名前のとおり強いにおい（刺激臭）"},
  {fm:"CO",nm:"一酸化炭素",c:"無臭",d:3,trap:"刺激臭",hint:"有毒なのに無色・無臭だから危険"},
  {fm:"NO",nm:"一酸化窒素",c:"無臭",d:3,trap:"刺激臭",hint:"NO は無臭。空気中で NO₂ になると刺激臭"},
  {fm:"O<sub>3</sub>",nm:"オゾン",c:"特異臭",d:3,trap:"無臭",hint:"O₂ は無臭だが、O₃ は特異臭（生ぐさいにおい）"},
  {fm:"HCHO",nm:"ホルムアルデヒド",c:"刺激臭",d:3,trap:"果実の香り"},
  {fm:"C<sub>6</sub>H<sub>5</sub>OH",nm:"フェノール",c:"特異臭",d:3,sz:"m",trap:"刺激臭",hint:"フェノールは特異臭"},
  {fm:"CH<sub>3</sub>COOH",nm:"酢酸",c:"刺激臭",d:3,sz:"m",trap:"果実の香り",hint:"酢酸は刺激臭 ／ 酢酸エチル（エステル）は果実の香り"},
 ]});

// ================= ♯8 試薬の保存方法：どっち？ =================
const bottle = ({body = "#fff", liq = null, cap = "none", lid = null, mark = ""}) => s => `<svg width="${s}" height="${s}" viewBox="0 0 48 48">
  <path d="M18 6 H30 V12 Q38 14 38 22 V42 Q38 45 35 45 H13 Q10 45 10 42 V22 Q10 14 18 12 Z" fill="${body}" stroke="#22314f" stroke-width="2.5"/>
  ${liq ? `<path d="M11.3 26 H36.7 V42 Q36.7 43.7 35 43.7 H13 Q11.3 43.7 11.3 42 Z" fill="${liq}" opacity=".8"/>` : ""}
  ${cap === "rubber" ? `<rect x="17" y="2" width="14" height="8" rx="2" fill="#2b2b33"/>` : cap === "glass" ? `<path d="M19 9 H29 L27 2 H21 Z" fill="#e6f0ff" stroke="#22314f" stroke-width="2"/>` : cap === "lid" ? `<rect x="16" y="2" width="16" height="7" rx="2" fill="${lid || "#22314f"}"/>` : ""}
  ${mark}</svg>`;
CH.push({id:"store", no:"♯8", title:"試薬の保存方法：どっち？", em:"🧴", mode:"swipe", isNew:1, prompt:"保存方法は？", bg:"#fff0c2", cap:{},
 swipe:{title:"保存方法どっち？", big:"保存方法<br>どっち？", note:"保存方法を選ぶ",
   opts:{
     "石油中":{col:"#ff8a3d", icon:bottle({liq:"#ffd36e", cap:"lid"})}, "水中":{col:"#3d7cff", icon:bottle({liq:"#9cc6ff", cap:"lid"})},
     "エタノール中":{col:"#14a37a", icon:bottle({liq:"#bfe6d8", cap:"lid"})}, "空気中":{col:"#6b7a99", icon:bottle({})},
     "透明びん":{col:"#3d7cff", icon:bottle({liq:"#e6f0ff", cap:"lid"})}, "褐色びん":{col:"#8a4b22", icon:bottle({body:"#8a4b22", cap:"lid", lid:"#3a2a1a"})},
     "ゴム栓":{col:"#22314f", icon:bottle({liq:"#e6f0ff", cap:"rubber"})}, "ガラス栓":{col:"#3d7cff", icon:bottle({liq:"#e6f0ff", cap:"glass"})},
     "密閉容器":{col:"#22314f", icon:bottle({liq:"#f4f6fb", cap:"lid"})},
     "ガラスびん":{col:"#3d7cff", icon:bottle({liq:"#e6f0ff", cap:"lid"})}, "ポリ容器":{col:"#14a37a", icon:bottle({body:"#f2f2f2", liq:"#e6f0ff", cap:"lid", lid:"#3d7cff"})},
   },
   pick:q => q.pair,  // 選択肢の組と左右は問題ごとに固定
   badge:() => "共通テスト頻出", top:labeledTop("why2"), reveal:showLabel,
   chips:[["性質は？", q => q.prop]],
   right:q => `${q.nm} → ${q.ans}`, why:q => `${q.prop} → ${q.ans}`},
 q:[
  {nm:"ナトリウム",fm:"Na",gc:"銀白",pair:["石油中","水中"],ans:"石油中",d:1,prop:"水や空気中の O₂ と反応する",why2:"水と激しく反応"},
  {nm:"濃硝酸",fm:"HNO<sub>3</sub>",gc:"無色",pair:["透明びん","褐色びん"],ans:"褐色びん",d:1,prop:"光や熱で分解しやすい",why2:"光で分解"},
  {nm:"黄リン",fm:"P<sub>4</sub>",gc:"淡黄",pair:["空気中","水中"],ans:"水中",d:1,prop:"空気中で自然発火する",why2:"自然発火"},
  {nm:"NaOH 水溶液",fm:"NaOH aq",gc:"無色",pair:["ゴム栓","ガラス栓"],ans:"ゴム栓",d:1,prop:"ガラス（SiO₂）と反応する",why2:"ガラス栓が固着"},
  {nm:"カリウム",fm:"K",gc:"銀白",pair:["石油中","エタノール中"],ans:"石油中",d:1,prop:"水やアルコールと反応する",why2:"アルコールとも反応"},
  {nm:"硝酸銀水溶液",fm:"AgNO<sub>3</sub> aq",gc:"無色",pair:["透明びん","褐色びん"],ans:"褐色びん",d:2,prop:"光で分解して Ag が析出",why2:"光で分解"},
  {nm:"NaOH（固体）",fm:"NaOH",gc:"白",pair:["ガラスびん","ポリ容器"],ans:"ポリ容器",d:2,prop:"ガラスと反応し、潮解性もある",why2:"ポリ容器で密閉"},
  {nm:"過酸化水素水",fm:"H<sub>2</sub>O<sub>2</sub> aq",gc:"無色",pair:["褐色びん","透明びん"],ans:"褐色びん",d:2,prop:"光で分解して O₂ を出す",why2:"光で分解"},
  {nm:"濃硫酸",fm:"H<sub>2</sub>SO<sub>4</sub>",gc:"無色",pair:["ゴム栓","ガラス栓"],ans:"ガラス栓",d:2,prop:"脱水作用でゴムを炭化させる",why2:"ゴムを侵す"},
  {nm:"リチウム",fm:"Li",gc:"銀白",pair:["水中","石油中"],ans:"石油中",d:2,prop:"水と反応して H₂ を出す",why2:"水と反応"},
  {nm:"KOH 水溶液",fm:"KOH aq",gc:"無色",pair:["ガラス栓","ゴム栓"],ans:"ゴム栓",d:2,prop:"強塩基でガラスと反応する",why2:"ガラス栓が固着"},
  {nm:"赤リン",fm:"P",gc:"赤褐",pair:["水中","密閉容器"],ans:"密閉容器",d:3,trap:1,prop:"自然発火しない（黄リンとちがう）",why2:"自然発火しない"},
  {nm:"過マンガン酸カリウム水溶液",fm:"KMnO<sub>4</sub> aq",gc:"赤紫",pair:["透明びん","褐色びん"],ans:"褐色びん",d:3,prop:"光で分解しやすい",why2:"光で分解"},
  {nm:"臭素",fm:"Br<sub>2</sub>",gc:"赤褐",pair:["ゴム栓","ガラス栓"],ans:"ガラス栓",d:3,trap:1,prop:"反応性が高くゴムを侵す",why2:"ゴムを侵す"},
  {nm:"フッ化水素酸",fm:"HF aq",gc:"無色",pair:["ガラスびん","ポリ容器"],ans:"ポリ容器",d:3,boss:1,prop:"ガラス（SiO₂）を溶かす",why2:"ガラスを溶かす"},
 ].map(q => ({...q, at:1, desc:"どうやって保存する？"}))});
