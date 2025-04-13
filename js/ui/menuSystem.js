/**
 * MazeRunner Game - Menu System
 * Handles game menus, difficulty selection, and game state transitions.
 */

MazeRunner.MenuSystem = class {
    constructor(game) {
        this.game = game;
        this.isMenuOpen = false;

        // Menu elements
        this.menuOverlay = null;
        this.menuContainer = null;

        // Bind methods
        this.toggleMenu = this.toggleMenu.bind(this);
    }

    init() {
        // Create menu elements
        this.createMenuElements();

        // Add event listeners
        document.getElementById('menu-button').addEventListener('click', this.toggleMenu);

        // Setup menu event listeners
        document.getElementById('resume-button').addEventListener('click', this.toggleMenu);
        document.getElementById('restart-button').addEventListener('click', () => {
            this.game.reset();
            this.toggleMenu();
        });

        // Difficulty selector
        const difficultySelect = document.getElementById('difficulty-select');
        difficultySelect.value = MazeRunner.config.game.difficulty;

        difficultySelect.addEventListener('change', (event) => {
            MazeRunner.config.game.difficulty = event.target.value;
        });

        // Fullscreen button
        document.getElementById('fullscreen-button').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    createMenuElements() {
        // Create menu overlay
        this.menuOverlay = document.createElement('div');
        this.menuOverlay.id = 'menu-overlay';
        this.menuOverlay.style.display = 'none';
        this.menuOverlay.style.position = 'absolute';
        this.menuOverlay.style.top = '0';
        this.menuOverlay.style.left = '0';
        this.menuOverlay.style.width = '100%';
        this.menuOverlay.style.height = '100%';
        this.menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.menuOverlay.style.zIndex = '100';
        this.menuOverlay.style.display = 'flex';
        this.menuOverlay.style.alignItems = 'center';
        this.menuOverlay.style.justifyContent = 'center';

        // Create menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.id = 'menu-container';
        this.menuContainer.style.backgroundColor = '#222';
        this.menuContainer.style.padding = '20px';
        this.menuContainer.style.borderRadius = '8px';
        this.menuContainer.style.width = '300px';
        this.menuContainer.style.color = 'white';

        // Menu title
        const menuTitle = document.createElement('h2');
        menuTitle.textContent = 'Maze Runner';
        menuTitle.style.textAlign = 'center';
        menuTitle.style.marginBottom = '20px';

        // Resume button
        const resumeButton = document.createElement('button');
        resumeButton.id = 'resume-button';
        resumeButton.textContent = 'Resume Game';
        resumeButton.style.display = 'block';
        resumeButton.style.width = '100%';
        resumeButton.style.padding = '10px';
        resumeButton.style.marginBottom = '10px';
        resumeButton.style.backgroundColor = '#3388ff';
        resumeButton.style.color = 'white';
        resumeButton.style.border = 'none';
        resumeButton.style.borderRadius = '4px';
        resumeButton.style.cursor = 'pointer';

        // Restart button
        const restartButton = document.createElement('button');
        restartButton.id = 'restart-button';
        restartButton.textContent = 'New Maze';
        restartButton.style.display = 'block';
        restartButton.style.width = '100%';
        restartButton.style.padding = '10px';
        restartButton.style.marginBottom = '20px';
        restartButton.style.backgroundColor = '#ff8833';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '4px';
        restartButton.style.cursor = 'pointer';

        // Difficulty selector
        const difficultyLabel = document.createElement('div');
        difficultyLabel.textContent = 'Difficulty:';
        difficultyLabel.style.marginBottom = '5px';

        const difficultySelect = document.createElement('select');
        difficultySelect.id = 'difficulty-select';
        difficultySelect.style.width = '100%';
        difficultySelect.style.padding = '8px';
        difficultySelect.style.marginBottom = '20px';
        difficultySelect.style.backgroundColor = '#333';
        difficultySelect.style.color = 'white';
        difficultySelect.style.border = '1px solid #555';
        difficultySelect.style.borderRadius = '4px';

        // Add difficulty options
        const difficulties = ['easy', 'normal', 'hard'];
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            difficultySelect.appendChild(option);
        });

        // Fullscreen button
        const fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'fullscreen-button';
        fullscreenButton.textContent = 'Toggle Fullscreen';
        fullscreenButton.style.display = 'block';
        fullscreenButton.style.width = '100%';
        fullscreenButton.style.padding = '10px';
        fullscreenButton.style.backgroundColor = '#555';
        fullscreenButton.style.color = 'white';
        fullscreenButton.style.border = 'none';
        fullscreenButton.style.borderRadius = '4px';
        fullscreenButton.style.cursor = 'pointer';

        // Assemble menu
        this.menuContainer.appendChild(menuTitle);
        this.menuContainer.appendChild(resumeButton);
        this.menuContainer.appendChild(restartButton);
        this.menuContainer.appendChild(difficultyLabel);
        this.menuContainer.appendChild(difficultySelect);
        this.menuContainer.appendChild(fullscreenButton);

        this.menuOverlay.appendChild(this.menuContainer);

        // Add to document
        document.body.appendChild(this.menuOverlay);

        // Initially hide menu
        this.menuOverlay.style.display = 'none';
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.menuOverlay.style.display = 'none';
            this.game.start();
        } else {
            this.menuOverlay.style.display = 'flex';
            this.game.pause();
        }

        this.isMenuOpen = !this.isMenuOpen;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    showGameOver(stats) {
        // Create a game over display
        this.menuOverlay.style.display = 'flex';
        this.menuContainer.innerHTML = '';

        // Game over title
        const gameOverTitle = document.createElement('h2');
        gameOverTitle.textContent = 'Level Complete!';
        gameOverTitle.style.textAlign = 'center';
        gameOverTitle.style.marginBottom = '20px';

        // Stats
        const statsContainer = document.createElement('div');
        statsContainer.style.backgroundColor = '#333';
        statsContainer.style.padding = '15px';
        statsContainer.style.borderRadius = '4px';
        statsContainer.style.marginBottom = '20px';

        statsContainer.innerHTML = `
            <div>Fog Remaining: ${stats.fogRemaining.toFixed(1)}%</div>
            <div>Coins Earned: ${stats.coinsEarned}</div>
            <div>Time: ${stats.minutes}:${stats.seconds < 10 ? '0' : ''}${stats.seconds}</div>
        `;

        // Next level button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next Level';
        nextButton.style.display = 'block';
        nextButton.style.width = '100%';
        nextButton.style.padding = '10px';
        nextButton.style.marginBottom = '10px';
        nextButton.style.backgroundColor = '#3388ff';
        nextButton.style.color = 'white';
        nextButton.style.border = 'none';
        nextButton.style.borderRadius = '4px';
        nextButton.style.cursor = 'pointer';

        nextButton.addEventListener('click', () => {
            this.menuOverlay.style.display = 'none';
            this.game.reset();
            this.isMenuOpen = false;
        });

        // Assemble menu
        this.menuContainer.appendChild(gameOverTitle);
        this.menuContainer.appendChild(statsContainer);
        this.menuContainer.appendChild(nextButton);
    }
};