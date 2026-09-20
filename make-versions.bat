@echo off
REM Drag & drop your video file onto this .bat. It makes 720p, 480p and 360p copies
REM next to the original (same folder), all with "faststart" so they start and seek fast.
REM Needs ffmpeg installed (winget install Gyan.FFmpeg) and available in PATH.

if "%~1"=="" (
  echo Drag your video file onto this .bat file.
  pause
  exit /b
)

set "IN=%~1"
set "BASE=%~dpn1"

echo.
echo === 720p ===
ffmpeg -y -i "%IN%" -vf scale=-2:720 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 1800k -maxrate 2200k -bufsize 4400k -c:a aac -b:a 128k -movflags +faststart "%BASE%_720.mp4"

echo.
echo === 480p ===
ffmpeg -y -i "%IN%" -vf scale=-2:480 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 800k -maxrate 1000k -bufsize 2000k -c:a aac -b:a 96k -movflags +faststart "%BASE%_480.mp4"

echo.
echo === 360p ===
ffmpeg -y -i "%IN%" -vf scale=-2:360 -c:v libx264 -profile:v main -pix_fmt yuv420p -preset medium -b:v 450k -maxrate 600k -bufsize 1200k -c:a aac -b:a 64k -movflags +faststart "%BASE%_360.mp4"

echo.
echo Done. Upload the _720 / _480 / _360 files to the bucket, then add their keys in Admin.
pause
