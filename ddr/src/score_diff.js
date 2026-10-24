(function(){
  // ヘッダー行を取得
  const headerRow = document.querySelector('.tr-scores-header');
  if (!headerRow) {
    alert('スコア表が見つかりません');
    return;
  }
  
  // 既に差分列が追加されているかチェック
  if (document.getElementById('th-sort-diff')) {
    console.log(`差分列は既に追加されています`);
    return;
  }
  
  // 差分列のヘッダーを追加
  const diffHeader = document.createElement('th');
  diffHeader.id = 'th-sort-diff';
  diffHeader.textContent = '差分';
  diffHeader.style.cursor = 'pointer';
  diffHeader.style.userSelect = 'none';
  headerRow.appendChild(diffHeader);

  // 更新日時列のヘッダーを追加
  const dateHeader = document.createElement('th');
  dateHeader.id = 'th-sort-played-at';
  dateHeader.textContent = '更新日時';
  dateHeader.style.cursor = 'pointer';
  dateHeader.style.userSelect = 'none';
  headerRow.appendChild(dateHeader);
  
  // 各スコア行に差分を追加
  const scoreRows = document.querySelectorAll('.tr-score');
  const scoreData = typeof indexedAllScores !== 'undefined' ? indexedAllScores : {};

  // 行ID末尾の「-d難易度」を譜面キーの「/難易度」に変換して更新日時を取得する
  function getPlayedAt(row) {
    const match = row.id.match(/^(.*)-d(\d+)$/);
    if (!match) return null;

    const score = scoreData[`${match[1]}/${match[2]}`];
    if (!score || score.score_time === null || score.score_time === '' ||
        !Number.isFinite(Number(score.score_time))) return null;

    return Number(score.score_time);
  }

  scoreRows.forEach(row => {
    const scoreCell = row.querySelector('.td-score .sp-score');
    const wrScoreCell = row.querySelector('.td-wr-score .sp-score');
    
    const diffCell = document.createElement('td');
    diffCell.className = 'td-diff';
    
    if (scoreCell && wrScoreCell) {
      const scoreText = scoreCell.textContent.trim();
      const wrScoreText = wrScoreCell.textContent.trim();
      
      // "スコアなし"の場合は処理しない
      if (scoreText === 'スコアなし' || wrScoreText === 'スコアなし') {
        diffCell.innerHTML = '<span class="sp-score">-</span>';
      } else {
        // カンマを除去して数値に変換
        const score = parseInt(scoreText.replace(/,/g, ''));
        const wrScore = parseInt(wrScoreText.replace(/,/g, ''));
        
        if (!isNaN(score) && !isNaN(wrScore)) {
          const diff = score - wrScore;
          const diffSpan = document.createElement('span');
          diffSpan.className = 'sp-score';
          
          // 差分の符号と色を設定
          if (diff > 0) {
            diffSpan.textContent = '+' + diff.toLocaleString();
            diffSpan.style.color = '#4CAF50'; // 緑色
          } else if (diff < 0) {
            diffSpan.textContent = diff.toLocaleString();
            diffSpan.style.color = '#F44336'; // 赤色
          } else {
            diffSpan.textContent = '0';
            diffSpan.style.color = '#666';
          }
          
          diffCell.appendChild(diffSpan);
        } else {
          diffCell.innerHTML = '<span class="sp-score">-</span>';
        }
      }
    } else {
      diffCell.innerHTML = '<span class="sp-score">-</span>';
    }
    
    row.appendChild(diffCell);

    // UNIX時刻を表示用の日時に変換し、ソート用には元の値を保持する
    const playedAtCell = document.createElement('td');
    playedAtCell.className = 'td-played-at';
    const playedAt = getPlayedAt(row);
    if (playedAt !== null) {
      playedAtCell.textContent = new Date(playedAt * 1000).toLocaleString('ja-JP');
      playedAtCell.dataset.sortValue = String(playedAt);
    } else {
      playedAtCell.textContent = '-';
      playedAtCell.dataset.sortValue = '';
    }
    row.appendChild(playedAtCell);
  });
  
  // ソート機能を追加
  diffHeader.addEventListener('click', function() {
    const tbody = scoreRows[0].parentElement;
    const rows = Array.from(scoreRows);
    
    // 現在のソート状態を取得
    const isAsc = this.classList.contains('sort-asc');
    
    // すべてのヘッダーのソートクラスをクリア
    document.querySelectorAll('.tr-scores-header th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // ソート
    rows.sort((a, b) => {
      const aDiff = a.querySelector('.td-diff .sp-score').textContent.replace(/[+,]/g, '');
      const bDiff = b.querySelector('.td-diff .sp-score').textContent.replace(/[+,]/g, '');
      
      // スコアなし("-")は常に下に
      if (aDiff === '-' && bDiff === '-') return 0;
      if (aDiff === '-') return 1;
      if (bDiff === '-') return -1;
      
      const aVal = parseInt(aDiff);
      const bVal = parseInt(bDiff);
      
      return isAsc ? bVal - aVal : aVal - bVal;
    });
    
    // ソート状態を更新
    this.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
    
    // 行を再配置
    rows.forEach(row => tbody.appendChild(row));
  });

  // 更新日時で並べ替え、日時不明の行は常に末尾に配置する
  dateHeader.addEventListener('click', function() {
    if (scoreRows.length === 0) return;

    const tbody = scoreRows[0].parentElement;
    const rows = Array.from(scoreRows);
    const isAsc = this.classList.contains('sort-asc');

    document.querySelectorAll('.tr-scores-header th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    rows.sort((a, b) => {
      const aDate = a.querySelector('.td-played-at').dataset.sortValue;
      const bDate = b.querySelector('.td-played-at').dataset.sortValue;

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return isAsc ? Number(bDate) - Number(aDate) : Number(aDate) - Number(bDate);
    });

    this.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
    rows.forEach(row => tbody.appendChild(row));
  });
})();