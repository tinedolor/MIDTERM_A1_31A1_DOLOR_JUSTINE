using Microsoft.EntityFrameworkCore;
using SlotMachine.API.Models;

namespace SlotMachine.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Player> Players { get; set; }
        public DbSet<GameResult> GameResults { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Player>()
                .HasMany(p => p.GameResults)
                .WithOne(g => g.Player)
                .HasForeignKey(g => g.PlayerId);
        }
    }
}