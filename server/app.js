const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { fork } = require('child_process');


//ab hier kommt Serverzeugs============================================================================================
app.use(express.json());
app.use(express.static('./public'))


//Routingfiles=======================================================================================================
const recipe = require("./routes/01-recipe")
const order = require("./routes/02-order")


//Routing==============================================================================================================

//use recipe.js File to handle endpoints starting with /recipe
app.use("/recipe", recipe); 

//use order.js File to handle endpoints starting with /order
app.use("/order", order); 



app.listen(5000, () => {
    console.log('Server is listening on Port 5000...');
}) 