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
  
  // 各スコア行に差分を追加
  const scoreRows = document.querySelectorAll('.tr-score');
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
})();