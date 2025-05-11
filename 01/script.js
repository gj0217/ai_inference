// 获取DOM元素
const frameworkRadios = document.querySelectorAll('input[name="framework"]');
const logOutput = document.getElementById('logOutput');
const modelDisplay = document.getElementById('modelDisplay');
const modelPathInput = document.getElementById('modelPath');
const exportPathInput = document.getElementById('exportPath');

// 存储选择的选项
const selectedFiles = {
    model: "",
    output: "",
    framework: "pytorch",
    opset_version: 14,
    export_param: true,
    input_shape: [1,3,224,224],
};

// 框架类型与输入形状的对应关系
const frameworkInputShapes = {
    'pytorch': '[1,3,224,224]',
    'tensorflow': '[1,224,224,3]',
    'mindspore': '[1,3,224,224]',
    'paddle': '[1,3,224,224]'
};

// 框架类型与算子版本的对应关系
const frameworkOperatorVersions = {
    'pytorch': { min: 7, max: 14 },
    'tensorflow': { min: 7, max: 14 },
    'mindspore': { min: 11, max: 14 },
    'paddle': { min: 7, max: 14 }
};

// 编码映射关系
const frameworkCodeMap = {
    'pytorch': '0',
    'tensorflow': '1',
    'mindspore': '2',
    'paddle': '3'
};

const operatorVersionCodeMap = {
    '11': '0',
    '12': '1',
    '13': '2',
    '14': '3'
};

const exportParamCodeMap = {
    'true': '0',
    'false': '1'
};

const inputShapeCodeMap = {
    '[1,3,224,224]': '0',
    '[1,224,224,3]': '1'
};

// 重置显示内容
function resetDisplay() {
    modelDisplay.innerHTML = '';
    modelDisplay.textContent = '点击"模型解析"按钮查看模型结构图';
    logOutput.classList.add('empty-content');
    logOutput.textContent = '点击"模型解析"按钮查看日志输出';
}

// 显示错误信息
function showError(message) {
    modelDisplay.innerHTML = `<div class="empty-content">${message}</div>`;
    logOutput.textContent = message;
    logOutput.classList.add('empty-content');
}

// 更新算子版本选项
function updateOperatorVersions(framework) {
    const operatorVersionSelect = document.getElementById('operatorVersion');
    const versions = frameworkOperatorVersions[framework];
    
    // 清空现有选项
    operatorVersionSelect.innerHTML = '';
    
    // 添加新的选项
    for (let i = versions.max; i >= versions.min; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === 14) {
            option.selected = true;
        }
        operatorVersionSelect.appendChild(option);
    }
}

// 监听算子版本变化
const operatorVersionSelect = document.getElementById('operatorVersion');
operatorVersionSelect.addEventListener('change', (e) => {
    if (selectedFiles) {
        selectedFiles.opset_version = e.target.value;
    }
});

// 监听框架类型变化
frameworkRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const selectedFramework = e.target.value;
        const defaultShape = frameworkInputShapes[selectedFramework];
        inputShapeSelect.value = defaultShape;
        updateOperatorVersions(selectedFramework);
        resetDisplay();
        
        // 更新selectedFile的framework属性
        if (selectedFiles) {
            selectedFiles.framework = selectedFramework;
        }
    });
});

// 初始化算子版本选项
document.addEventListener('DOMContentLoaded', () => {
    const defaultFramework = document.querySelector('input[name="framework"]:checked').value;
    updateOperatorVersions(defaultFramework);
});

// 生成文件名
function generateFileName() {
    const framework = document.querySelector('input[name="framework"]:checked').value;
    const operatorVersion = document.getElementById('operatorVersion').value;
    const exportParam = document.getElementById('exportParam').value;
    const inputShape = document.getElementById('inputShape').value;

    const frameworkCode = frameworkCodeMap[framework];
    const operatorVersionCode = operatorVersionCodeMap[operatorVersion];
    const exportParamCode = exportParamCodeMap[exportParam];
    const inputShapeCode = inputShapeCodeMap[inputShape];

    return `${frameworkCode}_0_${operatorVersionCode}_${exportParamCode}_${inputShapeCode}`;
}

// 添加框架类型change事件监听
document.querySelectorAll('input[name="framework"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const inputShape = document.getElementById('inputShape');
        switch(e.target.value) {
            case 'pytorch':
                inputShape.value = '[1,3,224,224]';
                break;
            case 'tensorflow':
                inputShape.value = '[1,224,224,3]';
                break;
            case 'mindspore':
                inputShape.value = '[1,3,224,224]';
                break;
            case 'paddle':
                inputShape.value = '[1,3,224,224]';
                break;
        }
        // 更新selectedFiles中的input_shape
        selectedFiles.input_shape = JSON.parse(inputShape.value);
    });
});

