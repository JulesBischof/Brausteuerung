const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { fork } = require("child_process");
const cors = require("cors");
const rpio = require('rpio');
const { setup, beep, servo, boiler, stirrer } = require("./src/brewcontrol/03-controlobjects.js")

// // Erlauben Sie Anfragen von Ihrem Vue.js-Client (zum Beispiel http://localhost:3000)
// const corsOptions = {
//   origin: "http://localhost:3000",
//   optionsSuccessStatus: 200, // Einige Legacy-Browser (IE11) benötigen das
// };
// app.use(cors(corsOptions)); // Verwenden Sie das cors-Middleware mit den angegebenen Optionen

rpio.init({ gpiomem: false }); // BCM-Modus aktivieren
boiler.open();
stirrer.open();
beep.open();
servo.open();
setup.GPIOdefaults();

//start childprocess and create eventemitter. Events get handled inside control-api router 
  const childProcessScriptPath = path.join(__dirname, './src/brewcontrol/02-autocontrol.js');
  const autoModeChild = fork(childProcessScriptPath);

//listen to incoming messages from childprocess
  autoModeChild.on('message', (message) => {
    console.log('server recieved data from childprocess: ', message);
  });
  module.exports = { autoModeChild };

//ab hier kommt Serverzeugs============================================================================================
app.use(express.json());

// Statische Dateien aus dem 'dist' Verzeichnis der Vue.js-Anwendung servieren
//app.use(express.static(path.join(__dirname, '../client/dist')));

//Routingfiles=======================================================================================================
const recipepanelAPI = require("./routes/01-recipepanelAPI");
const controlAPI = require("./routes/02-controlAPI");

//Routing==============================================================================================================
app.use("/recipepanelAPI", recipepanelAPI);
app.use("/controlAPI", controlAPI);

app.listen(5000, () => {
  console.log("Server is listening on Port 5000...");
});



// Überwachen Sie das 'exit'-Ereignis des Hauptprozesses
process.on('exit', () => {
  console.log('    express exits, kill autocontrol process! ');
  // Beenden Sie den Child-Prozess
  autoModeChild.kill();
  setup.GPIOdefaults();

  boiler.close();
  stirrer.close();
  beep.close();
  servo.close();

  console.log(" -------------> done")
});

// Stellen Sie sicher, dass der 'exit'-Handler vor dem Beenden des Servers ausgeführt wird (ctrl + c)
process.on('SIGINT', () => {
  process.exit(0); // Normalerweise sollte der Server hier beendet werden
});