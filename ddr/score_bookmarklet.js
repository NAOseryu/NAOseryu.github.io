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

  // DOM更新が1.2秒間止まった後に一度だけ再適用する
  function scheduleScoreDiffReload() {
    clearTimeout(window._scoreDiffReloadTimer);
    window._scoreDiffReloadTimer = setTimeout(() => loadScoreDiffScript(true), 1200);
  }

  function getScoreTableState() {
    return {
      table: document.querySelector('.tr-scores-header')?.closest('table') || null,
      rows: new Set(document.querySelectorAll('.tr-score'))
    };
  }

  function hasScoreTableChanged(previous, current) {
    if (previous.table !== current.table || previous.rows.size !== current.rows.size) {
      return true;
    }
    for (const row of current.rows) {
      if (!previous.rows.has(row)) return true;
    }
    return false;
  }

  if (!window._scoreDiffTableObserver) {
    // 行の並べ替えではなく、表や行そのものが差し替わった場合だけ再適用する
    window._scoreDiffTableState = getScoreTableState();
    window._scoreDiffTableObserver = new MutationObserver(mutations => {
      if (mutations.length === 0) return;

      const currentState = getScoreTableState();
      const hasChanged = hasScoreTableChanged(window._scoreDiffTableState, currentState);
      window._scoreDiffTableState = currentState;
      if (hasChanged) {
        scheduleScoreDiffReload();
      }
    });
    window._scoreDiffTableObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
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