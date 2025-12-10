'use client';

import { useEffect, useRef, useState } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const pacmanRef = useRef<Position>({ x: 10, y: 10 });
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const dotsRef = useRef<boolean[][]>([]);
  const ghostsRef = useRef<Position[]>([
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 5, y: 15 },
    { x: 15, y: 15 }
  ]);

  useEffect(() => {
    // Initialize dots grid
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
          nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
          nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          nextDirectionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    const gameLoop = setInterval(() => {
      // Update direction
      directionRef.current = nextDirectionRef.current;

      // Move Pac-Man
      const newPos = { ...pacmanRef.current };
      switch (directionRef.current) {
        case 'UP':
          newPos.y = (newPos.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          newPos.y = (newPos.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          newPos.x = (newPos.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          newPos.x = (newPos.x + 1) % GRID_SIZE;
          break;
      }
      pacmanRef.current = newPos;

      // Check collision with ghosts
      for (const ghost of ghostsRef.current) {
        if (ghost.x === newPos.x && ghost.y === newPos.y) {
          setGameOver(true);
          return;
        }
      }

      // Eat dot
      if (dotsRef.current[newPos.y]?.[newPos.x]) {
        dotsRef.current[newPos.y][newPos.x] = false;
        setScore(prev => prev + 10);
      }

      // Move ghosts randomly
      ghostsRef.current = ghostsRef.current.map(ghost => {
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        const newGhost = { ...ghost };
        
        switch (randomDir) {
          case 'UP':
            newGhost.y = (newGhost.y - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'DOWN':
            newGhost.y = (newGhost.y + 1) % GRID_SIZE;
            break;
          case 'LEFT':
            newGhost.x = (newGhost.x - 1 + GRID_SIZE) % GRID_SIZE;
            break;
          case 'RIGHT':
            newGhost.x = (newGhost.x + 1) % GRID_SIZE;
            break;
        }
        return newGhost;
      });

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dots
      ctx.fillStyle = '#fff';
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (dotsRef.current[y]?.[x]) {
            ctx.beginPath();
            ctx.arc(
              x * cellSize + cellSize / 2,
              y * cellSize + cellSize / 2,
              2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }

      // Draw Pac-Man
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(
        pacmanRef.current.x * cellSize + cellSize / 2,
        pacmanRef.current.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0.2 * Math.PI,
        1.8 * Math.PI
      );
      ctx.lineTo(
        pacmanRef.current.x * cellSize + cellSize / 2,
        pacmanRef.current.y * cellSize + cellSize / 2
      );
      ctx.fill();

      // Draw ghosts
      const ghostColors = ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'];
      ghostsRef.current.forEach((ghost, i) => {
        ctx.fillStyle = ghostColors[i];
        ctx.beginPath();
        ctx.arc(
          ghost.x * cellSize + cellSize / 2,
          ghost.y * cellSize + cellSize / 2,
          cellSize / 2 - 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    }, INITIAL_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    pacmanRef.current = { x: 10, y: 10 };
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    ghostsRef.current = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 5, y: 15 },
      { x: 15, y: 15 }
    ];
    
    const dots: boolean[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      dots[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        dots[y][x] = true;
      }
    }
    dotsRef.current = dots;
    
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4">PAC-MAN</h1>
      <div className="mb-4 text-2xl">Score: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border-4 border-blue-500 mb-4"
      />
      
      {!gameStarted && !gameOver && (
        <div className="text-xl">Press arrow keys to start!</div>
      )}
      
      {gameOver && (
        <div className="text-center">
          <div className="text-3xl text-red-500 mb-4">GAME OVER!</div>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400"
          >
            Play Again
          </button>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-400">
        Use arrow keys to move • Avoid the ghosts • Eat all the dots
      </div>
    </div>
  );
}

