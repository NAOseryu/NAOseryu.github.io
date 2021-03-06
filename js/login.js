// ユーザープールの設定
var poolData = {
  UserPoolId : 'ap-northeast-1_5ynbUsboz',
  ClientId : '4so6sevjpqoqmmhh3ki24r11fn'
};
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

/**
 * 画面読み込み時の処理
 */
$(document).ready(function() {

  // Amazon Cognito 認証情報プロバイダーの初期化
	AWS.config.region = 'ap-northeast-1'; // リージョン
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-1:221fd836-a94e-4135-b98c-d951bf2186c7'
	});

	// 「ログイン」ボタン押下時
	$("#execute").click(function(event) {
    login();
	});
});

/**
 * ログイン処理。
 */
var login = function() {

  var userId = $("#userId").val();
  var password = $("#password").val();
	// 何か1つでも未入力の項目がある場合、処理終了
  if (!userId | !password) {
  	return false;
  }

  // 認証データの作成
  var authenticationData = {
    Username: userId,
    Password: password,
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );

  var userData = {
  	Username: userId,
  	Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
  	onSuccess: function(result) {
  		var accessToken = result.getAccessToken().getJwtToken();

  		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
  		AWS.config.credentials.refresh(error => {
  			if (error) {
  				console.error(error);
  			} else {
  				// Instantiate aws sdk service objects now that the credentials have been updated.
  				// example: var s3 = new AWS.S3();
          //ログイン完了！topへ戻る
          location.href = "/wacca/top.html";
  				console.log('Successfully logged!');
  			}
  		});
  	},

  	onFailure: function(err) {
  		alert(err.message || JSON.stringify(err));
  	},
  });
}
