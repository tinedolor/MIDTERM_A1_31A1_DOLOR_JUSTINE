# Slot Machine Game

A full-stack slot machine game with Next.js frontend and ASP.NET Core backend.

## Features
- Player authentication
- Admin Web App
- Game history tracking
- Retry system with cooldown

## Setup

### Prerequisites
- Node.js (for frontend)
- .NET 7+ (for backend)
- SQL Server (for database)

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
1. Update connection string in `appsettings.json`
2. Run migrations:
```bash
cd server
dotnet ef database update
```
3. Start the server:
```bash
dotnet run
```
## Database Setup
Use EF Core migrations.
