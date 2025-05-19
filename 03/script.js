

// 获取DOM元素
const frameworkRadios = document.querySelectorAll('input[name="framework"]');
const verifyResult = document.getElementById('verify-result');
const loadResult = document.getElementById('load-result');

// 存储选择的选项
const selectedFiles = {
    type: "atlas",
};

// 监听芯片类型变化
const chipTypeRadios = document.querySelectorAll('input[name="chipType"]');
chipTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedFiles.type = e.target.value;
        resetDisplay();
    });
});

 // 在文件顶部添加全局变量
 let fetchLogTimer = null;
 
 function clearTimer() {
    // 清除现有的定时器
    if (fetchLogTimer) {
        clearTimeout(fetchLogTimer);
        fetchLogTimer = null;
    }
}

// 重置显示内容
function resetDisplay() {
    clearTimer();
    verifyResult.textContent = '查看日志输出';
    verifyResult.classList.add('empty-content');
    loadResult.textContent = '查看日志输出';
    loadResult.classList.add('empty-content');
}

// 显示错误信息
function showError(message,place) {
    place.textContent = message;
    place.classList.add('empty-content');
}

// 监听框架类型变化
frameworkRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const selectedFramework = e.target.value;
        const defaultShape = frameworkInputShapes[selectedFramework];
        inputShapeSelect.value = defaultShape;
        resetDisplay();
    });
});

window.dependencyVerify = async function() {
    console.log('dependencyVerify');
    clearTimer();
    // 显示正在启动服务的提示
    verifyResult.innerHTML = `
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
    try {
        const config1 = {
            task_type : "init",
            device : selectedFiles.type,
            log : "/home/lenovo/proj/demo/log.txt",
        };

        // 保存配置文件
        const savedPath = await window.parent.electron.saveJson(config1, `init_${selectedFiles.type}.json`);
        console.log('配置文件已保存到:', savedPath);
        const config2 = {
            task_jsons: [
                savedPath
            ]
        };

        // 保存配置文件
        const savePath2 = await window.parent.electron.saveJson(config2, `page3_init_${selectedFiles.type}.json`);
        console.log('配置文件已保存到:', savePath2);

        // 启动服务
        const command0 = 'rm /home/lenovo/proj/demo/log.txt';
        await window.parent.electron.executeCommand(command0);
        // 执行命令行命令
        const command = `python3 /home/lenovo/proj/demo/python_scripts/run_tasks.py --json ${savePath2}`;
        console.log('执行命令:', command);
        
        // 执行命令并等待结果
        const result = await window.parent.electron.executeCommand(command);
        console.log('命令执行结果:', result);
        
        if (result.error) {
            throw new Error(`Python 服务启动失败: ${result.error}`);
        }

        // 设置10分钟内定期获取日志
        const endTime = Date.now() + 10 * 60 * 1000; // 10分钟
        const fetchLog = async () => {
            if (Date.now() > endTime) return;
            
            try {
                const logContent = await window.parent.electron.readFile(config1.log);
                verifyResult.textContent = logContent;
                verifyResult.className = 'result-content';
            } catch (error) {
                console.error('获取日志失败:', error);
            }
            
            fetchLogTimer = setTimeout(fetchLog, 5000);
        };
        
        fetchLog(); // 开始获取日志


    } catch (error) {
        console.error('服务启动错误:', error);
        verifyResult.className = 'result-content';
        verifyResult.textContent = '解析失败:\n' + error.message;
        showError(error.message, verifyResult);
    }
}

window.dependencyLoad = async function() {
    console.log('dependencyLoad');
    clearTimer();
    // 显示正在启动服务的提示
    loadResult.innerHTML = `
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
    try {
        const config1 = {
            task_type : "load",
            device : selectedFiles.type,
            log : "/home/lenovo/proj/demo/log.txt",
        };

        // 保存配置文件
        const savedPath = await window.parent.electron.saveJson(config1, `load_${selectedFiles.type}.json`);
        console.log('配置文件已保存到:', savedPath);
        const config2 = {
            task_jsons: [
                savedPath
            ]
        };

        // 保存配置文件
        const savePath2 = await window.parent.electron.saveJson(config2, `page3_load_${selectedFiles.type}.json`);
        console.log('配置文件已保存到:', savePath2);

        // 启动服务
        const command0 = 'rm /home/lenovo/proj/demo/log.txt';
        await window.parent.electron.executeCommand(command0);
        // 执行命令行命令
        const command = `python3 /home/lenovo/proj/demo/python_scripts/run_tasks.py --json ${savePath2}`;
        console.log('执行命令:', command);
        
        // 执行命令并等待结果
        const result = await window.parent.electron.executeCommand(command);
        console.log('命令执行结果:', result);
        
        if (result.error) {
            throw new Error(`Python 服务启动失败: ${result.error}`);
        }

        // 设置10分钟内定期获取日志
        const endTime = Date.now() + 10 * 60 * 1000; // 10分钟
        const fetchLog = async () => {
            if (Date.now() > endTime) return;
            
            try {
                const logContent = await window.parent.electron.readFile(config1.log);
                loadResult.textContent = logContent;
                loadResult.className = 'result-content';
            } catch (error) {
                console.error('获取日志失败:', error);
            }
            
            fetchLogTimer = setTimeout(fetchLog, 5000); // 存储定时器引用
        };
        
        fetchLog(); // 开始获取日志


    } catch (error) {
        console.error('服务启动错误:', error);
        loadResult.className = 'result-content';
        loadResult.textContent = '解析失败:\n' + error.message;
        showError(error.message, loadResult);
    }
}