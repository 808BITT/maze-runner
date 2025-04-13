# Maze Runner

Maze Runner is a top-down 2D maze exploration game with fog of war mechanics. Players navigate through procedurally generated mazes while revealing as little of the map as possible. The game rewards efficiency and strategic planning.

## Features

- Procedurally generated mazes with varying difficulty levels.
- Fog of war mechanics to challenge navigation skills.
- Single-player mode with a focus on exploration and efficiency.
- Player upgrades, including movement speed and vision range.
- Leaderboards to track high scores and achievements.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd maze-runner
   ```

2. Install dependencies for both the server and client:

   ```bash
   npm run install:all
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   PORT=5000
   DEBUG=true
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

4. (Optional) To enable client-side debug logging, create a `.env` file in the `client` directory and add:

   ```env
   REACT_APP_DEBUG=true
   ```

## Running the Project

### Development Mode

To run both the server and client in development mode:

```bash
npm run dev
```

- The server will run on `http://localhost:5000`.
- The client will run on `http://localhost:3000`.

### Production Build

To build the client for production:

```bash
npm run build
```

The production-ready files will be located in the `client/dist` directory.

### Starting the Server

To start the server in production mode:

```bash
npm start
```

## Project Structure

```
maze-runner/
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Main application entry point
│   └── vite.config.js    # Vite configuration
├── server/               # Backend Node.js application
│   ├── controllers/      # Business logic
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── index.js          # Server entry point
├── .env                  # Environment variables
├── package.json          # Project metadata and scripts
└── README.md             # Project documentation
```

## Scripts

The following scripts are available in the `package.json` file:

- `npm run start`: Start the server in production mode.
- `npm run dev`: Run both the server and client in development mode.
- `npm run dev:server`: Run the server in development mode with hot reloading.
- `npm run dev:client`: Run the client in development mode.
- `npm run install:all`: Install dependencies for both the server and client.
- `npm run build`: Build the client for production.

## Debugging

- Server-side debugging can be enabled by setting `DEBUG=true` in the `.env` file.
- Client-side debugging can be enabled by setting `REACT_APP_DEBUG=true` in the `client/.env` file.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.
