@echo off
echo Starting AUREUS FIT AI Local Server...
echo.
echo Please assume that Python is installed. If not, please install Python.
echo.
echo Opening http://localhost:8000/index.html in your default browser...
start http://localhost:8000/index.html
echo.
echo Server is running. Close this window to stop the server.
python -m http.server 8000
pause
