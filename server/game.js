const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState();
    state.food = randomFood(state);
    state.food2 = randomFood(state);
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
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ],
        }, {
            name: 'p2',
            pos: {
                x: 38,
                y: 30,
            },
            vel: {
                x: -1,
                y: 0,
            },
            snake: [
                {x: 40, y: 30},
                {x: 39, y: 30},
                {x: 38, y: 30},
            ],
        }],
        food: {},
        food2: {},
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
        console.log("player 1 hit the wall");
        return 2;
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        // then player 1 wins
        console.log("player 2 hit the wall");
        return 1;
    }

    // check if player has just eaten food, then make player one size larger
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        // add a new food item
        state.food = randomFood(state);
    }

    if (state.food2.x === playerOne.pos.x && state.food2.y === playerOne.pos.y) {
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        // add a new food item
        state.food2 = randomFood(state);
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        state.food = randomFood(state);
    }

    if (state.food2.x === playerTwo.pos.x && state.food2.y === playerTwo.pos.y) {
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        state.food2 = randomFood(state);
    }

    // check for snake collisions
    // if player is moving...
    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            // check if any cells of the player's snake overlap with itself i.e. they lost
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                // then player 2 wins
                console.log("player 1 hit itself");
                return 2;
            }
            // check if player 2's head overlaps with any of player 1's body i.e. collision
            if (playerTwo.snake[playerTwo.snake.length - 1].x === cell.x && playerTwo.snake[playerTwo.snake.length - 1].y === cell.y) {
                // then player 1 wins
                console.log("player 2 hit player 1");
                return 1;
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
                console.log("player 2 hit itself");
                return 1;
            }
            if (playerOne.snake[playerOne.snake.length - 1].x === cell.x && playerOne.snake[playerOne.snake.length - 1].y === cell.y) {
                // then player 2 wins
                console.log("player 1 hit player 2");
                return 2;
            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;

}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * (GRID_SIZE - 4) + 2),
        y: Math.floor(Math.random() * (GRID_SIZE - 4) + 2),
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

    return food;
}

function getUpdatedVelocity(keyCode, prev_vel) {

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 40;
    const DOWN_KEY = 38;
  
    const keyPressed = keyCode;
    const goingUp = prev_vel['y'] === 1;
    const goingDown = prev_vel['y'] === -1;
    const goingRight = prev_vel['x'] === 1;  
    const goingLeft = prev_vel['x'] === -1;

      if (keyPressed === LEFT_KEY && !goingRight) {    
        return { x: -1, y: 0};
      }
  
      if (keyPressed === UP_KEY && !goingDown) {    
        return { x: 0, y: 1};
      }
  
      if (keyPressed === RIGHT_KEY && !goingLeft) {    
        return { x: 1, y: 0};
      }
  
      if (keyPressed === DOWN_KEY && !goingUp) {    
        return { x: 0, y: -1};
      }
}
