import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useKeyPress } from '../../utils/useKeyPress';

const ThreeDMaze = ({ mazeData, onPlayerMove }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const playerRef = useRef(null);
    const initialized = useRef(false);
    const [playerPosition, setPlayerPosition] = useState({
        x: mazeData.startX,
        y: mazeData.startY
    });
    const targetPosition = useRef({
        x: mazeData.startX,
        y: mazeData.startY
    });
    const isMoving = useRef(false);

    const upPressed = useKeyPress('w');
    const downPressed = useKeyPress('s');
    const leftPressed = useKeyPress('a');
    const rightPressed = useKeyPress('d');
    const upArrowPressed = useKeyPress('ArrowUp');
    const downArrowPressed = useKeyPress('ArrowDown');
    const leftArrowPressed = useKeyPress('ArrowLeft');
    const rightArrowPressed = useKeyPress('ArrowRight');

    useEffect(() => {
        if (!onPlayerMove || isMoving.current) return;

        if (upPressed || upArrowPressed) {
            onPlayerMove('up');
        } else if (downPressed || downArrowPressed) {
            onPlayerMove('down');
        } else if (leftPressed || leftArrowPressed) {
            onPlayerMove('left');
        } else if (rightPressed || rightArrowPressed) {
            onPlayerMove('right');
        }
    }, [
        upPressed, downPressed, leftPressed, rightPressed,
        upArrowPressed, downArrowPressed, leftArrowPressed, rightArrowPressed,
        onPlayerMove
    ]);

    useEffect(() => {
        if (mazeData && mazeData.playerPosition) {
            targetPosition.current = {
                x: mazeData.playerPosition.x,
                y: mazeData.playerPosition.y
            };
            isMoving.current = true;
        }
    }, [mazeData]);

    useEffect(() => {
        if (!mountRef.current || initialized.current) return;
        console.log('Initializing 3D scene with maze data:', mazeData);

        sceneRef.current = new THREE.Scene();
        sceneRef.current.fog = new THREE.Fog(0x000000, 5, 15);
        sceneRef.current.background = new THREE.Color(0x111111);

        cameraRef.current = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        rendererRef.current = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
        });
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        rendererRef.current.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current.shadowMap.enabled = true;
        rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

        console.log('Created new renderer');

        if (mountRef.current) {
            mountRef.current.appendChild(rendererRef.current.domElement);
            console.log('Appended renderer to DOM');
        }

        initialized.current = true;

        const handleResize = () => {
            if (rendererRef.current && cameraRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [mazeData]);

    useEffect(() => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        const scene = sceneRef.current;
        const camera = cameraRef.current;

        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffcc, 1, 20);
        pointLight.position.set(playerPosition.x, 2, playerPosition.y);
        scene.add(pointLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambientLight);

        console.log('Added lights to scene');

        const floorGeometry = new THREE.PlaneGeometry(mazeData.width, mazeData.height);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(mazeData.width / 2 - 0.5, 0, mazeData.height / 2 - 0.5);
        floor.receiveShadow = true;
        scene.add(floor);

        console.log('Added floor to scene');

        if (mazeData.grid) {
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.7,
                metalness: 0.1
            });

            mazeData.grid.forEach((row, z) => {
                row.forEach((cell, x) => {
                    if (cell === 1) {
                        const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
                        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                        wall.position.set(x, 0.5, z);
                        wall.castShadow = true;
                        wall.receiveShadow = true;
                        scene.add(wall);
                    } else if (cell === 3) {
                        const exitGeometry = new THREE.BoxGeometry(1, 0.1, 1);
                        const exitMaterial = new THREE.MeshStandardMaterial({
                            color: 0x8149e8,
                            emissive: 0x8149e8,
                            emissiveIntensity: 0.5,
                            roughness: 0.5,
                            metalness: 0.5
                        });
                        const exit = new THREE.Mesh(exitGeometry, exitMaterial);
                        exit.position.set(x, 0.05, z);
                        exit.receiveShadow = true;
                        scene.add(exit);
                    } else if (cell === 2) {
                        const startGeometry = new THREE.BoxGeometry(1, 0.1, 1);
                        const startMaterial = new THREE.MeshStandardMaterial({
                            color: 0x4a74e8,
                            emissive: 0x4a74e8,
                            emissiveIntensity: 0.5,
                            roughness: 0.5,
                            metalness: 0.5
                        });
                        const start = new THREE.Mesh(startGeometry, startMaterial);
                        start.position.set(x, 0.05, z);
                        start.receiveShadow = true;
                        scene.add(start);
                    }
                });
            });
            console.log('Added maze walls and features to scene');
        }

        const playerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const playerMaterial = new THREE.MeshStandardMaterial({
            color: 0xe84a74,
            emissive: 0xe84a74,
            emissiveIntensity: 0.3,
            roughness: 0.7,
            metalness: 0.3
        });
        playerRef.current = new THREE.Mesh(playerGeometry, playerMaterial);
        playerRef.current.castShadow = true;
        playerRef.current.position.set(playerPosition.x, 0.3, playerPosition.y);
        scene.add(playerRef.current);

        console.log('Added player to scene');

        const initialCameraHeight = 2.5;
        const initialCameraDistance = 5;
        camera.position.set(
            playerPosition.x,
            initialCameraHeight,
            playerPosition.y + initialCameraDistance
        );
        camera.lookAt(playerPosition.x, 0.3, playerPosition.y);

        console.log('Positioned camera');
    }, [mazeData.grid]);

    useEffect(() => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !playerRef.current) return;

        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;
        const player = playerRef.current;

        const initialCameraHeight = 2.5;
        const initialCameraDistance = 5;
        const moveSpeed = 0.15;

        let animationFrameId;
        const animate = () => {
            if (isMoving.current) {
                const dx = targetPosition.current.x - playerPosition.x;
                const dy = targetPosition.current.y - playerPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0.05) {
                    const newX = playerPosition.x + (dx * moveSpeed);
                    const newY = playerPosition.y + (dy * moveSpeed);
                    setPlayerPosition({ x: newX, y: newY });
                } else {
                    setPlayerPosition({
                        x: targetPosition.current.x,
                        y: targetPosition.current.y
                    });
                    isMoving.current = false;
                }
            }

            if (player) {
                player.position.set(playerPosition.x, 0.3, playerPosition.y);

                if (scene.children.length > 1 && scene.children[1] instanceof THREE.PointLight) {
                    scene.children[1].position.set(playerPosition.x, 1.5, playerPosition.y);
                }
            }

            camera.position.x = playerPosition.x;
            camera.position.z = playerPosition.y + initialCameraDistance;
            camera.lookAt(playerPosition.x, 0.3, playerPosition.y);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        console.log('Animation loop started');

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [playerPosition]);

    useEffect(() => {
        return () => {
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }

            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) object.geometry.dispose();

                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });

                sceneRef.current = null;
            }

            initialized.current = false;
        };
    }, []);

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
    );
};

export default ThreeDMaze;