/**
 * Maze Generator Utility
 * 
 * Generates procedural 2D mazes using different algorithms.
 * Supports various difficulty levels and maze sizes.
 */

// Add a debug flag to enable or disable logging
const DEBUG = process.env.DEBUG === 'true';

function logDebug(message, ...optionalParams) {
    if (DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
}

class MazeGenerator {
    /**
     * Generate a maze using the Depth-First Search algorithm
     * 
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {object} Generated maze data structure
     */
    generate(difficulty = 'medium') {
        logDebug('Generating maze', { difficulty });
        // Set maze dimensions based on difficulty
        let width, height;
        switch (difficulty) {
            case 'easy':
                width = 15;
                height = 15;
                break;
            case 'medium':
                width = 25;
                height = 25;
                break;
            case 'hard':
                width = 35;
                height = 35;
                break;
            default:
                width = 25;
                height = 25;
        }

        logDebug('Maze dimensions set', { width, height });

        // Initialize maze grid with walls
        const maze = Array(height).fill().map(() => Array(width).fill(1));
        logDebug('Maze grid initialized', maze);

        // Define starting point (center of the maze)
        const startX = Math.floor(width / 2);
        const startY = Math.floor(height / 2);
        logDebug('Start point defined', { startX, startY });

        // Define exit point (random edge position)
        const exitSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let exitX, exitY;

        switch (exitSide) {
            case 0: // top
                exitX = Math.floor(Math.random() * (width - 2)) + 1;
                exitY = 0;
                break;
            case 1: // right
                exitX = width - 1;
                exitY = Math.floor(Math.random() * (height - 2)) + 1;
                break;
            case 2: // bottom
                exitX = Math.floor(Math.random() * (width - 2)) + 1;
                exitY = height - 1;
                break;
            case 3: // left
                exitX = 0;
                exitY = Math.floor(Math.random() * (height - 2)) + 1;
                break;
        }

        logDebug('Exit point defined', { exitX, exitY });

        // Use DFS to carve paths
        this._carveMazeDFS(maze, startX, startY);
        logDebug('Maze paths carved');

        // Ensure path to exit
        this._ensurePathToExit(maze, startX, startY, exitX, exitY);
        logDebug('Path to exit ensured');

        // Mark start and exit points
        maze[startY][startX] = 2; // Start position
        maze[exitY][exitX] = 3;   // Exit position
        logDebug('Start and exit points marked', { startX, startY, exitX, exitY });

        return {
            grid: maze,
            width,
            height,
            startX,
            startY,
            exitX,
            exitY,
            difficulty
        };
    }

    /**
     * Carve passages using Depth-First Search with backtracking
     * 
     * @param {Array} maze - 2D maze grid
     * @param {number} x - Current X position
     * @param {number} y - Current Y position
     * @private
     */
    _carveMazeDFS(maze, x, y) {
        logDebug('Carving maze at position', { x, y });
        // Mark current cell as path
        maze[y][x] = 0;

        // Define possible directions (up, right, down, left)
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ];

        // Shuffle directions for randomness
        this._shuffleArray(directions);
        logDebug('Directions shuffled', directions);

        // Try each direction
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            // Check if the new position is valid and still a wall
            if (this._isValidPosition(maze, nx, ny) && maze[ny][nx] === 1) {
                logDebug('Carving passage to new position', { nx, ny });
                // Carve passage by making the wall between current and new position a path
                maze[y + dy / 2][x + dx / 2] = 0;

                // Continue DFS from new position
                this._carveMazeDFS(maze, nx, ny);
            }
        }
    }

    /**
     * Ensures there's a clear path from start to exit
     * 
     * @param {Array} maze - 2D maze grid
     * @param {number} startX - Start X position
     * @param {number} startY - Start Y position
     * @param {number} exitX - Exit X position
     * @param {number} exitY - Exit Y position
     * @private
     */
    _ensurePathToExit(maze, startX, startY, exitX, exitY) {
        logDebug('Ensuring path to exit', { startX, startY, exitX, exitY });
        // Simple implementation: create a direct path if exit is on the edge
        if (exitX === 0 || exitY === 0 || exitX === maze[0].length - 1 || exitY === maze.length - 1) {
            // Create a path to the nearest point we've already carved
            let currentX = exitX;
            let currentY = exitY;

            while (maze[currentY][currentX] !== 0) {
                logDebug('Carving direct path to exit', { currentX, currentY });
                maze[currentY][currentX] = 0;

                // Move towards the center
                if (currentX < startX) currentX++;
                else if (currentX > startX) currentX--;

                if (currentY < startY) currentY++;
                else if (currentY > startY) currentY--;
            }
        }
    }

    /**
     * Checks if a position is within maze bounds
     * 
     * @param {Array} maze - 2D maze grid
     * @param {number} x - X position to check
     * @param {number} y - Y position to check
     * @returns {boolean} True if position is valid
     * @private
     */
    _isValidPosition(maze, x, y) {
        const isValid = y >= 0 && y < maze.length && x >= 0 && x < maze[0].length;
        logDebug('Checking position validity', { x, y, isValid });
        return isValid;
    }

    /**
     * Shuffles an array in-place using Fisher-Yates algorithm
     * 
     * @param {Array} array - Array to shuffle
     * @private
     */
    _shuffleArray(array) {
        logDebug('Shuffling array', array);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        logDebug('Array shuffled', array);
    }
}

module.exports = new MazeGenerator();