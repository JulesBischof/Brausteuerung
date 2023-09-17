"use strict";
const { manualControl, setAutocontrolConfig } = require("../src/brewcontrol/01-handleorder.js");
const { autoModeChild } = require('../app.js');

const express = require("express");
const { setup } = require("../src/brewcontrol/03-controlobjects.js");
let router = express.Router();


//handle orders ###########################################################################################################################################################################
router
  // ____________________________________________________________________________________________________________________________________ GETSHIT
  .get("/", async (req, res) => {
    console.log("recieved poll request");

    // ask childprocess for data 
    const passData = {
      event: 'getProcessData',
    }
    autoModeChild.send(passData);

    autoModeChild.once('message', (message) => {
      res.status(200).send(message);
    });
  })
  // ____________________________________________________________________________________________________________________________________ PUTSHIT
  .put("/confirm", async (req, res) => {

    console.log("recieved confirmationrequest");
    // confirm childprocess
    if (req.body.confirmation) {
      const passData = {
        event: 'confirmation',
        confirmation: true
      }

      autoModeChild.send(passData);
      res.status(200).send(JSON.stringify({ message: "confirmation placed" }));
    } else {
      res.status(500).send(JSON.stringify({ message: "Internal server error (put/confim)" }));
    }

  })

  // ____________________________________________________________________________________________________________________________________ MANUALPOST 
  .post("/manual", async (req, res) => {

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ORDER START")
    console.log(req.body)
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ORDER END")

    try {
      await manualControl(req.body);
      res.status(200).send(JSON.stringify({ message: "manualorder successful" }));
    } catch (error) {
      console.error("Error in manualControl:", error);
      res.status(500).send(JSON.stringify({ message: "Internal server error (post/manual)" }));
    }
  })

  // ____________________________________________________________________________________________________________________________________ AUTOPOST
  .post("/auto", async (req, res) => {

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ORDER START")
    console.log(req.body)
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ORDER END")

    try {
      //fetch recipe from database and calc gradientfactor for all rests ->Y result is an Objekt with the properties: .gradientfactor(array) .recipe(array)
      const automodeconfig = await setAutocontrolConfig(req.body);

      //gather all relevant data together
      const passData = {
        event: 'order',
        order: req.body,
        config: automodeconfig, //config.recipe && config.gradientfactor
      }

      // pass everything down to child process
      autoModeChild.send(passData);

      res.status(200).send(JSON.stringify({ message: "autoorder successful" }));
    } catch (error) {
      console.error(error)
      res.status(500).send(JSON.stringify({ message: "Internal server error" }));
    }
  })

  // ____________________________________________________________________________________________________________________________________ AUTOPOST -- FromLog
  .post("/auto/FromLog", async (req, res) => {

    console.log("try starting from log");

    const logObject = setup.getFromLog();

    const order = {
      automode: true,
      selectedID: logObject.selectedID,
      brewmode: logObject.brewmode
    }

    try {
      //fetch recipe from database and calc gradientfactor for all rests ->Y result is an Objekt with the properties: .gradientfactor(array) .recipe(array)
      const automodeconfig = await setAutocontrolConfig(order);

      //gather all relevant data together
      const passData = {
        event: 'FromLog',
        order: order,
        config: automodeconfig, //config.recipe && config.gradientfactor
        leftmin: logObject.leftmin,
        toggle: logObject.timertoggle,
        step: logObject.step,
      }

      // pass everything down to child process
      autoModeChild.send(passData);

      res.status(200).send(JSON.stringify({ message: "autoorder successful" }));
    } catch (error) {
      console.error(error)
      res.status(500).send(JSON.stringify({ message: "Internal server error" }));
    }
  })

module.exports = router;
