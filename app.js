import {generateSimulatedBPC3Data} from './lib/main.js';


const simulatedData = await generateSimulatedBPC3Data({n: 5000});
//const simulatedData = await generateSimulatedBPC3Data({n: 100, caseControl: true});
console.log(simulatedData);
