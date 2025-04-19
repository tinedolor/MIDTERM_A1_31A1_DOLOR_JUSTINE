using SlotMachine.API.Models.DTO;
namespace SlotMachine.API.Models.DTO
{

    public class PlayerSummaryDto

    {
        public int Id { get; set; }
        public string StudentNumber { get; set; }
        public string FullName { get; set; }
        public DateTime LastPlayed { get; set; }
        public int TotalGames { get; set; }

    }
}