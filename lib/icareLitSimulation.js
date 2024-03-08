import {fetchFileAsText, fetchCsvFileAsJson, buildDesignMatrix} from "./utils.js";
import seedrandom from "https://esm.sh/seedrandom@3.0.5";


async function generateSimulatedICARELitData({n, seed = 1234}) {
    const rng = seedrandom(seed);

    const referenceDataUrl =
        "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/icare-lit/ge50/reference_covariate_data_ge50.csv";
    const formulaUrl = "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/icare-lit/ge50/model_formula_ge50.txt";
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

    const lowestEntryAge = 50;
    const highestEntryAge = 67;
    const lowestFollowup = 5;
    const highestFollowup = 13;

    for (const sample of simulatedData) {
        sample.studyEntryAge = Math.floor(rng() * (highestEntryAge - lowestEntryAge + 1)) + lowestEntryAge;
        sample.observedFollowup = Math.floor(rng() * (highestFollowup - lowestFollowup + 1)) + lowestFollowup;
        sample.studyExitAge = sample.studyEntryAge + sample.observedFollowup;
    }

    const designMatrix = await buildDesignMatrix(formula, JSON.stringify(simulatedData), JSON.stringify(dtypes), riskFactors);
    console.log(designMatrix);

    return simulatedData;
}


export {generateSimulatedICARELitData};