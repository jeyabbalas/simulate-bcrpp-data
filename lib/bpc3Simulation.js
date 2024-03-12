import {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson} from "./utils.js";
import {buildDesignMatrix} from "./stats.js";
import seedrandom from "https://esm.sh/seedrandom@3.0.5";


async function generateSimulatedBPC3Data({n, caseControl = false, seed = 1234}) {
    // Simulation parameters
    const rng = seedrandom(seed);
    const simulationParams = {
        lowestEntryAge: 50,
        highestEntryAge: 67,
        lowestFollowup: 5,
        highestFollowup: 13,
        weibullGamma: 2.15,
        weibullLambda: 0.9E-06
    };

    // BPC3 parameters
    const rootUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/bpc3/";
    const referenceDataUrl = rootUrl + "reference_covariate_data.csv";
    const formulaUrl = rootUrl + "model_formula.txt";
    const dtypesUrl = rootUrl + "dtypes.json";
    const relativeRisksUrl = "model_log_odds_ratios.json";

    const referenceData = await fetchCsvFileAsJson(referenceDataUrl);
    const formula = await fetchFileAsText(formulaUrl);
    const riskFactors = Object.keys(referenceData[0]);
    const dtypes = await fetchFileAsJson(dtypesUrl);
    const relativeRisks = await fetchFileAsJson(relativeRisksUrl);
}

export {generateSimulatedBPC3Data};