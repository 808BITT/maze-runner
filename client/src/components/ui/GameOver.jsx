import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GameOver.css';

const GameOver = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get results from navigation state
    const results = location.state?.results || {
        score: 0,
        fogPercentage: '0.00',
        completionTime: '0.0',
        steps: 0,
        difficulty: 'unknown',
        coins: 0
    };

    const returnToMainMenu = () => {
        navigate('/');
    };

    const playAgain = () => {
        navigate('/play');
    };

    return (
        <div className="game-over-container">
            <h1 className="title">Maze Completed!</h1>

            <div className="results-container">
                <div className="score-section">
                    <h2>Final Score</h2>
                    <div className="final-score">{results.score}</div>

                    <div className="coins-earned">
                        <span>Coins Earned:</span>
                        <span>{results.coins} <i className="coin-icon">🪙</i></span>
                    </div>
                </div>

                <div className="stats-section">
                    <h2>Performance Stats</h2>

                    <div className="stat-grid">
                        <div className="stat-item">
                            <div className="stat-label">Fog Remaining</div>
                            <div className="stat-value">{results.fogPercentage}%</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Completion Time</div>
                            <div className="stat-value">{results.completionTime}s</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Steps Taken</div>
                            <div className="stat-value">{results.steps}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Difficulty</div>
                            <div className="stat-value">{results.difficulty}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="feedback">
                {getFeedbackMessage(results.fogPercentage)}
            </div>

            <div className="actions">
                <button onClick={playAgain} className="play-again-btn">Play Again</button>
                <button onClick={returnToMainMenu} className="main-menu-btn">Main Menu</button>
            </div>
        </div>
    );
};

/**
 * Generate feedback message based on fog percentage remaining
 * 
 * @param {string} fogPercentage - Fog percentage as string
 * @returns {string} Feedback message
 */
function getFeedbackMessage(fogPercentage) {
    const fogValue = parseFloat(fogPercentage);

    if (fogValue >= 90) {
        return "Outstanding! You're a maze master!";
    } else if (fogValue >= 75) {
        return "Amazing navigation skills! Almost perfect!";
    } else if (fogValue >= 60) {
        return "Great job! You have a good sense of direction.";
    } else if (fogValue >= 45) {
        return "Not bad. Practice more to improve your route.";
    } else if (fogValue >= 30) {
        return "You completed the maze, but revealed more than needed.";
    } else {
        return "Try to be more efficient with your route next time.";
    }
}

export default GameOver;