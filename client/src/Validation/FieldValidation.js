import { validationLimits as data } from './validationLimitsImport.js';


export class FieldValidation {
  constructor(fieldName, table, InputType) {
    this._limits = data[table][fieldName];
    this._InputType = InputType;
    this._fieldname = fieldName;
  }

  validate(value) {
    try {
      // First, check if the input type is correct
      const valuetype = this._isNumber(value);

      switch (this._InputType) {
        case "number":
          if (!valuetype) {
            throw new Error("Only numbers are allowed.");
          }
          break;
        case "text":
          if (valuetype) {
            throw new Error("Only text is allowed.");
          }
          break;
      }

      // Check if the maximum length is within the range
      if ('maxLength' in this._limits) {
        if (value.length > this._limits.maxLength) {
          throw new Error(`Only ${this._limits.maxLength} characters are allowed!`);
        }
      }

      // Check if the value is within the specified range
      if ('minValue' in this._limits && valuetype) {
        if (value < this._limits.minValue) {
          throw new Error(`Value ${this._fieldname} must be bigger than ${this._limits.minValue}!`);
        }
      }

      if ('maxValue' in this._limits && valuetype) {
        if (value > this._limits.maxValue) {
          throw new Error(`Value ${this._fieldname} must be less than ${this._limits.maxValue}!`);
        }
      }

      return null; // If validation is successful
    } catch (err) {
      return err; // If an error occurs
    }
  }

  _isNumber(value) {
    if (typeof value === 'number' && !isNaN(value)) {
      return true; // true if it's a real number
    }
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return true; // true if it's a number inside a string
    }
    return false; // false if letters are present
  }
}