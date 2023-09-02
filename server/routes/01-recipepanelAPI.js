"use strict";
const express = require("express");
let router = express.Router();

//import object to handle Database
const {
  recipe_db,
  dbHandlerClass,
} = require("../src/database/01-db-object.js");
//import Validation class
const { CheckRecipeArrayClass } = require("../src/00-Validation.js");
const { Command } = require("concurrently");

//==========================================================================================================================handle general-purpose incoming requests for specific id's
router
  .route("/:selected_id(\\d+)") //    (\\d+) makes sure that route only gets executed, if selecte_id has an numeric Value

  //____________________________________________________________________________________________________________________________________ DELETE request - user wants to delete something out of the database
  .delete(async (req, res) => {
    try {
      const selected_id = req.params.selected_id;
      console.log("delete request on ID ", selected_id);

      // Create Objects to handle DB commands
      const masterdbHandler = new dbHandlerClass(
        null,
        "recipe_master",
        "id",
        null,
        selected_id
      );
      const restdbHandler = new dbHandlerClass(
        null,
        "recipe_hops",
        "recipe_master_id",
        null,
        selected_id
      );
      const boildbHandler = new dbHandlerClass(
        null,
        "recipe_rests",
        "recipe_master_id",
        null,
        selected_id
      );
      const gristdbHandler = new dbHandlerClass(
        null,
        "recipe_grist",
        "recipe_master_id",
        null,
        selected_id
      );

      // Perform deletions using Promise.all
      await Promise.all([
        masterdbHandler.deleteMasterRows(),
        restdbHandler.deleteMasterRows(),
        boildbHandler.deleteMasterRows(),
        gristdbHandler.deleteMasterRows(),
      ]);

      res.json({ msg: `Data ID ${selected_id} deleted.` });
    } catch (err) {
      res.status(500).send(err);
    }
  })

  // ____________________________________________________________________________________________________________________________________ GET request - something got selected -> send data to fill out recipepanel !!NOT DROPDOWN!!
  .get(async (req, res) => {
    const selected_id = req.params.selected_id;
    console.log("get request on ID ", selected_id);

    const res_array = []; // Array zum Speichern der Daten

    // Erstellen Sie Objekte zur Verarbeitung von DB-Befehlen
    const masterdbHandler = new dbHandlerClass(
      null,
      "recipe_master",
      "id",
      recipe_db.master_columns,
      selected_id
    );
    const restdbHandler = new dbHandlerClass(
      null,
      "recipe_rests",
      "recipe_master_id",
      recipe_db.rests_columns,
      selected_id
    );
    const boildbHandler = new dbHandlerClass(
      null,
      "recipe_hops",
      "recipe_master_id",
      recipe_db.hops_columns,
      selected_id
    );
    const gristdbHandler = new dbHandlerClass(
      null,
      "recipe_grist",
      "recipe_master_id",
      recipe_db.grist_columns,
      selected_id
    );

    try {
      // use promise.all to get all entries
      const results = await Promise.all([
        await masterdbHandler.getEntries(),
        await restdbHandler.getEntries(),
        await boildbHandler.getEntries(),
        await gristdbHandler.getEntries(),
      ]);

      // put entries into response array
      res_array[0] = results[0];
      res_array[1] = results[1];
      res_array[2] = results[2];
      res_array[3] = results[3];

      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>> respone array:", res_array);
      res.status(200).json(res_array);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  })

  // ____________________________________________________________________________________________________________________________________ UPDATE request
  .put(async (req, res) => {
    try {
      // Divide the JSON package into pieces
      const selectedMasterdata = req.params.selected_id;
      const masterdata = req.body.master;
      const restdata = Object.values(req.body.rests);
      const boildata = Object.values(req.body.hops);
      const gristdata = Object.values(req.body.malts);

      console.log("put request on ID ", selectedMasterdata);

      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> received data START: "
      );
      console.log("masterdata: ", masterdata);
      console.log("restdata: ", restdata);
      console.log("boildata: ", boildata);
      console.log("gristdata: ", gristdata);
      console.log(
        "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< received data END"
      );

      // Validation
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Validation START: "
      );

      const validationPromises = [
        new CheckRecipeArrayClass(
          masterdata,
          recipe_db.master_columns,
          recipe_db.limits.masterdata
        ).IsValid(),

        new CheckRecipeArrayClass(
          restdata,
          recipe_db.rests_columns,
          recipe_db.limits.restdata
        ).IsValid(),

        new CheckRecipeArrayClass(
          boildata,
          recipe_db.hops_columns,
          recipe_db.limits.boildata
        ).IsValid(),

        new CheckRecipeArrayClass(
          gristdata,
          recipe_db.grist_columns,
          recipe_db.limits.gristdata
        ).IsValid(),
      ];

      await Promise.all(
        validationPromises.map((promise) =>
          promise.catch((err) => {
            throw err; // To prevent subsequent steps
          })
        )
      );

      console.log("Validation OK");

      // Create Objects to handle DB commands
      const masterdbHandler = new dbHandlerClass(
        masterdata,
        "recipe_master",
        "id",
        recipe_db.master_columns,
        selectedMasterdata
      );
      const restdbHandler = new dbHandlerClass(
        boildata,
        "recipe_hops",
        "recipe_master_id",
        recipe_db.hops_columns,
        selectedMasterdata
      );
      const boildbHandler = new dbHandlerClass(
        restdata,
        "recipe_rests",
        "recipe_master_id",
        recipe_db.rests_columns,
        selectedMasterdata
      );
      const gristdbHandler = new dbHandlerClass(
        gristdata,
        "recipe_grist",
        "recipe_master_id",
        recipe_db.grist_columns,
        selectedMasterdata
      );

      // Update or Insert Rows using Promise.all
      await Promise.all([
        masterdbHandler.updateOrInsertRows(),
        restdbHandler.updateOrInsertRows(),
        boildbHandler.updateOrInsertRows(),
        gristdbHandler.updateOrInsertRows(),
      ]).catch((err) => {
        throw err;
        return;
      });

      res.status(200).send({ msg: "Update successful" });
    } catch (err) {
      console.log("Something went wrong in the PUT route: ", err);
      res.status(500).send(err);
    }
  });

