import {generateSimulatedICARELitData} from "./icareLitSimulation.js";


function generateDesignMatrix(formula, dataset) {
    const designMatrix = dataset.map(() => ({}));

    const patsyOperators = ['*', '+'];
    const termHasPatsyOperator = term => patsyOperators.some(operator => term.includes(operator));
    const terms = splitFormulaTerms(formula);
    console.log(terms);
    for (const term of terms) {
        if (term.startsWith('C(')) {
            // Categorical variable
            const [varName, levels] = parseCategoricalTerm(term, dataset);
            processCategoricalVariable(varName, levels, dataset, designMatrix);
        } else if (!termHasPatsyOperator(term)) {
            // Continuous variable
            processContinuousVariable(term, dataset, designMatrix);
        } else {
            // Interaction term
            processContinuousVariable(term, dataset, designMatrix);
        }
    }

    return designMatrix;
}


function splitFormulaTerms(formula) {
    const terms = [];
    const stack = [];
    let currentTerm = "";

    for (const char of formula) {
        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            stack.pop();
        }

        if (char === '+' && stack.length === 0) {
            terms.push(currentTerm.trim());
            currentTerm = "";
        } else {
            currentTerm += char;
        }
    }

    terms.push(currentTerm.trim());
    return terms;
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

function replaceVariableNamesWithPlaceholders(expression) {
    const variableNamePattern = /C\([^)]+\)|[a-zA-Z_]\w*/g;
    const placeholders = {};
    let counter = 0;

    function placeholderReplacer(match) {
        const placeholder = `x${counter}`;
        placeholders[placeholder] = match;
        counter++;
        return placeholder;
    }

    const simplifiedExpression = expression.replace(variableNamePattern, placeholderReplacer);

    return {simplifiedExpression, placeholders};
}


function replacePlaceholdersWithVariableNames(simplifiedExpressions, placeholders) {
    return simplifiedExpressions.map((term) => {
        for (const [placeholder, variableName] of Object.entries(placeholders)) {
            term = term.replace(placeholder, variableName);
        }
        return term;
    });
}


export {generateDesignMatrix, generateSimulatedICARELitData};