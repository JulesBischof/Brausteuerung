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
      spargevol: 30,
    },
    restdata: {
      temperature: 80,
      duration: 120,
    },
    boildata: {
      alphaacid: 30,
      droptime: 90,
      weight: 100,
    },
    gristdata: {
      ebc: 10000,
      weight: 10000,
    },
  },
};

class dbHandlerClass {
  constructor(newDataArray, tableName, groupKey, columns, MasterIdValue) {
    this._newDataArray = newDataArray;
    this._tableName = tableName;
    this._groupKey = groupKey;
    this._columns = columns;
    this.MasterIdValue = MasterIdValue;
  }

  _connect() {
    this.db = new sqlite3.Database(
      `./src/database/recipes.db`,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          return console.error(err.message);
        }
      }
    );
  }

  _disconnect() {
    this.db.close((err) => {
      if (err) return console.error(err.message);
    });
  }

  _sqlQuery(sql, params, commandType) {
    return new Promise((resolve, reject) => {
      this._connect();
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
        this._disconnect();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // get Dropdown Entries
  async getEntries() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${this._tableName} WHERE ${this._groupKey} = ${this.MasterIdValue}`;
      const value = [];
      this._sqlQuery(query, value, "all")
        .then((res) => {
          console.log(res);
          resolve(res);
        })
        .catch((err) => {
          console.error("Error while getting entries: ", err);
          reject(err);
        });
    });
  }

  //Delete data defined by groupkey
  async deleteMasterRows() {
    try {
      // Create the DELETE query
      const query = `DELETE FROM ${this._tableName} WHERE ${this._groupKey} = ?`;

      // Execute the DELETE query
      await this._sqlQuery(query, this.MasterIdValue, "run");
      console.log(
        `Delete successful from table ${this._tableName} entry ${this.MasterIdValue}`
      );
    } catch (error) {
      console.error(
        `Error during delete from table ${this._tableName}: ${error}`
      );
    }
  }

  async insertDataArray() {
    // prepare Data: dataArray gets properties {[columns], count, selectedmasterId} in every row
    for (let i = 0; i < this._newDataArray.length; i++) {
      const data = this._newDataArray[i];
      data.recipe_master_id = this.MasterIdValue; // New Row does not have a value for selectedMasterdata
      //add count value for rests/hops in every row
      switch (this._tableName) {
        case "recipe_rests":
          data.restnumber = i + 1;
          break;
        case "recipe_hops":
          data.hopnumber = i + 1;
          break;
      }
      //insert Row:
      const insertValues = this._columns.map((column) => data[column]); // build values Array
      const valuePlaceholders = this._columns.map(() => "?").join(", "); // Create placeholders for values
      const insertQuery = `INSERT INTO ${this._tableName} (${this._columns.join(
        ", "
      )}) VALUES (${valuePlaceholders})`;

      await this._sqlQuery(insertQuery, insertValues, "run");
      console.log(`${this._tableName} - new insert succesful!`);
    }
  }

  // async insertRowData() {
  //   try {
  //     // Create placeholders for the values
  //     const placeholders = _newDataArray.map(() => "?").join(", ");
  //     // Create the INSERT query
  //     const query = `INSERT INTO ${this._tableName} (${this._columns.join(
  //       ", "
  //     )}) VALUES (${placeholders})`;
  //     // Execute the SQL query
  //     await this._sqlQuery(query, _newDataArray, "run");
  //     console.log(`Insert into table ${this._tableName} successful.`);
  //   } catch (error) {
  //     console.error(
  //       `Error during insert into table ${this._tableName}: ${error}`
  //     );
  //   }
  // }

  async fetchMaxId() {
    return new Promise((resolve, reject) => {
      this._sqlQuery(`SELECT MAX(id) AS id FROM ${this._tableName}`, [], "all")
        .then((res) => {
          const maxId = res[0].id; // First entry contains id
          resolve(maxId);
        })
        .catch((err) => {
          reject(new Error("Error during fetch max id: " + err)); //
        });
    });
  }

  async updateOrInsertRows(primaryKey = "id") {
    try {
      // Fetch the current rows for the MasterIdValue
      const query = `SELECT * FROM ${this._tableName} WHERE ${this._groupKey} = ?`;
      const value = [this.MasterIdValue];
      const currentRows = await this._sqlQuery(query, value, "all");

      // Determine how many rows to create, update, or delete
      const numRowsToUpdate = Math.min(currentRows.length, this._newDataArray.length); // Update rows where data already exists
      const numRowsToCreate = this._newDataArray.length - numRowsToUpdate; // Create new rows for additional data
      const numRowsToDelete = currentRows.length - numRowsToUpdate; // Delete excess rows

      // Update existing rows with new data
      for (let i = 0; i < numRowsToUpdate; i++) {
        const currentRow = currentRows[i];
        const updatedData = this._newDataArray[i];

        // Create the SET clause for the SQL UPDATE statement
        const updateColumns = this._columns
          .filter((column) => column !== primaryKey) // Exclude the primary key from update
          .map((column) => `${column} = ?`) // Generate column = ? for each column
          .join(", "); // Join columns with a comma

        const updateQuery = `UPDATE ${this._tableName} SET ${updateColumns} WHERE ${primaryKey} = ?`;
        const updateValues = [
          ...this._columns
            .filter((column) => column !== primaryKey)
            .map((column) => updatedData[column]),
          currentRow[primaryKey],
        ];

        // Execute the SQL UPDATE statement
        await this._sqlQuery(updateQuery, updateValues, "run");
      }

      // Handle creation of new rows
      for (
        let i = numRowsToUpdate;
        i < numRowsToUpdate + numRowsToCreate;
        i++
      ) {
        const newRowData = this._newDataArray[i];

        // Prepare new Data:
        newRowData.recipe_master_id = this.MasterIdValue; // New Row does not have a value for MasterIdValue
        switch (this._tableName) {
          case "recipe_rests":
            newRowData.restnumber = i + 1;
            break;
          case "recipe_hops":
            newRowData.hopnumber = i + 1;
            break;
        }

        // Create arrays for columns and placeholders for the SQL INSERT statement
        const insertColumns = this._columns.join(", "); // List all columns
        const valuePlaceholders = this._columns.map(() => "?").join(", "); // Create placeholders for values

        const insertQuery = `INSERT INTO ${this._tableName} (${insertColumns}) VALUES (${valuePlaceholders})`;
        const insertValues = this._columns.map((column) => newRowData[column]);

        // Execute the SQL INSERT statement for creating new rows
        await this._sqlQuery(insertQuery, insertValues, "run");
      }

      // Handle deletion of excess rows
      for (
        let i = numRowsToUpdate + numRowsToCreate;
        i < numRowsToUpdate + numRowsToCreate + numRowsToDelete;
        i++
      ) {
        const rowToDelete = currentRows[i];

        const deleteQuery = `DELETE FROM ${this._tableName} WHERE ${primaryKey} = ?`;
        const deleteValue = [rowToDelete[primaryKey]];

        // Execute the SQL DELETE statement to remove excess rows
        await this._sqlQuery(deleteQuery, deleteValue, "run");
      }

      console.log(`Update or insert successful for table ${this._tableName}`);
    } catch (error) {
      console.error(`Error during updateOrInsertRows: ${error}`);
    }
  }
}

module.exports = { recipe_db, dbHandlerClass };
