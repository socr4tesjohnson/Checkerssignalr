using Microsoft.AspNetCore.SignalR;
using CheckersApi.Models;
using CheckersApi.Services;

namespace CheckersApi.Hubs;

public class CheckersHub : Hub
{
    private readonly GameService _gameService;
    private readonly ILogger<CheckersHub> _logger;

    public CheckersHub(GameService gameService, ILogger<CheckersHub> logger)
    {
        _gameService = gameService;
        _logger = logger;
    }

    public async Task CreateGame(string playerName)
    {
        var game = _gameService.CreateGame(Context.ConnectionId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
        
        var dto = GameService.ToDto(game, Context.ConnectionId);
        await Clients.Caller.SendAsync("GameCreated", dto);
        
        _logger.LogInformation("Game created: {GameCode} by {PlayerName}", game.GameCode, playerName);
    }

    public async Task JoinGame(string gameCode, string playerName)
    {
        var game = _gameService.JoinGame(gameCode, Context.ConnectionId, playerName);
        
        if (game == null)
        {
            await Clients.Caller.SendAsync("JoinFailed", "Unable to join game. Invalid code or game already started.");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
        
        // Notify both players
        var player1Dto = GameService.ToDto(game, game.Player1ConnectionId);
        var player2Dto = GameService.ToDto(game, game.Player2ConnectionId);
        
        if (game.Player1ConnectionId != null)
        {
            await Clients.Client(game.Player1ConnectionId).SendAsync("GameStarted", player1Dto);
        }
        await Clients.Caller.SendAsync("GameJoined", player2Dto);
        
        _logger.LogInformation("Player {PlayerName} joined game {GameCode}", playerName, gameCode);
    }

    public async Task MakeMove(string gameId, Move move)
    {
        var (success, error) = _gameService.MakeMove(gameId, Context.ConnectionId, move);
        
        if (!success)
        {
            await Clients.Caller.SendAsync("MoveFailed", error);
            return;
        }

        var game = _gameService.GetGame(gameId);
        if (game == null) return;

        // Send updated game state to both players
        if (game.Player1ConnectionId != null)
        {
            var player1Dto = GameService.ToDto(game, game.Player1ConnectionId);
            await Clients.Client(game.Player1ConnectionId).SendAsync("GameUpdated", player1Dto);
        }
        
        if (game.Player2ConnectionId != null)
        {
            var player2Dto = GameService.ToDto(game, game.Player2ConnectionId);
            await Clients.Client(game.Player2ConnectionId).SendAsync("GameUpdated", player2Dto);
        }

        // Notify if game is over
        if (game.State == GameState.Completed)
        {
            await Clients.Group(gameId).SendAsync("GameOver", game.Winner);
            _logger.LogInformation("Game {GameId} completed. Winner: Player {Winner}", gameId, game.Winner);
        }
    }

    public async Task GetGameState(string gameId)
    {
        var game = _gameService.GetGame(gameId);
        if (game == null)
        {
            await Clients.Caller.SendAsync("GameNotFound");
            return;
        }

        var dto = GameService.ToDto(game, Context.ConnectionId);
        await Clients.Caller.SendAsync("GameState", dto);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _gameService.PlayerDisconnected(Context.ConnectionId);
        
        var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
        if (game != null)
        {
            await Clients.Group(game.GameId).SendAsync("PlayerDisconnected");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
