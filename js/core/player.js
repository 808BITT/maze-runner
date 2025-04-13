/**
 * MazeRunner Game - Player Module
 * Handles player entity, movement, collision and camera follow.
 */

MazeRunner.Player = class {
    constructor(scene, camera, maze) {
        this.scene = scene;
        this.camera = camera;
        this.maze = maze;

        // Player attributes
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Y-axis rotation in radians
        this.speed = MazeRunner.config.player.moveSpeed;
        this.rotationSpeed = MazeRunner.config.player.rotationSpeed;
        this.radius = 0.4; // For collision detection

        // Player mesh
        this.mesh = null;

        // Camera settings
        this.cameraHeight = 10; // Height of camera above player
        this.cameraDistance = 0; // Distance behind player (0 for top-down)
        this.cameraLookAhead = 5; // How far ahead the camera looks

        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;
    }

    init() {
        // Create player mesh
        this.createPlayerMesh();

        // Position at start
        const startPos = this.maze.getStartPosition();
        this.position.set(startPos.x, 0, startPos.z);
        this.mesh.position.copy(this.position);

        // Add to scene
        this.scene.add(this.mesh);

        // Position camera
        this.updateCamera();
    }

    createPlayerMesh() {
        // Create a player model (a simple cylinder for now)
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, 1, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3388ff,
            emissive: 0x001133,
            roughness: 0.5,
            metalness: 0.8
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;

        // Add a directional indicator (cone pointing forward)
        const coneGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
        const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff8833 });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);

        // Position cone at front of player
        cone.position.z = -this.radius - 0.1;
        cone.rotation.x = Math.PI / 2;

        this.mesh.add(cone);
    }

    setMovement(direction, active) {
        switch (direction) {
            case 'forward':
                this.moveForward = active;
                break;
            case 'backward':
                this.moveBackward = active;
                break;
            case 'left':
                this.rotateLeft = active;
                break;
            case 'right':
                this.rotateRight = active;
                break;
        }
    }

    update(delta) {
        // Handle rotation
        if (this.rotateLeft) {
            this.rotation += this.rotationSpeed * delta;
        }
        if (this.rotateRight) {
            this.rotation -= this.rotationSpeed * delta;
        }

        // Apply rotation to mesh
        this.mesh.rotation.y = this.rotation;

        // Calculate movement
        let moveX = 0;
        let moveZ = 0;

        if (this.moveForward) {
            moveX = Math.sin(this.rotation) * this.speed * delta;
            moveZ = Math.cos(this.rotation) * this.speed * delta;
        }
        if (this.moveBackward) {
            moveX = -Math.sin(this.rotation) * this.speed * 0.5 * delta; // Slower backward movement
            moveZ = -Math.cos(this.rotation) * this.speed * 0.5 * delta;
        }

        // Try movement with collision detection
        if (moveX !== 0 || moveZ !== 0) {
            const nextPosition = {
                x: this.position.x + moveX,
                y: this.position.y,
                z: this.position.z + moveZ
            };

            // Check if new position has collision
            if (!this.maze.checkCollision(nextPosition, this.radius)) {
                // Update position if no collision
                this.position.x = nextPosition.x;
                this.position.z = nextPosition.z;
                this.mesh.position.copy(this.position);

                // Emit move event for fog of war
                MazeRunner.events.emit('playerMoved', {
                    position: { ...this.position },
                    rotation: this.rotation
                });
            }
        }

        // Update camera position
        this.updateCamera();

        // Check for win condition
        this.checkWin();
    }

    updateCamera() {
        // Position camera above and behind player
        const lookAtPoint = new THREE.Vector3(
            this.position.x + Math.sin(this.rotation) * this.cameraLookAhead,
            this.position.y,
            this.position.z + Math.cos(this.rotation) * this.cameraLookAhead
        );

        // Calculate camera position
        const cameraPosition = new THREE.Vector3(
            this.position.x - Math.sin(this.rotation) * this.cameraDistance,
            this.position.y + this.cameraHeight,
            this.position.z - Math.cos(this.rotation) * this.cameraDistance
        );

        // Update camera
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(lookAtPoint);
    }

    checkWin() {
        const exitPos = this.maze.getExitPosition();

        // Check if player has reached the exit
        if (Math.abs(this.position.x - exitPos.x) < 1 &&
            Math.abs(this.position.z - exitPos.z) < 1) {
            // Emit win event
            MazeRunner.events.emit('reachedExit', {
                position: { ...this.position }
            });
        }
    }

    getPosition() {
        return { ...this.position };
    }

    getRotation() {
        return this.rotation;
    }

    reset(position) {
        // Reset player position
        this.position.set(position.x, position.y, position.z);
        this.mesh.position.copy(this.position);

        // Reset rotation
        this.rotation = 0;
        this.mesh.rotation.y = 0;

        // Reset movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;

        // Update camera
        this.updateCamera();
    }
};