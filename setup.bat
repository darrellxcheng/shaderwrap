@echo off
setlocal enabledelayedexpansion

echo Starting setup...

echo Installing dependencies...
pip install -r requirements.txt
echo Dependencies installed!

if exist .env (
    echo .env file already exists, skipping setup...
) else (
    echo Setting up environment variables...
    set /p "OLLAMA_API_KEY=Enter Ollama API key or press Enter to skip: "
    (
        echo OLLAMA_API_KEY=!OLLAMA_API_KEY!
    ) > .env
    echo .env created!
)

if not exist config.yml (
    echo unity_project_path: ""> config.yml
)

echo Starting FastAPI server...
python -m fastapi dev main.py

endlocal