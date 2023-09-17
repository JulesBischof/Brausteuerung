const axios = require('axios');
const { boiler, stirrer, setup, beep, servo } = require("./03-controlobjects");
const { temperature } = require('ds18b20');

//START ProcessdataObject ====================================================================================================================
let processdata = {
  thermometer: {
    temperature: 0,
    gradient: 0,
  },
  datarow: {
    name: "not started yet",
    numberACTUAL: 0,
    numberALL: 0,
    temperature: 0,
    duration: 0,
    brewloopactive: false,
    boilloopactive: false,
  },
  timer: {
    leftmin: 0,
    toggle: false,
  },
  GPIO: {
    boiler: false,
    stirrer: false,
  },
  events: {
    message: String,
    trigger: String,
    confirmation: true,
  }
}
//END ProcessdataObject ====================================================================================================================



// decide what to do! 
process.on('message', (message) => {

  const event = message.event;
  let order;
  switch (event) {

    // _________________________________________________________________________________________________________________________ event = FromLog
    case 'FromLog':

      //safe logdata to processdata
      processdata.timer.toggle = message.toggle;
      processdata.timer.leftmin = messsage.leftmin;

      // autoControlAPI - post - request! 
      order = message.order;

      switch (order.brewmode) {

        case true: // order affects brewmode <<<<<<<<<==============================

          //get together relevant data
          const gradientfactor = message.config.gradientfactor;
          const recipe = message.config.recipe;
          const restdata = recipe[1]
          const startupDelay = message.config.startupDealy;
          //start loop
          Brewloop.start(restdata, gradientfactor, startupDelay, message.step);

          break;

        case false: // order affects boilmode <<<<<<<<<==============================

          startBoilLoop();
          break;
      }
      break;

    // _________________________________________________________________________________________________________________________ event = confirmation
    case 'confirmation':
      processdata.events.confirmation = true;

      servo.open();
      servo.setupPWM();
      servo.flipOver();

      console.log("IMHERE")
      // beep.short();

      break;

    // _________________________________________________________________________________________________________________________ event = getProcessData
    case 'getProcessData':
      // autoControlAPI - get - request!
      processdata.GPIO.stirrer = stirrer.readState();
      processdata.GPIO.boiler = boiler.readState();
      process.send(processdata);
      break;

    // _________________________________________________________________________________________________________________________ event = order
    case 'order':
      // autoControlAPI - post - request! 
      order = message.order;

      switch (order.brewmode) {

        case true: // order affects brewmode <<<<<<<<<==============================
          switch (order.automode) {

            case true: //start auto BREW
              //get together relevant data
              const gradientfactor = message.config.gradientfactor;
              const recipe = message.config.recipe;
              const restdata = recipe[1]
              const startupDelay = message.config.startupDealy;
              //start loop
              Brewloop.start(restdata, gradientfactor, startupDelay);
              break;

            case false: //stop auto BREW
              Brewloop.stop();
              break;
          }
          break;

        case false: // order affects boilmode <<<<<<<<<==============================
          switch (order.automode) {

            case true: //start auto BOIL
              startBoilLoop();
              break;

            case false: //stopp auto BOIL
              stopBoilLoop();
              break;
          }
          break;
      }
      break;

  }

})

//calctempLoop ################################################################################################################################### loop every few secs !!!!!!! ADD SENSOR FAILIURE HANDLING (e.g. not connected)
let previousTemperature = null;
let currentTemperature = null;
let gradient = 0;
const calcTempLoopIntervall = 5000; //measure temperature every xyz ms !

setInterval(() => {

  // get temperature!
  boiler.gettemp()
    .then(value => {
      currentTemperature = parseFloat(value);
    })
    .catch(error => {
      console.error(error); // log error
    });

  if (previousTemperature !== null) { //exclude the first run! (prevtemp = null)
    gradient = (((currentTemperature - previousTemperature) / (calcTempLoopIntervall / 1000)) * 60).toFixed(2); // round by 2

  };

  // now calculate the gradient
  previousTemperature = currentTemperature;
  processdata.thermometer.temperature = currentTemperature;
  processdata.thermometer.gradient = gradient;

}, calcTempLoopIntervall)







// timer #######################################################################################################################################

const timer = {

  timerintervall: 1000,
  intervalId: null,

  start(duration) {
    //set timerflag
    processdata.timer.toggle = true;
    //set leftmin to duration
    processdata.timer.leftmin = duration; //duration is in minutes, so is leftmin
    //loop here: 
    this.intervalId = setInterval(() => {
      //decrease leftmin by timerintervall
      processdata.timer.leftmin -= (this.timerintervall / 60000); //timerintervall is in milliseconds -> 60000 makes sure leftmin gets calculated in ms! 
      //cancelling of Intervall in other loop due to counting steps -> sorry for the spaghetti, I really regretti 
    }, this.timerintervall)
  },

  stop() {
    // if Flag is true -> clear timer
    if (processdata.timer.toggle) {
      clearInterval(this.intervalId);
      processdata.timer.leftmin = 0;
      processdata.timer.toggle = false;
    }
  }
}




// brewloop #######################################################################################################################################

