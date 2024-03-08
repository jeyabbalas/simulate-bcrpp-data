import {parseCsv, instantiatePyodide} from "./utils.js";
import seedrandom from "https://esm.sh/seedrandom@3.0.5";


async function generateSimulatedICARELitData({n, seed = 1234}) {
    const rng = seedrandom(seed);
    const pyodide = await instantiatePyodide();
    console.log(pyodide.runPython("1+2"));

    const referenceDataUrl =
        "https://raw.githubusercontent.com/jeyabbalas/simulate-bcrpp-data/main/data/icare-lit/ge50/reference_covariate_data_ge50.csv";
    const response = await fetch(referenceDataUrl);
    const csvData = await response.text();
    const referenceData = parseCsv(csvData);

    const riskFactors = Object.keys(referenceData[0]);

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

    return simulatedData;
}


export {generateSimulatedICARELitData};