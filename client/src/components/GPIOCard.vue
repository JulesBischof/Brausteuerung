<template>
        <v-container>
          <v-row>
              <v-col cols="12">
                <v-icon>mdi-stove</v-icon>
                <v-icon color="red" v-if="!GPIO.boiler"
                  >mdi-lightbulb-outline</v-icon
                >
                <v-icon color="green" v-if="GPIO.boiler"
                  >mdi-lightbulb-on-outline</v-icon
                >
              </v-col>
              </v-row>
              <v-row>
              <v-col cols="12">
                <v-icon>mdi-autorenew</v-icon>
                <v-icon color="red" v-if="!GPIO.stirrer"
                  >mdi-lightbulb-outline</v-icon>

                <v-icon color="green" v-if="GPIO.stirrer"
                  >mdi-lightbulb-on-outline</v-icon>
              </v-col>
          </v-row>
        </v-container>
</template>

<script>
export default {
  props: {
    modelValue: Object,
  },
  data () {
    return {
      // Hier kommen deine Daten/variablen
    }
  },
  computed: {
    GPIO: {
      get(){
        return this.modelValue;
      }
    }
  },
}
</script>