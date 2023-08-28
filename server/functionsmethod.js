const { spawn } = require('child_process');

const {ProcessData, stirrer, boiler} = require('./brewcontrol/controlobjects.js'); //getobjects




//========================================================================================================= Gradient berechnen
function gettemp2(){
    new Promise((resolve, reject) =>{
        setTimeout(() => {
            boiler.gettemp(); //Temperatur nach 20s erneut messen
            resolve(temp2);
        }, 20000);
    });
}
async function calcgradient(){ //sollte als Promise ausgeführt werden, um asynchronität zu gewährleisten..
    const temp1 = boiler.gettemp();
    const time1 = performance.now(); 
    const temp2 = await gettemp2();
    const time2 = performance.now();
    const gradient = ((temp2 - temp1) / (time2 - time1)) * 1000; //rate berechnen und in °C/sek umrechnen
    return (temp2, gradient);
}

module.exports = {calcgradient};