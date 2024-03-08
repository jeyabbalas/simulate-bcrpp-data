import {generateSimulatedICARELitData} from './lib/main.js';


const simulatedData = await generateSimulatedICARELitData({n: 5});
console.log(simulatedData);