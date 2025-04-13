/**
 * MazeRunner Game - Controls Module
 * Handles keyboard and touch input for player movement.
 */

MazeRunner.Controls = class {
    constructor(player) {
        this.player = player;

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        // Touch controls
        this.touchControls = {
            active: false,
            startX: 0,
            startY: 0,
            moveThreshold: 20 // Pixels threshold for movement
        };
    }

    init() {
        // Add keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Add touch event listeners
        document.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('touchmove', this.handleTouchMove);
        document.addEventListener('touchend', this.handleTouchEnd);

        console.log('Controls initialized');
    }

    handleKeyDown(event) {
        // Prevent default behavior for arrow keys and WASD
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
            event.preventDefault();
        }

        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                this.player.setMovement('forward', true);
                break;
            case 'ArrowDown':
            case 's':
                this.player.setMovement('backward', true);
                break;
            case 'ArrowLeft':
            case 'a':
                this.player.setMovement('left', true);
                break;
            case 'ArrowRight':
            case 'd':
                this.player.setMovement('right', true);
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                this.player.setMovement('forward', false);
                break;
            case 'ArrowDown':
            case 's':
                this.player.setMovement('backward', false);
                break;
            case 'ArrowLeft':
            case 'a':
                this.player.setMovement('left', false);
                break;
            case 'ArrowRight':
            case 'd':
                this.player.setMovement('right', false);
                break;
        }
    }

    handleTouchStart(event) {
        event.preventDefault();

        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.touchControls.active = true;
            this.touchControls.startX = touch.clientX;
            this.touchControls.startY = touch.clientY;
        }
    }

    handleTouchMove(event) {
        if (!this.touchControls.active) return;

        event.preventDefault();

        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchControls.startX;
            const deltaY = touch.clientY - this.touchControls.startY;

            // Reset all movements
            this.player.setMovement('forward', false);
            this.player.setMovement('backward', false);
            this.player.setMovement('left', false);
            this.player.setMovement('right', false);

            // Apply new movements based on touch deltas
            if (Math.abs(deltaY) > this.touchControls.moveThreshold) {
                if (deltaY < 0) {
                    this.player.setMovement('forward', true);
                } else {
                    this.player.setMovement('backward', true);
                }
            }

            if (Math.abs(deltaX) > this.touchControls.moveThreshold) {
                if (deltaX < 0) {
                    this.player.setMovement('left', true);
                } else {
                    this.player.setMovement('right', true);
                }
            }
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();

        this.touchControls.active = false;

        // Reset all movements
        this.player.setMovement('forward', false);
        this.player.setMovement('backward', false);
        this.player.setMovement('left', false);
        this.player.setMovement('right', false);
    }

    dispose() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
};