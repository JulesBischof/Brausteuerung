<template>
  <v-card>
    <v-container>
      <h1 class="Title">{{ title }}</h1>
    </v-container>
    <v-card-actions>
      <v-btn @click="addItem"> <v-icon>mdi-plus</v-icon> Add </v-btn>
    </v-card-actions>
    <v-card-text>
      <div v-for="(item, index) in inputItems" :key="index">
        <v-row :key="'row_' + index"> <!-- Key hier setzen -->
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
    title: String,
    modelValue: Array,
    dataName: String,
  },

  data() {
    return {
      errorMessages: [], // Ein Array von Objekten für Fehlermeldungen
      idCounter: 0,
    };
  },

  methods: {
    addItem() {
      const newItem = {};
      newItem.__id__ = this.idCounter++;
      this.fields.forEach((field) => {
        newItem[field.name] = "";
      });
      this.errorMessages.push({}); // Ein neues leeres Objekt für die neue Zeile hinzufügen
      this.inputItems.push(newItem);
    },
    removeItem(index) {
      this.inputItems.splice(index, 1);
      this.errorMessages.splice(index, 1); // Fehlermeldung für die entfernte Zeile entfernen
    },

    validateField(item, field, rowIndex) {
      const fieldValue = item[field.name];
      const validator = new FieldValidation(
        field.name,
        this.dataName,
        field.inputType
      );
      const validationError = validator.validate(fieldValue);

      // Verwenden Sie das Array von Objekten, um Fehlermeldungen für jedes Feld zu speichern
      if (validationError) {
        if (!this.errorMessages[rowIndex]) {
          this.errorMessages[rowIndex] = {};
        }
        this.errorMessages[rowIndex][field.name] = validationError.message;
      } else {
        if (
          this.errorMessages[rowIndex] &&
          this.errorMessages[rowIndex][field.name]
        ) {
          this.errorMessages[rowIndex][field.name] = "";
        }
      }
    },

    getErrorMessage(rowIndex, fieldName) {
      return this.errorMessages[rowIndex] ? this.errorMessages[rowIndex][fieldName] : "";
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
