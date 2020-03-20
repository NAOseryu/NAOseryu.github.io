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

  // ユーザ名をチェックして表示
  checkUser();

  // Lambdaからスコアを取得する
  getScore();
});

// ユーザ名をチェックして表示する
var checkUser = function(){

  if (userName != null) {
    $("div#menu h3").text(userName + "さんのスコア");
  } else {
    $("div#menu h3").text("ユーザの指定がありません");
  }
};

/**
 * Lambdaからスコアを取得する
 */
var getScore = function(){

  var lambda = new AWS.Lambda();

  var payload = "{\"UserId\":\"" + userName + "\"}"

  var params = {
    FunctionName:"getWaccaScore",
    InvocationType:"RequestResponse",
    Payload:payload
  };

  lambda.invoke( params,function(err,data) {
    if(err) {
      console.log(err,err.stack);
    } else {
      console.log(data);
      // 取得結果を表示
      scoreJson = JSON.parse(data.Payload);
      scoreTable = new Tabulator("#scoreTable", {
        data:scoreJson,
        layout:"fitColumns",
        movableColumns:true,
        columns:[
          {title:"MusicId", field:"MusicId", visible:false},
          {title:"曲名", field:"Title", width:470},
          {title:"難易度", field:"Difficulty", align:"center", formatter:dispDiff, width:77},
          {title:"レベル", field:"Level", width:77},
          {title:"スコア", field:"Score", width:77},
          {title:"プレイ回数", field:"PlayCount", width:105}
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
    return difficulty; // 表示する値を返す
}

/**
 * フィルタ
 */
var scoreTableFilter = function(){
  //表示用スコア格納先
  let dispScore = [];

  dispScore = diffFilter();

  dispScore = scoreFilter(dispScore);

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
  return returnScore;
};


/**
 * スコアフィルタ
 */
var scoreFilter = function(dispScore){
  let returnScore = [];
  let AAA = document.getElementsByName("AAA");
  let S = document.getElementsByName("S");
  let SS = document.getElementsByName("SS");
  let SSS = document.getElementsByName("SSS");
  let MASTER = document.getElementsByName("MASTER");

  if (AAA[0].checked) {
    let filterScore = dispScore.filter(function(item, index){
      if (item.Score < 900000) return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (S[0].checked) {
    let filterScore = dispScore.filter(function(item, index){
      if (item.Score >= 900000 && item.Score < 950000) return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (SS[0].checked) {
    let filterScore = dispScore.filter(function(item, index){
      if (item.Score >= 950000 && item.Score < 980000) return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (SSS[0].checked) {
    let filterScore = dispScore.filter(function(item, index){
      if (item.Score >= 980000 && item.Score < 1000000) return true;
    });
    Array.prototype.push.apply(returnScore, filterScore);
  }

  if (MASTER[0].checked) {
    let filterScore = dispScore.filter(function(item, index){
    if (item.Score == 1000000) return true;
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
      if (item.Level == i + 1) return true;
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
