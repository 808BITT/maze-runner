import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import SinglePlayerGame from './components/game/SinglePlayerGame';
import CharacterCustomization from './components/ui/CharacterCustomization';
import GameOver from './components/ui/GameOver';
import Leaderboard from './components/ui/Leaderboard';
import MainMenu from './components/ui/MainMenu';
import Settings from './components/ui/Settings';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<MainMenu />} />
                    <Route path="/play" element={<SinglePlayerGame />} />
                    <Route path="/gameover" element={<GameOver />} />
                    <Route path="/customize" element={<CharacterCustomization />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;