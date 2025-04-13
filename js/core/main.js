/**
 * MazeRunner Game - Main Module
 * Establishes the main namespace and configuration for the game.
 */

// Create global namespace
const MazeRunner = {
    // Game configuration
    config: {
        // Rendering settings
        rendering: {
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true,
            shadows: true,
            pixelRatio: window.devicePixelRatio || 1
        },

        // Game settings
        game: {
            difficulty: 'normal',  // easy, normal, hard
            fogOfWarRadius: 5,     // How much area gets revealed around player
            baseReward: 100,       // Base reward for completing a maze
        },

        // Maze generation settings
        maze: {
            easy: {
                size: 15,          // Size of maze (n x n)
                complexity: 0.3,   // How complex the maze is (0-1)
                baseReward: 75
            },
            normal: {
                size: 25,
                complexity: 0.5,
                baseReward: 100
            },
            hard: {
                size: 40,
                complexity: 0.7,
                baseReward: 150
            }
        },

        // Player settings
        player: {
            moveSpeed: 5,
            rotationSpeed: 3,
            visionRange: 5
        },

        // Debug settings
        debug: {
            enabled: false,
            showFPS: true,
            wireframe: false
        }
    },

    // Utility functions
    utils: {},

    // Event system
    events: {
        listeners: {},

        on: function (event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        emit: function (event, data) {
            const callbacks = this.listeners[event];
            if (callbacks) {
                callbacks.forEach(callback => callback(data));
            }
        }
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    MazeRunner.config.rendering.width = window.innerWidth;
    MazeRunner.config.rendering.height = window.innerHeight;

    // Emit resize event for components to respond
    MazeRunner.events.emit('windowResize', {
        width: window.innerWidth,
        height: window.innerHeight
    });
});