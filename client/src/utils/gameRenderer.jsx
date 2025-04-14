/**
 * Game Renderer Utilities
 * 
 * Contains functions for rendering the maze, player, and fog of war on canvas
 */

// Cell size in pixels
const CELL_SIZE = 20;

// Add a debug flag to enable or disable logging
const DEBUG = import.meta.env.REACT_APP_DEBUG === 'true';

function logDebug(message, ...optionalParams) {
    if (DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
}

/**
 * Render the maze grid on the canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {object} maze - Maze data object
 */
export function renderMaze(ctx, maze) {
    logDebug('Rendering maze', maze);
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
 * @param {object} position - Player position for zoomed view {x, y}
 * @param {number} viewRadius - Radius of visibility around player (in cells)
 * @param {Array} mazeGrid - 2D array representing maze walls for line-of-sight
 */
export function renderFogOfWar(ctx, fogGrid, position, viewRadius, mazeGrid) {
    logDebug('Rendering fog of war', fogGrid);
    const height = fogGrid.length;
    const width = fogGrid[0].length;

    // Set canvas dimensions
    ctx.canvas.width = width * CELL_SIZE;
    ctx.canvas.height = height * CELL_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw fog overlay
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (fogGrid[y][x] === 1) { // Fogged area
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Reveal visible area around the player
    const visibleCells = getVisibleCells(position.x, position.y, viewRadius, width, height, mazeGrid);
    visibleCells.forEach(cell => {
        ctx.clearRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

/**
 * Get all cells visible from a given position using a field-of-view algorithm
 * 
 * @param {number} startX - Starting X position in grid coordinates
 * @param {number} startY - Starting Y position in grid coordinates
 * @param {number} radius - Visibility radius in grid cells
 * @param {number} gridWidth - Width of the grid
 * @param {number} gridHeight - Height of the grid
 * @param {Array} mazeGrid - 2D maze grid with walls
 * @returns {Array} Array of visible cells {x, y}
 */
function getVisibleCells(startX, startY, radius, gridWidth, gridHeight, mazeGrid) {
    const visibleCells = new Set();
    const radiusSq = radius * radius;

    // Always include the starting cell
    visibleCells.add(`${startX},${startY}`);

    // Helper function to check if a cell at x,y is a wall
    const isWall = (x, y) => {
        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return true;
        return mazeGrid[y][x] === 1;
    };

    // Helper function to check if a cell at x,y is in view range
    const isInRange = (x, y) => {
        const dx = x - startX;
        const dy = y - startY;
        return (dx * dx + dy * dy) <= radiusSq;
    };

    // Cast visibility rays in a full 360-degree sweep
    for (let octant = 0; octant < 8; octant++) {
        castVisibilityOctant(startX, startY, radius, octant, visibleCells, isWall, isInRange, gridWidth, gridHeight);
    }

    // Convert the set of cell coordinates to an array of objects
    const result = [];
    visibleCells.forEach(coord => {
        const [x, y] = coord.split(',').map(Number);
        result.push({ x, y });
    });

    return result;
}

/**
 * Cast visibility in a specific octant (1/8th of a circle)
 * This uses a recursive shadowcasting algorithm
 */
function castVisibilityOctant(startX, startY, radius, octant, visibleCells, isWall, isInRange, gridWidth, gridHeight) {
    const transformers = [
        (x, y) => ({ x: startX + x, y: startY - y }),  // 0: top-right
        (x, y) => ({ x: startX + y, y: startY - x }),  // 1: right-top
        (x, y) => ({ x: startX + y, y: startY + x }),  // 2: right-bottom
        (x, y) => ({ x: startX + x, y: startY + y }),  // 3: bottom-right
        (x, y) => ({ x: startX - x, y: startY + y }),  // 4: bottom-left
        (x, y) => ({ x: startX - y, y: startY + x }),  // 5: left-bottom
        (x, y) => ({ x: startX - y, y: startY - x }),  // 6: left-top
        (x, y) => ({ x: startX - x, y: startY - y }),  // 7: top-left
    ];

    const transform = transformers[octant];

    // Process a row of cells in this octant
    const processRow = (depth, startSlope, endSlope) => {
        if (depth > radius) return;

        // Find the start and end cells of the row
        let startX = Math.floor(startSlope * depth);
        let endX = Math.ceil(endSlope * depth);

        // Track if we've found a wall in this row
        let wasOpaque = false;
        let lastVisibleX = -1;

        // Go through each cell in the row
        for (let x = startX; x <= endX; x++) {
            if (!isInRange(startX + x, startY + depth)) continue;

            // Transform coordinates based on octant
            const curr = transform(x, depth);

            // Skip if out of bounds
            if (curr.x < 0 || curr.y < 0 || curr.x >= gridWidth || curr.y >= gridHeight) continue;

            // Check if this cell is in our FOV
            if (x >= startSlope * depth && x <= endSlope * depth) {
                // Mark cell as visible
                visibleCells.add(`${curr.x},${curr.y}`);
                lastVisibleX = x;
            }

            // Determine if this cell is a wall
            const isCurrentOpaque = isWall(curr.x, curr.y);

            // Handle transition from transparent to opaque
            if (isCurrentOpaque && !wasOpaque) {
                // Start a new scan with reduced FOV
                wasOpaque = true;
            }
            // Handle transition from opaque to transparent
            else if (!isCurrentOpaque && wasOpaque) {
                // Start a new scan with a different FOV
                wasOpaque = false;
            }
        }

        // If the row contained at least one non-wall, continue to the next depth
        if (!wasOpaque && lastVisibleX >= startX) {
            processRow(depth + 1, startSlope, endSlope);
        }
    };

    // Start processing from depth 1
    processRow(1, -1.0, 1.0);
}

/**
 * Render player character on canvas
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {object} position - Player position {x, y}
 * @param {object} maze - Maze data object (for dimensions)
 */
export function renderPlayer(ctx, position, maze) {
    logDebug('Rendering player', position, maze);
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
 * 
 * @param {object} position - Player position
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {object} maze - Maze data object
 * @returns {object} Viewport info {offsetX, offsetY, visibleWidth, visibleHeight}
 */
export function calculateViewport(position, canvasWidth, canvasHeight, maze) {
    logDebug('Calculating viewport', position, canvasWidth, canvasHeight, maze);
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