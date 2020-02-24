// てんあさん(@chirping_crow)のWACCAスコア集計ツールを(勝手に)参考にしてます。ありがとうございます。

try {
  const URL = location.href;

  if (URL != "https://wacca.marv-games.jp/web/music") {
    throw new Error("表示しているページが違います。プレイデータの楽曲スコアのページを開いて再度試してください。");
  }

  let results = [];
  let tmpScore, tmpResult;
  let inputs = $('input[name="musicId"]');
  console.log(inputs);
  let nodes = $('[class*="muuri-item"]');

  for (let i = 1; i <= nodes.length; i++) {
    input = inputs[i - 1];
    musicId = $(input).val();
    tmpLevel = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__lv');
    tmpScore = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__score');

    tmpResult = {
      musicId: musicId,
      title: nodes[i - 1].querySelector('.playdata__score-list__song-info__name').innerText,
      n_level: tmpLevel[0].innerText.replace(/\s+/g, "").replace("NORMAL", ""),
      h_level: tmpLevel[1].innerText.replace(/\s+/g, "").replace("HARD", ""),
      e_level: tmpLevel[2].innerText.replace(/\s+/g, "").replace("EXPERT", ""),
      n_score: tmpScore[0].innerText.replace(/\s+/g, "").replace("SCORE", ""),
      h_score: tmpScore[1].innerText.replace(/\s+/g, "").replace("SCORE", ""),
      e_score: tmpScore[2].innerText.replace(/\s+/g, "").replace("SCORE", ""),
    }

    results.push(tmpResult)
  }
  let resultJson = JSON.stringify(results);

  let textBox = document.createElement("textarea");
  textBox.setAttribute("id", "target");
  textBox.setAttribute("type", "hidden");
  textBox.textContent = resultJson;
  document.body.appendChild(textBox);

  textBox.select();
  document.execCommand('copy');
  document.body.removeChild(textBox);

  alert("スコアデータをクリップボードにコピーしました");
} catch (e) {
  alert(e);
}
