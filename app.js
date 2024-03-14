import {generateSimulatedBPC3Data} from './lib/main.js';
import {fetchFileAsText, fetchFileAsJson} from './lib/utils.js';
import {fitLogisticRegression} from './lib/stats.js';


const simulatedData = await generateSimulatedBPC3Data({n: 100});
//const simulatedData = await generateSimulatedBPC3Data({n: 100, caseControl: true});
console.log(simulatedData);

// BPC3 parameters
// const rootUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/bpc3/";
// const formulaUrl = rootUrl + "model_formula.txt";
// const dtypesUrl = rootUrl + "dtypes.json";
//
// const formula = "observed_outcome ~ study_entry_age + " + (await fetchFileAsText(formulaUrl));
// const dtypes = await fetchFileAsJson(dtypesUrl);
//
// const modelOutput = await fitLogisticRegression(formula, JSON.stringify(simulatedData), JSON.stringify(dtypes));
// console.log(modelOutput);