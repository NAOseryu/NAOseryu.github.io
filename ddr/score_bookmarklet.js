// 「javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/score_bookmarklet.js')」
// をブックマークに登録して実行すること
(function() {
  const SCRIPT_URL = 'https://naoseryu.github.io/ddr/src/score_diff.js';
  const SCRIPT_ID = 'score_diff';

  // 外部スクリプトを読み込むヘルパー関数
  function loadScoreDiffScript() {
    // 既存のスクリプト要素を検索
    const existingScript = document.getElementById(SCRIPT_ID);

    // 既存の要素があれば削除
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
      console.log(`[ScoreDiff] 既存のスクリプト (${SCRIPT_ID}) を削除しました。`);
    }

    // 新しい <script> 要素を作成し、DOMに挿入
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.id = SCRIPT_ID;
    document.body.appendChild(script);
    console.log(`[ScoreDiff] 新しいスクリプトを読み込みました: ${SCRIPT_URL}`);
  }

  // 初回実行: ページロード時に一度差分スクリプトを読み込む
  loadScoreDiffScript();
  
  // window.reloadTable のモンキーパッチ
  if (typeof window.reloadTable === 'function' && !window._original_reloadTable) {
    // 元の関数への参照を保持 (初めて上書きする場合のみ実行)
    window._original_reloadTable = window.reloadTable;

    // window.reloadTable を上書き
    window.reloadTable = function() {
      // 元の関数を実行 (argumentsをそのまま渡す)
      window._original_reloadTable.apply(this, arguments);

      // 元の処理が完了した後、差分スクリプトを再読み込みする
      loadScoreDiffScript();
    };
    console.log('[ScoreDiff] window.reloadTable をフック（上書き）しました。');
  } else if (typeof window.reloadTable !== 'function') {
      console.warn('[ScoreDiff] window.reloadTable 関数が見つかりませんでした。フック処理をスキップします。');
  } else {
      console.log('[ScoreDiff] window.reloadTable は既にフックされています。');
  }
})();