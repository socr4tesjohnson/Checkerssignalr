export interface Game {
  gameId: string;
  gameCode: string;
  player1Name: string | null;
  player2Name: string | null;
  state: 'WaitingForPlayer' | 'InProgress' | 'Completed';
  board: number[][];
  currentPlayer: number;
  winner: number | null;
  yourPlayerNumber: number | null;
}

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

// Piece values on the board:
// 0 = empty
// 1 = red piece (player 1)
// 2 = black piece (player 2)
// 3 = red king (player 1)
// 4 = black king (player 2)

export const isPieceOwner = (piece: number, playerNumber: number): boolean => {
  if (playerNumber === 1) return piece === 1 || piece === 3;
  if (playerNumber === 2) return piece === 2 || piece === 4;
  return false;
};

export const isKing = (piece: number): boolean => piece === 3 || piece === 4;
