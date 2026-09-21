@echo off
REM Drag & drop one or more videos onto this .bat.
REM It makes "<name>_fast.mp4": SAME quality, no re-encoding (takes about a minute),
REM but the file index is moved to the front so the video starts and seeks instantly.
REM Needs ffmpeg in PATH  (install once:  winget install Gyan.FFmpeg)

if "%~1"=="" (
  echo Drag your video file^(s^) onto this .bat file.
  pause
  exit /b
)

:next
if "%~1"=="" goto finished
echo.
echo ===== %~nx1 =====
ffmpeg -y -i "%~1" -c copy -movflags +faststart "%~dpn1_fast.mp4"
shift
goto next

:finished
echo.
echo Done. Upload the *_fast.mp4 file to the bucket and use its new key in Admin.
pause
