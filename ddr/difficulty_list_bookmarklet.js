// 「javascript:(function(url){s=document.createElement('script');s.src=url;document.body.appendChild(s);})('https://naoseryu.github.io/ddr/difficulty_list_bookmarklet.js')」
// をブックマークに登録して実行すること
for (chartKey of Object.keys(difficultyList).concat(missingChartsChartKeys)) {
	let score = indexedAllScores[chartKey];

	if (score) {
		scoreText = document.createElement('p');
		scoreText.style.fontSize='0.5em';
		scoreText.style.margin='0px 0px 0px 0px'
		scoreText.textContent = score.score

		if (score.lamp == '0') {
			scoreText.style.color = '#808080';
		} else if (score.score >= 990000) {
			scoreText.style.color = '#FFFF00';
		} else if (score.score < 790000) {
			scoreText.style.color = '#00FFFF';
		}

		$('#div-jacket-' + chartKey.replace('/', '-')).append(scoreText);
	}
}