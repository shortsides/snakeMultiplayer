const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {origin: true}
});

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { emit } = require("process");
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on("connection", client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('rematch', handleRematch);

    function handleRematch(roomName){
        const room = io.sockets.adapter.rooms.get(roomName);

        let numClients = 0;
        if (room) {
            numClients = room.size;
        }
    
        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 5) {
            client.emit('tooManyPlayers');
            return;
        }

        state[roomName] = initGame(numClients); // init game on server
        io.sockets.in(roomName).emit('rematchStart'); // init game for all clients in room
        handleStartGame(roomName);
    }

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
    
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }
    
        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 5) {
            client.emit('tooManyPlayers');
            return;
        }
    
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        client.join(roomName);
        numClients = room.size;
        client.number = numClients;
        console.log(`player ${client.number} has joined`);
        client.emit('init', client.number);
        
        // start the game
        state[roomName] = initGame(numClients);
        handleStartGame(roomName);
    }

    function handleNewGame() {
        let roomName = makeid(5);

        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        client.join(roomName);
        console.log('player 1 has joined');
        client.number = 1;
        client.emit('init', 1);
    }

    function handleStartGame(roomName) {
        
        io.sockets.in(roomName).emit('countdown'); // client countdown

        // server countdown
        var timeleft = 5;
        var downloadTimer = setInterval(function(){
          if(timeleft <= 0){
            clearInterval(downloadTimer);
            startGameInterval(roomName); // start game
          }
          timeleft -= 1;
        }, 1000);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName || !state[roomName]) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);

        } catch(e) {
            console.error(e);
            return;
        }

        prev_vel = state[roomName].players[client.number - 1].vel

        const vel = getUpdatedVelocity(keyCode, prev_vel);

        if (vel) {
            // update velocity to new velocity
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);
        // check state of game if there is a winner
        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state) {
    io.sockets.in(roomName).emit('gameState', state);
}

function emitGameOver(roomName, winner) {
    io.sockets.in(roomName).emit('gameOver', { winner });
}

httpServer.listen(process.env.PORT || 3000);