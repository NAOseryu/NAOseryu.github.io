// ユーザープールの設定
var poolData = {
  UserPoolId : 'ap-northeast-1_5ynbUsboz',
  ClientId : '4so6sevjpqoqmmhh3ki24r11fn'
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cognitoUser = userPool.getCurrentUser();  // 現在のユーザー

/**
 * 画面読み込み時の処理
 */
$(document).ready(function() {

	// Amazon Cognito 認証情報プロバイダーの初期化
	AWS.config.region = 'ap-northeast-1'; // リージョン
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:221fd836-a94e-4135-b98c-d951bf2186c7'
	});

  // 現在のユーザーの属性情報を取得・表示
  getUserAttribute();

  // Lambdaからスコアを取得する
  getScore();
});

/**
 * 現在のユーザーの属性情報を取得・表示する
 */
var getUserAttribute = function(){

  // 現在のユーザー情報が取得できているか？
  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        console.log(err);
        $("div#menu h3").text("セッションの取得に失敗してます");
      } else {
        $("div#menu h3").text(cognitoUser.username + "さんのスコア");
      }
    });
  } else {
    $("div#menu h3").text("ログインしてません");
  }
};

/**
 * Lambdaからスコアを取得する
 */
var getScore = function(){

  var lambda = new AWS.Lambda();

  var payload = "{\"UserId\":\"" + cognitoUser.username + "\"}"

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
        columns:[
          {title:"MusicId", field:"MusicId", visible:false},
          {title:"曲名", field:"Title", width:470},
          {title:"難易度", field:"Difficulty", align:"center", formatter:dispDiff, width:100},
          {title:"レベル", field:"Level", width:80},
          {title:"スコア", field:"Score", width:100}
        ],
        initialSort:[
          {column:"Title", dir:"asc"},
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
    return val; // 表示する値を返す
}

/**
 * フィルタ
 */
function scoreTableFilter(){
  //表示用スコア格納先
  let dispScore = [];

  dispScore = diffFilter();

  dispScore = scoreFilter(dispScore);

  scoreTable.setData(dispScore);
};

/**
 * 難易度フィルタ
 */
function diffFilter(){
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
function scoreFilter(dispScore){
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
