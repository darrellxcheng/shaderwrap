import datetime
import os

def generatePrompt(description: str, surface_type: str, lighting_type: str, complexity: str, shader_type: str) -> str:
    try:
        with open("./shaderprompt.txt", "r", encoding="utf-8") as file:
            prompt = file.read().format(
                description=description, 
                surface_type=surface_type, 
                lighting_type=lighting_type, 
                complexity=complexity, 
                shader_type=shader_type)
        return prompt
    except Exception as e:
        print(f"Error generating prompt: {e}")
        return ""

def saveShader(_code:str, unity_path: str ) -> str:
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    if not unity_path or unity_path == "":
        print("Unity path not provided, only saving to default output folder.")
    try:
        os.makedirs ("output", exist_ok=True)
        
        filename = f"output/output_{timestamp}.shader"
        with open(filename, "w", encoding="utf-8") as file:
            file.write(_code)

        if unity_path:
            unity_path = os.path.join(unity_path, f"Assets/Shaderwrap/Outputs/output_{timestamp}.shader")
            os.makedirs(os.path.dirname(unity_path), exist_ok=True)
            with open(unity_path, "w", encoding="utf-8") as file:
                file.write(_code)
            print(f"Shader saved to Unity project: {unity_path}")

        return filename
    except Exception as e:
        print(f"Error saving shader: {e}")
        return ""