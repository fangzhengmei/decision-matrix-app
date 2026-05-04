// 数据模型
let dimensions = [];
let alternatives = [];
let scores = {};
let nextId = 1;

function generateId() {
    return `id_${nextId++}`;
}

// 核心逻辑函数 - 导出以便测试
if (typeof module !== 'undefined') {
    module.exports = {
        addDimension,
        deleteDimension,
        addAlternative,
        deleteAlternative,
        setScore,
        normalizeWeights,
        calculateWeightedScores,
        calculateRankings,
        getNormalizedWeight,
        getDimensions: () => [...dimensions],
        getAlternatives: () => [...alternatives],
        getScores: () => ({...scores}),
        clearAll,
        setDimensions,
        setAlternatives,
        setScores,
        isValidScore,
        validateAllScores
    };
}

// 设置数据（用于测试）
function setDimensions(newDimensions) {
    dimensions = newDimensions;
}

function setAlternatives(newAlternatives) {
    alternatives = newAlternatives;
}

function setScores(newScores) {
    scores = newScores;
}

// 清除所有数据（用于测试）
function clearAll() {
    dimensions = [];
    alternatives = [];
    scores = {};
    nextId = 1;
    if (typeof document !== 'undefined') {
        renderAll();
    }
}

// 添加维度
function addDimension(name, weight) {
    let dimensionName, dimensionWeight;
    
    if (name !== undefined) {
        dimensionName = name;
        dimensionWeight = weight !== undefined ? parseFloat(weight) : 1;
    } else {
        if (typeof document === 'undefined') {
            return null;
        }
        dimensionName = document.getElementById('dimensionName').value.trim();
        dimensionWeight = parseFloat(document.getElementById('dimensionWeight').value) || 1;
    }
    
    if (!dimensionName) {
        if (typeof alert !== 'undefined') {
            alert('请输入维度名称');
        }
        return null;
    }
    
    if (isNaN(dimensionWeight) || !isFinite(dimensionWeight)) {
        if (typeof alert !== 'undefined') {
            alert(`权重必须是有效的数字`);
        }
        return null;
    }
    
    if (dimensionWeight <= 0) {
        if (typeof alert !== 'undefined') {
            alert('权重必须大于0');
        }
        return null;
    }
    
    const existingIndex = dimensions.findIndex(d => d.name === dimensionName);
    if (existingIndex !== -1) {
        if (typeof alert !== 'undefined') {
            alert('该维度名称已存在');
        }
        return null;
    }
    
    const dimension = {
        id: generateId(),
        name: dimensionName,
        weight: dimensionWeight
    };
    
    dimensions.push(dimension);
    
    alternatives.forEach(alt => {
        if (!scores[alt.id]) {
            scores[alt.id] = {};
        }
        scores[alt.id][dimension.id] = 0;
    });
    
    if (typeof document !== 'undefined') {
        document.getElementById('dimensionName').value = '';
        document.getElementById('dimensionWeight').value = 1;
        renderAll();
    }
    
    return dimension;
}

// 删除维度
function deleteDimension(id) {
    const index = dimensions.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    dimensions.splice(index, 1);
    
    alternatives.forEach(alt => {
        if (scores[alt.id]) {
            delete scores[alt.id][id];
        }
    });
    
    if (typeof document !== 'undefined') {
        renderAll();
    }
    
    return true;
}

// 添加方案
function addAlternative(name) {
    let alternativeName;
    
    if (name !== undefined) {
        alternativeName = name;
    } else {
        if (typeof document === 'undefined') {
            return null;
        }
        alternativeName = document.getElementById('alternativeName').value.trim();
    }
    
    if (!alternativeName) {
        if (typeof alert !== 'undefined') {
            alert('请输入方案名称');
        }
        return null;
    }
    
    const existingIndex = alternatives.findIndex(a => a.name === alternativeName);
    if (existingIndex !== -1) {
        if (typeof alert !== 'undefined') {
            alert('该方案名称已存在');
        }
        return null;
    }
    
    const alternative = {
        id: generateId(),
        name: alternativeName
    };
    
    alternatives.push(alternative);
    
    scores[alternative.id] = {};
    dimensions.forEach(dim => {
        scores[alternative.id][dim.id] = 0;
    });
    
    if (typeof document !== 'undefined') {
        document.getElementById('alternativeName').value = '';
        renderAll();
    }
    
    return alternative;
}

