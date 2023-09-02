const { recipe_db } = require("./database/01-db-object.js");


  class CheckRecipeArrayClass {
    constructor(incomingDataArray, dbColumns, limits) {
      this.incomingDataArray = incomingDataArray;
      this.limits = limits;

      //Validation does not neet dbColumns "recipe_master_id", "hopnumber", "restsnumber"
      this._APIelementsToRemove = ["id", "recipe_master_id", "restnumber", "hopnumber"];
      const cleanedColumnArray = dbColumns.filter((item) => !this._APIelementsToRemove.includes(item));
      this.dbColumns = cleanedColumnArray;

    }

    _CheckAPI() {
        const firstObject = this.incomingDataArray[0];
        const objectKeys = Object.keys(firstObject);

        // remove this.dbColumns, if there is a need for it
        const cleanedKeysArray = objectKeys.filter((item) => !this._APIelementsToRemove.includes(item));

        return JSON.stringify(cleanedKeysArray) === JSON.stringify(this.dbColumns);
      }
  
    _RowsGeneral(data) {
      for (const [key, value] of Object.entries(data)) {
        if (this._CheckForSpecialChars(value) || this._CheckForNullValue(value) || value < 0) {
          return false;
        }
      }
      return true;
    }
  
    _RowsCheckLimits(data) {
      const compObject = this.limits;
      for (const [key, value] of Object.entries(compObject)) {
        if (data[key] > value) {
          return false;
        }
      }
      return true;
    }
  
    _CheckForSpecialChars(string) {
      const regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|]/;
      return regex.test(string);
    }
  
    _CheckForNullValue(data) {
      return data == null;
    }
  
    IsValid() {
      return new Promise((resolve, reject) => {
        if (!this._CheckAPI()) {
          reject(new Error('ERROR: Validation_API bad request. API columns: ', this.dbColumns));
        }
  
        for (const value of this.incomingDataArray) {
          if (!this._RowsGeneral(value)) {
            reject(new Error(`ERROR: Validation_Corrupt input in ${JSON.stringify(value)}`));
          }
          if (!this._RowsCheckLimits(value)) {
            reject(new Error(`ERROR: Validation_Check limitations in ${JSON.stringify(value)}`));
          }
        }
        resolve();
      });
    }
  }
  


module.exports = { CheckRecipeArrayClass };