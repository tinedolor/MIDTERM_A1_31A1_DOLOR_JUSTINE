using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SlotMachine.API.Data;
using SlotMachine.API.Models;

namespace SlotMachine.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GamesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{studentNumber}/game-history/summary")]
        public async Task<ActionResult<GameHistorySummary>> GetGameHistory(string studentNumber)
        {
            var player = await _context.Players
                .Include(p => p.GameResults)
                .FirstOrDefaultAsync(p => p.StudentNumber == studentNumber);

            if (player == null) return NotFound();

            var summary = new GameHistorySummary
            {
                TotalGames = player.GameResults.Count,
                Wins = player.GameResults.Count(g => g.IsWin),
                Losses = player.GameResults.Count(g => !g.IsWin),
                RecentGames = player.GameResults
                    .OrderByDescending(g => g.PlayedAt)
                    .Take(10)
                    .Select(g => new GameHistoryEntry
                    {
                        PlayedAt = g.PlayedAt,
                        Result = g.IsWin ? "Win" : "Loss",
                        RetriesUsed = g.RetriesUsed
                    })
                    .ToList()
            };

            summary.WinPercentage = summary.TotalGames > 0 ?
                Math.Round((double)summary.Wins / summary.TotalGames * 100, 2) : 0;

            return summary;
        }
    }

    public class GameHistorySummary
    {
        public int TotalGames { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public double WinPercentage { get; set; }
        public List<GameHistoryEntry> RecentGames { get; set; }
    }

    public class GameHistoryEntry
    {
        public DateTime PlayedAt { get; set; }
        public string Result { get; set; }
        public int RetriesUsed { get; set; }
    }
}