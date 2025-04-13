/**
 * MazeRunner Game - Maze Generator and Manager
 * Handles maze generation, visualization and collision detection.
 */

MazeRunner.Maze = class {
    constructor(scene) {
        this.scene = scene;
        this.grid = [];
        this.size = 0;
        this.complexity = 0;
        this.cellSize = 2; // Size of each cell in 3D units
        this.wallHeight = 2; // Height of maze walls
        this.startPosition = { x: 0, z: 0 };
        this.exitPosition = { x: 0, z: 0 };

        // Materials
        this.wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.7,
            metalness: 0.1
        });

        this.floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9,
            metalness: 0.0
        });

        this.startMaterial = new THREE.MeshStandardMaterial({
            color: 0x00aa00,
            emissive: 0x005500
        });

        this.exitMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa0000,
            emissive: 0x550000
        });

        // Mesh group to hold all maze elements
        this.meshGroup = new THREE.Group();
    }

    generate() {
        const difficulty = MazeRunner.config.game.difficulty;
        const settings = MazeRunner.config.maze[difficulty];

        this.size = settings.size;
        this.complexity = settings.complexity;

        console.log(`Generating ${this.size}x${this.size} maze with complexity ${this.complexity}`);

        // Initialize grid with walls
        this.initializeGrid();

        // Generate the maze using recursive backtracking
        this.recursiveBacktracking();

        // Place start and exit points
        this.placeStartAndExit();

        // Create the 3D representation of the maze
        this.createMesh();

        // Add to scene
        this.scene.add(this.meshGroup);

        return this.grid;
    }

    initializeGrid() {
        // Initialize grid with all walls
        this.grid = [];

        for (let x = 0; x < this.size; x++) {
            this.grid[x] = [];
            for (let z = 0; z < this.size; z++) {
                // 1 represents a wall, 0 represents a path
                this.grid[x][z] = 1;
            }
        }
    }

    recursiveBacktracking() {
        // Start at a random cell
        const startX = Math.floor(Math.random() * Math.floor(this.size / 2)) * 2 + 1;
        const startZ = Math.floor(Math.random() * Math.floor(this.size / 2)) * 2 + 1;

        // Mark start cell as path
        this.grid[startX][startZ] = 0;

        // Stack for backtracking
        const stack = [{ x: startX, z: startZ }];

        // Directions: up, right, down, left
        const directions = [
            { x: 0, z: -2 }, // up
            { x: 2, z: 0 },  // right
            { x: 0, z: 2 },  // down
            { x: -2, z: 0 }  // left
        ];

        while (stack.length > 0) {
            // Get current cell
            const current = stack[stack.length - 1];

            // Find valid neighbors (unvisited cells two steps away)
            const validNeighbors = [];

            for (const dir of directions) {
                const nx = current.x + dir.x;
                const nz = current.z + dir.z;

                // Check if neighbor is valid and unvisited
                if (nx >= 1 && nx < this.size - 1 && nz >= 1 && nz < this.size - 1 && this.grid[nx][nz] === 1) {
                    validNeighbors.push({ x: nx, z: nz, dx: dir.x / 2, dz: dir.z / 2 });
                }
            }

            if (validNeighbors.length > 0) {
                // Choose a random neighbor
                const neighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

                // Remove the wall between current cell and neighbor
                const wallX = current.x + neighbor.dx;
                const wallZ = current.z + neighbor.dz;
                this.grid[wallX][wallZ] = 0;

                // Mark neighbor as visited
                this.grid[neighbor.x][neighbor.z] = 0;

                // Add neighbor to stack
                stack.push({ x: neighbor.x, z: neighbor.z });
            } else {
                // No valid neighbors, backtrack
                stack.pop();
            }
        }
    }

    placeStartAndExit() {
        // Find cells near opposite corners for start and exit

        // Start in top-left quarter
        let startX, startZ;
        do {
            startX = Math.floor(Math.random() * Math.floor(this.size / 3));
            startZ = Math.floor(Math.random() * Math.floor(this.size / 3));
        } while (this.grid[startX][startZ] !== 0); // Ensure it's a path

        // Exit in bottom-right quarter
        let exitX, exitZ;
        do {
            exitX = Math.floor(Math.random() * Math.floor(this.size / 3)) + Math.floor(this.size * 2 / 3);
            exitZ = Math.floor(Math.random() * Math.floor(this.size / 3)) + Math.floor(this.size * 2 / 3);
        } while (this.grid[exitX][exitZ] !== 0); // Ensure it's a path

        // Store the positions
        this.startPosition = {
            x: startX * this.cellSize - (this.size * this.cellSize / 2),
            z: startZ * this.cellSize - (this.size * this.cellSize / 2)
        };

        this.exitPosition = {
            x: exitX * this.cellSize - (this.size * this.cellSize / 2),
            z: exitZ * this.cellSize - (this.size * this.cellSize / 2)
        };

        // Mark them in the grid for visualization
        this.grid[startX][startZ] = 2; // 2 for start
        this.grid[exitX][exitZ] = 3;   // 3 for exit
    }

    createMesh() {
        // Remove any existing mesh
        if (this.meshGroup.parent) {
            this.scene.remove(this.meshGroup);
        }

        // Create a new group
        this.meshGroup = new THREE.Group();

        // Create floor
        const floorSize = this.size * this.cellSize;
        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        floor.position.y = -0.1;         // Slightly below walls
        floor.receiveShadow = true;
        this.meshGroup.add(floor);

        // Create walls
        const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.wallHeight, this.cellSize);

        // Start marker
        const startMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const startMarker = new THREE.Mesh(startMarkerGeometry, this.startMaterial);
        startMarker.position.set(
            this.startPosition.x,
            0.05, // Just above floor
            this.startPosition.z
        );
        this.meshGroup.add(startMarker);

        // Exit marker
        const exitMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const exitMarker = new THREE.Mesh(exitMarkerGeometry, this.exitMaterial);
        exitMarker.position.set(
            this.exitPosition.x,
            0.05, // Just above floor
            this.exitPosition.z
        );
        this.meshGroup.add(exitMarker);

        // Create walls based on grid
        const halfMazeSize = (this.size * this.cellSize) / 2;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                // Only create walls where grid value is 1
                if (this.grid[x][z] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, this.wallMaterial);

                    // Position in world coordinates
                    const worldX = x * this.cellSize - halfMazeSize;
                    const worldZ = z * this.cellSize - halfMazeSize;

                    wall.position.set(worldX, this.wallHeight / 2, worldZ);
                    wall.castShadow = true;
                    wall.receiveShadow = true;

                    this.meshGroup.add(wall);
                }
            }
        }

        // Add to scene
        this.scene.add(this.meshGroup);
    }

    getStartPosition() {
        return { ...this.startPosition, y: 0 };
    }

    getExitPosition() {
        return { ...this.exitPosition, y: 0 };
    }

    // Check if there's a wall at the given position
    hasWallAt(x, z) {
        // Convert world coordinates to grid coordinates
        const halfMazeSize = (this.size * this.cellSize) / 2;
        const gridX = Math.floor((x + halfMazeSize) / this.cellSize);
        const gridZ = Math.floor((z + halfMazeSize) / this.cellSize);

        // Check if coordinates are within grid bounds
        if (gridX < 0 || gridX >= this.size || gridZ < 0 || gridZ >= this.size) {
            return true; // Out of bounds is considered a wall
        }

        // Check grid value
        return this.grid[gridX][gridZ] === 1;
    }

    // For collision detection with walls
    checkCollision(position, radius) {
        // Check nearby grid cells for walls
        const halfMazeSize = (this.size * this.cellSize) / 2;

        // Convert player position to grid coordinates
        const gridX = Math.floor((position.x + halfMazeSize) / this.cellSize);
        const gridZ = Math.floor((position.z + halfMazeSize) / this.cellSize);

        // Check surrounding cells for walls
        const checkRadius = 1; // Check one cell in each direction

        for (let x = gridX - checkRadius; x <= gridX + checkRadius; x++) {
            for (let z = gridZ - checkRadius; z <= gridZ + checkRadius; z++) {
                // Skip out of bounds cells
                if (x < 0 || x >= this.size || z < 0 || z >= this.size) continue;

                // If this is a wall, check collision
                if (this.grid[x][z] === 1) {
                    // Calculate wall center position
                    const wallX = x * this.cellSize - halfMazeSize;
                    const wallZ = z * this.cellSize - halfMazeSize;

                    // Calculate the closest point on the wall to the player position
                    const closestX = Math.max(wallX - this.cellSize / 2, Math.min(position.x, wallX + this.cellSize / 2));
                    const closestZ = Math.max(wallZ - this.cellSize / 2, Math.min(position.z, wallZ + this.cellSize / 2));

                    // Calculate distance from closest point to player center
                    const distanceX = closestX - position.x;
                    const distanceZ = closestZ - position.z;
                    const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;

                    // If distance is less than player radius, there is a collision
                    if (distanceSquared < radius * radius) {
                        return true;
                    }
                }
            }
        }

        // No collision found
        return false;
    }

    update(delta) {
        // Any animated elements or game logic related to the maze would go here
    }
};