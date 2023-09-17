var ds18b20 = require('ds18b20');
const rpio = require('rpio');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Configuration:
const boilerGPIO = 35;
const stirrSlowGPIO = 38;
const stirrfastGPIO = 40;
const tempGPIO = 4;
const piezoGPIO = 36;
const servoGPIO = 12;
const SensorID_1 = '28-3c47045771fd';

// Boiler Control:
const boiler = {
  // Properties
  heater: boilerGPIO,

  // Methods
  open: function () {
    rpio.open(this.heater, rpio.OUTPUT);
    console.log("boiler pins opened")
  },

  close: function () {
    rpio.close(this.heater)
  },

  on: function () {
    rpio.write(this.heater, rpio.HIGH);
    this.state = true;
  },

  off: function () {
    rpio.write(this.heater, rpio.LOW);
    this.state = false;
  },

  readState: function () {
    this.open();
    if (rpio.read(this.heater) === rpio.HIGH) {
      return true;
    } else {
      return false;
    }
  },

  getSensorID: function () {
    ds18b20.sensors(function (err, ids) {
      if (err) {
        console.error("Error retrieving sensor IDs:", err);
      } else {
        console.log("Currently saved sensor IDs:", ids);
      }
    });
  },

  gettemp: function () {
    return new Promise((resolve, reject) => {
      ds18b20.temperature(SensorID_1, function (err, value) {
        if (err) {
          console.error("Error retrieving temperature:", err);
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },
};

// Stirrer Control:
const stirrer = {
  // Properties
  outslow: stirrSlowGPIO,
  outfast: stirrfastGPIO,

  // Methods
  open: function () {
    rpio.open(this.outslow, rpio.OUTPUT);
    rpio.open(this.outfast, rpio.OUTPUT);
    console.log("stirr pins opened")
  },

  close: function () {
    rpio.close(this.outslow)
    rpio.close(this.outfast)
  },

  stop: function () {
    rpio.write(this.outslow, rpio.LOW);
    rpio.write(this.outfast, rpio.LOW);
  },

  goslow: function () {
    rpio.write(this.outslow, rpio.HIGH);
    rpio.write(this.outfast, rpio.LOW);
  },

  gofast: function () {
    rpio.write(this.outslow, rpio.LOW);
    rpio.write(this.outfast, rpio.HIGH);
  },

  readState: function () {
    try {
      this.open();
      const slowState = rpio.read(this.outslow);
      const fastState = rpio.read(this.outfast);

      if (slowState === rpio.HIGH && fastState === rpio.LOW) {
        return 1;
      } else if (slowState === rpio.LOW && fastState === rpio.HIGH) {
        return 2;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error reading stirrer state:", error);
      return -1; // Error state
    }
  },

};

// Piezo Control:
const beep = {
  // Properties
  piezoPin: piezoGPIO,

  // Methods
  open: function () {
    rpio.open(this.piezoPin, rpio.OUTPUT);
  },

  close: function () {
    rpio.close(this.piezoPin)
  },

  short: function () {
    this.on();
    setTimeout(() => {
      this.off();
    }, 100);
  },

  long: function () {
    this.on();
    setTimeout(() => {
      this.off();
    }, 1000);
  },

  on: function () {
    rpio.open(this.piezoPin, rpio.OUTPUT, rpio.HIGH);
    setTimeout(() => {
      rpio.close(this.piezoPin);
    }, 1000);
  },

  off: function () {
    rpio.open(this.piezoPin, rpio.OUTPUT, rpio.LOW);
    setTimeout(() => {
      rpio.close(this.piezoPin);
    }, 1000);
  },
};

// Servo Control:
const servo = {
  pwmPin: servoGPIO,

  // Open PWM pin
  open: function () {
    rpio.open(this.pwmPin, rpio.PWM);
  },

  // Close PWM pin
  close: function () {
    rpio.close(this.pwmPin);
  },

  // Configure PWM parameters
  setupPWM: function () {
    const pwmFrequency = 50; // 50 Hz
    const pwmRange = 2000; // 1000 - 2000 Mikrosekunden
    rpio.pwmSetClockDivider(64); // Standardwert für 50 Hz PWM
    rpio.pwmSetRange(this.pwmPin, pwmRange);
  },

  // Move the servo to a specific position (in microseconds)
  moveToPosition: function (position) {
    rpio.pwmSetData(this.pwmPin, position);
  },

  // Example: Move the servo to the center position
  moveToCenter: function () {
    this.moveToPosition(1500); // Center position (1500 microseconds)
  },

  // Example: Move the servo to the start position
  moveToStart: function () {
    this.moveToPosition(250); // Start position (1000 microseconds)
  },

  // Methode für die Auskippbewegung
  flipOver: function () {
    this.moveToStart();
    setTimeout(() => {
      this.moveToPosition(1800);
      setTimeout(() => {
        this.moveToStart();
      }, 2000);
    }, 2000);
  },

};


// recipe handling ____________________________________________________________________________
const setup = {
  logpath: './src/brewcontrol/04-autocontrol-log.json',

  GPIOdefaults: function () {
    boiler.off();
    stirrer.stop();
    beep.off();
  },

  brewmode: function (recipe) {

    // get together what is needed to set up everything
    const gristdata = recipe[3];
    const restdata = recipe[1];
    const mashvol = recipe[0][0].mashvol;

    let kgMalt = 0;
    let gradfactor = [];

    // sum up all the malts weights
    for (let i = 0; i < gristdata.length; i++) {
      const row = gristdata[i];
      kgMalt += (row.weight / 1000);
    }

    // get Volume in mashpan
    const totalVolume = mashvol + kgMalt * 0.7;

    //calculate gradfactor for every resttemp
    for (let i = 0; i < restdata.length; i++) {
      const row = restdata[i];
      const s = (-0.06 * row.temperature + 6.29);
      gradfactor[i] = s * Math.pow(0.95, totalVolume);
    }

    //calculate the startup-delay (time until gradient gets positive after boiler got toggled)
    const startDelay = 0.06 * totalVolume + 0.42;

    //give back an object.. 
    const config = {
      gradientfactor: gradfactor,
      startupDelay: startDelay
    };

    //return everything!
    return config;

  },

  writeToLog(selectedID, step, timertoggle, leftmin, brewmode) {
    const currentTime = new Date();

    const dataToWrite = {
      selectedID: selectedID,
      brewmode: brewmode,
      step: step,
      timertoggle: timertoggle,
      leftmin: leftmin,
      lastTimeStamp: currentTime.getTime(),
    }

    const jsonData = JSON.stringify(dataToWrite, null, 2);

    fs.writeFile(this.logpath, jsonData, (error) => {
      if (error) {
        console.error('error write to log:', error);
      }
    });
  },

  getFromLog() {
    const currentTime = new Date();

    fs.readFile(this.logpath, 'utf8', (error, data) => {
      if (error) {
        console.error('Error reading log', error);
        return;
      }

      try {
        const logObject = JSON.parse(data);

      } catch (parseError) {
        console.error('Error parse log json', parseError);
      }

      if (logObject.timertoggle) {
        logobject.leftmin = logobject.leftmin - ((currentTime.getTime() - logobject.lastTimeStamp) / 60000) //subtract passed time from leftmintime, when timer was active. otherwise this is irrelevant 
      }
    });

  },

  deletelog() {
    fs.unlink(this.logpath, (error) => {
      if (error) {
        console.error('couldnt dele log', error);
        return;
      }
      console.log('log deleted');
    });
  }

}



module.exports = { beep, stirrer, boiler, setup, servo }