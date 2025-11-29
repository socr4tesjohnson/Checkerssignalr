using System.Collections.Concurrent;
using CheckersApi.Models;

namespace CheckersApi.Services;

public class GameService
{
    private readonly ConcurrentDictionary<string, Game> _games = new();
    private readonly ConcurrentDictionary<string, string> _gameCodeToId = new();
    private readonly Random _random = new();

    public Game CreateGame(string connectionId, string playerName)
    {
        var gameId = Guid.NewGuid().ToString();
        var gameCode = GenerateGameCode();

        var game = new Game
        {
            GameId = gameId,
            GameCode = gameCode,
            Player1ConnectionId = connectionId,
            Player1Name = playerName
        };

        _games[gameId] = game;
        _gameCodeToId[gameCode] = gameId;

        return game;
    }

    public Game? JoinGame(string gameCode, string connectionId, string playerName)
    {
        if (!_gameCodeToId.TryGetValue(gameCode.ToUpperInvariant(), out var gameId))
        {
            return null;
        }

        if (!_games.TryGetValue(gameId, out var game))
        {
            return null;
        }

        if (game.State != GameState.WaitingForPlayer)
        {
            return null;
        }

        // Prevent same player from joining twice
        if (game.Player1ConnectionId == connectionId)
        {
            return null;
        }

        game.Player2ConnectionId = connectionId;
        game.Player2Name = playerName;
        game.State = GameState.InProgress;

        return game;
    }

    public Game? GetGame(string gameId)
    {
        _games.TryGetValue(gameId, out var game);
        return game;
    }

    public Game? GetGameByCode(string gameCode)
    {
        if (_gameCodeToId.TryGetValue(gameCode.ToUpperInvariant(), out var gameId))
        {
            return GetGame(gameId);
        }
        return null;
    }

    public Game? GetGameByConnectionId(string connectionId)
    {
        return _games.Values.FirstOrDefault(g =>
            g.Player1ConnectionId == connectionId || g.Player2ConnectionId == connectionId);
    }

    public (bool success, string? error) MakeMove(string gameId, string connectionId, Move move)
    {
        if (!_games.TryGetValue(gameId, out var game))
        {
            return (false, "Game not found");
        }

        if (game.State != GameState.InProgress)
        {
            return (false, "Game is not in progress");
        }

        var playerNumber = GetPlayerNumber(game, connectionId);
        if (playerNumber == 0)
        {
            return (false, "You are not a player in this game");
        }

        if (game.CurrentPlayer != playerNumber)
        {
            return (false, "It's not your turn");
        }

        // Validate and execute the move
        var (isValid, isCapture) = ValidateMove(game, move, playerNumber);
        if (!isValid)
        {
            return (false, "Invalid move");
        }

        ExecuteMove(game, move, isCapture);

        // Check for additional captures (multi-jump)
        var hasMoreCaptures = CanCapture(game, move.ToRow, move.ToCol, playerNumber);

        // Only switch turns if no more captures available or piece was promoted
        var piece = game.Board[move.ToRow, move.ToCol];
        var wasPromoted = (playerNumber == 1 && move.ToRow == 0) || (playerNumber == 2 && move.ToRow == 7);
        
        if (!hasMoreCaptures || wasPromoted)
        {
            game.CurrentPlayer = game.CurrentPlayer == 1 ? 2 : 1;
        }

        // Check for win condition
        CheckWinCondition(game);

        return (true, null);
    }

    public void PlayerDisconnected(string connectionId)
    {
        var game = GetGameByConnectionId(connectionId);
        if (game != null && game.State == GameState.WaitingForPlayer)
        {
            _games.TryRemove(game.GameId, out _);
            _gameCodeToId.TryRemove(game.GameCode, out _);
        }
    }

    private int GetPlayerNumber(Game game, string connectionId)
    {
        if (game.Player1ConnectionId == connectionId) return 1;
        if (game.Player2ConnectionId == connectionId) return 2;
        return 0;
    }

    private string GenerateGameCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded I, O, 0, 1 to avoid confusion
        var code = new char[6];
        for (int i = 0; i < 6; i++)
        {
            code[i] = chars[_random.Next(chars.Length)];
        }
        var gameCode = new string(code);

        // Ensure uniqueness
        while (_gameCodeToId.ContainsKey(gameCode))
        {
            for (int i = 0; i < 6; i++)
            {
                code[i] = chars[_random.Next(chars.Length)];
            }
            gameCode = new string(code);
        }

