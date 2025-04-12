import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

// Mock data for leaderboards - in a real app, this would come from an API
const mockLeaderboardData = {
    global: [
        { id: 1, playerName: 'MazeWizard', score: 9872, fogPercentage: 92.7, completionTime: 245.8, steps: 312, difficulty: 'hard', date: '2025-04-10' },
        { id: 2, playerName: 'FogExplorer', score: 8654, fogPercentage: 88.3, completionTime: 198.2, steps: 286, difficulty: 'hard', date: '2025-04-09' },
        { id: 3, playerName: 'RunnerPro', score: 7991, fogPercentage: 85.1, completionTime: 210.5, steps: 301, difficulty: 'hard', date: '2025-04-11' },
        { id: 4, playerName: 'LabyrinthKing', score: 7645, fogPercentage: 90.2, completionTime: 321.7, steps: 402, difficulty: 'medium', date: '2025-04-08' },
        { id: 5, playerName: 'MazeRunner42', score: 7320, fogPercentage: 83.9, completionTime: 187.3, steps: 274, difficulty: 'medium', date: '2025-04-10' },
        { id: 6, playerName: 'SpeedMazer', score: 6987, fogPercentage: 78.2, completionTime: 154.6, steps: 229, difficulty: 'medium', date: '2025-04-11' },
        { id: 7, playerName: 'PathFinder', score: 6542, fogPercentage: 82.7, completionTime: 276.9, steps: 345, difficulty: 'easy', date: '2025-04-09' },
        { id: 8, playerName: 'MazeHacker', score: 6125, fogPercentage: 75.3, completionTime: 202.4, steps: 312, difficulty: 'easy', date: '2025-04-07' },
        { id: 9, playerName: 'FogWarrior', score: 5872, fogPercentage: 76.8, completionTime: 231.3, steps: 327, difficulty: 'easy', date: '2025-04-12' },
        { id: 10, playerName: 'MazeNinja', score: 5541, fogPercentage: 72.1, completionTime: 197.5, steps: 286, difficulty: 'medium', date: '2025-04-11' }
    ],
    weekly: [
        { id: 1, playerName: 'FogExplorer', score: 8654, fogPercentage: 88.3, completionTime: 198.2, steps: 286, difficulty: 'hard', date: '2025-04-09' },
        { id: 2, playerName: 'MazeRunner42', score: 7320, fogPercentage: 83.9, completionTime: 187.3, steps: 274, difficulty: 'medium', date: '2025-04-10' },
        { id: 3, playerName: 'SpeedMazer', score: 6987, fogPercentage: 78.2, completionTime: 154.6, steps: 229, difficulty: 'medium', date: '2025-04-11' },
        { id: 4, playerName: 'FogWarrior', score: 5872, fogPercentage: 76.8, completionTime: 231.3, steps: 327, difficulty: 'easy', date: '2025-04-12' },
        { id: 5, playerName: 'NavigatorX', score: 5321, fogPercentage: 70.2, completionTime: 212.8, steps: 294, difficulty: 'easy', date: '2025-04-08' }
    ],
    daily: [
        { id: 1, playerName: 'FogWarrior', score: 5872, fogPercentage: 76.8, completionTime: 231.3, steps: 327, difficulty: 'easy', date: '2025-04-12' },
        { id: 2, playerName: 'MazeGuru', score: 4921, fogPercentage: 68.5, completionTime: 201.7, steps: 276, difficulty: 'medium', date: '2025-04-12' },
        { id: 3, playerName: 'FogMaster', score: 4657, fogPercentage: 65.1, completionTime: 189.4, steps: 258, difficulty: 'easy', date: '2025-04-12' }
    ]
};

// Mock user stats
const mockUserStats = {
    totalGames: 42,
    bestScore: 6125,
    averageScore: 4287,
    totalCoins: 2150,
    bestTime: '3:12',
    bestFogPercentage: '82.7%',
    gamesWon: 38,
    winRate: '90.5%',
    favoriteMapSize: 'Medium'
};

const Leaderboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('global');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userStats, setUserStats] = useState(mockUserStats);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch leaderboard data based on active tab
    useEffect(() => {
        // Simulate API call with loading state
        setIsLoading(true);
        setTimeout(() => {
            let filteredData = [...mockLeaderboardData[activeTab]];
            
            // Apply difficulty filter if not 'all'
            if (categoryFilter !== 'all') {
                filteredData = filteredData.filter(item => item.difficulty === categoryFilter);
            }
            
            setLeaderboardData(filteredData);
            setIsLoading(false);
        }, 800); // Simulated loading delay
    }, [activeTab, categoryFilter]);

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Handle category filter change
    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Return to main menu
    const handleBackToMenu = () => {
        navigate('/');
    };

    return (
        <div className="leaderboard-container">
            <h1>Leaderboards</h1>

            <div className="leaderboard-tabs">
                <button
                    className={`tab ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => handleTabChange('global')}
                >
                    All Time
                </button>
                <button
                    className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
                    onClick={() => handleTabChange('weekly')}
                >
                    Weekly
                </button>
                <button
                    className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                    onClick={() => handleTabChange('daily')}
                >
                    Daily
                </button>
            </div>

            <div className="category-filter">
                <button
                    className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                >
                    All Difficulties
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'easy' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('easy')}
                >
                    Easy
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'medium' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('medium')}
                >
                    Medium
                </button>
                <button
                    className={`filter-btn ${categoryFilter === 'hard' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('hard')}
                >
                    Hard
                </button>
            </div>

            <div className="your-stats">
                <h3>Your Statistics</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-label">Total Games</div>
                        <div className="stat-value">{userStats.totalGames}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Best Score</div>
                        <div className="stat-value">{userStats.bestScore}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Win Rate</div>
                        <div className="stat-value">{userStats.winRate}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Total Coins</div>
                        <div className="stat-value">{userStats.totalCoins}</div>
                    </div>
                </div>
            </div>

            <div className="leaderboard-content">
                {isLoading ? (
                    <div className="loading-spinner"></div>
                ) : leaderboardData.length === 0 ? (
                    <div className="no-data">No leaderboard data available for the selected filters</div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                                <th>Fog %</th>
                                <th>Time</th>
                                <th>Steps</th>
                                <th>Difficulty</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboardData.map((entry, index) => (
                                <tr key={entry.id} className={index < 3 ? 'top-rank' : ''}>
                                    <td className="rank-cell">
                                        {index < 3 ? (
                                            <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                                        ) : (
                                            index + 1
                                        )}
                                    </td>
                                    <td className="player-cell">{entry.playerName}</td>
                                    <td className="score-cell">{entry.score}</td>
                                    <td>{entry.fogPercentage}%</td>
                                    <td>{entry.completionTime}s</td>
                                    <td>{entry.steps}</td>
                                    <td>
                                        <span className={`difficulty-badge bg-${entry.difficulty}`}>
                                            {entry.difficulty}
                                        </span>
                                    </td>
                                    <td>{formatDate(entry.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="leaderboard-footer">
                <button className="back-button" onClick={handleBackToMenu}>
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default Leaderboard;