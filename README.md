このリポジトリは高校化学の学習ゲーム「ケミカラ」です。最新版のファイルをアップロードしました。

1. まずファイルの配置を確認してください。正しい構成は次のとおりです。
   アップロード時にフォルダが崩れて、ファイルがルートなどに並んでいる場合は、この構成に移動してください。
   chemicolor/ フォルダの中に入っている場合は、中身をルートに出してください。

   README.md
   CLAUDE.md
   build.py
   tools/check_recipes.js
   src/engine/base.html
   src/engine/rewards.js
   src/engine/rewards.css
   src/engine/lab-core.js
   src/data/common.js
   src/data/inorganic.js
   src/data/inorganic-lab.js
   src/data/organic.js
   src/data/organic-lab.js
   dist/inorganic.html
   dist/inorganic-rank.html
   dist/organic.html

   以前にアップした古いファイル（上の一覧にないもの）が残っていれば削除してください。
   上の一覧で足りないファイルがあれば、作業を止めて私に教えてください。

2. CLAUDE.md と README.md を読んで、プロジェクトの方針を把握してください。
3. python3 build.py と node tools/check_recipes.js を実行し、両方成功することを確認してください。
4. GitHub Actions のワークフローを作り、main に push するたびに build.py を実行して dist/ を GitHub Pages に公開するようにしてください。
5. dist/ に index.html を作り、3つの版（無機・基本版／無機・ランキング版／有機版）へのリンクを並べたトップページにしてください。デザインはゲームと同じポップ系で、iPad で見やすくしてください。
6. README の「公開」の手順を、実際の設定方法（Settings → Pages で Source を GitHub Actions にする）に直してください。
7. 終わったら、私が GitHub 側で設定する必要があることを、手順として箇条書きで教えてください。

変更はブランチを作ってコミットし、プルリクエストにしてください。
