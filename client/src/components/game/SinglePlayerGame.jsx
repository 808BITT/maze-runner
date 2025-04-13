import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './SinglePlayerGame.css';
import ThreeDMaze from './ThreeDMaze';

// Import game utilities

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

    const socketRef = useRef();

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

    // Handle player movement from ThreeDMaze
    const handlePlayerMove = (direction) => {
        if (!gameState || gameState.status !== 'active' || !socketRef.current) return;

        logDebug('Player move requested', { direction });

        // Send movement to server
        socketRef.current.emit('movePlayer', {
            userId: gameState.userId,
            direction
        });
    };

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
            {gameState && (
                <ThreeDMaze
                    mazeData={{
                        ...gameState.maze,
                        playerPosition: gameState.playerPosition
                    }}
                    onPlayerMove={handlePlayerMove}
                />
            )}
            <div className="controls-help">
                <p>Use WASD or Arrow keys to move</p>
            </div>
        </div>
    );
};

export default SinglePlayerGame;