// 「javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/difficulty_list_bookmarklet.js')」
// をブックマークに登録して実行すること
for (chartKey of Object.keys(difficultyList).concat(missingChartsChartKeys)) {
	let score = indexedAllScores[chartKey];

	if (score) {
		scoreText = document.createElement('p');
		scoreText.style.fontSize='20px';
		scoreText.style.margin='0px 0px 0px 0px'
		scoreText.style.paddingRight='5px'
		scoreText.textContent = score.score

		if (score.lamp === 0) {
			scoreText.style.color = '#808080';
		} else if (score.lamp === 5) {
			scoreText.style.background = 'linear-gradient(0deg, #ffffff 25%, #a5ffe5 40%, #ffc4f9 55%)';
			scoreText.style.color = 'transparent';
			scoreText.style.webkitBackgroundClip = 'text';
			scoreText.style.backgroundClip = 'text';
			scoreText.style.webkitTextFillColor = 'transparent';
		} else if (score.score >= 990000) {
			scoreText.style.color = '#FFFF00';
		} else if (score.score >= 950000) {
			scoreText.style.color = '#30d81e';
		} else if (score.score < 790000) {
			scoreText.style.color = '#00FFFF';
		}

		scoreTime = document.createElement('p');
		scoreTime.style.fontSize='20px';
		scoreTime.style.margin='0px 0px 0px 0px'
		scoreTime.style.paddingRight='5px'
		let updateTime = new Date(score.score_time * 1000);
		scoreTime.textContent = updateTime.toLocaleDateString('ja-JP')

		$('#div-jacket-' + chartKey.replace('/', '-')).append(scoreText, scoreTime);
	}
}
