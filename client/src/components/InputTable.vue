<template>
  <v-card>
    <v-container>
      <h1 class="Title">{{ title }}</h1>
    </v-container>
    <v-card-actions>
      <v-btn @click="addItem"> <v-icon>mdi-plus</v-icon> Add </v-btn>
    </v-card-actions>
    <v-card-text>
      <template v-for="(item, index) in inputItems" :key="index">
        <v-row>
          <v-col v-for="(field, fieldIndex) in fields" :key="fieldIndex">
            <v-text-field
              v-model="item[field.name]"
              :label="field.label"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn @click="removeItem(index)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  components: {
  },
  props: {
    fields: Array,
    title: String,
    modelValue: Array,
  },
  data() {
    return {
    };
  },
  methods: {
    addItem() {
      const newItem = {};
      this.fields.forEach(field => {
        newItem[field.name] = "";
      });
      this.inputItems.push(newItem);
    },
    removeItem(index) {
      this.inputItems.splice(index, 1);
    }
  },
  computed: {
    inputItems: {
      get() {
          return this.modelValue
      },
      set (value){
        this.$emit('update: modelValue', value);
      }
    }
  }
};
</script>
