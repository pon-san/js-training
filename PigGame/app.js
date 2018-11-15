/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

var scores, roundScore, activePlayer, onGame

initialize();

//NEW GAMEクリック時の処理
document.querySelector('.btn-new').addEventListener('click', initialize);

// ROLL DICEボタンクリック時の処理
document.querySelector('.btn-roll').addEventListener('click', function() {
	if(onGame) {
		// サイコロ定義
		var dice = Math.floor(Math.random()*6) + 1;
		var diceDOM = document.querySelector('.dice');

		//サイコロ描画
		diceDOM.src = 'dice-' + dice + '.png';
		diceDOM.style.display = 'block';

		// サイコロが1以外の時は加算、それ以外の時は攻守交代
		if(dice !== 1) {
			roundScore += dice;
			document.getElementById('current-' + activePlayer).textContent = roundScore;
		} else {
			switchPlayer();
		}
	}
});

// HOLDボタンクリック時の処理
document.querySelector('.btn-hold').addEventListener('click', function() {
	if(onGame) {
		scores[activePlayer] += roundScore;
		document.getElementById('score-' + activePlayer).textContent = scores[activePlayer];
		document.getElementById('current-' + activePlayer).textContent = roundScore;
		if(scores[activePlayer] >= 20) {
			// finish the game
			roundScore = 0;
			document.querySelector('.dice').style.display = 'none';
			document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
			document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
			document.getElementById('name-' + activePlayer).textContent ='Winner!';
			onGame = false;
		} else {
			switchPlayer();
		}
	}
});

function initialize() {
	scores = [0, 0];
	roundScore = 0;
	activePlayer = 0;
	onGame = true;
	document.getElementById('score-0').textContent = 0;
	document.getElementById('score-1').textContent = 0;
	document.getElementById('current-0').textContent = 0;
	document.getElementById('current-1').textContent = 0;
	document.getElementById('name-0').textContent ='Player1';
	document.getElementById('name-1').textContent ='Player2';
	document.querySelector('.dice').style.display = 'none';
	document.querySelector('.player-0-panel').classList.remove('active');
	document.querySelector('.player-1-panel').classList.remove('active');
	document.querySelector('.player-0-panel').classList.add('active');
	document.querySelector('.player-0-panel').classList.remove('winner');
	document.querySelector('.player-1-panel').classList.remove('winner');
};

function switchPlayer() {
	// プレイヤーを入れ替える
	activePlayer === 0 ? activePlayer = 1 : activePlayer = 0;
	document.querySelector('.player-0-panel').classList.toggle('active');
	document.querySelector('.player-1-panel').classList.toggle('active');

	// roundScoreをリセット
	roundScore = 0;
	document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';
};















