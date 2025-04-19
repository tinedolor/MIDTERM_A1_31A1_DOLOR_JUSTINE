namespace SlotMachine.API.Models.DTO
{
    public class PlayLimitResponse
    {
        public bool CanPlay { get; set; }
        public int GamesPlayed { get; set; }
        public DateTime ResetTimeUtc { get; set; }
    }
}