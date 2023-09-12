<template>
    <v-card title="Temperature" :elevation="0">
        <v-card-text>
          <v-row>
            <v-col class="text-h4" cols="8">
              {{ thermometer.temperature }}&deg;C
            </v-col>
            <v-col cols="4">
              <v-icon v-if="thermometer.gradient < -0.3" size="42" color="blue"
                >mdi-thermometer-minus</v-icon
              >
              <v-icon
                v-if="
                  thermometer.gradient >= -0.3 && thermometer.gradient <= 0.3
                "
                size="42"
                >mdi-thermometer</v-icon
              >
              <v-icon v-if="thermometer.gradient > 0.3" size="42" color="green"
                >mdi-thermometer-plus</v-icon
              >
            </v-col>
          </v-row>
        </v-card-text>
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
    thermometer: {
      get() {
        return this.modelValue;
      },
    },
  },

};
</script>