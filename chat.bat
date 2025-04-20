@echo off
setlocal enabledelayedexpansion
:start
cls
echo starting..
color E
echo setting variables..
set ver=2.1
set sp=%programdata%\cmdchat
set "p=pause >nul"
set ga=goto askexit
title command chat v%ver% ^| by chicken
echo checking for dependencies
tasklist /FI "IMAGENAME eq windowsterminal.exe" | find /I "windowsterminal.exe" >nul
if %errorlevel%==0 (
	echo you have to run this in cmd, not the new windows terminal!
	echo if this is a bug, try closing windows terminal windows!
	echo ^(click any key to continue...^)
	%p%
	exit
) else echo this script is being ran with normal cmd, good!
curl >nul 2>&1
if %errorLevel%==2 ( echo you have curl! ) else goto curl
if not exist !sp! md !sp!

:menu
cls
echo 	command chat - v%ver% by chicken
echo.
echo.
echo  ?. help
echo  0. exit
echo  1. connect to custom chat
echo  2. connect to default chat
set /p cc=" choose an option: "
cls
if %cc%==0 ( exit
) else if %cc%==r ( goto start
) else if %cc%==test ( set ip=192.168.1.39:3000
) else if %cc%==chicken ( set ip=chicken.bulletinbay.com:3000
) else if %cc%==? (
	echo faq:
	echo q: why do chats not appear?
	echo a: chats are refreshed every time you send a message,
	echo a: ^(continued^) or you can send a blank message to refresh.
	echo.
	echo click any key to continue..
	%p%
	goto menu
) else if %cc%==1 ( goto customip
) else if %cc%==2 ( goto defaultchat
) else (
   echo invalid option
   echo sending you back to the menu in 3 seconds..
   timeout /t 3 >nul
   goto menu
)
goto connect
:customip
set /p ip="what ip would you like to connect to? "
goto connect
:defaultchat
if exist !sp!\default (
   echo found default chat!
   set /p ip=<!sp!\defaultip
) else (
	echo i didn't find a default!
	set /p ip="what ip would you like to set as the default? "
	echo !ip! >!sp!\defaultip
)
:connect
echo connecting to %ip%..
echo your entering! only way out is ctrl+c
echo entering in 3 seconds..
timeout /t 3 >nul
mode con lines=30 cols=110
:chat
cls
curl -X GET %ip%/chat -o -
if %errorlevel%==28 echo failed fetching messages! ^(timed out^)
echo ______________________________________________________________________________________________________________
set /p chat="send message: "
if "%chat%"=="" ( goto chat
) else (
	curl -X PATCH -H "Content-Type: application/json" -d "{\"message\":\"^<!username!^> !chat!\"}" "http://!ip!/chat"
	if %errorlevel%==28 echo failed sending messages! ^(timed out^)
	goto chat
)
exit
:curl
echo curl is needed for this script.
set /p curl="install it? (y/n) "
if %curl%==y (
	winget install cURL.cURL
	echo curl installed. restarting script.
	%t3%
	goto start
) else exit
endlocal


how ts gonna go down:
make a file that allows put requests
for chatting, use that file for put requests
chats will be stored in a plain text file