//just 4 help: here the data structure in the data array of app.js
    // boiler: false,
    // stirrer: 0,
    // curtemp: -99,
    // suptemp: 99,
    // gradient: -20,
    // restname: "off",
    // nuber_rests: "3";
    // counter_rests: "0";
    // lefttimeinrest: "0"; 
    // controlmode: "manual",
    // boilermode: "brew",
    // raspitemp: -99,

const { boiler, ProcessData } = require("./03-controlobjects"); //get objectcopy of Processdata - dont forget to parse into main! 


async function autocontrol(){
    //first of all: collect some data! (e.g. current temperature & gradient)

        // //get temperatures and gradient
        // const temp1 = boiler.gettemp();
        // const time1 = performance.now();
        // const temp2 = await gettemp2();
        // const time2 = performance.now();
        // //with this, calculate gradient and save into data aray
        // ProcessData.gradient = ((temp2 - temp1) / (time2 - time1)) * 1000; //°C/s -> *1000 is to get rid of °C/ms
        // ProcessData.curtemp = temp2;
    
        //get recipee data

        //figure out - where we at? 

        //


}


function gettemp2(){
    new Promise((resolve, reject) =>{
        setTimeout(() => {
            boiler.gettemp(); //mesure second temperature after 10 seconds
            resolve(temp2);
        }, 20000);
    });
}













//run script every 30 seconds!
setInterval(() => {
    const controldata = autocontrol();
    process.send(controldata); // send data to app.js
  }, 30000);