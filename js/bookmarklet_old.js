//プレイ回数取得のため各曲のページへ遷移させようとするが上手くいかないため保留

// てんあさん(@chirping_crow)のWACCAスコア集計ツールを(勝手に)参考にしてます。ありがとうございます。
// サーバへの負荷軽減のためのウェイト関数
$.wait = function (msec) {
    let d = new $.Deferred();
    setTimeout(function () {
        d.resolve(msec);
    }, msec);
    return d.promise();
};

const dispStatus = function() {
  return new Promise((resolve,reject) => {
    const toolBg = $('<div>').addClass('toolBg').attr('style','position: fixed; top: 0; z-index: 10; width: 100%; height:100%; background-color: rgba(0,0,0,0.6);');
    const infoArea = $('<div>').addClass('infoArea').attr('style', 'width: 100%; padding: 5px; background-color: #f82374; color: #fcfcfc;');
    const infoSpan = $('<span>').addClass('infoSpan').text('スコアを取得します。');
    infoArea.append(infoSpan);
    toolBg.append(infoArea);
    $('body').append(toolBg);
    resolve("f1 ==> f2");
  })
}

const getData = function(passVal) {
  return new Promise((resolve,reject) => {
    setTimeout(function(){
      let results = [];

      let tmpScore, tmpResult;
      let inputs = $('input[name="musicId"]');
      let nodes = $('[class="playdata__score-list__song-info"]');

      for (let i = 1; i <= nodes.length; i++) {
        console.log('-----');
        setTimeout($.wait(1000).done(function(){
          input = inputs[i - 1];
          musicId = $(input).val();
          tmpLevel = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__lv');
          tmpScore = nodes[i - 1].querySelectorAll('.playdata__score-list__song-info__score');

          console.log(musicId);

          // Cookie設定
          let cookies = document.cookie; //全てのcookieを取り出して
          let cookiesArray = cookies.split(';'); // ;で分割し配列に
          let wsid;
          for (var c of cookiesArray) { //一つ一つ取り出して
              cookieArray = c.split('='); //さらに=で分割して配列に
              if( cookieArray[0] == 'WSID') { // 取り出したいkeyと合致したら
                  wsid = cookieArray[1];  // [key,value]
                  console.log("Cookie: " + wsid);
              }
          }
          let sendCookie = "WSID=" + wsid + "; WUID=" + wsid

          // 各曲のスコアページを取得
          $.ajax({
            type: 'POST',
            url: '/web/music/detail',
            data: 'musicId=' + musicId,
            headers: {
                "set-cookie":sendCookie
            },
            async: false,
          })
          .done(function(data) {
            tmpPlayCount = $(data).find('[class*="song-info__top__play-count"]');
            //console.log(tmpPlayCount);

            tmpResult = {
              musicId: musicId,
              title: nodes[i - 1].querySelector('.playdata__score-list__song-info__name').innerText,
              n_level: tmpLevel[0].innerText.replace(/\s+/g, "").replace("NORMAL", ""),
              h_level: tmpLevel[1].innerText.replace(/\s+/g, "").replace("HARD", ""),
              e_level: tmpLevel[2].innerText.replace(/\s+/g, "").replace("EXPERT", ""),
              i_level: tmpLevel[3].innerText.replace(/\s+/g, "").replace("INFERNO", ""),
              n_score: tmpScore[0].innerText.replace(/\s+/g, "").replace("SCORE", ""),
              h_score: tmpScore[1].innerText.replace(/\s+/g, "").replace("SCORE", ""),
              e_score: tmpScore[2].innerText.replace(/\s+/g, "").replace("SCORE", ""),
              i_score: tmpScore[3].innerText.replace(/\s+/g, "").replace("SCORE", ""),
              n_playCount: tmpPlayCount[0].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
              h_playCount: tmpPlayCount[1].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
              e_playCount: tmpPlayCount[2].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", ""),
            }

            // INFERNOのプレイ回数はある場合だけ取得
            if (tmpResult.i_level != 0) {
              tmpResult.i_playCount = tmpPlayCount[3].innerText.replace(/\s+/g, "").replace("プレイ回数：", "").replace("回", "")
            }

            results.push(tmpResult)
          }).fail(function(jqXHR, textStatus, errorThrown){
            console.log("エラーです" + musicId);
            // エラーの場合処理
          });
          $('.infoSpan').text(i + '/' + nodes.length + ' 曲完了');
        }), 1000)
      }
      resolve(results);
    }, 1000);
  })
}

// テキストで出力
const downloadText = function(results) {
  return new Promise((resolve,reject) => {
    setTimeout(function(){
      let resultJson = JSON.stringify(results);
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      let blob = new Blob([bom, resultJson], { "type" : "text/plain" });
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'wacca_playdata.txt';
      link.click();
      $('.toolBg').remove();
      resolve("f1 ==> f2");
    }, 1000);
  })
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

  dispStatus()
  .then(getData)
  .then(downloadText)

} catch (e) {
  alert(e);
}
