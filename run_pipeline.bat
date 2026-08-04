@echo off
setlocal
cd /d "C:\Stuff\Projects\will-ai-bubble-burst-soon\backend"
if not exist logs mkdir logs
"C:\Stuff\Projects\will-ai-bubble-burst-soon\backend\venv\Scripts\python.exe" main.py >> "logs\pipeline_run.log" 2>&1
endlocal
