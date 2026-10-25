// 「javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/score_bookmarklet.js')」
// をブックマークに登録して実行すること
(function() {
  const SCRIPT_URL = 'https://naoseryu.github.io/ddr/src/score_diff.js';
  const SCRIPT_ID = 'score_diff';

  // 外部スクリプトを読み込むヘルパー関数
  // 表の再描画後は、既存の差分列を作り直すモードで読み込む
  function loadScoreDiffScript(forceReapply) {
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
    script.dataset.forceReapply = forceReapply ? 'true' : 'false';
    document.body.appendChild(script);
    console.log(`[ScoreDiff] 新しいスクリプトを読み込みました: ${SCRIPT_URL}`);
  }

  // 初回実行: ページロード時に一度差分スクリプトを読み込む
  loadScoreDiffScript(false);

  // ブックマークレット自身が追加した要素は再適用の監視対象から除外する
  function isScoreDiffElement(node) {
    return node.nodeType === Node.ELEMENT_NODE &&
      node.matches('#score_diff, #rival-column-controls, #th-sort-diff, #th-sort-played-at, ' +
        'th[id^="th-sort-rival-score-"], .td-diff, .td-played-at, [class*="td-rival-score-"]');
  }

  // 差分列やチェックボックスの変更ではなく、元サイトの表更新だけを検出する
  function isPageTableMutation(mutation) {
    const target = mutation.target.nodeType === Node.ELEMENT_NODE
      ? mutation.target
      : mutation.target.parentElement;
    if (target && target.closest(
      '#score_diff, #rival-column-controls, #th-sort-diff, #th-sort-played-at, ' +
      'th[id^="th-sort-rival-score-"], .td-diff, .td-played-at, [class*="td-rival-score-"]'
    )) {
      return false;
    }

    return [...mutation.addedNodes, ...mutation.removedNodes]
      .some(node => !isScoreDiffElement(node));
  }

  // DOM更新が1.2秒間止まった後に一度だけ再適用する
  function scheduleScoreDiffReload() {
    clearTimeout(window._scoreDiffReloadTimer);
    window._scoreDiffReloadTimer = setTimeout(() => loadScoreDiffScript(true), 1200);
  }

  const scoreTable = document.querySelector('.tr-scores-header')?.closest('table');
  if (scoreTable && scoreTable.parentElement && !window._scoreDiffTableObserver) {
    // 表の行が差し替わるケースもMutationObserverで検出する
    window._scoreDiffTableObserver = new MutationObserver(mutations => {
      if (mutations.some(isPageTableMutation)) {
        scheduleScoreDiffReload();
      }
    });
    window._scoreDiffTableObserver.observe(scoreTable.parentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // window.reloadTable のモンキーパッチ
  if (typeof window.reloadTable === 'function' && !window._original_reloadTable) {
    // 元の関数への参照を保持 (初めて上書きする場合のみ実行)
    window._original_reloadTable = window.reloadTable;

    // window.reloadTable を上書き
    window.reloadTable = function() {
      // 元の関数を実行 (argumentsをそのまま渡す)
      const result = window._original_reloadTable.apply(this, arguments);

      // 非同期の表更新が落ち着いてから差分列を再適用する
      scheduleScoreDiffReload();
      return result;
    };
    console.log('[ScoreDiff] window.reloadTable をフック（上書き）しました。');
  } else if (typeof window.reloadTable !== 'function') {
      console.warn('[ScoreDiff] window.reloadTable 関数が見つかりませんでした。フック処理をスキップします。');
  } else {
      console.log('[ScoreDiff] window.reloadTable は既にフックされています。');
  }

  // 次ページのスコア取得が完了してから差分列を再適用する
  if (typeof window.nextPageFollowScores === 'function' &&
      !window._original_nextPageFollowScores) {
    window._original_nextPageFollowScores = window.nextPageFollowScores;
    window.nextPageFollowScores = function() {
      const result = window._original_nextPageFollowScores.apply(this, arguments);
      if (result && typeof result.then === 'function') {
        result.then(scheduleScoreDiffReload, scheduleScoreDiffReload);
      } else {
        scheduleScoreDiffReload();
      }
      return result;
    };
    console.log('[ScoreDiff] nextPageFollowScores をフックしました。');
  } else if (typeof window.nextPageFollowScores !== 'function') {
    console.warn('[ScoreDiff] nextPageFollowScores 関数が見つかりませんでした。フック処理をスキップします。');
  }
})();