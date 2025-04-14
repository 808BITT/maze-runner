import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './SinglePlayerGame.css';

// Import game utilities
import { renderFogOfWar, renderMaze, renderPlayer } from '../../utils/gameRenderer';

// Add a debug flag to enable or disable logging
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

function logDebug(message, ...optionalParams) {
    if (DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
}

// Add debug message to confirm VITE_DEBUG is loaded
logDebug('Client debug mode is enabled');

const SinglePlayerGame = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [showDifficultyMenu, setShowDifficultyMenu] = useState(true);
    const [error, setError] = useState(null);
    const [viewRadius, setViewRadius] = useState(5); // Visibility radius around player
    const [showFullMap, setShowFullMap] = useState(false); // Toggle between main view and map view

    const socketRef = useRef();
    const canvasRef = useRef();
    const fogCanvasRef = useRef();
    const containerRef = useRef();

    // Handle difficulty selection and start game
    const startGame = (selectedDifficulty) => {
        logDebug('startGame function called with difficulty:', selectedDifficulty);
        logDebug('Starting game', { selectedDifficulty });
        setDifficulty(selectedDifficulty);
        setShowDifficultyMenu(false);
        setLoading(true);

        // Connect to server via Socket.io
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        socketRef.current = io(serverUrl);
        logDebug('Socket initialized:', socketRef.current);
        logDebug('Socket connected:', socketRef.current);

        socketRef.current.on('connect', () => {
            logDebug('Socket connected successfully:', socketRef.current.id);
        });
        socketRef.current.on('connect_error', (err) => {
            logDebug('Socket connection error:', err);
        });

        // Request new game with selected difficulty
        socketRef.current.emit('joinGame', {
            userId: 'player-' + Date.now(), // Temporary user ID for now
            difficulty: selectedDifficulty
        });
        logDebug('Emitting joinGame event with data:', {
            userId: 'player-' + Date.now(),
            difficulty: selectedDifficulty
        });
        logDebug('joinGame event emitted', { userId: 'player-' + Date.now(), difficulty: selectedDifficulty });

        // Handle game initialization response
        socketRef.current.on('gameInitialized', (initialState) => {
            logDebug('gameInitialized event received:', initialState);
            setGameState(initialState);
            setLoading(false);
        });

        // Handle game state updates
        socketRef.current.on('gameStateUpdate', (updatedState) => {
            logDebug('gameStateUpdate event received', updatedState);
            setGameState(updatedState);

            // Check if game is completed
            if (updatedState.status === 'completed') {
                logDebug('Game completed', updatedState);
                socketRef.current.emit('completeGame', {
                    userId: updatedState.userId,
                    gameState: updatedState
                });
            }
        });

        // Handle game completion
        socketRef.current.on('gameCompleted', (results) => {
            logDebug('gameCompleted event received', results);
            navigate('/gameover', { state: { results } });
        });

        // Handle errors
        socketRef.current.on('error', (errorData) => {
            logDebug('Error event received', errorData);
            setError(errorData.message);
        });
    };

    // Handle keyboard inputs for player movement and map toggle
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!gameState || gameState.status !== 'active') return;

            let direction;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'k': // Vim up
                    direction = 'up';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'l': // Vim right
                    direction = 'right';
                    break;
                case 'ArrowDown':
                case 's':
                case 'j': // Vim down
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'h': // Vim left
                    direction = 'left';
                    break;
                case 'm': // Toggle map view
                    setShowFullMap(prev => !prev);
                    return; // Don't send movement
                case '+':
                    adjustViewRadius(1);
                    return;
                case '-':
                    adjustViewRadius(-1);
                    return;
                default:
                    return;
            }

            // Send movement to server
            socketRef.current.emit('movePlayer', {
                userId: gameState.userId,
                direction
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState]);

    // Update the rendering logic to center the map on the screen
    useEffect(() => {
        if (!gameState) return;

        const mazeCanvas = canvasRef.current;
        const fogCanvas = fogCanvasRef.current;
        const container = containerRef.current;

        if (!mazeCanvas || !fogCanvas || !container) return;

        const mazeCtx = mazeCanvas.getContext('2d');
        const fogCtx = fogCanvas.getContext('2d');

        // Ensure canvas dimensions match maze dimensions
        const mazeWidth = gameState.maze.width * 20; // Assuming each cell is 20px
        const mazeHeight = gameState.maze.height * 20;
        mazeCanvas.width = mazeWidth;
        mazeCanvas.height = mazeHeight;
        fogCanvas.width = mazeWidth;
        fogCanvas.height = mazeHeight;

        // Clear canvases
        mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);

        // Render maze background
        renderMaze(mazeCtx, gameState.maze);

        // Render fog of war overlay with player position and view radius
        renderFogOfWar(fogCtx, gameState.fogGrid, gameState.playerPosition, viewRadius, gameState.maze.grid);

        // Render player on the maze canvas
        renderPlayer(mazeCtx, gameState.playerPosition, gameState.maze);

        // Center the map in the container
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const scaleX = containerWidth / mazeWidth;
        const scaleY = containerHeight / mazeHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Ensure we don't scale up beyond 1

        mazeCanvas.style.transform = `scale(${scale})`;
        fogCanvas.style.transform = `scale(${scale})`;

        const offsetX = (containerWidth - mazeWidth * scale) / 2;
        const offsetY = (containerHeight - mazeHeight * scale) / 2;

        mazeCanvas.style.position = 'absolute';
        fogCanvas.style.position = 'absolute';
        mazeCanvas.style.left = `${offsetX}px`;
        mazeCanvas.style.top = `${offsetY}px`;
        fogCanvas.style.left = `${offsetX}px`;
        fogCanvas.style.top = `${offsetY}px`;

        // Reset transform origin to ensure proper scaling
        mazeCanvas.style.transformOrigin = 'top left';
        fogCanvas.style.transformOrigin = 'top left';

        // Trigger rendering after ensuring dimensions and scaling are set
        renderMaze(mazeCtx, gameState.maze);
        renderFogOfWar(fogCtx, gameState.fogGrid, gameState.playerPosition, viewRadius, gameState.maze.grid);
        renderPlayer(mazeCtx, gameState.playerPosition, gameState.maze);
    }, [gameState, viewRadius]);

    // Clean up socket connection when component unmounts
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Handle return to main menu
    const exitToMainMenu = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        navigate('/');
    };

    // Adjust view radius (zooming in/out)
    const adjustViewRadius = (amount) => {
        setViewRadius(prev => Math.max(3, Math.min(10, prev + amount)));
    };

    // Toggle map view
    const toggleMapView = () => {
        setShowFullMap(prev => !prev);
    };

    // Render difficulty selection menu
    if (showDifficultyMenu) {
        return (
            <div className="difficulty-menu">
                <h2>Select Difficulty</h2>
                <div className="difficulty-buttons">
                    <button onClick={() => startGame('easy')}>Easy</button>
                    <button onClick={() => startGame('medium')}>Medium</button>
                    <button onClick={() => startGame('hard')}>Hard</button>
                </div>
                <button className="back-button" onClick={exitToMainMenu}>Back to Menu</button>
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <div className="loading-screen">
                <h2>Generating Maze...</h2>
                <div className="spinner"></div>
            </div>
        );
    }

    // Show error message if there's an error
    if (error) {
        return (
            <div className="error-screen">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={exitToMainMenu}>Back to Menu</button>
            </div>
        );
    }

    return (
        <div className={`game-container ${showFullMap ? 'map-mode' : ''}`}>
            {/* Game HUD */}
            <div className="game-hud">
                <div className="stats">
                    <div className="stat">
                        <span>Fog Remaining:</span>
                        <span>{gameState?.fogPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="stat">
                        <span>Steps:</span>
                        <span>{gameState?.steps || 0}</span>
                    </div>
                    <div className="stat">
                        <span>Time:</span>
                        <span>{Math.floor((Date.now() - gameState?.startTime) / 1000)}s</span>
                    </div>
                </div>

                <div className="game-controls">
                    <button className="control-button" onClick={() => adjustViewRadius(1)} title="Zoom Out">+</button>
                    <button className="control-button" onClick={() => adjustViewRadius(-1)} title="Zoom In">-</button>
                    <button
                        className={`control-button map-toggle ${showFullMap ? 'active' : ''}`}
                        onClick={toggleMapView}
                        title="Toggle Map View"
                    >
                        {showFullMap ? 'Player View' : 'Map View'}
                    </button>
                    <button className="exit-button" onClick={exitToMainMenu}>Exit</button>
                </div>
            </div>

            {/* Game Canvas */}
            <div className="canvas-container" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    width={gameState?.maze.width * 20}
                    height={gameState?.maze.height * 20}
                    className="maze-canvas"
                />
                <canvas
                    ref={fogCanvasRef}
                    width={gameState?.maze.width * 20}
                    height={gameState?.maze.height * 20}
                    className="fog-canvas"
                />
            </div>

            {/* Controls help */}
            <div className="controls-help">
                <p>Use WASD, Arrow keys, or Vim keys (HJKL) to move | +/- to adjust view range | Press M to toggle map view</p>
            </div>
        </div>
    );
};

export default SinglePlayerGame;