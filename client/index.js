const BG_COLOUR = '#231f20';
const SNAKE_COLOUR_P1 = 'silver';
const SNAKE_COLOUR_P2 = 'red'
const FOOD_COLOUR = '#e66916'

const socket = io('https://quiet-coast-19364.herokuapp.com/');

// local testing config
//const socket = io('http://localhost:3000/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('rematchStart', handleRematchStart);
socket.on('countdown', handleCountdown);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameHeaderH1 = document.getElementById('gameHeaderH1');
const gameCodeH1 = document.getElementById('gameCodeH1');
const rematchButton = document.getElementById('rematchButton');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
rematchButton.addEventListener('click', rematchGame);

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
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    // draw food
    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    // draw players
    paintPlayer(state.players[0], size, SNAKE_COLOUR_P1);
    paintPlayer(state.players[1], size, SNAKE_COLOUR_P2);
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;

    // loop through cells in snake and draw them on canvas
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }

    // update heading for each player
    if (playerNumber === 1) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOUR_P1}`;
        gameHeaderH1.style.color = SNAKE_COLOUR_P1;
        gameCodeH1.style.display = "none";
    } else if (playerNumber === 2) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOUR_P2}`;
        gameHeaderH1.style.color = SNAKE_COLOUR_P2;
        gameCodeH1.style.display = "none";
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
    //gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    //data = JSON.parse(data);

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

function handleRematchStart() {
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