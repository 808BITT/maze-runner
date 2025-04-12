import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './SinglePlayerGame.css';

// Import game utilities
import { renderFogOfWar, renderMaze, renderPlayer } from '../../utils/gameRenderer';

const SinglePlayerGame = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [showDifficultyMenu, setShowDifficultyMenu] = useState(true);
    const [error, setError] = useState(null);

    const socketRef = useRef();
    const canvasRef = useRef();
    const fogCanvasRef = useRef();

    // Handle difficulty selection and start game
    const startGame = (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        setShowDifficultyMenu(false);
        setLoading(true);

        // Connect to server via Socket.io
        socketRef.current = io();

        // Request new game with selected difficulty
        socketRef.current.emit('joinGame', {
            userId: 'player-' + Date.now(), // Temporary user ID for now
            difficulty: selectedDifficulty
        });

        // Handle game initialization response
        socketRef.current.on('gameInitialized', (initialState) => {
            setGameState(initialState);
            setLoading(false);
        });

        // Handle game state updates
        socketRef.current.on('gameStateUpdate', (updatedState) => {
            setGameState(updatedState);

            // Check if game is completed
            if (updatedState.status === 'completed') {
                socketRef.current.emit('completeGame', {
                    userId: updatedState.userId,
                    gameState: updatedState
                });
            }
        });

        // Handle game completion
        socketRef.current.on('gameCompleted', (results) => {
            // Navigate to game over screen with results
            navigate('/gameover', { state: { results } });
        });

        // Handle errors
        socketRef.current.on('error', (errorData) => {
            setError(errorData.message);
        });
    };

    // Handle keyboard inputs for player movement
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!gameState || gameState.status !== 'active') return;

            let direction;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    direction = 'up';
                    break;
                case 'ArrowRight':
                case 'd':
                    direction = 'right';
                    break;
                case 'ArrowDown':
                case 's':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                    direction = 'left';
                    break;
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

    // Render maze, fog, and player when game state updates
    useEffect(() => {
        if (!gameState) return;

        const mazeCanvas = canvasRef.current;
        const fogCanvas = fogCanvasRef.current;

        if (!mazeCanvas || !fogCanvas) return;

        const mazeCtx = mazeCanvas.getContext('2d');
        const fogCtx = fogCanvas.getContext('2d');

        // Clear canvases
        mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);

        // Render maze background
        renderMaze(mazeCtx, gameState.maze);

        // Render fog of war overlay
        renderFogOfWar(fogCtx, gameState.fogGrid);

        // Render player
        renderPlayer(mazeCtx, gameState.playerPosition, gameState.maze);

    }, [gameState]);

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
        <div className="game-container">
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

                <button className="exit-button" onClick={exitToMainMenu}>Exit</button>
            </div>

            {/* Game Canvas */}
            <div className="canvas-container">
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

            {/* Mini-map with fog of war */}
            <div className="minimap-container">
                <h3>Minimap</h3>
                <div className="minimap">
                    {gameState?.maze.grid.map((row, y) => (
                        <div key={`row-${y}`} className="minimap-row">
                            {row.map((cell, x) => {
                                // Define cell type
                                let cellType = '';
                                if (cell === 1) cellType = 'wall';
                                else if (cell === 2) cellType = 'start';
                                else if (cell === 3) cellType = 'exit';
                                else cellType = 'path';

                                // Add player marker
                                const isPlayer = gameState.playerPosition.x === x && gameState.playerPosition.y === y;

                                // Add fog
                                const isFogged = gameState.fogGrid[y][x] === 1;

                                return (
                                    <div
                                        key={`cell-${x}-${y}`}
                                        className={`minimap-cell ${cellType} ${isPlayer ? 'player' : ''} ${isFogged ? 'fogged' : ''}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls help */}
            <div className="controls-help">
                <p>Use WASD or Arrow keys to move</p>
            </div>
        </div>
    );
};

export default SinglePlayerGame;