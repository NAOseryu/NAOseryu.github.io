//　ユーザー名取得
var urlParams = new URLSearchParams(window.location.search);
var userName = urlParams.get('user');

/**
 * 画面読み込み時の処理
 */
$(document).ready(function() {

  // Amazon Cognito 認証情報プロバイダーの初期化
  AWS.config.region = 'ap-northeast-1'; // リージョン
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:221fd836-a94e-4135-b98c-d951bf2186c7'
  });

  // Lambdaからスコアを取得する
  getScore();
});

/**
 * Lambdaからスコアを取得する
 */
var getScore = function(){

  var lambda = new AWS.Lambda();

  var payload = "{}"

  var params = {
    FunctionName:"getWaccaMusicData",
    InvocationType:"RequestResponse",
    Payload:payload
  };

  lambda.invoke( params,function(err,data) {
    if(err) {
      console.log(err,err.stack);
    } else {
      console.log(data);
      // 難易度ソート順の定義
      const difficultyList = [ "NORMAL", "HARD", "EXPERT", "INFERNO" ];
      // レベルソート順の定義
      const levelList = [ "1", "2", "3", "4", "5", "5+", "6", "6+", "7", "7+", "8", "8+", "9", "9+", "10", "10+", "11", "11+", "12", "12+", "13", "13+", "14", "14+" ];
      // 取得結果を表示
      scoreJson = JSON.parse(data.Payload);
      scoreTable = new Tabulator("#scoreTable", {
        data:scoreJson,
        layout:"fitColumns",
        movableColumns:true,
        columns:[
          {title:"MusicId", field:"MusicId", visible:false},
          {title:"曲名", field:"Title", width:470},
          {title:"難易度", field:"Difficulty", align:"center", sorter:(a,b)=>difficultyList.indexOf(a)-difficultyList.indexOf(b), formatter:dispDiff, width:77},
          {title:"レベル", field:"Level", sorter:(a,b)=>levelList.indexOf(a)-levelList.indexOf(b), width:77},
          {title:"平均スコア", field:"AveScore", width:110}
        ],
        initialSort:[
          {column:"Title", dir:"asc"},
          {column:"Difficulty", dir:"asc"},
        ]
      })

      // スコアにフィルタをかける
      scoreTableFilter();
    }
  });
};

/**
 * 難易度セルのフォーマット
 */
var dispDiff = function(cell){ // 引数は難易度
    let difficulty = cell.getValue(); // セルの値を取得
    if(difficulty == "NORMAL") {
        cell.getElement().style.backgroundColor="#009DE6";
    }
    if(difficulty == "HARD") {
        cell.getElement().style.backgroundColor="#FED131";
    }
    if(difficulty == "EXPERT") {
        cell.getElement().style.backgroundColor="#FA0C98";
    }
    if(difficulty == "INFERNO") {
        cell.getElement().style.color="#FFFFFF";
        cell.getElement().style.backgroundColor="#4A004F";
    }
    return difficulty; // 表示する値を返す
}

/**
 * フィルタ
 */
var scoreTableFilter = function(){
  //表示用スコア格納先
  let dispScore = [];

  dispScore = diffFilter();

  dispScore = levelFilter(dispScore);

  scoreTable.setData(dispScore);

  // 件数表示用
  let dataCount = Object.keys(dispScore).length
  $("div#dataCount").text(dataCount + "件");
};

/**
 * 難易度フィルタ
 */
var diffFilter = function(){
  let returnScore = [];
  let NORMAL = document.getElementsByName("NORMAL");
  let HARD = document.getElementsByName("HARD");
  let EXPERT = document.getElementsByName("EXPERT");
  let INFERNO = document.getElementsByName("INFERNO");

  if (NORMAL[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Difficulty == "NORMAL") return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (HARD[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Difficulty == "HARD") return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (EXPERT[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Difficulty == "EXPERT") return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (INFERNO[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Difficulty == "INFERNO") return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }
  return returnScore;
};

/**
 * レベルフィルタ
 */
var levelFilter = function(dispScore){
  let returnScore = [];
  let levelFilter = document.getElementsByName("levelFilter");

  for (let i = 0; i < levelFilter.length; i++) {
      if (levelFilter[i].checked) {
        let filterScore = dispScore.filter(function(item, index){
        if (item.Level == i + 1 || item.Level == i + 1 + "+") return true;
      });
      Array.prototype.push.apply(returnScore, filterScore);
    }
  }
  return returnScore;
};

// フィルターごとのチェックON・OFF
var change_all = function(type, sw) {
  let types = document.getElementsByName(type);
  types.forEach((item) => {
    item.checked = sw;
  });
}
