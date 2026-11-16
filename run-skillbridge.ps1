# SkillBridge Full Stack Runner Script for Windows PowerShell
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  SkillBridge - Full Stack Platform Launcher" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check PostgreSQL Service
Write-Host "[1/3] Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql-x64* -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Write-Host "      Starting PostgreSQL service ($($pgService.Name))..." -ForegroundColor Yellow
        Start-Service -Name $pgService.Name
    }
    Write-Host "      PostgreSQL service is RUNNING ($($pgService.Name))." -ForegroundColor Green
} else {
    Write-Host "      PostgreSQL service not found automatically. Ensure your PostgreSQL server is listening on port 5432." -ForegroundColor DarkYellow
}

# 2. Launch Backend
Write-Host "[2/3] Launching Express & PostgreSQL Backend API (Port 5000)..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -PassThru
Write-Host "      Backend process launched (PID: $($backendProcess.Id))." -ForegroundColor Green

# 3. Launch Frontend
Write-Host "[3/3] Launching React & Vite Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru
Write-Host "      Frontend process launched (PID: $($frontendProcess.Id))." -ForegroundColor Green

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  SkillBridge is now running!" -ForegroundColor Green
Write-Host "  - Frontend URL:  http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:   http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "  Demo Credentials:" -ForegroundColor Yellow
Write-Host "  - Student:    student@skillbridge.com    / Student@123" -ForegroundColor White
Write-Host "  - Instructor: instructor@skillbridge.com / Instructor@123" -ForegroundColor White
Write-Host "  - Admin:      admin@skillbridge.com      / Admin@123" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
