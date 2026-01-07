@echo off
REM Push to GitHub Repository
cd /d D:\Leofansy\E-Commerce

echo.
echo ===================================
echo  Pushing to GitHub Repository
echo ===================================
echo.

REM Set GitHub remote
echo Setting GitHub repository...
git remote set-url origin https://github.com/Daud2712/E-Commerce.git

REM Verify remote
echo.
echo Current remotes:
git remote -v

REM Push to main
echo.
echo Pushing to main branch...
git push -u origin main

echo.
echo ===================================
echo  Push Complete!
echo ===================================
echo.
pause
