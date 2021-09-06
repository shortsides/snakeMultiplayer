const BG_COLOUR = '#231f20';
const SNAKE_COLOUR_P1 = 'silver';
const SNAKE_COLOUR_P2 = 'red'
const FOOD_COLOUR = '#e66916'

const socket = io('https://quiet-coast-19364.herokuapp.com/', {
    withCredentials: true
});

// local testing config
//const socket = io('http://localhost:3000/', {
//    withCredentials: true
//});

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameHeaderH1 = document.getElementById('gameHeaderH1');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame(){
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;


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

    document.addEventListener('keydown', keydown);
    gameActive = true;
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
    } else if (playerNumber === 2) {
        gameHeaderH1.innerText = `You are ${SNAKE_COLOUR_P2}`;
        gameHeaderH1.style.color = SNAKE_COLOUR_P2;
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);

    gameActive = false;

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

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}
