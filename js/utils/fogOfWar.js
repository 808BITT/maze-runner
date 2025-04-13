/**
 * MazeRunner Game - Fog of War Implementation
 * Handles revealing parts of the maze as the player explores.
 */

MazeRunner.FogOfWar = class {
    constructor(scene, maze, player) {
        this.scene = scene;
        this.maze = maze;
        this.player = player;

        this.fogGrid = []; // 0: hidden, 1: revealed
        this.revealedCells = 0; // Counter for revealed cells
        this.totalCells = 0;    // Total number of cells in the maze

        this.visionRadius = MazeRunner.config.player.visionRange;

        // Visual fog representation
        this.fogGroup = new THREE.Group();
        this.fogMeshes = [];
        this.fogMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
    }

    init() {
        // Listen for player movement events
        MazeRunner.events.on('playerMoved', this.updateFog.bind(this));

        // Initialize fog grid based on maze size
        this.initFogGrid();

        // Create visual representation
        this.createFogMesh();

        // Add fog to scene
        this.scene.add(this.fogGroup);

        // Initially update fog around starting position
        const startPos = this.player.getPosition();
        this.revealAreaAroundPosition(startPos);
    }

    initFogGrid() {
        const mazeSize = this.maze.size;

        this.fogGrid = [];
        this.revealedCells = 0;
        this.totalCells = 0;

        for (let x = 0; x < mazeSize; x++) {
            this.fogGrid[x] = [];
            for (let z = 0; z < mazeSize; z++) {
                // Initialize all cells as hidden (0)
                this.fogGrid[x][z] = 0;

                // Only count path cells (not walls) for percentage calculation
                if (this.maze.grid[x][z] !== 1) {
                    this.totalCells++;
                }
            }
        }
    }

    createFogMesh() {
        // Clear any existing fog meshes
        if (this.fogGroup.parent) {
            this.scene.remove(this.fogGroup);
        }

        this.fogGroup = new THREE.Group();
        this.fogMeshes = [];

        const mazeSize = this.maze.size;
        const cellSize = this.maze.cellSize;
        const halfMazeSize = (mazeSize * cellSize) / 2;

        // Create fog cubes for each cell
        for (let x = 0; x < mazeSize; x++) {
            this.fogMeshes[x] = [];
            for (let z = 0; z < mazeSize; z++) {
                // Only add fog to navigable areas (not walls)
                if (this.maze.grid[x][z] !== 1) {
                    const fogGeometry = new THREE.BoxGeometry(cellSize, 4, cellSize);
                    const fogMesh = new THREE.Mesh(fogGeometry, this.fogMaterial.clone());

                    // Position in world coordinates
                    const worldX = x * cellSize - halfMazeSize;
                    const worldZ = z * cellSize - halfMazeSize;

                    fogMesh.position.set(worldX, 1, worldZ);

                    this.fogMeshes[x][z] = fogMesh;
                    this.fogGroup.add(fogMesh);
                } else {
                    this.fogMeshes[x][z] = null; // No fog for walls
                }
            }
        }

        // Add to scene
        this.scene.add(this.fogGroup);
    }

    updateFog(playerData) {
        // Reveal area around current player position
        this.revealAreaAroundPosition(playerData.position);
    }

    revealAreaAroundPosition(position) {
        const mazeSize = this.maze.size;
        const cellSize = this.maze.cellSize;
        const halfMazeSize = (mazeSize * cellSize) / 2;

        // Convert world coordinates to grid coordinates
        const gridX = Math.floor((position.x + halfMazeSize) / cellSize);
        const gridZ = Math.floor((position.z + halfMazeSize) / cellSize);

        // Reveal cells within vision radius
        const radius = this.visionRadius;

        for (let x = Math.max(0, gridX - radius); x <= Math.min(mazeSize - 1, gridX + radius); x++) {
            for (let z = Math.max(0, gridZ - radius); z <= Math.min(mazeSize - 1, gridZ + radius); z++) {
                // Calculate distance from player
                const distance = Math.sqrt((x - gridX) ** 2 + (z - gridZ) ** 2);

                // If within radius and cell is hidden
                if (distance <= radius && this.fogGrid[x][z] === 0) {
                    // Check if there's a direct line of sight
                    if (this.hasLineOfSight(gridX, gridZ, x, z)) {
                        this.revealCell(x, z);
                    }
                }
            }
        }
    }

    hasLineOfSight(x1, z1, x2, z2) {
        // Simple Bresenham's line algorithm to check if there's a wall in the way
        const dx = Math.abs(x2 - x1);
        const dz = Math.abs(z2 - z1);
        const sx = x1 < x2 ? 1 : -1;
        const sz = z1 < z2 ? 1 : -1;
        let err = dx - dz;

        let x = x1;
        let z = z1;

        while (x !== x2 || z !== z2) {
            // Skip the start and end points
            if (x !== x1 || z !== z1) {
                // If we hit a wall, no line of sight
                if (this.maze.grid[x][z] === 1) {
                    return false;
                }
            }

            const e2 = 2 * err;
            if (e2 > -dz) {
                err -= dz;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                z += sz;
            }
        }

        return true;
    }

    revealCell(x, z) {
        // If cell is already revealed, do nothing
        if (this.fogGrid[x][z] === 1) return;

        // Mark cell as revealed
        this.fogGrid[x][z] = 1;

        // If cell is a path (not a wall), increment revealed count
        if (this.maze.grid[x][z] !== 1) {
            this.revealedCells++;
        }

        // Update visual representation
        if (this.fogMeshes[x] && this.fogMeshes[x][z]) {
            this.fogGroup.remove(this.fogMeshes[x][z]);
            this.fogMeshes[x][z] = null;
        }
    }

    getFogRemainingPercentage() {
        // Calculate percentage of fog (unexplored cells) remaining
        if (this.totalCells === 0) return 100;

        const fogRemaining = this.totalCells - this.revealedCells;
        return (fogRemaining / this.totalCells) * 100;
    }

    reset() {
        // Remove all fog meshes
        this.scene.remove(this.fogGroup);

        // Re-initialize fog grid
        this.initFogGrid();

        // Create new fog meshes
        this.createFogMesh();

        // Reveal area around starting position
        const startPos = this.player.getPosition();
        this.revealAreaAroundPosition(startPos);
    }

    update(delta) {
        // Any animations or effects for fog could go here
    }
};