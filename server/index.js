const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const mazeGenerator = require('./utils/mazeGenerator');
const { initializeGameState } = require('./utils/gameState');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(express.json());

// Set static folder in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/scores', require('./routes/scores'));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle player joining the game
    socket.on('joinGame', ({ userId, difficulty }) => {
        try {
            // Generate a new maze based on difficulty
            const maze = mazeGenerator.generate(difficulty);

            // Initialize game state for this player
            const gameState = initializeGameState(userId, maze);

            // Send initial game state to the client
            socket.emit('gameInitialized', gameState);

            console.log(`Player ${userId} started a new game with difficulty ${difficulty}`);
        } catch (error) {
            console.error('Error initializing game:', error);
            socket.emit('error', { message: 'Failed to initialize game' });
        }
    });

    // Handle player movement
    socket.on('movePlayer', ({ userId, direction }) => {
        try {
            // Update player position and fog of war
            const updatedState = require('./controllers/gameController').handlePlayerMovement(userId, direction);

            // Send updated state to the client
            socket.emit('gameStateUpdate', updatedState);
        } catch (error) {
            console.error('Error handling player movement:', error);
            socket.emit('error', { message: 'Failed to process movement' });
        }
    });

    // Handle game completion
    socket.on('completeGame', ({ userId, gameState }) => {
        try {
            // Calculate score based on fog remaining
            const result = require('./controllers/gameController').handleGameCompletion(userId, gameState);

            // Send result to client
            socket.emit('gameCompleted', result);

            console.log(`Player ${userId} completed the game with score: ${result.score}`);
        } catch (error) {
            console.error('Error handling game completion:', error);
            socket.emit('error', { message: 'Failed to process game completion' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Save game state if necessary
    });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));