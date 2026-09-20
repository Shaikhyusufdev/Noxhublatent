@echo off
REM Drag & drop one or MORE video files onto this .bat.
REM For each file it makes 720p, 480p and 360p copies next to the original,
REM all with "faststart" so they start and seek quickly.
REM Needs ffmpeg in PATH  (install once:  winget install Gyan.FFmpeg)

if "%~1"=="" (
  echo Drag your video file^(s^) onto this .bat file.
  pause
  exit /b
)

:next
if "%~1"=="" goto finished
set "IN=%~1"
set "BASE=%~dpn1"

echo.
echo ===== %~nx1 : 480p =====
ffmpeg -y -i "%IN%" -vf scale=-2:480 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 800k -maxrate 1000k -bufsize 2000k -c:a aac -b:a 96k -movflags +faststart "%BASE%_480.mp4"

echo.
echo ===== %~nx1 : 360p =====
ffmpeg -y -i "%IN%" -vf scale=-2:360 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 450k -maxrate 600k -bufsize 1200k -c:a aac -b:a 64k -movflags +faststart "%BASE%_360.mp4"

echo.
echo ===== %~nx1 : 720p =====
ffmpeg -y -i "%IN%" -vf scale=-2:720 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 1800k -maxrate 2200k -bufsize 4400k -c:a aac -b:a 128k -movflags +faststart "%BASE%_720.mp4"

shift
goto next

:finished
echo.
echo Done. Upload the _480 / _360 / _720 files to the bucket, then add their keys in Admin ^> Qualities.
pause