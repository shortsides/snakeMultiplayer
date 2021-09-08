const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame(numberOfPlayers) {
    const state = createGameState(numberOfPlayers);
    state.food = randomFood(state);
    state.food2 = randomFood(state);
    return state;
}

function createGameState (numberOfPlayers) {
    let gameState = {
        players: [{
            name: 1,
            colour: 'silver',
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
            lives: 3,
            points: 0,
            isAlive: true,
        }, {
            name: 2,
            colour: 'red',
            pos: {
                x: 38,
                y: 20,
            },
            vel: {
                x: -1,
                y: 0,
            },
            snake: [
                {x: 40, y: 20},
                {x: 39, y: 20},
                {x: 38, y: 20},
            ],
            lives: 3,
            points: 0,
            isAlive: true,
        }],
        food: {},
        food2: {},
        gridsize: GRID_SIZE,
    };

    const player3 = {
        name: 3,
        colour: 'lightskyblue',
        pos: {
            x: 3,
            y: 30,
        },
        vel: {
            x: 1,
            y: 0,
        },
        snake: [
            {x: 1, y: 30},
            {x: 2, y: 30},
            {x: 3, y: 30},
        ],
        lives: 3,
        points: 0,
        isAlive: true,
    };

    const player4 = {
        name: 4,
        colour: 'pink',
        pos: {
            x: 38,
            y: 40,
        },
        vel: {
            x: -1,
            y: 0,
        },
        snake: [
            {x: 40, y: 40},
            {x: 39, y: 40},
            {x: 38, y: 40},
        ],
        lives: 3,
        points: 0,
        isAlive: true,
    };

    const player5 = {
        name: 5,
        colour: 'blueviolet',
        pos: {
            x: 3,
            y: 40,
        },
        vel: {
            x: 1,
            y: 0,
        },
        snake: [
            {x: 1, y: 40},
            {x: 2, y: 40},
            {x: 3, y: 40},
        ],
        lives: 3,
        points: 0,
        isAlive: true,
    };
    
    if (numberOfPlayers === 2) {
        return gameState;
    } else if (numberOfPlayers === 3) {
        gameState.players.push(player3);
        return gameState;
    } else if (numberOfPlayers === 4) {
        gameState.players.push(player3, player4);
        return gameState;
    } else if (numberOfPlayers === 5) {
        gameState.players.push(player3, player4, player5);
        return gameState;
    }
}

function gameLoop (state) {
    if (!state) {
        return;
    }

    for (player of state.players) {

        if (player.isAlive) {
            // increase player's position by the velocity each frame
            player.pos.x += player.vel.x;
            player.pos.y += player.vel.y;

            // check if player has hit the edge of the game board i.e. they lost
            if (player.pos.x < 0 || player.pos.x > GRID_SIZE || player.pos.y < 0 || player.pos.y > GRID_SIZE) {
                // then player loses a life
                console.log(`${player.colour} player hit the wall`);
                return loseLife(player, state);
            }
            // check if player has just eaten food, then make player one size larger
            if (state.food.x === player.pos.x && state.food.y === player.pos.y) {
                player.snake.push({ ...player.pos });
                player.pos.x += player.vel.x;
                player.pos.y += player.vel.y;
                player.points++ // score a point
                // add a new food item
                state.food = randomFood(state);
            }
            if (state.food2.x === player.pos.x && state.food2.y === player.pos.y) {
                player.snake.push({ ...player.pos });
                player.pos.x += player.vel.x;
                player.pos.y += player.vel.y;
                player.points++
                state.food2 = randomFood(state);
            }
            // if player is moving...
            // check for snake collisions and move snake on screen
            if (player.vel.x || player.vel.y) {
                
                for (let cell of player.snake) {
                    // check if any cells of the player's snake overlap with itself i.e. they lost
                    if (cell.x === player.pos.x && cell.y === player.pos.y) {
                        // then player loses a life
                        console.log(`${player.colour} player hit itself`);
                        return loseLife(player, state);
                    }
                    // check if player 2's head overlaps with any of player 1's body i.e. collision
                    for (let otherPlayer of state.players) {
                        if (otherPlayer.name === player.name) {
                            continue;
                        }
                        if (!otherPlayer.isAlive) {
                            break;
                        }
                        if (otherPlayer.snake[otherPlayer.snake.length - 1].x === cell.x && otherPlayer.snake[otherPlayer.snake.length - 1].y === cell.y) {
                            // then player 2 loses a life
                            console.log(`${otherPlayer.colour} player hit ${player.colour} player`);
                            return loseLife(otherPlayer, state);
                        }
                    }
                }
                // 'move' snake by one cell i.e.
                // add new cell to head of snake and remove tail cell
                player.snake.push({ ...player.pos });
                player.snake.shift();
            }
        }
    }
    return false;
}

function loseLife(player, state) {
    player.lives--;
    console.log(`${player.colour} player has ${player.lives} live/s left`);
    player.isAlive = false;
    if (player.lives > -1) {
        playerReset(player);
    } else {
        return checkWinner(state);
    }
}

function playerReset(player) {
    // wait 1 second
    var time = 1;
    var timer = setInterval(function(){
        if(time <= 0){
            clearInterval(timer);
            // reset snake's position, velocity etc
            player.snake = [
            {x: 10, y: 10},
            {x: 11, y: 10},
            {x: 12, y: 10},];
            player.pos = {x: 12, y: 10};
            player.vel = {x: 1, y: 0};
            player.isAlive = true;
        }
        time -= 1
    }, 1000);
}

function checkWinner(state) {
    let losers = [];
    let alivePlayers = [];
    for (player of state.players) {
        if (player.lives < 0) {
            losers.push(player.name);
        } else {
            alivePlayers.push(player.name);
        }
    }
    if (alivePlayers.length === 1) {
        console.log(`winner is ${alivePlayers}`);
        return alivePlayers[0];
    }
    console.log('no winners yet');
    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * (GRID_SIZE - 4) + 2),
        y: Math.floor(Math.random() * (GRID_SIZE - 4) + 2),
    }

    // check if the new food is on any of the snakes' body cells
    for (let player of state.players) {
        for (let cell of player.snake) {
            if (cell.x === food.x && cell.y === food.y) {
                // recursively call randomFood to generate a different food
                return randomFood(state);
            }
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
