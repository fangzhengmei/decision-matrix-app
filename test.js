const assert = require('assert');
const app = require('./app.js');

console.log('=== 开始测试决策矩阵工具 ===\n');

// 清理测试环境
app.clearAll();

let testPassed = 0;
let testFailed = 0;

// 测试1: 测试添加维度
console.log('测试1: 添加维度');
try {
    const dim1 = app.addDimension('价格', 3);
    const dim2 = app.addDimension('性能', 5);
    const dim3 = app.addDimension('外观', 2);
    
    const dimensions = app.getDimensions();
    assert.strictEqual(dimensions.length, 3, '应该有3个维度');
    assert.strictEqual(dimensions[0].name, '价格', '第一个维度名称应该是价格');
    assert.strictEqual(dimensions[0].weight, 3, '价格权重应该是3');
    assert.strictEqual(dimensions[1].name, '性能', '第二个维度名称应该是性能');
    assert.strictEqual(dimensions[1].weight, 5, '性能权重应该是5');
    assert.strictEqual(dimensions[2].name, '外观', '第三个维度名称应该是外观');
    assert.strictEqual(dimensions[2].weight, 2, '外观权重应该是2');
    
    console.log('✓ 通过: 维度添加成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试2: 测试添加方案
console.log('\n测试2: 添加方案');
try {
    const alt1 = app.addAlternative('方案A');
    const alt2 = app.addAlternative('方案B');
    const alt3 = app.addAlternative('方案C');
    
    const alternatives = app.getAlternatives();
    assert.strictEqual(alternatives.length, 3, '应该有3个方案');
    assert.strictEqual(alternatives[0].name, '方案A', '第一个方案名称应该是方案A');
    assert.strictEqual(alternatives[1].name, '方案B', '第二个方案名称应该是方案B');
    assert.strictEqual(alternatives[2].name, '方案C', '第三个方案名称应该是方案C');
    
    console.log('✓ 通过: 方案添加成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试3: 测试权重归一化
console.log('\n测试3: 权重归一化');
try {
    // 总权重: 3 + 5 + 2 = 10
    // 价格: 3/10 = 0.3
    // 性能: 5/10 = 0.5
    // 外观: 2/10 = 0.2
    
    const dimensions = app.getDimensions();
    const priceWeight = app.getNormalizedWeight(dimensions[0].id);
    const performanceWeight = app.getNormalizedWeight(dimensions[1].id);
    const appearanceWeight = app.getNormalizedWeight(dimensions[2].id);
    
    assert.strictEqual(priceWeight, 0.3, '价格归一化权重应该是0.3');
    assert.strictEqual(performanceWeight, 0.5, '性能归一化权重应该是0.5');
    assert.strictEqual(appearanceWeight, 0.2, '外观归一化权重应该是0.2');
    
    // 验证权重之和为1
    const totalNormalizedWeight = priceWeight + performanceWeight + appearanceWeight;
    assert.strictEqual(totalNormalizedWeight, 1, '归一化权重之和应该为1');
    
    console.log('✓ 通过: 权重归一化成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试4: 测试设置评分
console.log('\n测试4: 设置评分');
try {
    const dimensions = app.getDimensions();
    const alternatives = app.getAlternatives();
    
    // 为方案A设置评分
    app.setScore(alternatives[0].id, dimensions[0].id, 8); // 价格: 8
    app.setScore(alternatives[0].id, dimensions[1].id, 6); // 性能: 6
    app.setScore(alternatives[0].id, dimensions[2].id, 9); // 外观: 9
    
    // 为方案B设置评分
    app.setScore(alternatives[1].id, dimensions[0].id, 5); // 价格: 5
    app.setScore(alternatives[1].id, dimensions[1].id, 9); // 性能: 9
    app.setScore(alternatives[1].id, dimensions[2].id, 7); // 外观: 7
    
    // 为方案C设置评分
    app.setScore(alternatives[2].id, dimensions[0].id, 7); // 价格: 7
    app.setScore(alternatives[2].id, dimensions[1].id, 8); // 性能: 8
    app.setScore(alternatives[2].id, dimensions[2].id, 6); // 外观: 6
    
    const scores = app.getScores();
    assert.strictEqual(scores[alternatives[0].id][dimensions[0].id], 8, '方案A的价格评分应该是8');
    assert.strictEqual(scores[alternatives[1].id][dimensions[1].id], 9, '方案B的性能评分应该是9');
    assert.strictEqual(scores[alternatives[2].id][dimensions[2].id], 6, '方案C的外观评分应该是6');
    
    console.log('✓ 通过: 评分设置成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试5: 测试加权总分计算
console.log('\n测试5: 加权总分计算');
try {
    // 方案A: 8*0.3 + 6*0.5 + 9*0.2 = 2.4 + 3 + 1.8 = 7.2
    // 方案B: 5*0.3 + 9*0.5 + 7*0.2 = 1.5 + 4.5 + 1.4 = 7.4
    // 方案C: 7*0.3 + 8*0.5 + 6*0.2 = 2.1 + 4 + 1.2 = 7.3
    
    const weightedScores = app.calculateWeightedScores();
    const alternatives = app.getAlternatives();
    
    const scoreA = weightedScores.find(s => s.id === alternatives[0].id);
    const scoreB = weightedScores.find(s => s.id === alternatives[1].id);
    const scoreC = weightedScores.find(s => s.id === alternatives[2].id);
    
    assert.strictEqual(scoreA.totalScore, 7.2, '方案A的加权总分应该是7.2');
    assert.strictEqual(scoreB.totalScore, 7.4, '方案B的加权总分应该是7.4');
    assert.strictEqual(scoreC.totalScore, 7.3, '方案C的加权总分应该是7.3');
    
    console.log('✓ 通过: 加权总分计算成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试6: 测试排名
console.log('\n测试6: 排名计算');
try {
    // 排名应该是:
    // 1. 方案B (7.4)
    // 2. 方案C (7.3)
    // 3. 方案A (7.2)
    
    const rankings = app.calculateRankings();
    
    assert.strictEqual(rankings.length, 3, '应该有3个排名');
    assert.strictEqual(rankings[0].rank, 1, '第一个应该是第1名');
    assert.strictEqual(rankings[0].name, '方案B', '第1名应该是方案B');
    assert.strictEqual(rankings[0].totalScore, 7.4, '方案B的总分应该是7.4');
    
    assert.strictEqual(rankings[1].rank, 2, '第二个应该是第2名');
    assert.strictEqual(rankings[1].name, '方案C', '第2名应该是方案C');
    assert.strictEqual(rankings[1].totalScore, 7.3, '方案C的总分应该是7.3');
    
    assert.strictEqual(rankings[2].rank, 3, '第三个应该是第3名');
    assert.strictEqual(rankings[2].name, '方案A', '第3名应该是方案A');
    assert.strictEqual(rankings[2].totalScore, 7.2, '方案A的总分应该是7.2');
    
    console.log('✓ 通过: 排名计算成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试7: 测试删除维度
console.log('\n测试7: 删除维度');
try {
    const initialDimensions = app.getDimensions();
    const initialCount = initialDimensions.length;
    
    // 删除第一个维度
    const result = app.deleteDimension(initialDimensions[0].id);
    assert.strictEqual(result, true, '删除应该成功');
    
    const afterDimensions = app.getDimensions();
    assert.strictEqual(afterDimensions.length, initialCount - 1, '维度数量应该减少1');
    assert.strictEqual(afterDimensions[0].name, '性能', '第一个维度应该是性能');
    
    console.log('✓ 通过: 维度删除成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试8: 测试删除方案
console.log('\n测试8: 删除方案');
try {
    const initialAlternatives = app.getAlternatives();
    const initialCount = initialAlternatives.length;
    
    // 删除第一个方案
    const result = app.deleteAlternative(initialAlternatives[0].id);
    assert.strictEqual(result, true, '删除应该成功');
    
    const afterAlternatives = app.getAlternatives();
    assert.strictEqual(afterAlternatives.length, initialCount - 1, '方案数量应该减少1');
    assert.strictEqual(afterAlternatives[0].name, '方案B', '第一个方案应该是方案B');
    
    console.log('✓ 通过: 方案删除成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试9: 测试重复添加维度
console.log('\n测试9: 重复添加维度');
try {
    app.clearAll();
    app.addDimension('测试维度', 1);
    const result = app.addDimension('测试维度', 2); // 同名维度
    assert.strictEqual(result, null, '重复添加应该返回null');
    
    const dimensions = app.getDimensions();
    assert.strictEqual(dimensions.length, 1, '应该只有1个维度');
    
    console.log('✓ 通过: 重复维度检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试10: 测试空名称维度
console.log('\n测试10: 空名称维度');
try {
    app.clearAll();
    const result = app.addDimension('', 1); // 空名称
    assert.strictEqual(result, null, '空名称应该返回null');
    
    const dimensions = app.getDimensions();
    assert.strictEqual(dimensions.length, 0, '应该没有维度');
    
    console.log('✓ 通过: 空名称检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试11: 测试负权重
console.log('\n测试11: 负权重');
try {
    app.clearAll();
    const result = app.addDimension('测试维度', -1); // 负权重
    assert.strictEqual(result, null, '负权重应该返回null');
    
    const dimensions = app.getDimensions();
    assert.strictEqual(dimensions.length, 0, '应该没有维度');
    
    console.log('✓ 通过: 负权重检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试12: 测试 isValidScore 函数 - 有效分数
console.log('\n测试12: isValidScore - 有效分数');
try {
    assert.strictEqual(app.isValidScore(0), true, '0 应该是有效分数');
    assert.strictEqual(app.isValidScore(5), true, '5 应该是有效分数');
    assert.strictEqual(app.isValidScore(10), true, '10 应该是有效分数');
    assert.strictEqual(app.isValidScore(3.5), true, '3.5 应该是有效分数');
    assert.strictEqual(app.isValidScore('7'), true, '字符串 "7" 应该是有效分数');
    assert.strictEqual(app.isValidScore('8.5'), true, '字符串 "8.5" 应该是有效分数');
    
    console.log('✓ 通过: 有效分数检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试13: 测试 isValidScore 函数 - 无效分数
console.log('\n测试13: isValidScore - 无效分数');
try {
    assert.strictEqual(app.isValidScore(-1), false, '-1 应该是无效分数');
    assert.strictEqual(app.isValidScore(11), false, '11 应该是无效分数');
    assert.strictEqual(app.isValidScore(NaN), false, 'NaN 应该是无效分数');
    assert.strictEqual(app.isValidScore(Infinity), false, 'Infinity 应该是无效分数');
    assert.strictEqual(app.isValidScore(-Infinity), false, '-Infinity 应该是无效分数');
    assert.strictEqual(app.isValidScore('abc'), false, '"abc" 应该是无效分数');
    assert.strictEqual(app.isValidScore(''), false, '空字符串 应该是无效分数');
    assert.strictEqual(app.isValidScore(null), false, 'null 应该是无效分数');
    assert.strictEqual(app.isValidScore(undefined), false, 'undefined 应该是无效分数');
    
    console.log('✓ 通过: 无效分数检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试14: 测试 setScore - 无效输入返回 null
console.log('\n测试14: setScore - 无效输入返回 null');
try {
    app.clearAll();
    const dim = app.addDimension('测试维度', 1);
    const alt = app.addAlternative('测试方案');
    
    const result1 = app.setScore(alt.id, dim.id, -5);
    assert.strictEqual(result1, null, '负数分数应该返回 null');
    
    const result2 = app.setScore(alt.id, dim.id, 15);
    assert.strictEqual(result2, null, '超出范围的分数应该返回 null');
    
    const result3 = app.setScore(alt.id, dim.id, NaN);
    assert.strictEqual(result3, null, 'NaN 应该返回 null');
    
    const result4 = app.setScore(alt.id, dim.id, 'abc');
    assert.strictEqual(result4, null, '非数字字符串应该返回 null');
    
    console.log('✓ 通过: setScore 无效输入检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试15: 测试 addDimension - 非数字权重
console.log('\n测试15: addDimension - 非数字权重');
try {
    app.clearAll();
    
    const result1 = app.addDimension('测试维度', NaN);
    assert.strictEqual(result1, null, 'NaN 权重应该返回 null');
    
    const result2 = app.addDimension('测试维度', Infinity);
    assert.strictEqual(result2, null, 'Infinity 权重应该返回 null');
    
    const result3 = app.addDimension('测试维度', 'abc');
    assert.strictEqual(result3, null, '非数字字符串权重应该返回 null');
    
    const dimensions = app.getDimensions();
    assert.strictEqual(dimensions.length, 0, '应该没有维度被添加');
    
    console.log('✓ 通过: addDimension 非数字权重检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试16: 测试 validateAllScores - 有效数据
console.log('\n测试16: validateAllScores - 有效数据');
try {
    app.clearAll();
    const dim1 = app.addDimension('维度1', 1);
    const dim2 = app.addDimension('维度2', 2);
    const alt1 = app.addAlternative('方案A');
    const alt2 = app.addAlternative('方案B');
    
    app.setScore(alt1.id, dim1.id, 5);
    app.setScore(alt1.id, dim2.id, 7);
    app.setScore(alt2.id, dim1.id, 8);
    app.setScore(alt2.id, dim2.id, 6);
    
    const validation = app.validateAllScores();
    assert.strictEqual(validation.isValid, true, '有效数据应该验证通过');
    assert.strictEqual(validation.errors.length, 0, '不应该有错误');
    
    console.log('✓ 通过: validateAllScores 有效数据检测成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试17: 测试 validateAllScores - 检测已存储的无效评分
console.log('\n测试17: validateAllScores - 检测已存储的无效评分');
try {
    app.clearAll();
    const dim1 = app.addDimension('维度1', 1);
    const alt1 = app.addAlternative('方案A');
    
    const scores = app.getScores();
    scores[alt1.id] = {};
    scores[alt1.id][dim1.id] = 15; // 直接设置无效分数（绕过 setScore 验证）
    app.setScores(scores);
    
    const validation = app.validateAllScores();
    assert.strictEqual(validation.isValid, false, '无效数据应该验证失败');
    assert.strictEqual(validation.errors.length >= 1, true, '应该有错误');
    assert.strictEqual(validation.errors[0].includes('15'), true, '错误信息应该包含无效值 15');
    
    console.log('✓ 通过: validateAllScores 检测无效评分成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试18: 测试 validateAllScores - 检测 NaN 评分
console.log('\n测试18: validateAllScores - 检测 NaN 评分');
try {
    app.clearAll();
    const dim1 = app.addDimension('维度1', 1);
    const alt1 = app.addAlternative('方案A');
    
    const scores = app.getScores();
    scores[alt1.id] = {};
    scores[alt1.id][dim1.id] = NaN; // 直接设置 NaN
    app.setScores(scores);
    
    const validation = app.validateAllScores();
    assert.strictEqual(validation.isValid, false, 'NaN 数据应该验证失败');
    
    console.log('✓ 通过: validateAllScores 检测 NaN 评分成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试19: 测试 calculateRankings - 有无效评分时返回空数组
console.log('\n测试19: calculateRankings - 有无效评分时返回空数组');
try {
    app.clearAll();
    const dim1 = app.addDimension('维度1', 1);
    const alt1 = app.addAlternative('方案A');
    
    const scores = app.getScores();
    scores[alt1.id] = {};
    scores[alt1.id][dim1.id] = 15; // 无效分数
    app.setScores(scores);
    
    const rankings = app.calculateRankings();
    assert.strictEqual(rankings.length, 0, '有无效评分时应该返回空数组');
    
    console.log('✓ 通过: calculateRankings 阻止无效评分参与排名成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 测试20: 测试完整流程 - 有效数据可以正常排名
console.log('\n测试20: 完整流程 - 有效数据可以正常排名');
try {
    app.clearAll();
    const dim1 = app.addDimension('价格', 3);
    const dim2 = app.addDimension('性能', 5);
    const dim3 = app.addDimension('外观', 2);
    const alt1 = app.addAlternative('方案A');
    const alt2 = app.addAlternative('方案B');
    const alt3 = app.addAlternative('方案C');
    
    app.setScore(alt1.id, dim1.id, 8);
    app.setScore(alt1.id, dim2.id, 6);
    app.setScore(alt1.id, dim3.id, 9);
    
    app.setScore(alt2.id, dim1.id, 5);
    app.setScore(alt2.id, dim2.id, 9);
    app.setScore(alt2.id, dim3.id, 7);
    
    app.setScore(alt3.id, dim1.id, 7);
    app.setScore(alt3.id, dim2.id, 8);
    app.setScore(alt3.id, dim3.id, 6);
    
    const rankings = app.calculateRankings();
    assert.strictEqual(rankings.length, 3, '应该有3个排名');
    assert.strictEqual(rankings[0].name, '方案B', '第1名应该是方案B');
    assert.strictEqual(rankings[1].name, '方案C', '第2名应该是方案C');
    assert.strictEqual(rankings[2].name, '方案A', '第3名应该是方案A');
    
    console.log('✓ 通过: 完整流程测试成功');
    testPassed++;
} catch (error) {
    console.log('✗ 失败:', error.message);
    testFailed++;
}

// 输出测试结果
console.log('\n=== 测试结果 ===');
console.log(`通过: ${testPassed}`);
console.log(`失败: ${testFailed}`);

if (testFailed === 0) {
    console.log('\n✓ 所有测试通过！');
    process.exit(0);
} else {
    console.log('\n✗ 有测试失败！');
    process.exit(1);
}