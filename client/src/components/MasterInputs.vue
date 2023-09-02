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
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    fields: Array,
    modelValue: Array
  },
  data () {
    return {
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
  }
}
</script>
