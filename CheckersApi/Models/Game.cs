namespace CheckersApi.Models;

public class Game
{
    public string GameId { get; set; } = string.Empty;
    public string GameCode { get; set; } = string.Empty;
    public string? Player1ConnectionId { get; set; }
    public string? Player2ConnectionId { get; set; }
    public string? Player1Name { get; set; }
    public string? Player2Name { get; set; }
    public GameState State { get; set; } = GameState.WaitingForPlayer;
    public int[,] Board { get; set; } = new int[8, 8];
    public int CurrentPlayer { get; set; } = 1; // 1 = Red (Player1), 2 = Black (Player2)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? Winner { get; set; }

    public Game()
    {
        InitializeBoard();
    }

    private void InitializeBoard()
    {
        // Initialize the checkers board
        // 0 = empty, 1 = red piece, 2 = black piece, 3 = red king, 4 = black king
        for (int row = 0; row < 8; row++)
        {
            for (int col = 0; col < 8; col++)
            {
                if ((row + col) % 2 == 1) // Only dark squares have pieces
                {
                    if (row < 3)
                    {
                        Board[row, col] = 2; // Black pieces at top
                    }
                    else if (row > 4)
                    {
                        Board[row, col] = 1; // Red pieces at bottom
                    }
                    else
                    {
                        Board[row, col] = 0; // Empty middle rows
                    }
                }
                else
                {
                    Board[row, col] = 0;
                }
            }
        }
    }
}

public enum GameState
{
    WaitingForPlayer,
    InProgress,
    Completed
}

public class Move
{
    public int FromRow { get; set; }
    public int FromCol { get; set; }
    public int ToRow { get; set; }
    public int ToCol { get; set; }
}

public class GameDto
{
    public string GameId { get; set; } = string.Empty;
    public string GameCode { get; set; } = string.Empty;
    public string? Player1Name { get; set; }
    public string? Player2Name { get; set; }
    public string State { get; set; } = string.Empty;
    public int[][] Board { get; set; } = Array.Empty<int[]>();
    public int CurrentPlayer { get; set; }
    public int? Winner { get; set; }
    public int? YourPlayerNumber { get; set; }
}
