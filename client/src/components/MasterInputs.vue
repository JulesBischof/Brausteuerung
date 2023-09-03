<template>
  <div>
    <v-card>
      <v-container>
        <h1>Masterdata</h1>
      </v-container>
      <v-card-text>
        <div v-for="(item, index) in inputItems" :key="index">
          <v-row>
            <v-col
              cols="12"
              sm="5"
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
import { FieldValidation as FieldValidation } from '../Validation/FieldValidation.js';

export default {
  props: {
    fields: Array,
    modelValue: Array
  },
  data () {
    return {
      errorMessage: {}
    }
  },
  methods: {
  validateField(item, field) {
    const fieldValue = item[field.name];
    const validator = new FieldValidation(field.name, 'masterdata', field.inputType);
    const validationError = validator.validate(fieldValue);

    // Verwenden Sie ein assoziatives Array, um Fehlermeldungen für jedes Feld zu speichern
    if (validationError) {
      this.errorMessage[field.name] = validationError.message;
    } else {
      delete this.errorMessage[field.name];
    }
  }
},

  computed: {
    inputItems: {
      get () {
        return this.modelValue;
      },
      set (value) {
        this.$emit('update:modelvalue', value)
      }
    }
  },
}
</script>
