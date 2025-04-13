/**
 * MazeRunner Game - Core Game Controller
 * Handles game initialization, state management, and the main game loop.
 */

MazeRunner.Game = class {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.maze = null;
        this.player = null;
        this.controls = null;
        this.minimap = null;
        this.fogOfWar = null;

        this.clock = null;
        this.gameTime = 0;
        this.isRunning = false;

        // Bind methods
        this.update = this.update.bind(this);
    }

    init() {
        console.log('Initializing Maze Runner game...');

        // Set up Three.js renderer
        this.setupRenderer();

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);

        // Lighting
        this.setupLighting();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            MazeRunner.config.rendering.width / MazeRunner.config.rendering.height,
            0.1,
            1000
        );
        this.camera.position.y = 10; // Start camera above player for top-down view

        // Initialize systems
        this.clock = new THREE.Clock();

        // Create maze
        this.maze = new MazeRunner.Maze(this.scene);
        this.maze.generate();

        // Create player
        this.player = new MazeRunner.Player(this.scene, this.camera, this.maze);
        this.player.init();

        // Setup controls
        this.controls = new MazeRunner.Controls(this.player);
        this.controls.init();

        // Setup FOG of WAR
        this.fogOfWar = new MazeRunner.FogOfWar(this.scene, this.maze, this.player);
        this.fogOfWar.init();

        // Setup minimap
        this.minimap = new MazeRunner.Minimap(this.maze, this.player, this.fogOfWar);
        this.minimap.init();

        // Start game loop
        this.start();

        console.log('Maze Runner game initialized');
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: MazeRunner.config.rendering.antialias
        });

        this.renderer.setSize(
            MazeRunner.config.rendering.width,
            MazeRunner.config.rendering.height
        );

        this.renderer.setPixelRatio(MazeRunner.config.rendering.pixelRatio);
        this.renderer.shadowMap.enabled = MazeRunner.config.rendering.shadows;

        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Add resize listener
        MazeRunner.events.on('windowResize', (dimensions) => {
            this.renderer.setSize(dimensions.width, dimensions.height);
            if (this.camera) {
                this.camera.aspect = dimensions.width / dimensions.height;
                this.camera.updateProjectionMatrix();
            }
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;

        // Configure shadow
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;

        // Shadow camera frustum
        const size = 30;
        directionalLight.shadow.camera.left = -size;
        directionalLight.shadow.camera.right = size;
        directionalLight.shadow.camera.top = size;
        directionalLight.shadow.camera.bottom = -size;

        this.scene.add(directionalLight);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.clock.start();
            this.update();
        }
    }

    pause() {
        this.isRunning = false;
        this.clock.stop();
    }

    update() {
        if (!this.isRunning) return;

        // Calculate delta time
        const delta = this.clock.getDelta();
        this.gameTime += delta;

        // Update game systems
        this.player.update(delta);
        this.maze.update(delta);
        this.fogOfWar.update(delta);
        this.minimap.update(delta);

        // Update UI elements
        this.updateUI();

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Loop
        requestAnimationFrame(this.update);
    }

    updateUI() {
        // Update timer display
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('timer').textContent =
            `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // Update fog remaining display
        const fogRemaining = this.fogOfWar.getFogRemainingPercentage();
        document.getElementById('fog-remaining').textContent =
            `Fog Remaining: ${fogRemaining.toFixed(1)}%`;
    }

    checkWin() {
        const playerPos = this.player.getPosition();
        const exitPos = this.maze.getExitPosition();

        // Check if player has reached the exit
        if (Math.abs(playerPos.x - exitPos.x) < 0.5 && Math.abs(playerPos.z - exitPos.z) < 0.5) {
            this.pause();

            // Calculate score based on fog remaining
            const fogRemaining = this.fogOfWar.getFogRemainingPercentage() / 100;
            const baseReward = MazeRunner.config.game.baseReward;
            const score = Math.floor(fogRemaining * baseReward);

            alert(`Level Complete!\nFog Remaining: ${(fogRemaining * 100).toFixed(1)}%\nCoins Earned: ${score}\nTime: ${Math.floor(this.gameTime / 60)}:${Math.floor(this.gameTime % 60) < 10 ? '0' : ''}${Math.floor(this.gameTime % 60)}`);

            // Here we would save player progress and move to next level
            // For now just reset the game
            setTimeout(() => {
                this.reset();
            }, 1000);
        }
    }

    reset() {
        // Reset game state for a new level
        this.scene.remove(this.maze.meshGroup);

        // Generate new maze
        this.maze.generate();

        // Reset player position
        this.player.reset(this.maze.getStartPosition());

        // Reset fog of war
        this.fogOfWar.reset();

        // Reset time
        this.gameTime = 0;

        // Start game again
        this.start();
    }
};