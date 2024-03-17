import {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson, formatDataset} from "./utils.js";
import {buildDesignMatrix, sampleWithReplacement, generateCaseControlData, calculateLinearScore} from "./stats.js";
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
        proportionPositive: 0.035
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
    simulatedData = randomlyAssignFollowupPeriods(
        simulatedData,
        simulationParams.lowestEntryAge, simulationParams.highestEntryAge,
        simulationParams.lowestFollowup, simulationParams.highestFollowup,
        rng
    );

    const designMatrix = await buildDesignMatrix(formula, JSON.stringify(simulatedData), JSON.stringify(dtypes));
    const expLinearPredictors = calculateLinearScore(relativeRisks, designMatrix).map(Math.exp);

    simulatedData = calculateTimeOfOnsetAndOutcomeStatus(
        simulatedData,
        simulationParams.weibullGamma, simulationParams.weibullLambda,
        expLinearPredictors, rng
    );

    simulatedData = caseControl ? generateCaseControlData(simulatedData, "observed_outcome", Math.round(n * caseProportion), n - Math.round(n * caseProportion), rng) : simulatedData;

    return simulatedData;
}


function randomlyAssignFollowupPeriods(data, lowestEntryAge, highestEntryAge, lowestFollowup, highestFollowup, rng) {
    return {
        columns: [...data.columns, "study_entry_age", "study_exit_age", "observed_followup"],
        index: data.index,
        data: data.data.map(row => {
            const studyEntryAge = Math.floor(rng() * (highestEntryAge - lowestEntryAge + 1)) + lowestEntryAge;
            const observedFollowup = Math.floor(rng() * (highestFollowup - lowestFollowup + 1)) + lowestFollowup;
            const studyExitAge = studyEntryAge + observedFollowup;

            return [...row, studyEntryAge, studyExitAge, observedFollowup];
        })
    };
}


function calculateTimeOfOnsetAndOutcomeStatus(data, weibullGamma, weibullLambda, expLinearPredictors, rng) {
    const studyEntryAgeIndex = data.columns.indexOf("study_entry_age");
    const studyExitAgeIndex = data.columns.indexOf("study_exit_age");
    const observedFollowupIndex = data.columns.indexOf("observed_followup");

    return {
        columns: [...data.columns, "time_of_onset", "observed_outcome"],
        index: data.index,
        data: data.data.map((row, i) => {
            const studyEntryAge = row[studyEntryAgeIndex];
            const studyExitAge = row[studyExitAgeIndex];
            const observedFollowup = row[observedFollowupIndex];

            let timeOfOnset = Math.pow(
                Math.pow(studyEntryAge, weibullGamma) - Math.log(rng()) / (weibullLambda * expLinearPredictors[i]),
                1 / weibullGamma
            );
            const observedOutcome = timeOfOnset <= studyExitAge ? 1 : 0;
            timeOfOnset = +(timeOfOnset - studyEntryAge).toFixed(2);
            if (timeOfOnset > observedFollowup) {
                timeOfOnset = Infinity;
            }

            return [...row, timeOfOnset, observedOutcome];
        })
    };
}


function calculateTotalExamples(positiveExamplesNeeded, proportionPositive) {
    return Math.round(positiveExamplesNeeded / proportionPositive);
}


export {generateSimulatedBPC3Data};