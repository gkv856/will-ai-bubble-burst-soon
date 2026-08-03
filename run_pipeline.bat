@echo off
setlocal
cd /d "C:\Stuff\Projects\will-ai-bubble-burst-soon"
if not exist logs mkdir logs
"C:\Stuff\Projects\will-ai-bubble-burst-soon\venv\Scripts\python.exe" pipeline.py >> "logs\pipeline_run.log" 2>&1
endlocal
