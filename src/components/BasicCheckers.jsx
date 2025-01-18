import React, { useState } from 'react';
import { Crown } from 'lucide-react';

// Game variants configuration
const VARIANTS = {
  AMERICAN: {
    name: 'American Checkers',
    boardSize: 8,
    startRows: 3,
    flyingKings: false,
    mandatoryCapture: true,
    backwardCapture: false,
    description: 'Standard 8x8 board, kings move one square diagonally',
  },
  INTERNATIONAL: {
    name: 'International Draughts',
    boardSize: 10,
    startRows: 4,
    flyingKings: true,
    mandatoryCapture: true,
    backwardCapture: true,
    description: 'Played on 10x10 board, flying kings, backward captures allowed',
  },
  RUSSIAN: {
    name: 'Russian Draughts',
    boardSize: 8,
    startRows: 3,
    flyingKings: true,
    mandatoryCapture: true,
    backwardCapture: true,
    description: 'Flying kings, mandatory captures in any direction including backwards',
  },
};

const BasicCheckers = () => {
  const [variant, setVariant] = useState(VARIANTS.AMERICAN);
  const [board, setBoard] = useState(() => initializeBoard(variant));
  const [selectedCell, setSelectedCell] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [isRedTurn, setIsRedTurn] = useState(true);

  // Initialize the board based on the variant
  function initializeBoard(selectedVariant) {
    const size = selectedVariant.boardSize;
    const board = Array(size)
      .fill()
      .map(() => Array(size).fill(null));

    // Set up black pieces
    for (let row = 0; row < selectedVariant.startRows; row++) {
      for (let col = 0; col < size; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = 'black';
        }
      }
    }

    // Set up red pieces
    for (let row = size - selectedVariant.startRows; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = 'red';
        }
      }
    }

    return board;
  }

  const getValidMoves = (row, col) => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const jumps = [];
    const directions = piece.includes('king')
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece === 'red'
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

    directions.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;

      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }

      // Capture logic
      const captureRow = row + 2 * dx;
      const captureCol = col + 2 * dy;
      const midRow = row + dx;
      const midCol = col + dy;

      if (
        isValidPosition(captureRow, captureCol) &&
        board[midRow][midCol] &&
        isOpponentPiece(piece, board[midRow][midCol]) &&
        !board[captureRow][captureCol]
      ) {
        jumps.push({ row: captureRow, col: captureCol, captureRow: midRow, captureCol: midCol });
      }
    });

    return jumps.length > 0 ? jumps : moves;
  };

  const isValidPosition = (row, col) => {
    return row >= 0 && row < variant.boardSize && col >= 0 && col < variant.boardSize;
  };

  const isOpponentPiece = (piece1, piece2) => {
    return piece1.includes('red') !== piece2.includes('red');
  };

  const handleVariantChange = (newVariant) => {
    setVariant(newVariant);
    setBoard(initializeBoard(newVariant));
    setSelectedCell(null);
    setPossibleMoves([]);
    setIsRedTurn(true);
  };

  const handleClick = (row, col) => {
    if (!selectedCell) {
      const piece = board[row][col];
      if (piece && piece.includes('red') === isRedTurn) {
        setSelectedCell({ row, col });
        setPossibleMoves(getValidMoves(row, col));
      }
    } else {
      const move = possibleMoves.find((m) => m.row === row && m.col === col);
      if (move) {
        const newBoard = board.map((r) => r.slice());
        const piece = board[selectedCell.row][selectedCell.col];

        newBoard[selectedCell.row][selectedCell.col] = null;
        newBoard[row][col] = piece;

        if (move.captureRow !== undefined) {
          newBoard[move.captureRow][move.captureCol] = null;
        }

        if ((piece === 'red' && row === 0) || (piece === 'black' && row === variant.boardSize - 1)) {
          newBoard[row][col] += '-king';
        }

        setBoard(newBoard);
        setIsRedTurn(!isRedTurn);
      }
      setSelectedCell(null);
      setPossibleMoves([]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 mb-4">
        {Object.values(VARIANTS).map((v) => (
          <button
            key={v.name}
            onClick={() => handleVariantChange(v)}
            className={`px-4 py-2 rounded ${
              variant.name === v.name ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">{variant.description}</div>

      <div className="text-lg font-bold mb-4">{isRedTurn ? "Red's Turn" : "Black's Turn"}</div>

      <div
        className={`grid gap-0 border-2 border-gray-800`}
        style={{
          gridTemplateColumns: `repeat(${variant.boardSize}, 1fr)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 ${
                (rowIndex + colIndex) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800'
              } flex items-center justify-center cursor-pointer relative`}
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell && (
                <div
                  className={`w-12 h-12 rounded-full ${
                    cell.includes('red') ? 'bg-red-600' : 'bg-gray-900'
                  } flex items-center justify-center ${
                    cell.includes('king') ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  {cell.includes('king') && <Crown className="w-6 h-6 text-yellow-400" />}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BasicCheckers;
