const { recipe_db } = require("./database/01-db-object.js");


  class CheckRecipeArrayClass {
    constructor(incomingDataArray, dbColumns, limits) {
      this.incomingDataArray = incomingDataArray;
      this.dbColumns = dbColumns;
      this.limits = limits;
    }
  
    _CheckAPI() {
        const firstObject = this.incomingDataArray[0];
        const objectKeys = Object.keys(firstObject);
        // Check, if objectKeys matches with dbColumns
        return JSON.stringify(objectKeys) === JSON.stringify(this.dbColumns);
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
          reject(new Error('API bad request'));
        }
  
        for (const value of this.incomingDataArray) {
          if (!this._RowsGeneral(value)) {
            reject(new Error(`ERROR: Corrupt input in ${JSON.stringify(value)}`));
          }
          if (!this._RowsCheckLimits(value)) {
            reject(new Error(`ERROR: Check limitations in ${JSON.stringify(value)}`));
          }
        }
        resolve();
      });
    }
  }
  


module.exports = { CheckRecipeArrayClass };