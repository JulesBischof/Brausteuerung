"use strict";
const express = require("express");
let router = express.Router();

//functions that handles incoming orders
// const {handleorder, startAutoControl} = require('../brewcontrol/01-handleorder.js');

let order = {};

//handle orders
router.route("/").post((req, res) => {
  let order = req.body;
  // handleorder(order);
  res.send(JSON.stringify(order));
});

module.exports = router;
