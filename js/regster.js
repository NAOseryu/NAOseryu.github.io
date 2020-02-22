// ユーザープールの設定
const poolData = {
  UserPoolId : 'ap-northeast-1_5ynbUsboz',
  ClientId : '4so6sevjpqoqmmhh3ki24r11fn'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

var attributeList = [];

/**
 * 画面読み込み時の処理
 */
$(document).ready(function() {

	// Amazon Cognito 認証情報プロバイダーの初期化
	AWSCognito.config.region = 'ap-northeast-1'; // リージョン
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:221fd836-a94e-4135-b98c-d951bf2186c7'
	});

	// 「Create Account」ボタン押下時
	$("#regster").click(function(event) {
    regster();
	});
});

/**
 * サインアップ処理。
 */
var regster = function() {

	var userId = $("#userId").val();
	var password = $("#password").val();

	// 何か1つでも未入力の項目がある場合、処理終了
  if (!userId | !password) {
  	return false;
  }

  // サインアップ処理
  userPool.signUp(userId, password, null, null, function(err, result){
    if (err) {
    	alert(err);
		return;
    } else {
      	// サインアップ成功の場合、アクティベーション画面に遷移する
        location.href = "https://naoseryu.github.io/wacca/registerSuccess.html";
    }
  });
}