const Brewloop = {
  start(restdata, gradientfactor, startupDelay, startfrom = 0, lasttimerpos = 0) {

    if (!processdata.brewloopactive) {
      processdata.brewloopactive = true;

      let step = startfrom;
      const loopInterval = setInterval(() => {

        // get actual temperature and target temperature
        const actualTemperature = processdata.thermometer.temperature;
        const targetTemperature = restdata[step].temperature;
        const actualgradientfactor = gradientfactor[step];

        // there are two modes: first is to heat up until next step, the next is to rest at one specific temperature. depends on the timer Flag! (if timer active, so rest is ;))
        switch (processdata.timer.toggle) {

          //false means -> heat up the soup!
          case false:
            if (actualTemperature <= (targetTemperature - (processdata.thermometer.gradient * actualgradientfactor))) {
              boiler.on();
            } else {
              //stop heating and wait until temperature fades into targettemparea (area is 0.5 degree before we would hit that point)
              boiler.off();
              if (actualTemperature >= targetTemperature - 0.5) {
                // souuu were there! start Timer
                timer.start(restdata[step].duration);
                // beep -> just because
                beep.short();
                if (step === 0) {
                  processdata.events.confirmation = false;
                  processdata.events.event = "maltRequired";
                  processdata.events.message = "please fill malt into the mashpan and confirm";
                }
              }
            }
            break;

          //true means -> chill I wanna rest ;)
          case true:
            //check temperature! 
            if (actualTemperature <= (targetTemperature - 0.25)) { // control range +- 0.5°C
              boiler.on();
            } else {
              boiler.off();
            }

            if (processdata.events.confirmation) { //only do shit when confirmation is there -> soooooo we make sure user put malt into the boiler
              //alright - now check the time!
              if (processdata.timer.leftmin <= startupDelay) {
                // when leftmin gets lower than the startupDelay start to heat up the soup again! 
                boiler.on();
                // When timer.leftmin reaches 0 go one stop forward
                if (processdata.timer.leftmin <= 0) {
                  timer.stop(); //this sets back toogle as well
                  // count steps
                  step++;
                  // beep -> just because
                  beep.short();
                }
              }
            }
            break;
        }

        // fill out processdata.datarow for our lovely client
        processdata.datarow.name = restdata[step].name;
        processdata.datarow.numberACTUAL = step + 1;
        processdata.datarow.numberALL = restdata.length;
        processdata.datarow.temperature = restdata[step].temperature;
        processdata.datarow.duration = restdata[step].duration;

        // we reached the end of the recipe
        if (step >= restdata.length) {
          beep.long();
          // send shit to client
          console.log("Brewmode is over -> Hell yeah go to lautering dude! ");
          processdata.events.message = "Brewmode over! ";
          processdata.events.trigger = "brewModeEnd";

          //end this loop
          this.stop();
        }


        console.log("ProcessControl______________________________________________ ")

        console.log("targettemperature ", targetTemperature)
        console.log("actualTemperature ", actualTemperature)
        console.log("processdata.gradient ", processdata.thermometer.gradient)

        console.log("step:", step)
        console.log("leftmin:", processdata.timer.leftmin)
        console.log("toggle:", processdata.timer.toggle)



        // Quit Loop when brewmode gets canceled
        if (!processdata.brewloopactive) {
          clearInterval(loopInterval);
          console.log("brewmode QUIT.");
        }

        // write savegame to logfile
        setup.writeToLog(restdata[step].recipe_master_id, step, processdata.timer.toggle, processdata.timer.leftmin, true);

      }, 1000); // Beispielhaft alle 1 Sekunde
    }
  },


  stop() {
    processdata.brewloopactive = false;
  }
}



//boilloop #######################################################################################################################################

const boilloop = {
  start: async function (boildata, startfrom = 0) {
    if (!processdata.boilloopactive) {
      processdata.boilloopactive = true;

      let step = startfrom;
      let beepflag = flase;

      const actualTemperature = processdata.thermometer.temperature;
      processdata.events.message = "heating up";

      if (actualTemperature >= 97) { //start loop when temperature reached 97 degree
        processdata.events.message = "reached boiltemperature";

        const loopInterval = setInterval(() => {

          //get current droptime!
          const droptime = boildata[step].duration;
          timer.start(droptime);

          //check for leftmin! -> prewarning 1 minute before droptime
          if (leftmin <= 1 && !beepflag) {
            beep.short();
            beepflag = true;
          }
          //check for end of timer!!
          if (leftmin <= 0.1) {
            beep.long();
            servo.flipOver();
            beepflag = false;
            step++;
          }

          //quit automode when all timers were run threw
          if (step >= boildata.length) {

            console.log("Boilmode is over -> congrats to your new Beer ;) ")
            processdata.events.message = "Boilmode over!"
            processdata.events.trigger = "boilModeEnd"

            this.stop();
          }



          console.log("ProcessControl______________________________________________ ")

          console.log("actualTemperature ", actualTemperature)

          console.log("step:", step)
          console.log("leftmin:", processdata.timer.leftmin)


          if (!processdata.boilloopactive) {
            clearInterval(loopInterval); // QUIT loop
            console.log("brewmode QUIT.");
          }
        }, 1000); // Beispielhaft alle 1 Sekunde
      }
    }
  },

  stop: function () {
    processdata.boilloopactive = false;
  }
};