const {ProcessData, stirrer, boiler} = require('./brewcontrol/controlobjects.js'); //getobjects
const { calcgradient } = require('./functionsmethod.js'); //method for different functions





setIntervall(getdata, 30000); //Abfrage alle 30 sekunden ausführen -> das ist länger als für die Berechnung des Gradienten benötigt wird. 


function getdata () {
calcgradient()
    .then((res) => {
        const currenttemp = res[0]; //last saved temperature is saved in res array
        const gradient = [1];
        //Werte in Datenbank schreiben
        ProcessData.connect();
            ProcessData.update(temp, currenttemp);
        ProcessData.disconnect();})
    .catch((err => {
        console.log("something went wrong during calculate gradient");
    }));
};

