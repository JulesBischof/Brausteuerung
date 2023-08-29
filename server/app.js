const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { fork } = require("child_process");
const cors = require("cors");

// Erlauben Sie Anfragen von Ihrem Vue.js-Client (zum Beispiel http://localhost:3000)
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // Einige Legacy-Browser (IE11) benötigen das
};
app.use(cors(corsOptions)); // Verwenden Sie das cors-Middleware mit den angegebenen Optionen

//ab hier kommt Serverzeugs============================================================================================
app.use(express.json());

//Routingfiles=======================================================================================================
const recipepanelAPI = require("./routes/01-recipepanelAPI");
const order = require("./routes/02-order");

//Routing==============================================================================================================

//use recipe.js File to handle endpoints starting with /recipe
app.use("/recipepanelAPI", recipepanelAPI);

//use order.js File to handle endpoints starting with /order
app.use("/order", order);

app.listen(5000, () => {
  console.log("Server is listening on Port 5000...");
});
