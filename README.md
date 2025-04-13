# Maze Runner

A top-down 3D maze exploration game built with Three.js, where players must navigate through procedurally generated mazes while strategically uncovering as little of the map as possible.

![Maze Runner Game](assets/screenshots/game_preview.png)

## Game Overview

Maze Runner challenges players to navigate through complex mazes with a unique twist - you're rewarded for leaving more of the map unexplored. The game features a fog-of-war mechanic that gradually reveals areas as you explore, but your final score is higher when you can find the exit while uncovering minimal territory.

## Features

- Procedurally generated mazes with varying difficulty levels
- Fog of war mechanic that rewards efficient navigation
- Top-down 3D graphics powered by Three.js
- Interactive minimap showing explored areas
- Multiple difficulty options
- Touch and keyboard controls

## Installation

Maze Runner is a web-based game that runs directly in your browser without requiring any installation or build steps.

### Option 1: Run Locally (No Server)

1. Clone or download this repository:

   ```
   git clone https://github.com/yourusername/maze-runner.git
   ```

2. Open `index.html` directly in your web browser.

### Option 2: Using a Local Web Server (Recommended)

For the best experience, especially to avoid potential CORS issues with textures and assets, it's recommended to use a local web server:

1. Clone or download this repository:

   ```
   git clone https://github.com/yourusername/maze-runner.git
   ```

2. If you have Node.js installed, you can use a simple HTTP server like `http-server`:

   ```
   npm install -g http-server
   cd maze-runner
   http-server
   ```

3. Or with Python:

   ```
   # Python 3
   cd maze-runner
   python -m http.server 8000
   
   # Python 2
   cd maze-runner
   python -m SimpleHTTPServer 8000
   ```

4. Open your browser and navigate to `http://localhost:8000`

## How to Play

- **Movement**: Use WASD or Arrow keys to move
- **Menu**: Click the Menu button at the top of the screen
- **Objective**: Find the exit (red marker) while revealing as little of the maze as possible
- **Score**: Your score is based on the percentage of fog remaining when you reach the exit

## Browser Compatibility

Maze Runner works best in modern browsers that support WebGL:

- Google Chrome (recommended)
- Firefox
- Edge
- Safari (latest version)

## Development

Maze Runner is built with:

- Three.js for 3D rendering
- Vanilla JavaScript
- HTML5 and CSS

The codebase follows a modular structure:

```
js/
├── core/          # Core game mechanics
├── ui/            # User interface components
└── utils/         # Utility functions and systems
```

## License

[MIT License](LICENSE)

## Credits

Developed by [Your Name]

## Future Updates

- Battle Royale mode
- Tactical Team mode
- Character customization
- More maze generation algorithms
- Additional power-ups and special abilities
