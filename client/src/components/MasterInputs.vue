<template>
  <div>
    <v-card>
      <v-card-text>
        <div v-for="(item, index) in inputItems" :key="index">
          <v-row>
            <v-col
              cols="12"
              sm="6"
              v-for="(field, fieldIndex) in fields"
              :key="fieldIndex"
            >
              <div></div>
              <v-text-field
                v-model="item[field.name]"
                :label="field.label"
                @input="validateField(item, field)"
              ></v-text-field>
              <span>{{ errorMessage[field.name] }}</span>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { FieldValidation as FieldValidation } from "../Validation/FieldValidation.js";

export default {
  props: {
    fields: Array,
    modelValue: Array,
  },
  data() {
    return {
      errorMessage: {},
      errorCountArray: [],
    };
  },
  methods: {
    validateField(item, field) {
      this.$emit("validation", this.getSumOfValidationErrors());

      const fieldValue = item[field.name];
      const validator = new FieldValidation(
        field.name,
        "masterdata",
        field.inputType
      );
      const validationError = validator.validate(fieldValue);

      // Verwenden Sie ein assoziatives Array, um Fehlermeldungen für jedes Feld zu speichern
      if (validationError) {
        this.errorMessage[field.name] = validationError.message;
        this.errorCountArray[field.name] = 1;
      } else {
        delete this.errorMessage[field.name];
        this.errorCountArray[field.name] = 0;
      }
    },

    getSumOfValidationErrors() {
      let sum = 0;
      for (let i = 0; i < this.fields.length; i++) {
        const fieldName = this.fields[i].name;
        sum += this.errorCountArray[fieldName] || 0;
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
        this.$emit("update:modelvalue", value);
      },
    },
  },
};
</script>
