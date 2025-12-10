#!/bin/bash

echo "Starting setup..."

echo "Installing dependencies..."
pip install -r requirements.txt
echo "Dependencies installed!"

if [ -f .env ]; then
    echo ".env file already exists, skipping setup..."
else
    echo "Setting up environment variables..."
    read -p "Enter Ollama API key or press Enter to skip: " OLLAMA_API_KEY
    echo "OLLAMA_API_KEY=$OLLAMA_API_KEY" > .env
    echo ".env created!"
fi

if [ ! -f config.yml ]; then
    echo 'unity_project_path: ""' > config.yml
fi

echo "Starting FastAPI server..."
python -m fastapi dev main.py
