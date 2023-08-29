"use strict";
const express = require("express");
let router = express.Router();

//import object to handle Database
const { recipe_db } = require("../database/01-db-object.js");

//==========================================================================================================================handle general-purpose incoming requests for specific id's
router
  .route("/:selected_id(\\d+)") //    (\\d+) makes sure that route only gets executed, if selecte_id has an numeric Value

  //____________________________________________________________________________________________________________________________________ DELETE request - user wants to delete something out of the database
  .delete(async (req, res) => {
    try {
      const selected_id = req.params.selected_id;

      await recipe_db.deleteMasterRows("recipe_master", "id", selected_id);
      await recipe_db.deleteMasterRows(
        "recipe_hops",
        "recipe_master_id",
        selected_id
      );
      await recipe_db.deleteMasterRows(
        "recipe_rests",
        "recipe_master_id",
        selected_id
      );
      await recipe_db.deleteMasterRows(
        "recipe_grist",
        "recipe_master_id",
        selected_id
      );

      res.json({ message: `Data ID ${selected_id} deleted.` });
    } catch (err) {
      res.status(500).send(err);
    }
  })

  // ____________________________________________________________________________________________________________________________________ GET request - something got selected -> send data to fill out recipepanel !!NOT DROPDOWN!!
  .get(async (req, res) => {
    const selected_id = req.params.selected_id;
    let res_array = []; //empty array to save row data

    try {
      //############################################################################################################## GET entries in recipe_master table
      res_array[0] = await recipe_db.sqlQuery(
        `SELECT * 
                                               FROM recipe_master 
                                               WHERE id = ?`,
        selected_id,
        "all"
      );
      //############################################################################################################## GET entries in recipe_rests table
      res_array[1] = await recipe_db.sqlQuery(
        `SELECT * 
                                              FROM recipe_rests 
                                              WHERE recipe_master_id = ?`,
        selected_id,
        "all"
      );

      //############################################################################################################## GET entries in recipe_hops table
      res_array[2] = await recipe_db.sqlQuery(
        `SELECT * 
                                              FROM recipe_hops 
                                              WHERE recipe_master_id = ?`,
        selected_id,
        "all"
      );

      //############################################################################################################## GET entries in recipe_grist table
      res_array[3] = await recipe_db.sqlQuery(
        `SELECT * 
                                              FROM recipe_grist 
                                              WHERE recipe_master_id = ?`,
        selected_id,
        "all"
      );

      res.status(200).json(res_array);
    } catch (err) {
      res.status(500).send(err);
    }
  })

  // ____________________________________________________________________________________________________________________________________ UPDATE request
  .put(async (req, res) => {
    try {
      // divide json package into pieces
      const selectedMasterdata = req.params.selected_id;
      const masterdata = req.body.master;
      const restdata = Object.values(req.body.rests);
      const boildata = Object.values(req.body.hops);
      const gristdata = Object.values(req.body.malts);

      console.log(
        "_____________________________________________recieved data START: "
      );
      console.log(
        "_____________________________________________SQLite method: UPDATE"
      );
      console.log("masterdata: ", masterdata);
      console.log("restdata: ", restdata);
      console.log("boildata: ", boildata);
      console.log("gristdata: ", gristdata);
      console.log(
        "_____________________________________________recieved data END"
      );

      await recipe_db.updateOrInsertRows(
        "recipe_master",
        selectedMasterdata,
        masterdata,
        "id",
        "id",
        "all"
      ); //function needs an array to work propery ;) [masterdata]
      await recipe_db.updateOrInsertRows(
        "recipe_rests",
        selectedMasterdata,
        restdata
      );
      await recipe_db.updateOrInsertRows(
        "recipe_hops",
        selectedMasterdata,
        boildata
      );
      await recipe_db.updateOrInsertRows(
        "recipe_grist",
        selectedMasterdata,
        gristdata
      );

      res.send("succes!!!");
    } catch (err) {
      console.log("something went wrong in put route: ", err);
      res.status(500).send(err);
    }
  });

//==========================================================================================================================handle incoming requests without an selected ID
router
  .route("/")
  //create new masterdata!
  .post(async (req, res) => {
    try {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> here is a new psot")
      // divide json package into pieces (turn Objects into Arrays)
      const masterdata = Object.values(req.body.master[0]);
      const restdata = Object.values(req.body.rests);
      const boildata = Object.values(req.body.hops);
      const gristdata = Object.values(req.body.malts);
      console.log(
        "_____________________________________________recieved data START: "
      );
      console.log("masterdata: ", masterdata);
      console.log("restdata: ", restdata);
      console.log("boildata: ", boildata);
      console.log("gristdata: ", gristdata);
      console.log(
        "_____________________________________________recieved data END"
      );

      console.log(
        "____________________________________________START insert data into databases"
      );
      // create entry in masterdata table
      await recipe_db.insertData("recipe_master", masterdata);

      // fetch new build masterdata-id (is needed for the other two tables)
      const SQL4id_res_Array = await recipe_db.sqlQuery(
        "SELECT MAX(id) AS id FROM recipe_master",
        [],
        "all"
      );
      const newMasterId = SQL4id_res_Array[0].id; //first entry contains id
      console.log("New Master_ID:", newMasterId);

      // create entries in restdata_db
      for (let index = 0; index < restdata.length; index++) {
        const restrow = restdata[index];
        const restNumber = index + 1;
        const values = [
          newMasterId,
          restNumber,
          restrow.name,
          restrow.temperature,
          restrow.duration,
        ];
        await recipe_db.insertData("recipe_rests", values);
        console.log("restinsert", restNumber, "successful!");
      }

      // create entries in boildata_db
      for (let index = 0; index < boildata.length; index++) {
        const hoprow = boildata[index];
        const hopNumber = index + 1;
        const values = [
          newMasterId,
          hopNumber,
          hoprow.name,
          hoprow.alphaacid,
          hoprow.droptime,
          hoprow.weight,
        ];
        await recipe_db.insertData("recipe_hops", values);
        console.log("hopsinsert ", hopNumber, " successful!");
      }

      // create entries in gristdata_db
      for (let index = 0; index < gristdata.length; index++) {
        const maltrow = gristdata[index];
        const maltNumber = index + 1;
        const values = [newMasterId, maltrow.name, maltrow.ebc, maltrow.weight];
        await recipe_db.insertData("recipe_grist", values);
        console.log("maltsinsert ", maltNumber, " successful!");
      }

      // send response to client
      res.json({
        destination: "recipe",
        msg: "new data insertion successful!",
      });
      console.log(
        "insert successful!________________________________________END"
      );
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send(err);
    }
  })

  //client asks for entries for its dropdown
  .get((req, res) => {
    recipe_db
      .sqlQuery("SELECT id, name FROM recipe_master", [], "all")
      .then((rows) => {
        res.status(200).json(rows);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          destination: "dropdown",
          msg: "Internal server error while getting data",
        });
      });
  });

module.exports = router;
