<template>
        <v-card title="Timer" :elevation="0">
          <v-card-text>
            <v-row>
              <v-col cols="8" class="text-h4">{{ timer.leftmin }} min</v-col>
              <v-col cols="4">
                <v-icon v-if="!timer.toggle" size="42" color="red"
                  >mdi-timer-off</v-icon
                >
                <v-icon v-if="timer.toggle" size="42" color="green"
                  >mdi-timer-play</v-icon
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
  data () {
    return {
      // Hier kommen Daten/variablen
    }
  },
  computed: {
    timer: {
      get(){
        return this.modelValue;
      }
    }
  },

}
</script>

