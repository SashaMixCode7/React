import { useState, useEffect } from "react";
import { BoardWithCoordinates } from './sea_square.js';

function check_arena(arena) {
  let zan = Array(100).fill("Y");
  let battleship = 1;
  let cruisers = 2;
  let destroyers = 3;
  let boats = 4;
  const visited = Array(100).fill(false);

  for (let i = 0; i < 100; i++) {
    if (!visited[i] && arena[i] === "O") {
      const shipSize = findShipSize(arena, i, visited);
      if (shipSize >= 1 && shipSize <= 4) {
        let canPlace = false;
        switch (shipSize) {
          case 4: if (battleship > 0) { battleship--; canPlace = true; } break;
          case 3: if (cruisers > 0) { cruisers--; canPlace = true; } break;
          case 2: if (destroyers > 0) { destroyers--; canPlace = true; } break;
          case 1: if (boats > 0) { boats--; canPlace = true; } break;
        }
        if (canPlace) markShipAndArea(arena, i, shipSize, zan, visited);
      }
    }
  }
  return [zan, battleship, cruisers, destroyers, boats];
}

function findShipSize(arena, startIndex, visited) {
  let horizontalSize = 1;
  let verticalSize = 1;
  let currentIndex = startIndex;
  while (currentIndex + 1 < 100 && (currentIndex % 10) !== 9 && arena[currentIndex + 1] === "O" && !visited[currentIndex + 1]) {
    horizontalSize++;
    currentIndex++;
  }
  currentIndex = startIndex;
  while (currentIndex + 10 < 100 && arena[currentIndex + 10] === "O" && !visited[currentIndex + 10]) {
    verticalSize++;
    currentIndex += 10;
  }
  return Math.max(horizontalSize, verticalSize);
}

function markShipAndArea(arena, startIndex, size, zan, visited) {
  const isHorizontal = (startIndex + 1 < 100 && (startIndex % 10) !== 9 && arena[startIndex + 1] === "O");
  for (let i = 0; i < size; i++) {
    const index = isHorizontal ? startIndex + i : startIndex + i * 10;
    zan[index] = "O";
    visited[index] = true;
  }
  for (let i = 0; i < size; i++) {
    const index = isHorizontal ? startIndex + i : startIndex + i * 10;
    markCellAsRestricted(index, zan);
  }
}

function markCellAsRestricted(index, zan) {
  const row = Math.floor(index / 10);
  const col = index % 10;
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const newRow = row + r;
      const newCol = col + c;
      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        const newIndex = newRow * 10 + newCol;
        if (zan[newIndex] !== "O") zan[newIndex] = "Z";
      }
    }
  }
}

function checkWinner(arena) {
  return !arena.some(cell => cell === "O");
}

function maskBoard(arena) {
  return arena.map(cell => (cell === "O" ? "Y" : cell));
}

