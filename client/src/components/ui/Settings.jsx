import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        soundVolume: 75,
        musicVolume: 60,
        showMinimap: true,
        highContrast: false,
        controls: {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        }
    });

    const handleSoundVolumeChange = (e) => {
        setSettings({ ...settings, soundVolume: e.target.value });
    };

    const handleMusicVolumeChange = (e) => {
        setSettings({ ...settings, musicVolume: e.target.value });
    };

    const handleMinimapToggle = () => {
        setSettings({ ...settings, showMinimap: !settings.showMinimap });
    };

    const handleContrastToggle = () => {
        setSettings({ ...settings, highContrast: !settings.highContrast });
    };

    const handleSaveSettings = () => {
        // In a real app, save settings to local storage or database
        console.log('Settings saved:', settings);

        // Show saved indicator
        document.getElementById('save-indicator').classList.add('visible');
        setTimeout(() => {
            document.getElementById('save-indicator').classList.remove('visible');
        }, 2000);
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>

            <div className="settings-section">
                <h2>Audio</h2>

                <div className="setting-item">
                    <label htmlFor="sound-volume">Sound Effects Volume</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            id="sound-volume"
                            min="0"
                            max="100"
                            value={settings.soundVolume}
                            onChange={handleSoundVolumeChange}
                        />
                        <span>{settings.soundVolume}%</span>
                    </div>
                </div>

                <div className="setting-item">
                    <label htmlFor="music-volume">Music Volume</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            id="music-volume"
                            min="0"
                            max="100"
                            value={settings.musicVolume}
                            onChange={handleMusicVolumeChange}
                        />
                        <span>{settings.musicVolume}%</span>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2>Display</h2>

                <div className="setting-item">
                    <label htmlFor="show-minimap">Show Minimap</label>
                    <div className="toggle-container">
                        <input
                            type="checkbox"
                            id="show-minimap"
                            checked={settings.showMinimap}
                            onChange={handleMinimapToggle}
                        />
                        <div className="toggle-slider"></div>
                    </div>
                </div>

                <div className="setting-item">
                    <label htmlFor="high-contrast">High Contrast Mode</label>
                    <div className="toggle-container">
                        <input
                            type="checkbox"
                            id="high-contrast"
                            checked={settings.highContrast}
                            onChange={handleContrastToggle}
                        />
                        <div className="toggle-slider"></div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h2>Controls</h2>
                <p className="coming-soon-note">Advanced control customization coming soon!</p>
                <div className="controls-info">
                    <div>Move Up: <span className="key">↑</span> or <span className="key">W</span></div>
                    <div>Move Right: <span className="key">→</span> or <span className="key">D</span></div>
                    <div>Move Down: <span className="key">↓</span> or <span className="key">S</span></div>
                    <div>Move Left: <span className="key">←</span> or <span className="key">A</span></div>
                </div>
            </div>

            <div className="buttons-container">
                <button className="save-button" onClick={handleSaveSettings}>Save Settings</button>
                <button className="back-button" onClick={handleBackToMenu}>Back to Menu</button>
            </div>

            <div id="save-indicator" className="save-indicator">
                Settings saved successfully!
            </div>
        </div>
    );
};

export default Settings;