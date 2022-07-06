@echo off
cd ../
set curdir=%cd%
for /f  %%i in ('dir /b /ad "%curdir%/cloudfunctions"') do (
	echo %curdir%\cloudfunctions\%%i\
	copy /Y %curdir%\lib\comm.js %curdir%\cloudfunctions\%%i\
)
pause