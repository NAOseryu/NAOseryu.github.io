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
});

// 「送信」ボタン押下時
$("#regster").click(function(event) {
  addScore();
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
  
  //AWS.config.update({credentials: AWS.config.credentials ,region:"us-west-2"});

  var context = Base64.encode(JSON.stringify( $("#scoreCsv").val() ));

  var lambda = new AWS.Lambda();

  var params = {
    FunctionName:"addWaccaScore",
    InvocationType:"RequestResponse",
    ClientContext:context
  };

  lambda.invoke( params,function(err,data) {
    if(err) console.log(err,err.stack);
    else console.log(data);
  });
};