export default function Game() {
  const [arena_pl1, setArena_pl1] = useState(Array(100).fill("Y"));
  const [arena_pl2, setArena_pl2] = useState(Array(100).fill("Y"));
  const [zan, setZan] = useState(Array(100).fill("Y"));
  const [pl_IsNext, setPlIsNext] = useState("p1_O");
  const [shipCounts, setShipCounts] = useState({ battleship: 1, cruisers: 2, destroyers: 3, boats: 4 });
  const [winner, setWinner] = useState(null);

  //let description = "передать ход 2 игроку";

  useEffect(() => {
    if (winner) return;
  if (pl_IsNext === "p1_S" && checkWinner(arena_pl2)) setWinner(1);
  else if (pl_IsNext === "p2_S" && checkWinner(arena_pl1)) setWinner(2);
}, [arena_pl1, arena_pl2, pl_IsNext, winner]);

  const handlePlay = (move, field) => {
    if (winner) return;

    if (move === "p1_O") {
      const arena_pl = [...arena_pl1];
      arena_pl[field] = arena_pl[field] === "O" ? "Y" : "O";
      setArena_pl1(arena_pl);
      const [newZan, battleship, cruisers, destroyers, boats] = check_arena(arena_pl);
      setZan(newZan);
      setShipCounts({ battleship, cruisers, destroyers, boats });
    } else if (move === "p2_O") {
      const arena_pl = [...arena_pl2];
      arena_pl[field] = arena_pl[field] === "O" ? "Y" : "O";
      setArena_pl2(arena_pl);
      const [newZan, battleship, cruisers, destroyers, boats] = check_arena(arena_pl);
      setZan(newZan);
      setShipCounts({ battleship, cruisers, destroyers, boats });
    } else if (move === "p1_S") {
      const arena_pl = [...arena_pl2];
      if (arena_pl[field] === "O") arena_pl[field] = "X";
      else if (arena_pl[field] === "X" || arena_pl[field] === "M") return;
      else { arena_pl[field] = "M"; setPlIsNext("p2_S"); }
      setArena_pl2(arena_pl);
      return;
    } else if (move === "p2_S") {
      const arena_pl = [...arena_pl1];
      if (arena_pl[field] === "O") arena_pl[field] = "X";
      else if (arena_pl[field] === "X" || arena_pl[field] === "M") return;
      else { arena_pl[field] = "M"; setPlIsNext("p1_S"); }
      setArena_pl1(arena_pl);
      return;
    }
  };

  const description =
    pl_IsNext === "p1_O" ? "Передать ход Игроку 2 (расстановка)" :
    pl_IsNext === "p2_O" ? "Начать игру" : "Игра идёт";

  const jumpTo = () => {
    if (winner) return;
    if (pl_IsNext === "p1_O") {
      const { battleship, cruisers, destroyers, boats } = shipCounts;
      if (battleship === 0 && cruisers === 0 && destroyers === 0 && boats === 0) {
        setPlIsNext("p2_O");
        setZan(Array(100).fill("Y"));
        setShipCounts({ battleship: 1, cruisers: 2, destroyers: 3, boats: 4 });
      } else alert("Расставьте все корабли перед передачей хода!");
    } else if (pl_IsNext === "p2_O") {
      const { battleship, cruisers, destroyers, boats } = shipCounts;
      if (battleship === 0 && cruisers === 0 && destroyers === 0 && boats === 0) {
        setPlIsNext("p1_S");
      } else alert("Расставьте все корабли перед началом игры!");
    }
  };

  const restartGame = () => {
    setArena_pl1(Array(100).fill("Y"));
    setArena_pl2(Array(100).fill("Y"));
    setZan(Array(100).fill("Y"));
    setPlIsNext("p1_O");
    setShipCounts({ battleship: 1, cruisers: 2, destroyers: 3, boats: 4 });
    setWinner(null);
  };

  return (
    <div className="game">
      {winner && (
        <div className="winner-message">
          <h2>🚢 Флот побежден! 🏴‍☠️</h2>
          <p>Игрок {winner} победил!</p>
          <button onClick={restartGame} className="new-game-btn">Новая игра</button>
        </div>
      )}

      <div className="game-info">
        <div>Линкор (4): {shipCounts.battleship}</div>
        <div>Крейсеры (3): {shipCounts.cruisers}</div>
        <div>Эсминцы (2): {shipCounts.destroyers}</div>
        <div>Катера (1): {shipCounts.boats}</div>
        {winner && <div className="winner-announcement">Игрок {winner} победил!</div>}
      </div>

      <div className="game-board">
        <div className="player-board">
          <h2>Игрок 1 {pl_IsNext === "p1_O" && "(расставляет корабли)"}</h2>
          <BoardWithCoordinates
            pl_IsNext={pl_IsNext}
            arena={
              pl_IsNext === "p1_O" ? zan :
              pl_IsNext === "p2_S" ? maskBoard(arena_pl1) :
              arena_pl1
            }
            active={pl_IsNext === "p2_S" || pl_IsNext === "p1_O"}
            onPlay={handlePlay}
          />
        </div>

        <div className="player-board">
          <h2>Игрок 2 {pl_IsNext === "p2_O" && "(расставляет корабли)"}</h2>
          <BoardWithCoordinates
            pl_IsNext={pl_IsNext}
            arena={
              pl_IsNext === "p2_O" ? zan :
              pl_IsNext === "p1_S" ? maskBoard(arena_pl2) :
              arena_pl2
            }
            active={pl_IsNext === "p1_S" || pl_IsNext === "p2_O"}
            onPlay={handlePlay}
          />
        </div>
      </div>

      <button onClick={jumpTo} disabled={winner}>{description}</button>

    </div>
  );
}