import os
import json
import ollama
import shaderoperations
import apiclasses
import yaml
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse 
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

try:
    with open("config.yml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
        UNITY_PATH = config.get("unity_project_path", None)
except Exception as e:
    UNITY_PATH = None

app = FastAPI(
            version="1.0", 
            title="ShaderWrap - Unity Shader Generator", 
            description="Generates Unity shaders based on natural language descriptions given by the user."
        )

app.mount("/static", StaticFiles(directory="static"), name="static") 
        
API_KEY = os.environ.get("OLLAMA_API_KEY")
MODEL_LIST = json.loads(open("mpresets.json").read())
currentModel = MODEL_LIST.get("Default")
SYS_PROMPT = open("systemprompt.xml", "r", encoding="utf-8").read()

if currentModel in MODEL_LIST.get("local").values():
    client = ollama.AsyncClient(host='http://localhost:11434/')
else:
    client = ollama.AsyncClient(
        host='https://ollama.com/',
        headers={'Authorization': 'Bearer ' + API_KEY}
    )
    
@app.get("/")
def read_root():
    try:
        return HTMLResponse(open("static/index.html", "r").read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load index.html: {str(e)}")

@app.get("/models")
async def getModels():
    try:
        return {
            "models" : MODEL_LIST,
            "current_model": currentModel,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch models: {str(e)}")

@app.get("/shader_options")
async def getShaderOptions():
    try:
        with open("shaderoptions.json", "r") as f:
            options = json.load(f)
        return {"options": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch shader options: {str(e)}")
    
@app.post("/set_filepath")
async def setFilepath(request: apiclasses.FilepathRequest):
    global UNITY_PATH
    try:
        config['unity_project_path'] = request.unity_path
        with open("config.yml", "w", encoding="utf-8") as f:
            yaml.dump(config, f)
        UNITY_PATH = request.unity_path
        return {
            "success": True,
            "unity_path": UNITY_PATH,
            "message": f"Unity project path set to {UNITY_PATH}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not set filepath: {str(e)}")

@app.post("/set_model")
async def setModel(request: apiclasses.ModelRequest):
    global currentModel, client
    try:
        all_models = []
        all_models.extend(MODEL_LIST["cloud"].values())
        all_models.extend(MODEL_LIST["local"].values())
        
        if request.model not in all_models:
            raise HTTPException(status_code=400, detail="Invalid model selection")
        

        currentModel = request.model
        
        if currentModel in MODEL_LIST.get("local", {}).values():
            client = ollama.AsyncClient(host='http://localhost:11434/')
        else:
            client = ollama.AsyncClient(
                host='https://ollama.com/',
                headers={'Authorization': 'Bearer ' + API_KEY}
            )
        
        return {
            "success": True,
            "model": currentModel,
            "message": f"Model changed to {currentModel}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not set model: {str(e)}")
    
@app.post("/generate_shader")
async def generate_shader(request: apiclasses.ShaderRequest):
    try:
        _prompt = shaderoperations.generatePrompt(
            request.description,
            request.surface_type, 
            request.lighting_type, 
            request.complexity, 
            request.shader_type
        )

        response = await client.generate(
            model=currentModel,
            system=SYS_PROMPT,
            prompt = _prompt, 
            think=False,
            stream=False,
        )

        shadercode = response["response"]
        
        filename = shaderoperations.saveShader(shadercode, UNITY_PATH)

        print(_prompt)

        return {
            "filename" : filename,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong!: {str(e)}")

