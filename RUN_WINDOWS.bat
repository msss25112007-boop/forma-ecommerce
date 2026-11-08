@echo off
setlocal
title FORMA Store - Ziad Tareek
cd /d "%~dp0"
echo ==================================================
echo   FORMA Store - Ziad Tareek
echo ==================================================
echo.
if not exist "server.js" goto missing_files
where node >nul 2>nul
if errorlevel 1 goto missing_node
node -e "const v=process.versions.node.split('.').map(Number); if(v[0]<22 || (v[0]===22 && v[1]<16)) process.exit(1); require('node:sqlite')" >nul 2>nul
if errorlevel 1 goto old_node
echo Node.js version:
node -v
echo.
echo Your website: http://localhost:3001
echo Keep this black window open while using your site.
echo Opening the browser automatically...
echo.
start "" /min powershell.exe -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3001'"
node server.js
echo.
echo The server has stopped or could not start.
echo If you see EADDRINUSE, close another copy using port 3001.
pause
exit /b
:missing_files
echo ERROR: server.js is missing from this folder.
echo Extract the ZIP archive FIRST, then open the project folder.
pause
exit /b 1
:missing_node
echo ERROR: Node.js is not installed or not on PATH.
echo Download Node.js LTS from: https://nodejs.org/en/download
echo Install it, then close and reopen this window.
pause
exit /b 1
:old_node
echo ERROR: This project needs Node.js version 22.16 or newer.
echo Check your version with: node -v
echo Download current Node.js LTS from: https://nodejs.org/en/download
echo.
pause
exit /b 1
