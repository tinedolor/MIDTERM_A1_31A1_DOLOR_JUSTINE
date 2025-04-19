using System.Collections.Generic;

namespace SlotMachine.API.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string StudentNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
        public ICollection<GameResult> GameResults { get; set; } = new List<GameResult>();
        public int Retries { get; set; } = 3;
        public DateTime? LastTryResetTime { get; set; }
    }
}