        return gameCode;
    }

    private (bool isValid, bool isCapture) ValidateMove(Game game, Move move, int playerNumber)
    {
        // Basic boundary checks
        if (move.FromRow < 0 || move.FromRow > 7 || move.FromCol < 0 || move.FromCol > 7 ||
            move.ToRow < 0 || move.ToRow > 7 || move.ToCol < 0 || move.ToCol > 7)
        {
            return (false, false);
        }

        var piece = game.Board[move.FromRow, move.FromCol];
        
        // Check if player owns this piece
        var isPlayerPiece = (playerNumber == 1 && (piece == 1 || piece == 3)) ||
                           (playerNumber == 2 && (piece == 2 || piece == 4));
        if (!isPlayerPiece)
        {
            return (false, false);
        }

        // Check destination is empty
        if (game.Board[move.ToRow, move.ToCol] != 0)
        {
            return (false, false);
        }

        var rowDiff = move.ToRow - move.FromRow;
        var colDiff = Math.Abs(move.ToCol - move.FromCol);
        var isKing = piece == 3 || piece == 4;

        // Check valid direction for non-kings
        if (!isKing)
        {
            // Red (1) moves up (negative row), Black (2) moves down (positive row)
            var validDirection = (playerNumber == 1 && rowDiff < 0) || (playerNumber == 2 && rowDiff > 0);
            if (!validDirection && Math.Abs(rowDiff) == 1)
            {
                return (false, false);
            }
        }

        // Regular move
        if (Math.Abs(rowDiff) == 1 && colDiff == 1)
        {
            if (!isKing)
            {
                var validDirection = (playerNumber == 1 && rowDiff < 0) || (playerNumber == 2 && rowDiff > 0);
                return (validDirection, false);
            }
            return (true, false);
        }

        // Capture move
        if (Math.Abs(rowDiff) == 2 && colDiff == 2)
        {
            var midRow = (move.FromRow + move.ToRow) / 2;
            var midCol = (move.FromCol + move.ToCol) / 2;
            var capturedPiece = game.Board[midRow, midCol];

            var isOpponentPiece = (playerNumber == 1 && (capturedPiece == 2 || capturedPiece == 4)) ||
                                  (playerNumber == 2 && (capturedPiece == 1 || capturedPiece == 3));

            if (isOpponentPiece)
            {
                if (!isKing)
                {
                    var validDirection = (playerNumber == 1 && rowDiff < 0) || (playerNumber == 2 && rowDiff > 0);
                    return (validDirection, true);
                }
                return (true, true);
            }
        }

        return (false, false);
    }

    private void ExecuteMove(Game game, Move move, bool isCapture)
    {
        var piece = game.Board[move.FromRow, move.FromCol];
        game.Board[move.FromRow, move.FromCol] = 0;

        // Handle capture
        if (isCapture)
        {
            var midRow = (move.FromRow + move.ToRow) / 2;
            var midCol = (move.FromCol + move.ToCol) / 2;
            game.Board[midRow, midCol] = 0;
        }

        // Check for king promotion
        if (piece == 1 && move.ToRow == 0)
        {
            piece = 3; // Red king
        }
        else if (piece == 2 && move.ToRow == 7)
        {
            piece = 4; // Black king
        }

        game.Board[move.ToRow, move.ToCol] = piece;
    }

    private bool CanCapture(Game game, int row, int col, int playerNumber)
    {
        var piece = game.Board[row, col];
        var isKing = piece == 3 || piece == 4;

        var directions = new[] { (-2, -2), (-2, 2), (2, -2), (2, 2) };

        foreach (var (rowDir, colDir) in directions)
        {
            var newRow = row + rowDir;
            var newCol = col + colDir;
            var midRow = row + rowDir / 2;
            var midCol = col + colDir / 2;

            // Check bounds
            if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7)
                continue;

            // Non-kings can only capture forward
            if (!isKing)
            {
                var validDirection = (playerNumber == 1 && rowDir < 0) || (playerNumber == 2 && rowDir > 0);
                if (!validDirection) continue;
            }

            // Check if destination is empty
            if (game.Board[newRow, newCol] != 0)
                continue;

            // Check if there's an opponent piece to capture
            var capturedPiece = game.Board[midRow, midCol];
            var isOpponentPiece = (playerNumber == 1 && (capturedPiece == 2 || capturedPiece == 4)) ||
                                  (playerNumber == 2 && (capturedPiece == 1 || capturedPiece == 3));

            if (isOpponentPiece)
                return true;
        }

        return false;
    }

    private void CheckWinCondition(Game game)
    {
        var player1Pieces = 0;
        var player2Pieces = 0;

        for (int row = 0; row < 8; row++)
        {
            for (int col = 0; col < 8; col++)
            {
                var piece = game.Board[row, col];
                if (piece == 1 || piece == 3) player1Pieces++;
                else if (piece == 2 || piece == 4) player2Pieces++;
            }
        }

        if (player1Pieces == 0)
        {
            game.Winner = 2;
            game.State = GameState.Completed;
        }
        else if (player2Pieces == 0)
        {
            game.Winner = 1;
            game.State = GameState.Completed;
        }
    }

    public static GameDto ToDto(Game game, string? connectionId = null)
    {
        var board = new int[8][];
        for (int row = 0; row < 8; row++)
        {
            board[row] = new int[8];
            for (int col = 0; col < 8; col++)
            {
                board[row][col] = game.Board[row, col];
            }
        }

        int? playerNumber = null;
        if (connectionId != null)
        {
            if (game.Player1ConnectionId == connectionId) playerNumber = 1;
            else if (game.Player2ConnectionId == connectionId) playerNumber = 2;
        }

        return new GameDto
        {
            GameId = game.GameId,
            GameCode = game.GameCode,
            Player1Name = game.Player1Name,
            Player2Name = game.Player2Name,
            State = game.State.ToString(),
            Board = board,
            CurrentPlayer = game.CurrentPlayer,
            Winner = game.Winner,
            YourPlayerNumber = playerNumber
        };
    }
}
