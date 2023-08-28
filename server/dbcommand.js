const {stirrer, boiler} = require('./brewcontrol/03-controlobjects.js');

const sqlite3 = require('sqlite3').verbose();


//Hier sind so ein paar Befehle aufgelistet - als Steuerung für die Datenbank. einfach entsprechend ein oder auskommentieren





//connect do DB=========================================================================================================================================

const db  =new sqlite3.Database("./brewcontrol/brewdata.db", sqlite3.OPEN_READWRITE, (err) => {
    console.log("cVerbindung aufgebaut");
    if(err) return console.error(err.message);
});


//create table===========================================================================================================================================

//fill in names!! 

// sql = 'CREATE TABLE recipees(id, name, style)';
// db.run(sql);

// sql = 'CREATE TABLE brewdata(id, recipee_id, restname, resttemp, resttime)';
// db.run(sql);

// sql = 'CREATE TABLE boildata(id, recipee_id, hopsname, boilfor, boildurgen)';
// db.run(sql);




//Check for Tables of any type==========================================================================================================================

// const sql = "SELECT name FROM sqlite_master WHERE type='table'";
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     const tableNames = rows.map(row => row.name);
//     console.log(tableNames); // Array der Tabellennamen
//   }
// });






//INSERT DATA===========================================================================================================================================
//bspprocessdata
// sql = 'INSERT INTO processdata(id, temp, gradient, timer, restname, stirrspeed, boilerstatus, mode, raspitemp) VALUES (?,?,?,?,?,?,?,?)';
// db.run(sql,[40, 58, "maltose", 2, "on", "45°"],
// (err) => {if(err) return console.error(err.message);}); //seltsame syntax, hilft aber beim Ausfüllen. 



//Auslesen der gesamten Datenbank========================================================================================================================

// sql = 'SELECT * FROM processdata';
// db.all(sql, [], (err, rows) => {
//    if(err) return console.error(err.message);
//    rows.forEach(rows => {
//        console.log(rows);
//    })
// })





//Drop table
//db.run("DROP TABLE processdata")




// close con to DB=========================================================================================================================================
db.close((err) => {
    if (err) return console.error(err.message);
    console.log("Datenbankverbindung geschlossen");
  });