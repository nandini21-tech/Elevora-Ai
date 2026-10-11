@echo off
title Elevora AI - Launcher
echo ======================================================
echo 🚀 Launching Elevora AI Developer Platform...
echo ======================================================

set AGY_NODE="%USERPROFILE%\AppData\Roaming\Antigravity\bin\agy-node.cmd"

if exist %AGY_NODE% (
    echo Using Antigravity Node Runtime: %AGY_NODE%
    start "" %AGY_NODE% "%~dp0server.js"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:3000"
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Using System Node.js...
        start "" node "%~dp0server.js"
        timeout /t 2 /nobreak >nul
        start "" "http://localhost:3000"
    ) else (
        echo Node runtime not found. Opening Elevora directly in browser...
        start "" "%~dp0index.html"
    )
)
