(function(){
  // ヘッダー行を取得
  const headerRow = document.querySelector('.tr-scores-header');
  if (!headerRow) {
    alert('スコア表が見つかりません');
    return;
  }

  // スクロール時に列見出しを画面上部に固定する
  function makeHeaderSticky(header) {
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '1000';
  }
  headerRow.querySelectorAll('th').forEach(makeHeaderSticky);
  
  // 既に差分列が追加されているかチェック
  if (document.getElementById('th-sort-diff')) {
    console.log(`差分列は既に追加されています`);
    return;
  }
  
  // 差分列のヘッダーを追加
  const diffHeader = document.createElement('th');
  diffHeader.id = 'th-sort-diff';
  diffHeader.textContent = '設定したライバルとの差分';
  diffHeader.style.cursor = 'pointer';
  diffHeader.style.userSelect = 'none';
  makeHeaderSticky(diffHeader);
  headerRow.appendChild(diffHeader);

  // 更新日時列のヘッダーを追加
  const dateHeader = document.createElement('th');
  dateHeader.id = 'th-sort-played-at';
  dateHeader.textContent = '更新日時';
  dateHeader.style.cursor = 'pointer';
  dateHeader.style.userSelect = 'none';
  makeHeaderSticky(dateHeader);
  headerRow.appendChild(dateHeader);
  
  // 各スコア行に差分を追加
  const scoreRows = document.querySelectorAll('.tr-score');
  const scoreData = typeof indexedAllScores !== 'undefined' ? indexedAllScores : {};
  const songData = typeof ALL_SONG_DATA !== 'undefined' ? ALL_SONG_DATA : [];
  const songsById = new Map(songData.map(song => [song.song_id, song]));

  // 行IDの難易度番号に対応するratingsとtiersから表示値を作る
  scoreRows.forEach(row => {
    const match = row.id.match(/^(.*)-d(\d+)$/);
    if (!match) return;

    const song = songsById.get(match[1]);
    const difficultyIndex = Number(match[2]);
    if (!song || !Array.isArray(song.ratings) || !Array.isArray(song.tiers)) return;

    const rating = song.ratings[difficultyIndex];
    const tier = song.tiers[difficultyIndex];
    if (rating === undefined || tier === undefined ||
        !Number.isFinite(Number(rating)) || !Number.isFinite(Number(tier))) return;

    const difficultyCell = row.querySelector('.td-level .sp-difficulty');
    if (difficultyCell) {
      difficultyCell.textContent = (Number(rating) + Number(tier)).toFixed(2);
    }
  });

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

  // 選択欄が閉じている場合は、選択ライバルを記録したCookieから取得する
  const rivalSelect = document.querySelector('.swal2-select');
  const selectedRivalCookie = document.cookie.split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('sec='));
  const selectedRivalUsername = rivalSelect instanceof HTMLSelectElement
    ? rivalSelect.value
    : selectedRivalCookie?.slice(4).split('/')[0];
  const followees = typeof FOLLOWEES_FULL !== 'undefined' ? FOLLOWEES_FULL : null;

  if (!followees || typeof followees !== 'object') {
    console.error('ライバル一覧 FOLLOWEES_FULL が見つかりません');
    return;
  }

  // 世界記録ではなく、選択中でもないライバルを取得対象にする
  const rivalOptions = Object.entries(followees)
    .filter(([username]) => username !== selectedRivalUsername)
    .map(([username, name]) => ({
      username,
      name: `${username} (${name})`
    }));
  if (rivalOptions.length === 0) return;

  if (typeof jQuery === 'undefined' || typeof buildScoreIndex !== 'function' ||
      typeof spdpMode === 'undefined') {
    console.error('ライバルスコア取得に必要なページ機能が見つかりません');
    return;
  }

  // 各ライバルのスコアを同じSP/DPモードで取得し、譜面キーで引ける形にする
  const rivalRequests = rivalOptions.map(rival => jQuery.ajax({
    url: '/api/follow_scores',
    type: 'POST',
    contentType: 'application/json',
    processData: false,
    data: JSON.stringify({ username: rival.username, SP_or_DP: spdpMode })
  }).then(jsonRes => {
    jsonRes.scores.forEach(score => {
      score.name = rival.name;
    });
    return { name: rival.name, scores: buildScoreIndex(jsonRes.scores) };
  }, xhr => {
    if (xhr.status === 400) {
      console.warn(`ライバル ${rival.name} のスコアを取得できませんでした`);
    } else {
      console.error(`ライバル ${rival.name} のスコア取得に失敗しました`, xhr);
    }
    return null;
  }));

  Promise.all(rivalRequests).then(results => {
    const rivalColumns = results.filter(rival => rival !== null);
    const scoreTable = headerRow.closest('table');
    if (!scoreTable || !scoreTable.parentElement) {
      console.error('スコア表の配置先が見つかりません');
      return;
    }

    // チェックボックスは列の外に置き、非表示後も再表示できるようにする
    const rivalControls = document.createElement('div');
    rivalControls.id = 'rival-column-controls';
    rivalControls.style.display = 'flex';
    rivalControls.style.flexWrap = 'wrap';
    rivalControls.style.gap = '0.5em 1em';
    rivalControls.style.backgroundColor = '#fff';
    rivalControls.style.margin = '0px 18px';
    rivalControls.setAttribute('aria-label', 'ライバル列の表示設定');

    if (rivalColumns.length > 0) {
      const controlsTitle = document.createElement('span');
      controlsTitle.textContent = 'ライバル列:';
      rivalControls.appendChild(controlsTitle);
      scoreTable.parentElement.insertBefore(rivalControls, scoreTable);
    }

    let previousHeader = diffHeader;
    rivalColumns.forEach((rival, index) => {
      // ライバル名の見出しと、独立して列を切り替えるチェックボックスを追加
      const rivalHeader = document.createElement('th');
      rivalHeader.id = `th-sort-rival-score-${index}`;
      rivalHeader.textContent = rival.name;
      rivalHeader.style.cursor = 'pointer';
      rivalHeader.style.userSelect = 'none';
      rivalHeader.style.display = 'none';
      makeHeaderSticky(rivalHeader);

      const visibilityLabel = document.createElement('label');
      visibilityLabel.textContent = rival.name;
      visibilityLabel.style.cursor = 'pointer';

      const visibilityCheckbox = document.createElement('input');
      visibilityCheckbox.type = 'checkbox';
      visibilityCheckbox.checked = false;
      visibilityCheckbox.setAttribute('aria-label', `${rival.name}の列を表示`);
      visibilityCheckbox.style.marginRight = '0.25em';
      visibilityCheckbox.addEventListener('change', () => {
        const visible = visibilityCheckbox.checked;
        rivalHeader.style.display = visible ? '' : 'none';
        scoreRows.forEach(row => {
          const cell = row.querySelector(`.td-rival-score-${index}`);
          if (cell) cell.style.display = visible ? '' : 'none';
        });
      });
      visibilityLabel.prepend(visibilityCheckbox);
      rivalControls.appendChild(visibilityLabel);

      if (previousHeader) {
        previousHeader.after(rivalHeader);
      } else {
        headerRow.insertBefore(rivalHeader, diffHeader);
      }
      previousHeader = rivalHeader;

      scoreRows.forEach(row => {
        // スコアの下に、自分のスコアとの差（自分 - ライバル）を表示する
        const match = row.id.match(/^(.*)-d(\d+)$/);
        const rivalScore = match ? rival.scores[`${match[1]}/${match[2]}`] : null;
        const rivalCell = document.createElement('td');
        rivalCell.className = `td-rival-score-${index}`;
        rivalCell.style.display = 'none';

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'sp-score';
        if (rivalScore && rivalScore.score !== null && rivalScore.score !== undefined &&
            Number.isFinite(Number(rivalScore.score))) {
          const score = Number(rivalScore.score);
          scoreSpan.textContent = score.toLocaleString();
          rivalCell.dataset.sortValue = String(score);
        } else {
          scoreSpan.textContent = '-';
          rivalCell.dataset.sortValue = '';
        }
        rivalCell.appendChild(scoreSpan);

        const ownScoreText = row.querySelector('.td-score .sp-score')?.textContent.trim();
        const ownScore = ownScoreText && ownScoreText !== 'スコアなし'
          ? Number(ownScoreText.replace(/,/g, ''))
          : NaN;
        const rivalScoreValue = rivalScore && rivalScore.score !== null &&
          rivalScore.score !== undefined && rivalScore.score !== ''
          ? Number(rivalScore.score)
          : NaN;
        const rivalDiffSpan = document.createElement('span');
        rivalDiffSpan.className = 'sp-score';
        rivalDiffSpan.style.display = 'block';
        rivalDiffSpan.style.fontSize = 'smaller';

        if (Number.isFinite(ownScore) && Number.isFinite(rivalScoreValue)) {
          const diff = ownScore - rivalScoreValue;
          rivalDiffSpan.textContent = `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`;
          rivalDiffSpan.style.color = diff > 0 ? '#4CAF50' : diff < 0 ? '#F44336' : '#666';
        } else {
          rivalDiffSpan.textContent = '-';
        }
        rivalCell.appendChild(rivalDiffSpan);

        const previousCell = index === 0
          ? row.querySelector('.td-diff')
          : row.querySelector(`.td-rival-score-${index - 1}`);
        if (previousCell) {
          previousCell.after(rivalCell);
        } else {
          row.appendChild(rivalCell);
        }
      });

      rivalHeader.addEventListener('click', function() {
        if (scoreRows.length === 0) return;

        const tbody = scoreRows[0].parentElement;
        const rows = Array.from(scoreRows);
        const isAsc = this.classList.contains('sort-asc');

        document.querySelectorAll('.tr-scores-header th').forEach(th => {
          th.classList.remove('sort-asc', 'sort-desc');
        });

        // 未登録スコアは末尾に置き、数値として並べ替える
        rows.sort((a, b) => {
          const aScore = a.querySelector(`.td-rival-score-${index}`).dataset.sortValue;
          const bScore = b.querySelector(`.td-rival-score-${index}`).dataset.sortValue;

          if (!aScore && !bScore) return 0;
          if (!aScore) return 1;
          if (!bScore) return -1;

          return isAsc ? Number(bScore) - Number(aScore) : Number(aScore) - Number(bScore);
        });

        this.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
        rows.forEach(row => tbody.appendChild(row));
      });
    });
  }).catch(error => {
    console.error('ライバルスコアの処理に失敗しました', error);
  });
})();
