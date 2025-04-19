namespace SlotMachine.API.Models
{
    public class GameResult
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public Player Player { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
        public string Result { get; set; } // "Win" or "Loss"
        public int RetriesUsed { get; set; }
        public bool IsWin { get; set; } // Should match Result
    }
}