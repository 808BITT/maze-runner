/**
 * Game Renderer Utilities
 * 
 * Contains functions for rendering the maze, player, and fog of war on canvas
 */

// Cell size in pixels
const CELL_SIZE = 20;

/**
 * Render the maze grid on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {object} maze - Maze data object
 */
export function renderMaze(ctx, maze) {
    const { grid, width, height } = maze;

    // Set canvas dimensions
    ctx.canvas.width = width * CELL_SIZE;
    ctx.canvas.height = height * CELL_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw maze cells
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y][x];
            const xPos = x * CELL_SIZE;
            const yPos = y * CELL_SIZE;

            // Draw cell based on type
            switch (cell) {
                case 0: // Path
                    ctx.fillStyle = '#444444';
                    break;
                case 1: // Wall
                    ctx.fillStyle = '#111111';
                    break;
                case 2: // Start
                    ctx.fillStyle = '#4a74e8';
                    break;
                case 3: // Exit
                    ctx.fillStyle = '#8149e8';
                    break;
                default:
                    ctx.fillStyle = '#333333';
            }

            ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

            // Add grid lines
            ctx.strokeStyle = '#222222';
            ctx.lineWidth = 1;
            ctx.strokeRect(xPos, yPos, CELL_SIZE, CELL_SIZE);
        }
    }
}

/**
 * Render fog of war overlay on canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Array} fogGrid - 2D array representing fog of war (1=fogged, 0=visible)
 */
export function renderFogOfWar(ctx, fogGrid) {
    const height = fogGrid.length;
    const width = fogGrid[0].length;

    // Set canvas dimensions
    ctx.canvas.width = width * CELL_SIZE;
    ctx.canvas.height = height * CELL_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw fog
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (fogGrid[y][x] === 1) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

/**
 * Render player character on canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {object} position - Player position {x, y}
 * @param {object} maze - Maze data object (for dimensions)
 */
export function renderPlayer(ctx, position, maze) {
    const { x, y } = position;

    // Calculate center position of the cell
    const centerX = (x * CELL_SIZE) + (CELL_SIZE / 2);
    const centerY = (y * CELL_SIZE) + (CELL_SIZE / 2);
    const radius = CELL_SIZE * 0.35;

    // Draw player circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e84a74';
    ctx.fill();

    // Add outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add shadow
    ctx.shadowColor = '#e84a74';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
}

/**
 * Calculate viewport dimensions and offsets for camera follow
 * Note: For future implementation of camera that follows player
 * 
 * @param {object} position - Player position
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {object} maze - Maze data object
 * @returns {object} Viewport info {offsetX, offsetY, visibleWidth, visibleHeight}
 */
export function calculateViewport(position, canvasWidth, canvasHeight, maze) {
    const mazeWidthPx = maze.width * CELL_SIZE;
    const mazeHeightPx = maze.height * CELL_SIZE;

    // Center viewport on player
    let offsetX = (position.x * CELL_SIZE) - (canvasWidth / 2);
    let offsetY = (position.y * CELL_SIZE) - (canvasHeight / 2);

    // Bound offsets to keep viewport within maze
    offsetX = Math.max(0, Math.min(offsetX, mazeWidthPx - canvasWidth));
    offsetY = Math.max(0, Math.min(offsetY, mazeHeightPx - canvasHeight));

    return {
        offsetX,
        offsetY,
        visibleWidth: Math.min(canvasWidth, mazeWidthPx),
        visibleHeight: Math.min(canvasHeight, mazeHeightPx)
    };
}