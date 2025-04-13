import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';

const MainMenu = () => {
    const navigate = useNavigate();

    const startSinglePlayer = () => {
        navigate('/play');
    };

    const openCustomization = () => {
        navigate('/customize');
    };

    const openSettings = () => {
        navigate('/settings');
    };

    const openLeaderboard = () => {
        navigate('/leaderboard');
    };

    return (
        <div className="main-menu">
            <div className="game-title">
                <h1>MAZE RUNNER</h1>
                <p>Navigate through the maze while uncovering as little fog as possible</p>
            </div>

            <div className="menu-container">
                <div className="menu-section">
                    <h2>Game Modes</h2>

                    <button className="menu-button active" onClick={startSinglePlayer}>
                        Single Player
                    </button>

                    <button className="menu-button disabled" disabled>
                        Battle Royale <span className="coming-soon">Coming Soon</span>
                    </button>

                    <button className="menu-button disabled" disabled>
                        Tactical Team <span className="coming-soon">Coming Soon</span>
                    </button>
                </div>

                <div className="menu-section">
                    <h2>Player</h2>

                    <button className="menu-button" onClick={openCustomization}>
                        Character Customization
                    </button>

                    <button className="menu-button" onClick={openSettings}>
                        Settings
                    </button>

                    <button className="menu-button" onClick={openLeaderboard}>
                        Leaderboards
                    </button>
                </div>
            </div>

            <div className="footer">
                <p>v1.0.0 | © 2025 Maze Runner</p>
            </div>
        </div>
    );
};

export default MainMenu;