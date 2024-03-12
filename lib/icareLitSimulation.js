import {fetchFileAsText, fetchFileAsJson, fetchCsvFileAsJson} from "./utils.js";
import {buildDesignMatrix} from "./stats.js";
import seedrandom from "https://esm.sh/seedrandom@3.0.5";


async function generateSimulatedICARELitData({n, caseControl = false, seed = 1234}) {
    // Simulation parameters
    const rng = seedrandom(seed);
    const simulationParams = {
        lowestEntryAge: 50,
        highestEntryAge: 67,
        lowestFollowup: 5,
        highestFollowup: 13
    };

    // iCARE-Lit parameters
    const rootUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/icare-lit/ge50/";
    const referenceDataUrl = rootUrl + "reference_covariate_data.csv";
    const formulaUrl = rootUrl + "model_formula.txt";
    const dtypesUrl = rootUrl + "dtypes.json";
    const relativeRisksUrl = "";

    const referenceData = await fetchCsvFileAsJson(referenceDataUrl);
    const formula = await fetchFileAsText(formulaUrl);
    const riskFactors = Object.keys(referenceData[0]).filter((key) => key !== "id");
    const dtypes = {
        "age_at_menarche": "str",
        "parity": "str",
        "age_first_birth": "str",
        "oc_ever": "int",
        "alcohol_intake": "str",
        "bbd": "int",
        "famhist": "int",
        "age_at_menopause": "str",
        "height": "float",
        "hrt": "str",
        "hrt_type": "int",
        "bmi_curc": "str"
    }

    const simulatedData = [];
    for (let i = 0; i < n; i++) {
        const sample = {id: i + 1};
        for (const factor of riskFactors) {
            const values = referenceData.map((row) => row[factor]);
            sample[factor] = values[Math.floor(rng() * values.length)];
        }
        simulatedData.push(sample);
    }

    for (const sample of simulatedData) {
        sample.studyEntryAge = Math.floor(rng() * (simulationParams.highestEntryAge - simulationParams.lowestEntryAge + 1)) + simulationParams.lowestEntryAge;
        sample.observedFollowup = Math.floor(rng() * (simulationParams.highestFollowup - simulationParams.lowestFollowup + 1)) + simulationParams.lowestFollowup;
        sample.studyExitAge = sample.studyEntryAge + sample.observedFollowup;
    }

    const designMatrix = await buildDesignMatrix(formula, JSON.stringify(simulatedData), JSON.stringify(dtypes), riskFactors);
    console.log(designMatrix);

    return simulatedData;
}


export {generateSimulatedICARELitData};