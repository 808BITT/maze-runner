/**
 * Game Controller
 * 
 * Handles game-related actions like player movement and game completion
 */

const { updatePlayerPosition, calculateFinalScore } = require('../utils/gameState');

/**
 * Handle player movement in the maze
 * 
 * @param {string} userId - User identifier
 * @param {string} direction - Movement direction ('up', 'right', 'down', 'left')
 * @returns {object} Updated game state
 */
function handlePlayerMovement(userId, direction) {
    try {
        // Get current game state from the in-memory store
        // This would typically come from a database in production
        const gameState = require('../utils/gameState').activeGames.get(userId);

        if (!gameState) {
            throw new Error('Game not found');
        }

        // Calculate new position based on direction
        const newPosition = { ...gameState.playerPosition };

        switch (direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            default:
                throw new Error('Invalid direction');
        }

        // Check if new position is valid (not a wall)
        if (isValidMove(gameState.maze.grid, newPosition)) {
            // Update player position and reveal fog
            return updatePlayerPosition(userId, newPosition);
        } else {
            // Return unchanged state if move is invalid
            return gameState;
        }
    } catch (error) {
        console.error('Error in handlePlayerMovement:', error);
        throw error;
    }
}

/**
 * Handle game completion and score calculation
 * 
 * @param {string} userId - User identifier
 * @param {object} gameState - Current game state
 * @returns {object} Final score and results
 */
function handleGameCompletion(userId, gameState) {
    try {
        // Verify that player is at the exit
        if (gameState.playerPosition.x !== gameState.maze.exitX ||
            gameState.playerPosition.y !== gameState.maze.exitY) {
            throw new Error('Player has not reached the exit');
        }

        // Calculate final score
        const finalResults = calculateFinalScore(userId);

        // In production, save score to database here
        // saveScoreToDatabase(userId, finalResults);

        return finalResults;
    } catch (error) {
        console.error('Error in handleGameCompletion:', error);
        throw error;
    }
}

/**
 * Check if a move is valid (not a wall)
 * 
 * @param {Array} mazeGrid - 2D maze grid
 * @param {object} position - Position to check {x, y}
 * @returns {boolean} True if move is valid
 * @private
 */
function isValidMove(mazeGrid, position) {
    // Check if position is within grid bounds
    if (position.y < 0 || position.y >= mazeGrid.length ||
        position.x < 0 || position.x >= mazeGrid[0].length) {
        return false;
    }

    // Check if position is not a wall (0 = path, 1 = wall, 2 = start, 3 = exit)
    return mazeGrid[position.y][position.x] !== 1;
}

module.exports = {
    handlePlayerMovement,
    handleGameCompletion
};