<template>
    <v-card :elevation="0">
      <v-card-title>Task {{ datarow.numberCURRENTLY }}/{{ datarow.numberALL }}</v-card-title>
        <v-row>
          <v-col cols="5">
            <v-card-text class="text-h5">{{ datarow.name }}</v-card-text>
          </v-col>

          <v-col cols="7">
            <v-card-text class="text-h5">HOLD {{ datarow.temperature }}&deg;C | {{ datarow.duration }} min</v-card-text>
          </v-col>
        </v-row>
    </v-card>
</template>

<script>
export default {
  props: {
    modelValue: Object,
  },
  data() {
    return {
      // Hier kommen  Daten/variablen
    };
  },
  computed: {
    datarow: {
      get() {
        return this.modelValue;
      },
    },
  },
};
</script>
