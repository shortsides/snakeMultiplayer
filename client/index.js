const BG_COLOUR = '#231f20';
const SNAKE_COLOUR_P1 = 'silver';
const SNAKE_COLOUR_P2 = 'red'
const SNAKE_COLOURS = ['silver', 'red', 'blue', 'pink', 'purple']
const FOOD_COLOUR = '#e66916'
const FOOD2_COLOUR = '#3CB371'

//const socket = io('https://quiet-coast-19364.herokuapp.com/');

// local testing config
const socket = io('http://localhost:3000/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameStart', handleGameStart);
socket.on('countdown', handleCountdown);
socket.on('joinedGame', handleJoinedGame);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameHeaderH1 = document.getElementById('gameHeaderH1');
const gameCodeH1 = document.getElementById('gameCodeH1');
const rematchButton = document.getElementById('rematchButton');
const startBtn = document.getElementById('startButton');
const numPlayersJoined = document.getElementById('numPlayersJoined');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
rematchButton.addEventListener('click', rematchGame);
startBtn.addEventListener('click', startGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame(){
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

function rematchGame() {
    const code = gameCodeDisplay.innerText;
    socket.emit('rematch', code);
}

function startGame() {
    const code = gameCodeDisplay.innerText;
    socket.emit('startGame', code);
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // define background as 600px
    canvas.width = canvas.height = 600;

    // draw background
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // activate game
    document.addEventListener('keydown', keydown);
    gameActive = true;

    // hide rematch button
    rematchButton.style.display = 'none';
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

function paintGame(state) {

    // draw background
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const food2 = state.food2;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    // draw food
    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);
    ctx.fillStyle = FOOD2_COLOUR;
    ctx.fillRect(food2.x * size, food2.y * size, size, size);

    // draw players
    for (let player of state.players) {
        paintPlayer(player, size);
    }

    // update heading for each player
    gameCodeH1.style.display = "none";
    if (playerNumber === 1) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOURS[0]}`;
        gameHeaderH1.style.color = SNAKE_COLOURS[0];
    } else if (playerNumber === 2) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOURS[1]}`;
        gameHeaderH1.style.color = SNAKE_COLOURS[1];
    } else if (playerNumber === 3) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOURS[2]}`;
        gameHeaderH1.style.color = SNAKE_COLOURS[2];
    } else if (playerNumber === 4) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOURS[3]}`;
        gameHeaderH1.style.color = SNAKE_COLOURS[3];
    } else if (playerNumber === 5) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOURS[4]}`;
        gameHeaderH1.style.color = SNAKE_COLOURS[4];
    }

}

function paintPlayer(playerState, size) {
    const snake = playerState.snake;

    ctx.fillStyle = playerState.colour;

    // loop through cells in snake and draw them on canvas
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        console.log('game not active');
        return;
    }
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    gameActive = false;
    rematchButton.style.display = 'block';
    document.getElementById("countdown").innerHTML = "GAME OVER";

    if (data.winner === playerNumber) {
        alert("You Win!")
    } else {
        alert("You Lose!")
    }
}

function handleGameCode(gameCode) {
    // display game code to user
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers() {
    reset();
    alert("This game is already in progress");
}

function handleJoinedGame(playerNum) {
    numPlayersJoined.innerText = `Player ${playerNum} has joined`;
    startBtn.style.display = 'block'; // show start button
}

function handleGameStart() {
    init();
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

function handleCountdown() {
    startBtn.style.display = 'none'; // hide start button
    // countdown timer
    var timeleft = 5;
    var downloadTimer = setInterval(function(){
      if(timeleft <= 0){
        clearInterval(downloadTimer);
        document.getElementById("countdown").innerHTML = "GAME START";
      } else {
        document.getElementById("countdown").innerHTML = timeleft + " seconds remaining";
      }
      timeleft -= 1;
    }, 1000);
}