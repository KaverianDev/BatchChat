@echo on
setlocal enabledelayedexpansion
echo finishing update.
echo do not close window.
set sp=%programdata%\cmdchat
if not exist %sp%\updatenew (
  echo there is no update to be finished.
  pause
  exit
)
del /q %sp%\updatenew
set /p dir=<%sp%\cd
del /q %sp%\cd
cd !dir!
pause
del /q chat.bat
ren chatnew.bat chat.bat
pause
echo update finished.
echo starting new script.
timeout /t 3 >nul
cls
"chat.bat"
endlocal
