using SlotMachine.API.Models.DTO;
namespace SlotMachine.API.Models.DTO
{
    public class PlayerDto
    {
        public int Id { get; set; }
        public string StudentNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime RegistrationDate { get; set; }
        public int GameCount { get; set; }
    }
}