//==========================================================================================================================handle incoming requests without an selected ID
router
  .route("/")
  //create new masterdata!
  .post(async (req, res) => {
    console.log("put request new recipe");

    try {
      const masterdata = Object.values(req.body.master);
      const restdata = Object.values(req.body.rests);
      const boildata = Object.values(req.body.hops);
      const gristdata = Object.values(req.body.malts);

      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> received data START: "
      );
      console.log("masterdata: ", masterdata);
      console.log("restdata: ", restdata);
      console.log("boildata: ", boildata);
      console.log("gristdata: ", gristdata);
      console.log(
        "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< received data END"
      );

      // Validation
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Validation START: "
      );

      const validationPromises = [
        new CheckRecipeArrayClass(
          masterdata,
          recipe_db.master_columns,
          recipe_db.limits.masterdata
        ).IsValid(),

        new CheckRecipeArrayClass(
          restdata,
          recipe_db.rests_columns,
          recipe_db.limits.restdata
        ).IsValid(),

        new CheckRecipeArrayClass(
          boildata,
          recipe_db.hops_columns,
          recipe_db.limits.boildata
        ).IsValid(),

        new CheckRecipeArrayClass(
          gristdata,
          recipe_db.grist_columns,
          recipe_db.limits.gristdata
        ).IsValid(),
      ];

      await Promise.all(
        validationPromises.map((promise) =>
          promise.catch((err) => {
            res.status(500).json({ msg: "Validation failed", error: err });
            throw err; // To prevent subsequent steps
          })
        )
      );

      console.log("Validation OK");

      // Insert data into the database

      const masterdbHandler = new dbHandlerClass(
        masterdata,
        "recipe_master",
        "id",
        recipe_db.master_columns,
        null
      );

      await masterdbHandler.insertDataArray().catch((err) => {
        res.status(500).json({ msg: "master insert failed", error: err });
        throw err; // To prevent subsequent steps
      });

      const newMasterId = await masterdbHandler.fetchMaxId().catch((err) => {
        console.log(err);
        throw err; // To prevent subsequent steps
      });

      const restdbHandler = new dbHandlerClass(
        boildata,
        "recipe_hops",
        "recipe_master_id",
        recipe_db.hops_columns,
        newMasterId
      );
      const boildbHandler = new dbHandlerClass(
        restdata,
        "recipe_rests",
        "recipe_master_id",
        recipe_db.rests_columns,
        newMasterId
      );
      const gristdbHandler = new dbHandlerClass(
        gristdata,
        "recipe_grist",
        "recipe_master_id",
        recipe_db.grist_columns,
        newMasterId
      );

      // Create entries in the database
      await Promise.all([
        restdbHandler.insertDataArray().catch((err) => {
          res.status(500).json({ msg: "restData insert failed", error: err });
          throw err; // To prevent subsequent steps
        }),

        boildbHandler.insertDataArray().catch((err) => {
          res.status(500).json({ msg: "boildata insert failed", error: err });
          throw err; // To prevent subsequent steps
        }),

        gristdbHandler.insertDataArray().catch((err) => {
          res.status(500).json({ msg: "gristdata insert failed", error: err });
          throw err; // To prevent subsequent steps
        }),
      ]);

      // Everything went well -> send a response to the client
      res.json({
        msg: "new data insertion successful!",
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send(err);
    }
  })

  //client asks for entries for its dropdown
  .get((req, res) => {
    console.log("get request recipe form");

    // create Objects to handle DB commands
    const masterdbHandler = new dbHandlerClass(
      null,
      "recipe_master",
      "id",
      recipe_db.master_columns,
      null
    );
    masterdbHandler
      ._sqlQuery("SELECT id, name FROM recipe_master", [], "all")
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
