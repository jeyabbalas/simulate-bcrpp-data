function generateDesignMatrix(formula, dataset) {
    const designMatrix = dataset.map(() => ({}));

    const terms = formula.split('+').map(term => term.trim());
    for (const term of terms) {
        console.log(term);
        if (term.includes('C(')) {
            // Categorical variable
            const [varName, levels] = parseCategoricalTerm(term, dataset);
            console.log(varName, levels);
            processCategoricalVariable(varName, levels, dataset, designMatrix);
        } else {
            // Continuous variable
            const varName = term.trim();
            processContinuousVariable(varName, dataset, designMatrix);
        }
    }

    return designMatrix;
}


function parseCategoricalTerm(term, dataset) {
    const startIndex = term.indexOf('(') + 1;
    const endIndex = term.indexOf(')');
    const termContent = term.slice(startIndex, endIndex);

    let varName, levels;
    if (termContent.includes('levels=')) {
        const firstCommaIndex = termContent.indexOf(',');
        varName = termContent.slice(0, firstCommaIndex);
        const levelsStr = termContent.slice(firstCommaIndex + 1);

        levels = levelsStr.split('levels=')[1].trim().slice(1, -1).split(',').map(level => level.trim().slice(1, -1));
    } else {
        varName = termContent.trim();
        levels = [...new Set(dataset.map(dataPoint => dataPoint[varName]))].sort();
    }

    return [varName.trim(), levels];
}


function processCategoricalVariable(varName, levels, dataset, designMatrix) {
    for (let i = 1; i < levels.length; i++) {
        const level = levels[i];
        const variableName = `C(${varName}, levels=[${levels}])[T.${level}]`;
        for (let j = 0; j < dataset.length; j++) {
            const dataPoint = dataset[j];
            designMatrix[j][variableName] = dataPoint[varName] === level ? 1 : 0;
        }
    }
}


function processContinuousVariable(varName, dataset, designMatrix) {
    for (let i = 0; i < dataset.length; i++) {
        const dataPoint = dataset[i];
        designMatrix[i][varName] = dataPoint[varName] || 0;
    }
}


export {generateDesignMatrix};