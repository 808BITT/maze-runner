/**
 * MazeRunner Game - Minimap Component
 * Renders a top-down view of the maze with fog of war.
 */

MazeRunner.Minimap = class {
    constructor(maze, player, fogOfWar) {
        this.maze = maze;
        this.player = player;
        this.fogOfWar = fogOfWar;

        // Canvas elements
        this.container = document.getElementById('minimap-container');
        this.canvas = document.createElement('canvas');
        this.ctx = null;

        // Minimap dimensions
        this.width = 200;
        this.height = 200;

        // Colors
        this.colors = {
            background: '#111',
            wall: '#555',
            path: '#333',
            player: '#3af',
            start: '#0a0',
            exit: '#a00',
            fog: 'rgba(0, 0, 0, 0.7)'
        };
    }

    init() {
        // Set up canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Listen for player movement events to update minimap
        MazeRunner.events.on('playerMoved', this.render.bind(this));
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const mazeSize = this.maze.size;
        const cellSize = this.width / mazeSize;

        // Draw maze cells
        for (let x = 0; x < mazeSize; x++) {
            for (let z = 0; z < mazeSize; z++) {
                const cellX = x * cellSize;
                const cellY = z * cellSize;

                // Skip rendering if still fog-covered
                if (this.fogOfWar.fogGrid[x][z] === 0) continue;

                // Determine cell type and color
                let color;
                switch (this.maze.grid[x][z]) {
                    case 0: // Path
                        color = this.colors.path;
                        break;
                    case 1: // Wall
                        color = this.colors.wall;
                        break;
                    case 2: // Start
                        color = this.colors.start;
                        break;
                    case 3: // Exit
                        color = this.colors.exit;
                        break;
                    default:
                        color = this.colors.path;
                }

                // Draw cell
                this.ctx.fillStyle = color;
                this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
            }
        }

        // Draw player position
        const playerPos = this.player.getPosition();
        const halfMazeSize = (this.maze.size * this.maze.cellSize) / 2;

        // Convert world coordinates to grid coordinates
        const playerGridX = (playerPos.x + halfMazeSize) / this.maze.cellSize;
        const playerGridZ = (playerPos.z + halfMazeSize) / this.maze.cellSize;

        // Draw player marker
        const playerX = playerGridX * cellSize;
        const playerY = playerGridZ * cellSize;
        const playerSize = cellSize * 0.8;

        this.ctx.fillStyle = this.colors.player;

        // Draw player as a triangle pointing in movement direction
        const rotation = this.player.getRotation();
        const halfSize = playerSize / 2;

        this.ctx.save();
        this.ctx.translate(playerX + cellSize / 2, playerY + cellSize / 2);
        this.ctx.rotate(Math.PI - rotation); // Adjust for canvas coordinate system

        this.ctx.beginPath();
        this.ctx.moveTo(0, -halfSize); // Tip
        this.ctx.lineTo(-halfSize, halfSize); // Bottom left
        this.ctx.lineTo(halfSize, halfSize); // Bottom right
        this.ctx.closePath();

        this.ctx.fill();
        this.ctx.restore();
    }

    // Update minimap (called from game loop)
    update(delta) {
        this.render();
    }
};