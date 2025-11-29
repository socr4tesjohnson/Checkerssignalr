import React, { useState } from 'react';
import type { Game, Move } from '../types/game';
import { isPieceOwner, isKing } from '../types/game';
import './CheckerBoard.css';

interface CheckerBoardProps {
  game: Game;
  onMove: (move: Move) => void;
}

export const CheckerBoard: React.FC<CheckerBoardProps> = ({ game, onMove }) => {
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);

  const isMyTurn = game.currentPlayer === game.yourPlayerNumber;
  const canInteract = game.state === 'InProgress' && isMyTurn;

  const handleSquareClick = (row: number, col: number) => {
    if (!canInteract) return;

    const piece = game.board[row][col];

    if (selectedSquare) {
      // If clicking on a different square, try to move
      if (selectedSquare.row !== row || selectedSquare.col !== col) {
        const move: Move = {
          fromRow: selectedSquare.row,
          fromCol: selectedSquare.col,
          toRow: row,
          toCol: col,
        };
        onMove(move);
        setSelectedSquare(null);
      } else {
        // Clicking on the same square deselects
        setSelectedSquare(null);
      }
    } else if (game.yourPlayerNumber && isPieceOwner(piece, game.yourPlayerNumber)) {
      // Select the piece
      setSelectedSquare({ row, col });
    }
  };

  const renderPiece = (piece: number) => {
    if (piece === 0) return null;

    const isRed = piece === 1 || piece === 3;
    const pieceIsKing = isKing(piece);

    return (
      <div className={`piece ${isRed ? 'red' : 'black'} ${pieceIsKing ? 'king' : ''}`}>
        {pieceIsKing && <span className="crown">♔</span>}
      </div>
    );
  };

  const isSelected = (row: number, col: number) =>
    selectedSquare?.row === row && selectedSquare?.col === col;

  return (
    <div className="checker-board-container">
      <div className="game-info">
        <div className={`player-info ${game.currentPlayer === 1 ? 'active' : ''}`}>
          <span className="player-dot red"></span>
          <span>{game.player1Name || 'Player 1'} (Red)</span>
          {game.yourPlayerNumber === 1 && <span className="you-badge">YOU</span>}
        </div>
        <div className="turn-indicator">
          {game.state === 'Completed' 
            ? `Game Over! ${game.winner === 1 ? game.player1Name : game.player2Name} wins!`
            : game.state === 'WaitingForPlayer'
            ? 'Waiting for opponent...'
            : isMyTurn 
            ? "Your turn" 
            : "Opponent's turn"}
        </div>
        <div className={`player-info ${game.currentPlayer === 2 ? 'active' : ''}`}>
          <span className="player-dot black"></span>
          <span>{game.player2Name || 'Player 2'} (Black)</span>
          {game.yourPlayerNumber === 2 && <span className="you-badge">YOU</span>}
        </div>
      </div>
      <div className="checker-board">
        {game.board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((piece, colIndex) => {
              const isDark = (rowIndex + colIndex) % 2 === 1;
              return (
                <div
                  key={colIndex}
                  className={`square ${isDark ? 'dark' : 'light'} ${
                    isSelected(rowIndex, colIndex) ? 'selected' : ''
                  } ${canInteract ? 'interactive' : ''}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {renderPiece(piece)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
