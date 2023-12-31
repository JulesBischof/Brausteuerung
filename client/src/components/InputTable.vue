<template>
  <v-card>
    <v-card-actions>
      <v-btn @click="addItem"> <v-icon>mdi-plus</v-icon> Add </v-btn>
    </v-card-actions>
    <v-card-text>
      <div v-for="(item, index) in inputItems" :key="index">
        <v-row :key="'row_' + index">
          <!-- Key hier setzen -->
          <v-col v-for="(field, fieldIndex) in fields" :key="fieldIndex">
            <v-text-field
              v-model="item[field.name]"
              :label="field.label"
              @input="validateField(item, field, index)"
            ></v-text-field>
            <span>{{ getErrorMessage(index, field.name) }}</span>
          </v-col>
          <v-col>
            <v-btn @click="removeItem(index)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { FieldValidation } from "../Validation/FieldValidation.js";

export default {
  props: {
    fields: Array,
    modelValue: Array,
    dataName: String,
  },

  data() {
    return {
      errorMessages: [], // Ein Array von Objekten für Fehlermeldungen
      idCounter: 0,
      errorsCountArray: [], //Empty Array to count number of active validation error fields
    };
  },

  methods: {
    addItem() {
      const newItem = {};
      newItem.__id__ = this.idCounter++;
      this.fields.forEach((field) => {
        newItem[field.name] = "";
      });
      this.errorsCountArray.push({}); //new row to count existing errors
      this.errorMessages.push({}); // Ein neues leeres Objekt für die neue Zeile hinzufügen
      this.inputItems.push(newItem);
    },
    removeItem(index) {
      this.inputItems.splice(index, 1);
      this.errorMessages.splice(index, 1); // Fehlermeldung für die entfernte Zeile entfernen
    },

    validateField(item, field, rowIndex) {
      if (!this.errorsCountArray[rowIndex]) {
        this.errorsCountArray[rowIndex] = {};
      }

      this.$emit("validation", this.getSumOfValidationErrors());

      const fieldValue = item[field.name];
      const validator = new FieldValidation(
        field.name,
        this.dataName,
        field.inputType
      );
      const validationError = validator.validate(fieldValue);

      // Verwenden Sie das Array von Objekten, um Fehlermeldungen für jedes Feld zu speichern
      if (validationError) {
        this.errorMessages[rowIndex] = this.errorMessages[rowIndex] || {};
        this.errorMessages[rowIndex][field.name] = validationError.message;
        this.errorsCountArray[rowIndex][field.name] = 1;
      } else {
        if (
          this.errorMessages[rowIndex] &&
          this.errorMessages[rowIndex][field.name]
        ) {
          this.errorMessages[rowIndex][field.name] = "";
          this.errorsCountArray[rowIndex][field.name] = 0;
        }
      }
    },

    getErrorMessage(rowIndex, fieldName) {
      return this.errorMessages[rowIndex]
        ? this.errorMessages[rowIndex][fieldName]
        : "";
    },

    getSumOfValidationErrors() {
      let sum = 0;
      for (let i = 0; i < this.errorsCountArray.length; i++) {
        if (this.errorsCountArray[i]) {
          for (let j = 0; j < this.fields.length; j++) {
            const fieldName = this.fields[j].name;
            sum += this.errorsCountArray[i][fieldName] || 0;
          }
        }
      }
      return sum;
    },
  },

  computed: {
    inputItems: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
