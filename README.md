# NAOseryu.github.io

なんか作ったら置きます

## WACCAスコアツール
※作成中ですが一応使える（はず）  
https://naoseryu.github.io/wacca/top.html

#### できること
* スコアをデータベース(DynamoDB)に登録
* 登録したスコアの閲覧
  * 各項目でのソート
  * 難易度・スコアでの絞り込み

## 三倍icecreamスコア一覧用ブックマークレット
自分とライバルのスコアの差を表示してくれます。

複数のライバルのスコアを同時に表示できます。

表のヘッダーはスクロールに追従します。表の上にあるチェックボックスで各ライバル列の表示・非表示を切り替えられ、ライバルスコアでのソートもできます。

ライバルのスコアはブラウザーに保存され、取得から1日間は再実行時にAPI通信を省略します。「ライバルスコアを更新」ボタンを押すと、最新のスコアを取得してキャッシュも更新します。

#### 使い方
* 以下をブックマークに登録
```
javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/score_bookmarklet.js')
```

* [三倍icecream](https://3icecream.com/ddr/home)にログイン
* スコア一覧でブックマークを実行
* ライバル列を表示するには、表の上にある各ライバル名のチェックボックスをオンにする

## 三倍icecream難易度表用ブックマークレット
難易度表に自分のスコアを表示してくれます  
https://github.com/NAOseryu/NAOseryu.github.io/blob/master/ddr/difficulty_list_bookmarklet.js

#### 使い方
* 以下をブックマークに登録
```
javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/difficulty_list_bookmarklet.js')
```

* [三倍icecream](https://3icecream.com/ddr/home)にログイン
* スコアを表示したい[難易度表](https://3icecream.com/difficulty_list/15)のページを開く
* ブックマークを実行
