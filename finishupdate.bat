@echo off
setlocal enabledelayedexpansion
echo finishing update. do not close window.
set sp=%programdata%\cmdchat
if not exist %sp%\updatenew (
  echo there is no update to be finished.
  pause
  exit
)
del /q %sp%\updatenew
set /p dir=<%sp%\cd
del /q %sp%\cd
cd %dir%
del /q chat.bat
ren chatnew.bat chat.bat
echo update finished.
echo starting new script.
timeout /t 3 >nul
cls
"chat.bat"
endlocal
