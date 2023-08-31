const sqlite3 = require("sqlite3").verbose();

const recipe_db = {
  //=====================================================================================================properties
  db: null, //create db property wich can be catched by every method

  master_columns: [
    "name",
    "style",
    "stw",
    "abv",
    "yeast",
    "totboiltime",
    "mashvol",
    "spargevol",
  ],
  rests_columns: [
    "recipe_master_id",
    "restnumber",
    "name",
    "temperature",
    "duration",
  ],
  hops_columns: [
    "recipe_master_id",
    "hopnumber",
    "name",
    "alphaacid",
    "droptime",
    "weight",
  ],
  grist_columns: ["recipe_master_id", "name", "ebc", "weight"],

  limits: {
    masterdata: {
        stw: 80,
        abv: 30,
        totboiltime: 90,
        mashvol: 30,
        spargevol: 30
    },
    restdata: {
      temperature: 80,
      duration: 120
    },
    boildata: {
      alphaacid: 30,
      droptime: 90,
      weight: 100
    },
    gristdata: {
      ebc: 10000,
      weight: 10000
    },
  },

  //=====================================================================================================methods

  //connect & disconnect

  connect: function () {
    this.db = new sqlite3.Database(
      "./database/recipes.db",
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          return console.error(err.message);
        } else {
          //console.log("Connected to recipe_db");
        }
      }
    );
  },
  disconnect: function () {
    this.db.close((err) => {
      if (err) return console.error(err.message);
      //console.log("Disconnected from recipe_db");
    });
  },

  sqlQuery: function (sql, params, commandType) {
    return new Promise((resolve, reject) => {
      this.connect();

      let commandFn;
      switch (commandType) {
        case "get":
          commandFn = this.db.get;
          break;
        case "all":
          commandFn = this.db.all;
          break;
        case "run":
          commandFn = this.db.run;
          break;
        default:
          reject(new Error("Invalid command type"));
          return;
      }

      commandFn.call(this.db, sql, params, (err, result) => {
        this.disconnect();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  deleteMasterRows: async function (tableName, primaryKey, KeyValue) {
    try {
      // Create the DELETE query
      const query = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;

      // Execute the DELETE query
      await this.sqlQuery(query, KeyValue, "run");
      console.log(`Delete successful for table ${tableName}`);
    } catch (error) {
      console.error(`Error during delete from table ${tableName}: ${error}`);
    }
  },

  insertData: async function (tableName, values) {
    try {
      let columns = null;

      // Determine which columns to use based on the table name
      switch (tableName) {
        case "recipe_master":
          columns = this.master_columns;
          break;
        case "recipe_rests":
          columns = this.rests_columns;
          break;
        case "recipe_hops":
          columns = this.hops_columns;
          break;
        case "recipe_grist":
          columns = this.grist_columns;
          break;
      }

      // Create placeholders for the values
      const placeholders = values.map(() => "?").join(", ");
      // Create the INSERT query
      const query = `INSERT INTO ${tableName} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      // Execute the SQL query
      await this.sqlQuery(query, values, "run");
      console.log(`Insert into table ${tableName} successful.`);
    } catch (error) {
      console.error(`Error during insert into table ${tableName}: ${error}`);
    }
  },

  updateOrInsertRows: async function (
    tableName,
    selectedMasterdata,
    newData,
    primaryKey = "id",
    selectionkey = "recipe_master_id",
    fetchmethod = "all"
  ) {
    switch (tableName) {
      case "recipe_master":
        columns = this.master_columns;
        break;
      case "recipe_rests":
        columns = this.rests_columns;
        break;
      case "recipe_hops":
        columns = this.hops_columns;
        break;
      case "recipe_grist":
        columns = this.grist_columns;
        break;
    }

    try {
      // Fetch the current rows for the selectedMasterdata

      const query = `SELECT * FROM ${tableName} WHERE ${selectionkey} = ?`;
      const value = [selectedMasterdata];
      const currentRows = await this.sqlQuery(query, value, fetchmethod);

      // Determine how many rows to create, update, or delete
      const numRowsToUpdate = Math.min(currentRows.length, newData.length); // Update rows where data already exists
      const numRowsToCreate = newData.length - numRowsToUpdate; // Create new rows for additional data
      const numRowsToDelete = currentRows.length - numRowsToUpdate; // Delete excess rows

      // Update existing rows with new data
      for (let i = 0; i < numRowsToUpdate; i++) {
        const currentRow = currentRows[i];
        const updatedData = newData[i];

        // Create the SET clause for the SQL UPDATE statement
        const updateColumns = columns
          .filter((column) => column !== primaryKey) // Exclude the primary key from update
          .map((column) => `${column} = ?`) // Generate column = ? for each column
          .join(", "); // Join columns with a comma

        const query = `UPDATE ${tableName} SET ${updateColumns} WHERE ${primaryKey} = ?`;
        const values = [
          ...columns
            .filter((column) => column !== primaryKey)
            .map((column) => updatedData[column]),
          currentRow[primaryKey],
        ];

        // Execute the SQL UPDATE statement
        await this.sqlQuery(query, values, "run");
      }

      // Handle creation of new rows
      for (
        let i = numRowsToUpdate;
        i < numRowsToUpdate + numRowsToCreate;
        i++
      ) {
        const newRowData = newData[i];

        //prepare new Data:
        newRowData.recipe_master_id = selectedMasterdata; //new Row does not have a value for selectedMasterdata
        switch (tableName) {
          case "recipe_rests":
            newRowData.restnumber = i + 1;
            break;
          case "recipe_hops":
            newRowData.hopnumber = i + 1;
            break;
        }

        // Create arrays for columns and placeholders for the SQL INSERT statement
        const insertColumns = columns.join(", "); // List all columns
        const valuePlaceholders = columns.map(() => "?").join(", "); // Create placeholders for values

        const query = `INSERT INTO ${tableName} (${insertColumns}) VALUES (${valuePlaceholders})`;
        const values = columns.map((column) => newRowData[column]);

        // Execute the SQL INSERT statement for creating new rows
        await this.sqlQuery(query, values, "run");
      }

      // Handle deletion of excess rows
      for (
        let i = numRowsToUpdate + numRowsToCreate;
        i < numRowsToUpdate + numRowsToCreate + numRowsToDelete;
        i++
      ) {
        const rowToDelete = currentRows[i];

        const query = `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`;
        const value = [rowToDelete[primaryKey]];

        console.log(query, value);

        // Execute the SQL DELETE statement to remove excess rows
        await this.sqlQuery(query, value, "run");
      }

      console.log(`Update or insert successful for table ${tableName}`);
    } catch (error) {
      console.error(`Error during updateOrInsertRows: ${error}`);
    }
  },
};

module.exports = { recipe_db };
