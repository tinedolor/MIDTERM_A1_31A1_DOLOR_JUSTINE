using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SlotMachine.API.Data;
using SlotMachine.API.Models;
using SlotMachine.API.Models.DTO;

namespace SlotMachine.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlayersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlayerDto>> GetPlayer(int id)
        {
            var player = await _context.Players
                .Include(p => p.GameResults)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null) return NotFound();

            return new PlayerDto
            {
                Id = player.Id,
                StudentNumber = player.StudentNumber,
                FirstName = player.FirstName,
                LastName = player.LastName,
                RegistrationDate = player.RegistrationDate,
                GameCount = player.GameResults.Count
            };
        }

        [HttpGet("{studentNumber}/game-history/summary")]
        public async Task<ActionResult<GameHistorySummary>> GetGameHistorySummary(string studentNumber)
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

        [HttpGet("{studentNumber}/spin-availability")]
        public async Task<ActionResult<SpinAvailabilityResponse>> GetSpinAvailability(string studentNumber)
        {
            var player = await _context.Players
                .FirstOrDefaultAsync(p => p.StudentNumber == studentNumber);

            if (player == null) return NotFound();

            // Reset retries if cooldown period has passed
            if (player.Retries == 0 && player.LastTryResetTime.HasValue)
            {
                var timeSinceLastReset = DateTime.UtcNow - player.LastTryResetTime.Value;
                if (timeSinceLastReset.TotalHours >= 3)
                {
                    player.Retries = 3;
                    player.LastTryResetTime = null;
                    await _context.SaveChangesAsync();
                }
            }

            return new SpinAvailabilityResponse
            {
                CanSpin = player.Retries > 0,
                RetriesRemaining = player.Retries,
                CooldownEndTime = player.Retries == 0 ?
                    player.LastTryResetTime?.AddHours(3) : null
            };
        }

        [HttpPost]
        public async Task<ActionResult<PlayerDto>> CreatePlayer([FromBody] CreatePlayerDto newPlayerDto)
        {
            if (!IsValidStudentNumber(newPlayerDto.StudentNumber))
                return BadRequest("Invalid student number format");

            if (await _context.Players.AnyAsync(p => p.StudentNumber == newPlayerDto.StudentNumber))
                return Conflict("Student number already registered");

            var player = new Player
            {
                StudentNumber = newPlayerDto.StudentNumber,
                FirstName = newPlayerDto.FirstName.Trim(),
                LastName = newPlayerDto.LastName.Trim()
            };

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, new PlayerDto
            {
                Id = player.Id,
                StudentNumber = player.StudentNumber,
                FirstName = player.FirstName,
                LastName = player.LastName,
                RegistrationDate = player.RegistrationDate,
                GameCount = 0
            });
        }
        [HttpPost("record-game")]
        public async Task<ActionResult<RecordGameResponse>> RecordGameResult([FromBody] RecordGameRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                    return BadRequest("Request body is required");

                if (string.IsNullOrWhiteSpace(request.StudentNumber))
                    return BadRequest("Student number is required");

                // Find player - use ToLower() for case-insensitive comparison
                var player = await _context.Players
                    .FirstOrDefaultAsync(p => p.StudentNumber.ToLower() == request.StudentNumber.ToLower());

                if (player == null)
                    return NotFound($"Player with student number {request.StudentNumber} not found");

                if (player.Retries <= 0)
                    return BadRequest("No retries left");

                // Create game result
                var gameResult = new GameResult
                {
                    PlayerId = player.Id,
                    IsWin = request.IsWin,
                    RetriesUsed = request.RetriesUsed,
                    PlayedAt = DateTime.UtcNow,
                    Result = request.IsWin ? "Win" : "Loss"
                };

                // Update player retries
                player.Retries--;
                if (player.Retries == 0)
                {
                    player.LastTryResetTime = DateTime.UtcNow;
                }

                // Save changes
                _context.GameResults.Add(gameResult);
                await _context.SaveChangesAsync();

                return Ok(new RecordGameResponse
                {
                    Success = true,
                    RetriesRemaining = player.Retries,
                    CanSpinAgain = player.Retries > 0,
                    CooldownEndTime = player.Retries == 0 ?
                        DateTime.UtcNow.AddHours(3) : null
                });
            }
            catch (Exception ex)
            {
                // Log the full error
                Console.WriteLine($"Error recording game: {ex}");
                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("validate")]
        public async Task<ActionResult<ValidationResponse>> ValidatePlayer([FromQuery] string studentNumber)
        {
            if (!IsValidStudentNumber(studentNumber))
                return BadRequest("Invalid student number format");

            var exists = await _context.Players.AnyAsync(p => p.StudentNumber == studentNumber);
            return new ValidationResponse { IsValid = exists };
        }

        private bool IsValidStudentNumber(string studentNumber)
        {
            return !string.IsNullOrWhiteSpace(studentNumber) &&
                   studentNumber.Length > 1 &&
                   studentNumber[0] == 'C' &&
                   studentNumber.Substring(1).All(char.IsDigit);
        }
    }

    public class SpinAvailabilityResponse
    {
        public bool CanSpin { get; set; }
        public int RetriesRemaining { get; set; }
        public DateTime? CooldownEndTime { get; set; }
    }

    public class RecordGameRequest
    {
        public string StudentNumber { get; set; }
        public bool IsWin { get; set; }
        public int RetriesUsed { get; set; }
    }

    public class RecordGameResponse
    {
        public bool Success { get; set; }
        public int RetriesRemaining { get; set; }
        public bool CanSpinAgain { get; set; }
        public DateTime? CooldownEndTime { get; set; }
    }
}