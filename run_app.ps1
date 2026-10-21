# MailMind AI - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "               Starting MailMind AI" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/2] Starting Backend (FastAPI) on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python run.py"

Write-Host "[2/2] Starting Frontend (Vite) on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; cmd /c npm run dev"

Write-Host ""
Write-Host "Services are now running!" -ForegroundColor Green
Write-Host "  * Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "  * Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  * API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
