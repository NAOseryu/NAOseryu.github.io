// てんあさん(@chirping_crow)のWACCAスコア集計ツールを(勝手に)参考にしてます。ありがとうございます。
var getData = function() {
  let results = [];

  let tmpScore, tmpResult;
  let inputs = $('input[name="musicId"]');
  let nodes = $('[class*="muuri-item"]');

  for (let i = 1; i <= nodes.length; i++) {
    input = inputs[i - 1];
    musicId = $(input).val();
    tmpLevel = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__lv');
    tmpScore = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__score');

    console.log(musicId);
    // 各曲のスコアページを取得
    $.ajax({
      type: 'POST',
      url: 'https://wacca.marv-games.jp/web/music/detail',
      data: 'musicId=' + musicId,
      async: false,
    })
    .done(function(data) {
      tmpPlayCount = $(data).find('[class*="song-info__top__play-count"]');
      console.log(tmpPlayCount);

      tmpResult = {
        musicId: musicId,
        title: nodes[i - 1].querySelector('.playdata__score-list__song-info__name').innerText,
        n_level: tmpLevel[0].innerText.replace(/\s+/g, "").replace("NORMAL", ""),
        h_level: tmpLevel[1].innerText.replace(/\s+/g, "").replace("HARD", ""),
        e_level: tmpLevel[2].innerText.replace(/\s+/g, "").replace("EXPERT", ""),
        n_score: tmpScore[0].innerText.replace(/\s+/g, "").replace("SCORE", ""),
        h_score: tmpScore[1].innerText.replace(/\s+/g, "").replace("SCORE", ""),
        e_score: tmpScore[2].innerText.replace(/\s+/g, "").replace("SCORE", ""),
        n_playCount: tmpPlayCount[0].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
        h_playCount: tmpPlayCount[1].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
        e_playCount: tmpPlayCount[2].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
      }

      results.push(tmpResult)
    })
  }
  downloadText(results)
}

// テキストで出力
var downloadText = function(results) {
  let resultJson = JSON.stringify(results);
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let blob = new Blob([bom, resultJson], { "type" : "text/plain" });
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'wacca_playdata.txt';
  link.click();
}

// コピーが上手くいかないのでそのうちやる。。。
// var copy = function(results) {
//
//     console.log(results);
//
//     let resultJson = JSON.stringify(results);
//
//     let textBox = document.createElement("textarea");
//     textBox.setAttribute("id", "target");
//     textBox.setAttribute("type", "hidden");
//     textBox.textContent = resultJson;
//     document.body.appendChild(textBox);
//     copy2(textBox);
//     console.log(textBox);
//   }
  //
  // var copy2 = function(textBox) {
  //
  //       textBox.select();
  //       alert("スコアデータをクリップボードにコピーしました");
  //       console.log(document.activeElement);
  //       document.execCommand('copy');
  // }

try {
  const URL = location.href;

  if (URL != "https://wacca.marv-games.jp/web/music") {
    throw new Error("表示しているページが違います。プレイデータの楽曲スコアのページを開いて再度試してください。");
  }

  results = getData();

} catch (e) {
  alert(e);
}