// 修改文件选择函数
window.selectFile = async function() {
    const framework = document.querySelector('input[name="framework"]:checked').value;
    console.log('selectFile',framework);
    const paths = await window.parent.electron.selectFile1({ framework });
    
    const pathInput = document.getElementById('modelPath');
    if (paths && paths.length > 0) {
        const filePath = paths[0];
        pathInput.value = filePath;
        selectedFiles.model = filePath;
    }
};

// 选择文件夹
window.selectFolder = async function() {
    try {
        console.log('selectFolder',window);
        const paths = await window.parent.electron.selectFolder();
        if (paths && paths.length > 0) {
            const folderPath = paths[0];
            document.getElementById('exportPath').value = folderPath;
            selectedFiles.output = folderPath;
        }
    } catch (error) {
        console.error('选择文件夹失败:', error);
    }
};

window.parseModelFunction = async function() {
    resetDisplay();
    console.log('parseModelFunction');
    try {
        const randomId = getRandomId();
        const config = {
            id: "1",
            framework: selectedFiles.framework,
            model_path: selectedFiles.model,
            export_path: selectedFiles.output,
            parse_cfg: {
                opset_version: selectedFiles.opset_version,
                export_param: selectedFiles.export_param,
                input_shape: selectedFiles.input_shape,
            }
        };

        // 保存配置文件
        const savedPath = await window.parent.electron.saveJson(config, `${randomId}.json`);
        console.log('配置文件已保存到:', savedPath);

        // 显示正在启动服务的提示
        modelDisplay.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3>正在启动服务...</h3>
                <p>请稍候，这可能需要几秒钟时间</p>
                <div style="margin-top: 20px; display: flex; justify-content: center;">
                    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;

        // 执行命令行命令
        const command = `python /home/lenovo/桌面/proj/backend/main.py -c ./configs/${randomId}.json -i ${randomId} -p 3031`;
        console.log('执行命令:', command);
        
        // 执行命令并等待结果
        const result = await window.parent.electron.executeCommand(command);
        console.log('命令执行结果:', result);
        
        if (result.error) {
            throw new Error(`Python 服务启动失败: ${result.error}`);
        }
        // 等待5s
        await new Promise(resolve => setTimeout(resolve, 5000));
        // 等待并检查服务是否可用
        const isServiceAvailable = await checkServiceAvailability('http://localhost:3031');
        if (!isServiceAvailable) {
            throw new Error('服务启动失败，请检查 Python 服务是否正常运行');
        }
        // 更新模型显示区域为iframe
        modelDisplay.innerHTML = `
            <div style="position: relative;">
                <iframe 
                    src="http://localhost:3031" 
                    style="width: 100%; height: 600px; border: none;"
                    title="Model Visualization"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                ></iframe>
                <button 
                    style="position: absolute; top: 10px; right: 10px; padding: 5px 5px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    onclick="window.open('http://localhost:3031', '_blank', 'width=1200,height=800')"
                >全屏查看</button>
            </div>
        `;
        
        // 设置10分钟内定期获取日志
        const endTime = Date.now() + 10 * 60 * 1000; // 10分钟
        const fetchLog = async () => {
            if (Date.now() > endTime) return;
            
            const logPath = window.parent.electron.joinPath('logs', `${randomId}.log`);
            try {
                const logContent = await window.parent.electron.readFile(logPath);
                logOutput.textContent = logContent;
                logOutput.className = 'result-content';
            } catch (error) {
                console.error('获取日志失败:', error);
            }
            
            setTimeout(fetchLog, 5000); // 每5秒获取一次
        };
        
        fetchLog(); // 开始获取日志
        
    } catch (error) {
        console.error('服务启动错误:', error);
        logOutput.className = 'result-content';
        logOutput.textContent = '解析失败:\n' + error.message;
        showError(error.message, modelDisplay);
    }
}

// 监听算子版本变化
const exportParamSelect = document.getElementById('exportParam');
exportParamSelect.addEventListener('change', (e) => {
    if (selectedFiles) {
        selectedFiles.export_param = e.target.value;
    }
});

const inputShapeSelect = document.getElementById('inputShape');
inputShapeSelect.addEventListener('change', (e) => {
    if (selectedFiles) {
        selectedFiles.input_shape = e.target.value;
    }
});

// 生成随机ID
function getRandomId() {
    return Math.random().toString(36).substring(2, 12);
}

// 检查服务是否可用的函数
async function checkServiceAvailability(url, maxAttempts = 10, interval = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.log(`尝试 ${i + 1}/${maxAttempts} 连接服务...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    return false;
}
