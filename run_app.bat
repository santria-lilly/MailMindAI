@echo off
title MailMind AI - Application Launcher
echo ========================================================
echo               Starting MailMind AI
echo ========================================================
echo.

echo [1/2] Launching Python FastAPI Backend on http://localhost:8000...
start "MailMind AI - Backend" cmd /k "cd /d "%~dp0\backend" && python run.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "MailMind AI - Frontend" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo ========================================================
echo  Both services launched!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000
echo  - Interactive Swagger Docs: http://localhost:8000/docs
echo ========================================================
echo.
pause
