const ds18b20 = require('ds18b20');
const Gpio = require('onoff').Gpio;
const sqlite3 = require('sqlite3').verbose();



//Kochtopf_________________________________________________________________________________
const boiler = {
//properties______________________________________
  heater: new Gpio(2, 'out'),
//methods_________________________________________
  on: function(){
    this.heater.writeSync(1);
  },

  off: function(){
    this.heater.writeSync(0);
  },

  gettemp: function (sensorId){
        return new Promise((resolve, reject) => {
            ds18b20.temperature(sensorId, (err,value) => {
                if(err){
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
      }
}

//Rührwerk__________________________________________________________________________________
const stirrer = {
//properties______________________________________
  outslow: new Gpio(3, 'out'),
  outfast: new Gpio(4, 'out'),
//methods_________________________________________
  stop: function(){
    this.outslow.writeSync(0);
    this.outfast.writeSync(0);
  },
  goslow: function(){
    this.outslow.writeSync(1);
    this.outfast.writeSync(0);
  },
  gofast: function(){
    this.outslow.writeSync(0);
    this.outfast.writeSync(1);

  }
}



//ProcessData_Data with defaults___________________________________________________________________________
const ProcessData = {
  //properties
    boiler: false,
    stirrer: 0,
    temperature: -99,
    gradient: -20,
    restname: "off",
    controlmode: "manual",
    boilermode: "brew",
    raspitemp: -99,
}


// const RecipeeDatabase {
//   //properties

//   //methods
// }

// const brewrecDatabase {
//   //properties

//   //methods
// }

// const boilrecDatabase {
//   //properties

//   //methods
// }











module.exports = {ProcessData, stirrer, boiler}

//#################################################################################################################### RecipeeData Handhabung

//#################################################################################################################### LogData Handhabung

//}