// 删除方案
function deleteAlternative(id) {
    const index = alternatives.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    alternatives.splice(index, 1);
    delete scores[id];
    
    if (typeof document !== 'undefined') {
        renderAll();
    }
    
    return true;
}

function isValidScore(score) {
    const scoreValue = parseFloat(score);
    return !isNaN(scoreValue) && 
           isFinite(scoreValue) && 
           scoreValue >= 0 && 
           scoreValue <= 10;
}

function validateAllScores() {
    const errors = [];
    
    alternatives.forEach(alt => {
        const altName = alt.name;
        dimensions.forEach(dim => {
            const dimName = dim.name;
            const score = scores[alt.id] && scores[alt.id][dim.id] !== undefined 
                ? scores[alt.id][dim.id] 
                : undefined;
            
            if (score === undefined) {
                errors.push(`方案 "${altName}" 在维度 "${dimName}" 上缺少评分`);
            } else if (!isValidScore(score)) {
                errors.push(`方案 "${altName}" 在维度 "${dimName}" 上的评分 "${score}" 无效（必须是 0-10 之间的有效数字）`);
            }
        });
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 设置评分
function setScore(alternativeId, dimensionId, score) {
    const scoreValue = parseFloat(score);
    
    if (!isValidScore(scoreValue)) {
        if (typeof alert !== 'undefined') {
            alert(`评分必须是 0 到 10 之间的有效数字，当前输入: ${score}`);
        }
        return null;
    }
    
    if (!scores[alternativeId]) {
        scores[alternativeId] = {};
    }
    
    scores[alternativeId][dimensionId] = scoreValue;
    
    return scoreValue;
}

// 归一化权重
function normalizeWeights() {
    const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight, 0);
    
    if (totalWeight === 0) {
        return dimensions.map(dim => ({...dim, normalizedWeight: 0}));
    }
    
    return dimensions.map(dim => ({
        ...dim,
        normalizedWeight: dim.weight / totalWeight
    }));
}

// 获取归一化后的权重
function getNormalizedWeight(dimensionId) {
    const normalizedWeights = normalizeWeights();
    const dim = normalizedWeights.find(d => d.id === dimensionId);
    return dim ? dim.normalizedWeight : 0;
}

// 计算加权分数
function calculateWeightedScores() {
    const normalizedWeights = normalizeWeights();
    
    return alternatives.map(alt => {
        let totalScore = 0;
        
        normalizedWeights.forEach(dim => {
            const score = scores[alt.id] && scores[alt.id][dim.id] ? scores[alt.id][dim.id] : 0;
            totalScore += score * dim.normalizedWeight;
        });
        
        return {
            ...alt,
            totalScore: totalScore,
            dimensionScores: dimensions.map(dim => ({
                dimensionId: dim.id,
                dimensionName: dim.name,
                score: scores[alt.id] && scores[alt.id][dim.id] ? scores[alt.id][dim.id] : 0,
                weight: dim.weight,
                normalizedWeight: getNormalizedWeight(dim.id),
                weightedScore: (scores[alt.id] && scores[alt.id][dim.id] ? scores[alt.id][dim.id] : 0) * getNormalizedWeight(dim.id)
            }))
        };
    });
}

// 计算排名
function calculateRankings() {
    if (dimensions.length === 0) {
        if (typeof alert !== 'undefined') {
            alert('请至少添加一个评分维度');
        }
        return [];
    }
    
    if (alternatives.length === 0) {
        if (typeof alert !== 'undefined') {
            alert('请至少添加一个备选方案');
        }
        return [];
    }
    
    const validation = validateAllScores();
    if (!validation.isValid) {
        if (typeof alert !== 'undefined') {
            alert('评分数据无效，请检查以下问题：\n' + validation.errors.join('\n'));
        }
        return [];
    }
    
    const weightedScores = calculateWeightedScores();
    
    const sortedScores = [...weightedScores].sort((a, b) => b.totalScore - a.totalScore);
    
    const rankings = sortedScores.map((item, index) => ({
        rank: index + 1,
        ...item
    }));
    
    if (typeof document !== 'undefined') {
        renderRankings(rankings);
    }
    
    return rankings;
}

// 渲染所有内容
function renderAll() {
    if (typeof document === 'undefined') return;
    
    renderDimensions();
    renderAlternatives();
    renderScoringMatrix();
    document.getElementById('rankings').innerHTML = '<div class="empty-message">点击"计算排名"查看结果</div>';
}

// 渲染维度列表
function renderDimensions() {
    if (typeof document === 'undefined') return;
    
    const container = document.getElementById('dimensionsList');
    
    if (dimensions.length === 0) {
        container.innerHTML = '<div class="empty-message">暂无维度，请添加</div>';
        return;
    }
    
    const normalizedWeights = normalizeWeights();
    
    container.innerHTML = dimensions.map(dim => {
        const normalized = normalizedWeights.find(n => n.id === dim.id);
        const normalizedPercent = normalized ? (normalized.normalizedWeight * 100).toFixed(2) : '0.00';
        
        return `
            <div class="list-item">
                <span class="name">${dim.name}</span>
                <span class="weight">权重: ${dim.weight} (归一化: ${normalizedPercent}%)</span>
                <button class="delete-btn" onclick="deleteDimension('${dim.id}')">删除</button>
            </div>
        `;
    }).join('');
}

// 渲染方案列表
function renderAlternatives() {
    if (typeof document === 'undefined') return;
    
    const container = document.getElementById('alternativesList');
    
    if (alternatives.length === 0) {
        container.innerHTML = '<div class="empty-message">暂无方案，请添加</div>';
        return;
    }
    
    container.innerHTML = alternatives.map(alt => `
        <div class="list-item">
            <span class="name">${alt.name}</span>
            <button class="delete-btn" onclick="deleteAlternative('${alt.id}')">删除</button>
        </div>
    `).join('');
}

// 渲染评分矩阵
function renderScoringMatrix() {
    if (typeof document === 'undefined') return;
    
    const container = document.getElementById('scoringMatrix');
    
    if (dimensions.length === 0 || alternatives.length === 0) {
        container.innerHTML = '<div class="empty-message">请先添加维度和方案</div>';
        return;
    }
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>方案</th>
                    ${dimensions.map(dim => `<th>${dim.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    alternatives.forEach(alt => {
        tableHTML += `<tr>`;
        tableHTML += `<td>${alt.name}</td>`;
        
        dimensions.forEach(dim => {
            const score = scores[alt.id] && scores[alt.id][dim.id] !== undefined ? scores[alt.id][dim.id] : 0;
            tableHTML += `
                <td>
                    <input type="number" 
                           value="${score}" 
                           min="0" 
                           max="10" 
                           onchange="setScore('${alt.id}', '${dim.id}', this.value);"
                           placeholder="0-10">
                </td>
            `;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// 渲染排名
function renderRankings(rankings) {
    if (typeof document === 'undefined') return;
    
    const container = document.getElementById('rankings');
    
    if (rankings.length === 0) {
        container.innerHTML = '<div class="empty-message">暂无排名数据</div>';
        return;
    }
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>排名</th>
                    <th>方案</th>
                    <th>总分</th>
                    ${dimensions.map(dim => `<th>${dim.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    rankings.forEach(item => {
        tableHTML += `<tr>`;
        tableHTML += `<td>${item.rank}</td>`;
        tableHTML += `<td>${item.name}</td>`;
        tableHTML += `<td>${item.totalScore.toFixed(4)}</td>`;
        
        dimensions.forEach(dim => {
            const dimScore = item.dimensionScores.find(s => s.dimensionId === dim.id);
            const score = dimScore ? dimScore.score : 0;
            const weightedScore = dimScore ? dimScore.weightedScore : 0;
            const normalizedWeight = dimScore ? (dimScore.normalizedWeight * 100).toFixed(2) : '0.00';
            
            tableHTML += `<td>${score} × ${normalizedWeight}% = ${weightedScore.toFixed(4)}</td>`;
        });
        
        tableHTML += `</tr>`;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// 页面加载完成后初始化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        renderAll();
    });
}