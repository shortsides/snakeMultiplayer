const { pbkdf2 } = require('crypto');
const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState () {
    return {
        players: [{
            name: 'p1',
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake: [
                {x: 1, x: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        }, {
            name: 'p2',
            pos: {
                x: 18,
                y: 10,
            },
            vel: {
                x: -1,
                y: 0,
            },
            snake: [
                {x: 20, x: 10},
                {x: 19, y: 10},
                {x: 18, y: 10},
            ],
        }],
        food: {},
        gridsize: GRID_SIZE,
    };
}

function gameLoop (state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    // increase player's position by the velocity each frame
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    // check if player has hit the edge of the game board i.e. they lost
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        // then player 2 wins
        return 2;
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        // then player 1 wins
        return 1;
    }

    // check if player has just eaten food, then make player one size larger
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        // add a new food item
        randomFood(state);
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state);
    }

    // check if the player's snake overlaps with itself i.e. they lost
    // if player is moving...
    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            // check if any cells of the player's snake overlap
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                // then player 2 wins
                return 2;
            }
        }
        // 'move' snake by one cell i.e.
        // add new cell to head of snake and remove tail cell
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                // then player 1 wins
                return 1;
            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;

}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2) + 2),
        y: Math.floor(Math.random() * (GRID_SIZE - 2) + 2),
    }

    // check if the new food is on any of the snake's body cells
    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // recursively call randomFood to generate a different food
            return randomFood(state);
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // recursively call randomFood to generate a different food
            return randomFood(state);
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: { // left
            return { x: -1, y: 0};
        }
        case 38: { // down
            return { x: 0, y: -1};
        }
        case 39: { // right
            return { x: 1, y: 0};
        }
        case 40: { // up
            return { x: 0, y: 1};
        }
    }
}