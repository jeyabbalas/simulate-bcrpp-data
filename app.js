import {generateSimulatedBPC3Data} from './lib/main.js';
import {fetchFileAsText, fetchFileAsJson} from './lib/utils.js';
import {fitLogisticRegression} from './lib/stats.js';


function displayDataset(divUI, data) {
    const headers = data.columns;
    const rows = data.data;

    // Create the table
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.fontWeight = 'bold';
        th.style.backgroundColor = '#f0f0f0';
        th.style.padding = '8px';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        row.forEach(cellValue => {
            const cell = document.createElement('td');
            cell.textContent = cellValue;
            cell.style.padding = '8px';
            cell.style.border = '1px solid #ddd';
            tr.appendChild(cell);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Table scroller
    const container = document.createElement('div');
    container.style.overflowY = 'scroll';
    container.style.maxHeight = '400px';  // table height
    container.appendChild(table);

    // Attach
    divUI.appendChild(container);
}


function displayLogisticRegressionResults(results) {
    // Create the table
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Predictor', 'Relative Risk', 'Standard Error', 'Confidence Interval'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.fontWeight = 'bold';
        th.style.backgroundColor = '#f0f0f0';
        th.style.padding = '8px';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    Object.entries(results).forEach(([predictor, values]) => {
        const row = document.createElement('tr');

        // Predictor cell
        const predictorCell = document.createElement('td');
        predictorCell.textContent = predictor;
        predictorCell.style.fontWeight = 'bold';
        predictorCell.style.backgroundColor = '#f0f0f0';
        predictorCell.style.padding = '8px';
        predictorCell.style.border = '1px solid #ddd';
        row.appendChild(predictorCell);

        // Relative Risk cell
        const relativeRiskCell = document.createElement('td');
        relativeRiskCell.textContent = values.relativeRisk.toFixed(4);
        relativeRiskCell.style.padding = '8px';
        relativeRiskCell.style.border = '1px solid #ddd';
        row.appendChild(relativeRiskCell);

        // Standard Error cell
        const standardErrorCell = document.createElement('td');
        standardErrorCell.textContent = values.standardError.toFixed(4);
        standardErrorCell.style.padding = '8px';
        standardErrorCell.style.border = '1px solid #ddd';
        row.appendChild(standardErrorCell);

        // Confidence Interval cell
        const confidenceIntervalCell = document.createElement('td');
        confidenceIntervalCell.textContent = `(${values.lowerCI.toFixed(4)}, ${values.upperCI.toFixed(4)})`;
        confidenceIntervalCell.style.padding = '8px';
        confidenceIntervalCell.style.border = '1px solid #ddd';
        row.appendChild(confidenceIntervalCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Create a container div for the table with a scroller
    const container = document.createElement('div');
    container.style.overflowY = 'scroll';
    container.style.maxHeight = '400px';  // table height
    container.appendChild(table);

    // Attach
    document.body.appendChild(container);
}


const divID = 'app';
let divUI = divID ? document.getElementById(divID) : document.createElement('div');

//const simulatedData = await generateSimulatedBPC3Data({n: 25000});  // Uncomment for prospective cohort data
const simulatedData = await generateSimulatedBPC3Data({n: 10000, caseControl: true});
divUI.innerHTML = `<h2>Simulated BPC3 Data</h2>`;
displayDataset(divUI, simulatedData);

// BPC3 parameters
const rootUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/bpc3/";
const formulaUrl = rootUrl + "model_formula.txt";
const dtypesUrl = rootUrl + "dtypes.json";

const formula = "observed_outcome ~ study_entry_age + " + (await fetchFileAsText(formulaUrl));
const dtypes = await fetchFileAsJson(dtypesUrl);

// BPC3 modeling
const modelOutput = await fitLogisticRegression({
    formula,
    dataset: JSON.stringify(simulatedData),
    dtypes: JSON.stringify(dtypes),
    maxiter: 1000
});
const factorsToAdjust = ["Intercept", "study_entry_age"];
const payload = Object.keys(modelOutput)
    .filter(key => !factorsToAdjust.includes(key))
    .reduce((obj, key) => {
        obj[key] = modelOutput[key];
        return obj;
    }, {});

divUI.innerHTML += `<hr><h2>Logistic Regression Results</h2>`;
displayLogisticRegressionResults(payload);