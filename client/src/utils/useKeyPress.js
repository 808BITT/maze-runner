import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if a specific key is pressed
 * @param {string} targetKey - The key to detect (e.g., 'w', 'ArrowUp')
 * @returns {boolean} - Whether the key is currently pressed
 */
export function useKeyPress(targetKey) {
    const [keyPressed, setKeyPressed] = useState(false);

    const downHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    };

    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, []);

    return keyPressed;
}