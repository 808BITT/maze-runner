import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CharacterCustomization.css';

// Mock data - in a real app, this would come from the server
const mockPlayerData = {
    coins: 500,
    unlockedSkins: ['default', 'blue'],
    unlockedTrails: ['none', 'dots'],
    stats: {
        speed: 1,
        vision: 1,
        stamina: 1
    }
};

// Available customization options
const availableSkins = [
    { id: 'default', name: 'Default', price: 0, color: '#e84a74' },
    { id: 'blue', name: 'Blue Spirit', price: 100, color: '#4a74e8' },
    { id: 'green', name: 'Green Shadow', price: 250, color: '#4ae876' },
    { id: 'purple', name: 'Purple Haze', price: 500, color: '#8149e8' },
    { id: 'gold', name: 'Golden Glory', price: 1000, color: '#e8c249' }
];

const availableTrails = [
    { id: 'none', name: 'None', price: 0 },
    { id: 'dots', name: 'Dotted Trail', price: 150 },
    { id: 'line', name: 'Solid Line', price: 300 },
    { id: 'fire', name: 'Fire Trail', price: 750 },
    { id: 'sparkle', name: 'Sparkles', price: 1200 }
];

const CharacterCustomization = () => {
    const navigate = useNavigate();
    const [playerData, setPlayerData] = useState(mockPlayerData);
    const [selectedSkin, setSelectedSkin] = useState(playerData.unlockedSkins[0]);
    const [selectedTrail, setSelectedTrail] = useState(playerData.unlockedTrails[0]);
    const [activeTab, setActiveTab] = useState('appearance');

    // Handle skin selection
    const handleSkinSelect = (skinId) => {
        if (playerData.unlockedSkins.includes(skinId)) {
            setSelectedSkin(skinId);
        }
    };

    // Handle trail selection
    const handleTrailSelect = (trailId) => {
        if (playerData.unlockedTrails.includes(trailId)) {
            setSelectedTrail(trailId);
        }
    };

    // Handle skin purchase
    const handleSkinPurchase = (skin) => {
        if (playerData.coins >= skin.price) {
            const updatedPlayer = {
                ...playerData,
                coins: playerData.coins - skin.price,
                unlockedSkins: [...playerData.unlockedSkins, skin.id]
            };
            setPlayerData(updatedPlayer);
            setSelectedSkin(skin.id);

            // Show purchase feedback
            showPurchaseMessage(`Purchased ${skin.name}!`);
        } else {
            showPurchaseMessage('Not enough coins!', true);
        }
    };

    // Handle trail purchase
    const handleTrailPurchase = (trail) => {
        if (playerData.coins >= trail.price) {
            const updatedPlayer = {
                ...playerData,
                coins: playerData.coins - trail.price,
                unlockedTrails: [...playerData.unlockedTrails, trail.id]
            };
            setPlayerData(updatedPlayer);
            setSelectedTrail(trail.id);

            // Show purchase feedback
            showPurchaseMessage(`Purchased ${trail.name}!`);
        } else {
            showPurchaseMessage('Not enough coins!', true);
        }
    };

    // Handle stat upgrade
    const handleStatUpgrade = (statName) => {
        const upgradeCost = calculateUpgradeCost(playerData.stats[statName]);

        if (playerData.coins >= upgradeCost) {
            const updatedStats = { ...playerData.stats };
            updatedStats[statName] += 1;

            const updatedPlayer = {
                ...playerData,
                coins: playerData.coins - upgradeCost,
                stats: updatedStats
            };

            setPlayerData(updatedPlayer);
            showPurchaseMessage(`${statName.charAt(0).toUpperCase() + statName.slice(1)} upgraded!`);
        } else {
            showPurchaseMessage('Not enough coins!', true);
        }
    };

    // Calculate upgrade cost based on current level
    const calculateUpgradeCost = (currentLevel) => {
        return 100 * Math.pow(2, currentLevel - 1);
    };

    // Show purchase feedback message
    const showPurchaseMessage = (message, isError = false) => {
        const messageElement = document.createElement('div');
        messageElement.className = `purchase-message ${isError ? 'error' : 'success'}`;
        messageElement.textContent = message;

        document.querySelector('.customization-container').appendChild(messageElement);

        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 1500);
    };

    // Handle return to main menu
    const handleBackToMenu = () => {
        navigate('/');
    };

    // Render character preview with selected customizations
    const renderCharacterPreview = () => {
        const selectedSkinData = availableSkins.find(skin => skin.id === selectedSkin);

        return (
            <div className="character-preview">
                <div className="preview-title">Preview</div>
                <div className="preview-character">
                    <div
                        className="character-sprite"
                        style={{ backgroundColor: selectedSkinData.color }}
                    />
                    {selectedTrail !== 'none' && (
                        <div className={`trail-effect trail-${selectedTrail}`}></div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="customization-container">
            <h1>Character Customization</h1>

            <div className="coin-display">
                <span className="coin-icon">🪙</span>
                <span className="coin-amount">{playerData.coins}</span>
            </div>

            {renderCharacterPreview()}

            <div className="customization-tabs">
                <button
                    className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Appearance
                </button>
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Stats
                </button>
            </div>

            {activeTab === 'appearance' ? (
                <div className="appearance-options">
                    <div className="option-section">
                        <h2>Character Skins</h2>
                        <div className="items-grid">
                            {availableSkins.map((skin) => {
                                const isUnlocked = playerData.unlockedSkins.includes(skin.id);
                                const isSelected = selectedSkin === skin.id;

                                return (
                                    <div
                                        key={skin.id}
                                        className={`item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => isUnlocked ? handleSkinSelect(skin.id) : handleSkinPurchase(skin)}
                                    >
                                        <div className="item-preview" style={{ backgroundColor: skin.color }}></div>
                                        <div className="item-name">{skin.name}</div>
                                        {!isUnlocked && (
                                            <div className="item-price">
                                                <span className="coin-icon-small">🪙</span> {skin.price}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="option-section">
                        <h2>Trail Effects</h2>
                        <div className="items-grid">
                            {availableTrails.map((trail) => {
                                const isUnlocked = playerData.unlockedTrails.includes(trail.id);
                                const isSelected = selectedTrail === trail.id;

                                return (
                                    <div
                                        key={trail.id}
                                        className={`item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => isUnlocked ? handleTrailSelect(trail.id) : handleTrailPurchase(trail)}
                                    >
                                        <div className={`item-preview trail-preview trail-${trail.id}`}></div>
                                        <div className="item-name">{trail.name}</div>
                                        {!isUnlocked && (
                                            <div className="item-price">
                                                <span className="coin-icon-small">🪙</span> {trail.price}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="stats-upgrades">
                    <h2>Character Stats</h2>
                    <p className="stats-info">Improve your character's abilities for better maze navigation.</p>

                    <div className="stat-item">
                        <div className="stat-details">
                            <div className="stat-name">Movement Speed</div>
                            <div className="stat-level">
                                {Array(5).fill(0).map((_, i) => (
                                    <span
                                        key={`speed-${i}`}
                                        className={`stat-pip ${i < playerData.stats.speed ? 'filled' : ''}`}
                                    />
                                ))}
                            </div>
                            <div className="stat-description">
                                Move faster through the maze.
                            </div>
                        </div>
                        <button
                            className="upgrade-button"
                            onClick={() => handleStatUpgrade('speed')}
                            disabled={playerData.stats.speed >= 5}
                        >
                            Upgrade
                            {playerData.stats.speed < 5 && (
                                <span className="upgrade-cost">
                                    <span className="coin-icon-small">🪙</span>
                                    {calculateUpgradeCost(playerData.stats.speed)}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="stat-item">
                        <div className="stat-details">
                            <div className="stat-name">Vision Range</div>
                            <div className="stat-level">
                                {Array(5).fill(0).map((_, i) => (
                                    <span
                                        key={`vision-${i}`}
                                        className={`stat-pip ${i < playerData.stats.vision ? 'filled' : ''}`}
                                    />
                                ))}
                            </div>
                            <div className="stat-description">
                                See farther and reveal more of the map at once.
                            </div>
                        </div>
                        <button
                            className="upgrade-button"
                            onClick={() => handleStatUpgrade('vision')}
                            disabled={playerData.stats.vision >= 5}
                        >
                            Upgrade
                            {playerData.stats.vision < 5 && (
                                <span className="upgrade-cost">
                                    <span className="coin-icon-small">🪙</span>
                                    {calculateUpgradeCost(playerData.stats.vision)}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="stat-item">
                        <div className="stat-details">
                            <div className="stat-name">Stamina</div>
                            <div className="stat-level">
                                {Array(5).fill(0).map((_, i) => (
                                    <span
                                        key={`stamina-${i}`}
                                        className={`stat-pip ${i < playerData.stats.stamina ? 'filled' : ''}`}
                                    />
                                ))}
                            </div>
                            <div className="stat-description">
                                Unlock special abilities and increase their duration.
                            </div>
                        </div>
                        <button
                            className="upgrade-button"
                            onClick={() => handleStatUpgrade('stamina')}
                            disabled={playerData.stats.stamina >= 5}
                        >
                            Upgrade
                            {playerData.stats.stamina < 5 && (
                                <span className="upgrade-cost">
                                    <span className="coin-icon-small">🪙</span>
                                    {calculateUpgradeCost(playerData.stats.stamina)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div className="back-button-container">
                <button className="back-button" onClick={handleBackToMenu}>
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default CharacterCustomization;