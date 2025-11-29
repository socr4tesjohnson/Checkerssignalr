using CheckersApi.Hubs;
using CheckersApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameService>();

// Configure CORS for the frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "https://localhost:3000",
                    "https://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            // In production, allow same-origin and any configured origins
            policy.SetIsOriginAllowed(_ => true)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

// Serve static files from wwwroot for PWA
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<CheckersHub>("/checkershub");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

app.Run();
