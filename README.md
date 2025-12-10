# Shaderwrap

Simple Python automation tool and local webapp to automatically generate shaders in HLSL code based on natural language descriptions.

Backend is built with FASTAPI and the frontend is static with just good 'ol HTML, CSS, and vanilla JS.
The Bulma CSS Framework is used in this project as a simple stylesheet. There's a link to it [here](https://bulma.io/)

This project was created to simplify the process of generating shaders for Unity. It is essentially an automation experiment, as well as a very light educational project so that I could learn more about API usage, LLM inference/finetuning/compression,and full-stack web development.  

You may import your own models or download them locally via Ollama (which should be completely free with some usage limits), but the default models used are cloud versions as they are generally a bit faster. There is also an option to used a quantized 5-bit version of Qwen2.5-Coder that I finetuned specifically for writing HLSL shaders in Unity, and this works to varying effect depending on prompt and the nature of the shader you are trying to create. Note that it is around ~10 GB which works fine for me but obviously YMMV on different hardware, although I *believe* Ollama handles offloading automatically.   

**Note that many models have trouble with HLSL code, so the output can generally be pretty hit or miss.**

Link to my finetune:
[here](https://huggingface.co/darrellxcheng/shaderWrap-Qwen2.5CoderGGUF)

## Installation & Use

Install [Ollama](https://ollama.com/) (if you're planning on using local models, like the finetune I provide). You can also use any model on HF with a model manifest via <code>ollama pull [insert model here]</code>, which will add the model locally to your registry. Additionally, you can run models directly through the CLI v ia <code>ollama run [model]</code>. More information can be found in the Ollama [documentation](https://docs.ollama.com/). 

Assuming you already have Python 3 installed, clone the repo to any directory you'd like and run either the start batch/shell script depending on OS. It should walk you through setting a project path in the config, as well as inputting an Ollama API key. If you don't already have one, you can create one [here](https://ollama.com/settings/keys) 

The webui will then start locally via <code>fastapi dev main.py</code>, although try <code>fastapi run</code> to allow listening on all network interfaces. The dev command enables hot reload though, and is automatically set to localhost.

Input shader parameters in the input box, as well as any additional settings you might want for the shader, set a project path in the web form (or in <code>config.yml</code>), then hit 'generate' and everything should work!

After generation, output scripts should be in <code>./output</code> as well as in your Unity project's <code>Assets/Shaderwrap/Outputs</code>(if you set a Unity project path).

###### 2025 Darrell Cheng
