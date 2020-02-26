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
          {title:"難易度", field:"Difficulty", width:100},
          {title:"レベル", field:"Level", width:80},
          {title:"スコア", field:"Score", width:100}
        ],
      })
    }
  });
};

/**
 * スコアフィルタ
 */
function scoreFilter(){
  //表示用スコア格納先
  let dispScore = [];
  let AAA = document.getElementsByName("AAA");
  let S = document.getElementsByName("S");
  let SS = document.getElementsByName("SS");
  let SSS = document.getElementsByName("SSS");
  let MASTER = document.getElementsByName("MASTER");
  if (AAA[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Score < 900000) return true;
    });
    Array.prototype.push.apply(dispScore, filterScore);
  }

  if (S[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Score >= 900000 && item.Score < 950000) return true;
    });
    Array.prototype.push.apply(dispScore, filterScore);
  }

  if (SS[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Score >= 950000 && item.Score < 980000) return true;
    });
    Array.prototype.push.apply(dispScore, filterScore);
  }

  if (SSS[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
      if (item.Score >= 980000 && item.Score < 1000000) return true;
    });
    Array.prototype.push.apply(dispScore, filterScore);
  }

  if (MASTER[0].checked) {
    let filterScore = scoreJson.filter(function(item, index){
    if (item.Score == 1000000) return true;
    });
    Array.prototype.push.apply(dispScore, filterScore);
  }
  scoreTable.setData(dispScore);
};
