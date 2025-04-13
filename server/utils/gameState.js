/**
 * Game State Manager
 * 
 * Handles player's game state, including position, fog of war, and score calculations.
 */

// In-memory store for active game sessions (in production, this would use a database)
const activeGames = new Map();

// Add a debug flag to enable or disable logging
const DEBUG = process.env.DEBUG === 'true';

function logDebug(message, ...optionalParams) {
    if (DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
}

/**
 * Initialize a new game state for a player
 * 
 * @param {string} userId - User identifier
 * @param {object} maze - Generated maze object
 * @returns {object} Initial game state
 */
function initializeGameState(userId, maze) {
    logDebug('Initializing game state', { userId, maze });

    // Create fog of war grid (1 = fogged, 0 = visible)
    const fogGrid = Array(maze.height).fill().map(() => Array(maze.width).fill(1));
    logDebug('Fog grid created', fogGrid);

    // Set player position to start point
    const playerPosition = {
        x: maze.startX,
        y: maze.startY
    };
    logDebug('Player position set', playerPosition);

    // Reveal area around player's starting position
    revealFogAroundPlayer(fogGrid, playerPosition, 2); // Visibility radius of 2
    logDebug('Fog revealed around player', fogGrid);

    // Calculate total cells and initial fog percentage
    const totalCells = maze.width * maze.height;
    const initialVisibleCells = countVisibleCells(fogGrid);
    const fogPercentage = 100 - (initialVisibleCells / totalCells * 100);
    logDebug('Fog percentage calculated', { totalCells, initialVisibleCells, fogPercentage });

    const gameState = {
        userId,
        maze,
        playerPosition,
        fogGrid,
        fogPercentage,
        startTime: Date.now(),
        steps: 0,
        status: 'active'
    };

    // Store game state
    activeGames.set(userId, gameState);
    logDebug('Game state stored', gameState);

    return gameState;
}

/**
 * Update player position and reveal surrounding fog
 * 
 * @param {string} userId - User identifier
 * @param {object} position - New position {x, y}
 * @returns {object} Updated game state
 */
function updatePlayerPosition(userId, position) {
    const gameState = activeGames.get(userId);

    if (!gameState) {
        throw new Error('Game not found');
    }

    // Update position
    gameState.playerPosition = position;
    logDebug('Player position updated', position);

    // Reveal fog around new position
    revealFogAroundPlayer(gameState.fogGrid, position, 2);
    logDebug('Fog revealed around new position', gameState.fogGrid);

    // Update fog percentage
    const totalCells = gameState.maze.width * gameState.maze.height;
    const visibleCells = countVisibleCells(gameState.fogGrid);
    gameState.fogPercentage = 100 - (visibleCells / totalCells * 100);
    logDebug('Fog percentage updated', gameState.fogPercentage);

    // Increment steps counter
    gameState.steps++;
    logDebug('Steps incremented', gameState.steps);

    // Check if player reached exit
    if (position.x === gameState.maze.exitX && position.y === gameState.maze.exitY) {
        gameState.status = 'completed';
        gameState.endTime = Date.now();
        gameState.completionTime = (gameState.endTime - gameState.startTime) / 1000; // in seconds
        logDebug('Game completed', { endTime: gameState.endTime, completionTime: gameState.completionTime });
    }

    // Update stored game state
    activeGames.set(userId, gameState);
    logDebug('Game state updated', gameState);

    return gameState;
}

/**
 * Calculate final score when game is completed
 * 
 * @param {string} userId - User identifier
 * @returns {object} Final game results and score
 */
function calculateFinalScore(userId) {
    const gameState = activeGames.get(userId);

    if (!gameState) {
        throw new Error('Game not found');
    }

    if (gameState.status !== 'completed') {
        throw new Error('Game not completed yet');
    }

    // Base points from fog percentage
    const fogPoints = Math.floor(gameState.fogPercentage * 10);

    // Bonus points based on difficulty
    const difficultyMultiplier = getDifficultyMultiplier(gameState.maze.difficulty);

    // Time bonus (faster completion = more points)
    const timeBonus = calculateTimeBonus(gameState.completionTime, gameState.maze.difficulty);

    // Calculate total score
    const totalScore = fogPoints * difficultyMultiplier + timeBonus;

    const result = {
        userId: gameState.userId,
        score: totalScore,
        fogPercentage: gameState.fogPercentage.toFixed(2),
        completionTime: gameState.completionTime.toFixed(1),
        steps: gameState.steps,
        difficulty: gameState.maze.difficulty,
        coins: Math.floor(totalScore / 10) // Convert score to coins
    };

    // In a real app, save score to database here

    // Remove from active games
    activeGames.delete(userId);

    return result;
}

/**
 * Get difficulty multiplier for scoring
 * 
 * @param {string} difficulty - Difficulty level
 * @returns {number} Score multiplier
 * @private
 */
function getDifficultyMultiplier(difficulty) {
    switch (difficulty) {
        case 'easy': return 1;
        case 'medium': return 1.5;
        case 'hard': return 2;
        default: return 1;
    }
}

/**
 * Calculate time bonus based on completion time
 * 
 * @param {number} completionTime - Time in seconds
 * @param {string} difficulty - Difficulty level
 * @returns {number} Time bonus points
 * @private
 */
function calculateTimeBonus(completionTime, difficulty) {
    let par; // Par time in seconds

    switch (difficulty) {
        case 'easy': par = 120; break; // 2 minutes
        case 'medium': par = 240; break; // 4 minutes
        case 'hard': par = 360; break; // 6 minutes
        default: par = 240;
    }

    // If completed faster than par, award bonus points
    if (completionTime < par) {
        return Math.floor((par - completionTime) * 0.5);
    }

    return 0;
}

/**
 * Reveal fog around player's position
 * 
 * @param {Array} fogGrid - 2D fog grid
 * @param {object} position - Player position {x, y}
 * @param {number} radius - Visibility radius
 * @private
 */
function revealFogAroundPlayer(fogGrid, position, radius) {
    const height = fogGrid.length;
    const width = fogGrid[0].length;

    for (let y = Math.max(0, position.y - radius); y <= Math.min(height - 1, position.y + radius); y++) {
        for (let x = Math.max(0, position.x - radius); x <= Math.min(width - 1, position.x + radius); x++) {
            // Calculate distance from player
            const distance = Math.sqrt(Math.pow(position.x - x, 2) + Math.pow(position.y - y, 2));

            // If within radius, reveal fog
            if (distance <= radius) {
                fogGrid[y][x] = 0;
            }
        }
    }
}

/**
 * Count visible (non-fogged) cells in the fog grid
 * 
 * @param {Array} fogGrid - 2D fog grid
 * @returns {number} Count of visible cells
 * @private
 */
function countVisibleCells(fogGrid) {
    return fogGrid.reduce((count, row) => {
        return count + row.reduce((rowCount, cell) => {
            return rowCount + (cell === 0 ? 1 : 0);
        }, 0);
    }, 0);
}

module.exports = {
    initializeGameState,
    updatePlayerPosition,
    calculateFinalScore
};