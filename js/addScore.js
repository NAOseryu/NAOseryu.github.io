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

  // 「送信」ボタン押下時
  $("#execute").click(function(event) {
    $("font#sending").text("送信中。。。");
    addScore();
  });
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
        $("div#menu h3").text(cognitoUser.username + "でログインしてます");
      }
    });
  } else {
    $("div#menu h3").text("ログインしてません");
  }
};

/**
 * スコアをLambdaに送信する
 */
var addScore = function(){

  //スコアデータ編集
  var scoreObj = JSON.parse($("#scoreJson").val());
  var scoreJson = JSON.stringify(scoreObj);
  // ユーザID追加
  var payload = "{\"UserId\": \"" + cognitoUser.username + "\", \"Score\": " + scoreJson + "}";

  var lambda = new AWS.Lambda();

  var params = {
    FunctionName:"addWaccaScore",
    InvocationType:"RequestResponse",
    Payload:payload
  };

  lambda.invoke( params,function(err,data) {
    if(err) {
      console.log(err,err.stack);
      $("font#sending").text("");
    } else {
      console.log(data);
      // 送信成功の場合、スコア確認画面に遷移する
      location.href = "/wacca/viewScore.html?" + cognitoUser.username;
    }
  });
};
