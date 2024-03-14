import {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson, formatDataset} from "./utils.js";
import {buildDesignMatrix, sampleWithReplacement, generateCaseControlDataset, calculateLinearScore} from "./stats.js";
import seedrandom from "https://esm.sh/seedrandom@3.0.5";


async function generateSimulatedBPC3Data({n, caseControl = false, caseProportion = 0.5, seed = 1234}) {
    // Simulation parameters
    const rng = seedrandom(seed);
    const simulationParams = {
        lowestEntryAge: 50,
        highestEntryAge: 67,
        lowestFollowup: 5,
        highestFollowup: 13,
        weibullGamma: 2.39,
        weibullLambda: 5E-6,
        proportionPositive: 0.033
    };
    const nSimulated = caseControl ? calculateTotalExamples(Math.round(n * caseProportion), simulationParams.proportionPositive) : n;

    // BPC3 parameters
    const rootUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/bpc3/";
    const referenceDataUrl = rootUrl + "reference_covariate_data.csv";
    const formulaUrl = rootUrl + "model_formula.txt";
    const dtypesUrl = rootUrl + "dtypes.json";
    const relativeRisksUrl = rootUrl + "model_log_odds_ratios.json";

    const formula = await fetchFileAsText(formulaUrl);
    const dtypes = await fetchFileAsJson(dtypesUrl);
    const referenceData = formatDataset(await fetchCsvFileAsJson(referenceDataUrl), dtypes);
    const relativeRisks = await fetchFileAsJson(relativeRisksUrl);

    // Simulate data
    let simulatedData = sampleWithReplacement(referenceData, nSimulated, rng);
    for (const sample of simulatedData) {
        sample.study_entry_age = Math.floor(rng() * (simulationParams.highestEntryAge - simulationParams.lowestEntryAge + 1)) + simulationParams.lowestEntryAge;
        sample.observed_followup = Math.floor(rng() * (simulationParams.highestFollowup - simulationParams.lowestFollowup + 1)) + simulationParams.lowestFollowup;
        sample.study_exit_age = sample.study_entry_age + sample.observed_followup;
    }

    const designMatrix = await buildDesignMatrix(formula, JSON.stringify(simulatedData), JSON.stringify(dtypes));
    const expLinearPredictors = calculateLinearScore(relativeRisks, designMatrix).map(Math.exp);
    const timeOfOnset = simulatedData.map((data, i) => {
        return Math.pow(
            Math.pow(data.study_entry_age, simulationParams.weibullGamma) - Math.log(rng()) / (simulationParams.weibullLambda * expLinearPredictors[i]),
            1 / simulationParams.weibullGamma
        );
    });
    simulatedData.forEach((data, i) => {
        data.observed_outcome = timeOfOnset[i] <= data.study_exit_age ? 1 : 0;
        data.time_of_onset = timeOfOnset[i] - data.study_entry_age;
        if (data.time_of_onset > data.observed_followup) {
            data.time_of_onset = Infinity;
        }
    });

    simulatedData = caseControl ? generateCaseControlDataset(simulatedData, "observed_outcome", Math.round(n * caseProportion), n - Math.round(n * caseProportion), rng) : simulatedData;

    return simulatedData;
}


function calculateTotalExamples(positiveExamplesNeeded, proportionPositive) {
    return Math.round(positiveExamplesNeeded / proportionPositive);
}


export {generateSimulatedBPC3Data};