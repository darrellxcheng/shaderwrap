from pydantic import BaseModel

class ShaderRequest(BaseModel):
    description: str = ""
    surface_type: str = ""
    lighting_type : str = ""
    complexity : str = ""
    shader_type : str = ""

class ModelRequest(BaseModel):
    model: str

class FilepathRequest(BaseModel):
    unity_path: str   