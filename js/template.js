$(function(){
  var poolData = {
    UserPoolId : 'ap-northeast-1_5ynbUsboz',
    ClientId : '4so6sevjpqoqmmhh3ki24r11fn'
  };
  // ユーザ名取得
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const cognitoUser = userPool.getCurrentUser();  // 現在のユーザー

  $("#header").load("../wacca/include/header.html");
});
