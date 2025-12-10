async function loadModels() {
    try {
        const response = await fetch('/models');
        const data = await response.json();
        const modelDropdown = document.getElementById('modelDropdown');
        
        modelDropdown.innerHTML = '<option value=""> Select Model </option>';
        
        if (data.models.cloud) {
            const cloudGroup = document.createElement('optgroup');
            cloudGroup.label = 'Cloud Models';
            for (const [name, modelId] of Object.entries(data.models.cloud)) {
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = `${name} (${modelId})`;
                cloudGroup.appendChild(option);
            }
            modelDropdown.appendChild(cloudGroup);
        }
        
        if (data.models.local) {
            const localGroup = document.createElement('optgroup');
            localGroup.label = 'Local Models';
            for (const [name, modelId] of Object.entries(data.models.local)) {
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = `${name} (${modelId})`;
                localGroup.appendChild(option);
            }
            modelDropdown.appendChild(localGroup);
        }
    } catch (error) {
        console.error('Error loading models:', error);
        alert('Failed to load models. Please refresh the page.');
    }
}

async function changeModel(modelId) {
    if (!modelId) return;
    
    try {
        const response = await fetch('/set_model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: modelId })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('Model changed successfully:', result.message);
        } else {
            throw new Error(result.detail || 'Failed to change model');
        }
    } catch (error) {
        console.error('Error changing model:', error);
        alert('Failed to change model: ' + error.message);
    }
}

async function loadShaderOptions() {
    try {
        const response = await fetch('/shader_options');
        const data = await response.json();
        const container = document.getElementById('shaderOptionsContainer');
        
        container.innerHTML = '';
        
        for (const [category, options] of Object.entries(data.options)) {
            const column = document.createElement('div');
            column.className = 'column is-one-quarter';
            
            const categoryLabel = category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            const fieldHTML = `
                <div class="field">
                    <label class="label">${categoryLabel}</label>
                    <div class="control">
                        ${Object.entries(options).map(([key, value]) => `
                            <label class="radio" style="display: block; margin-bottom: 0.5rem;">
                                <input type="radio" name="${category}" value="${key}">
                                ${key.charAt(0).toUpperCase() + key.slice(1)}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
            column.innerHTML = fieldHTML;
            container.appendChild(column);
        }
    } catch (error) {
        console.error('Error loading shader options:', error);
        alert('Failed to load shader options. Please refresh the page.');
    }
}

async function generateShader(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const outputTextarea = document.querySelector('textarea[name="codeblock"]');
    const progressDiv = document.getElementById('generationProgress');
    const progressText = document.getElementById('progressText');
    
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    progressDiv.style.display = 'block';
    progressText.textContent = 'Generating shader...';
    outputTextarea.value = '';
    
    const description = document.getElementById('description').value;
    const surfaceType = document.querySelector('input[name="surface_type"]:checked')?.value || '';
    const lightingType = document.querySelector('input[name="lighting_type"]:checked')?.value || '';
    const complexityLevel = document.querySelector('input[name="complexity_level"]:checked')?.value || '';
    const shaderType = document.querySelector('input[name="shader_type"]:checked')?.value || '';
    
    try {
        const response = await fetch('/generate_shader', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: description,
                surface_type: surfaceType,
                lighting_type: lightingType,
                complexity: complexityLevel,
                shader_type: shaderType
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            progressText.textContent = 'Shader generated successfully!';
            outputTextarea.value = result.shader_code || 'Shader generated! Check ' + result.filename;
            console.log('Shader generated:', result.filename);
            
            setTimeout(() => {
                progressDiv.style.display = 'none';
            }, 2000);
        } else {
            throw new Error(result.detail || 'Failed to generate shader');
        }
    } catch (error) {
        console.error('Error generating shader:', error);
        progressText.textContent = 'Error: ' + error.message;
        outputTextarea.value = 'Error: ' + error.message;
        alert('Failed to generate shader: ' + error.message);
        
        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 3000);
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
    }
}

async function setFilePath() {
    const filePathInput = document.getElementById('unityPath');
    const filePathArea = filePathInput.value.trim();
    
    if (!filePathArea) {
        alert('Please enter a Unity project path');
        return;
    }
    
    const normalizedPath = filePathArea.replace(/\\/g, '/');

    try {
        const response = await fetch('/set_filepath', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unity_path: normalizedPath })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Unity path set successfully: ' + result.unity_path);
            console.log('Unity path updated:', result.message);
        } else {
            throw new Error(result.detail || 'Failed to set path');
        }
    } 
    catch (error){
        console.error('Error setting file path:', error);
        alert('Failed to set file path: ' + error.message);
    }
}

function toggleAdvancedOptions() {
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedPanel = document.getElementById('advancedPanel');
    
    advancedToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            advancedPanel.style.display = 'block';
        } else {
            advancedPanel.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadModels();
    loadShaderOptions();

    const filePathButton = document.getElementById('setFilePathBtn');
    if (filePathButton) {
        console.log('file path button found');
        filePathButton.addEventListener('click', setFilePath);
    } else {
        console.warn('setFilePathBtn not found - path setting disabled');
    }

    const modelDropdown = document.getElementById('modelDropdown');
    if (modelDropdown) {
        console.log('modelDropdown found');
        modelDropdown.addEventListener('change', (event) => {
            changeModel(event.target.value);
        });
    }

    const form = document.querySelector('form');
    if (form) {
        console.log('shader parameter form found');
        form.addEventListener('submit', generateShader);
    }

    toggleAdvancedOptions();
});

