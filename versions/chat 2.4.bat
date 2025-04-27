@echo off
setlocal enabledelayedexpansion
:start
cls
echo starting..
color E
echo setting variables..
set ver=2.4
set sp=%programdata%\cmdchat
set "p=pause >nul"
set ga=goto askexit
title command chat v%ver% ^| by chicken
echo checking for dependencies
curl >nul 2>&1
if %errorLevel%==2 ( echo you have curl! ) else goto curl
if not exist !sp! md !sp!

if not exist !sp!\name (
	cls
	echo i did not find a name, please enter one!
	echo if you want to use your windows username, just leave the field blank
	set /p name="what will be your username? "
	if "!name!"=="" ( call :winnamesave ) else echo !name!>!sp!\name
	goto start
) else set /p name=<!sp!\name

if not exist !sp!\namecall (
	cls
	echo leave the field blank to not get called something
	set /p namecall="would you like to be called a name on the menu? "
	if "!namecall!"=="" ( echo none>!sp!\namecall ) else echo !namecall!>!sp!\namecall
	goto start
) else set /p namecall=<!sp!\namecall

curl -s https://raw.githubusercontent.com/chicken-projects/cmdchat/refs/heads/main/version > !sp!\update
set /p update=<!sp!\update
del !sp!\update

:menu
mode con lines=12 cols=50
cls
echo   	  command chat - v%ver% by chicken
if "%update%"=="%ver%" ( echo 	          up to date ) else if "%update%"=="" ( echo     	could not check for updates ) else echo        update available; v!update!, u to update.
echo.
if "%namecall%"=="none " ( echo. ) else echo  hello, %namecall%
echo  ?. help
echo  0. exit
echo  1. connect to custom chat
echo  2. preset 1
echo  3. preset 2
set /p cc=" choose an option: "
cls
if %cc%==0 ( exit
) else if %cc%==reset (
	mode con lines=11 cols=50
	del /s /f !sp!\*
	echo reset succsessful
	echo click any key to exit
	%p%
	exit
) else if %cc%==r ( goto start
) else if %cc%==l ( set ip=192.168.1.39:3000
) else if %cc%==test ( set ip=127.0.0.1:3000
) else if %cc%==? (
	mode con lines=20 cols=60
	echo faq:
	echo q: why do chats not appear?
	echo a: chats are refreshed every time you send a message,
	echo a: ^(continued^) or you can type .r to refresh.
	echo.
	echo q: what menu commands are there?
	echo a: r = restart
	echo a: test = connect to local server
	echo a: ? = this menu
	echo a: u = update
	echo a: reset = reset 
	echo.
	echo q: what chat commands are there?
	echo a: .r = refresh chats
	echo a: .e = exit ^(or you can do ctrl+c^)
	echo a: .m = menu
	echo a: .? = see this menu
	echo.
	echo click any key to continue..
	%p%
	goto menu
) else if "%wow%"=="u" (
	if "!update!"=="" echo could not check for updates, so we cannot update. & %ga%
	if "!update!"=="!ver!" echo you do not need to update! & %ga%
	curl -s "https://github.com/chicken-projects/cmdchat/releases/download/v!update!/chat.bat" -o "chat.bat"
	echo updated!
	echo starting script in 3 seconds..
	%t3%
	cls
	"chat !update!.bat"
) else if %cc%==1 ( goto customip
) else if %cc%==2 ( goto preset1
) else if %cc%==3 ( goto preset2
) else (
   echo invalid option
   echo sending you back to the menu in 3 seconds..
   timeout /t 3 >nul
   goto menu
)
goto connect
:customip
mode con lines=25 cols=75
set /p ip="what ip would you like to connect to? "
goto connect
:preset1
mode con lines=25 cols=75
if exist !sp!\preset1 (
   echo found preset 1
   set /p ip=<!sp!\preset1
) else (
	echo i didn't find preset 1.
	set /p ip="what ip would you like to set as preset 1? "
	echo !ip!>!sp!\preset1
)
goto connect
:preset2
mode con lines=25 cols=75
if exist !sp!\preset2 (
   echo found preset 2
   set /p ip=<!sp!\preset2
) else (
	echo i didn't find preset 2.
	set /p ip="what ip would you like to set as preset 2? "
	echo !ip!>!sp!\preset2
)
goto connect
:connect
echo connecting to %ip%..
echo make sure to check chat commands! use .? in chat!
echo entering in 2 seconds..
timeout /t 2 >nul
:chatresize
mode con lines=30 cols=110
:chat
curl -X GET %ip%/chat -o -
if %errorlevel%==28 echo failed fetching messages! ^(timed out^)
echo ______________________________________________________________________________________________________________
if not defined chat echo ^(you can use .? in the chat to see chat commands^!^)
set /p chat="send message: "
if "%chat%"==".e" ( exit
) else if "%chat%"==".r" ( goto chat
) else if "%chat%"==".m" ( goto menu
) else if "%chat%"==".?" ( goto cmds
) else (
	cls
	curl -X PATCH -H "Content-Type: application/json" -d "{\"username\":\"!name!\", \"message\":\"!chat!\"}" "http://!ip!/chat"
	if %errorlevel%==28 echo failed sending messages! ^(timed out^)
	echo.
	echo ______________________________________________________________________________________________________________
	goto chat
)
echo howd you get here? contact me because you should not be getting this message. message me @ch1ck3m on discord
pause
exit
:cmds
echo.
echo.
echo .r = refresh chats
echo .e = exit ^(or you can do ctrl+c^)
echo .m = menu
echo .? = see this menu
echo.
echo click any key to return to chat
%p%
goto chatresize
:winnamesave
echo !username!>!sp!\name
exit /b
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
