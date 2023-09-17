<template>
  <v-container>
    <v-row>
      <v-spacer></v-spacer>
      <v-card-title>Manual - Controls</v-card-title>
      <v-spacer></v-spacer>
    </v-row>

    <v-row>
    <v-spacer></v-spacer>
      <v-col sm="6">

        <div>
          <v-btn-toggle v-model="manualControls.stirrspeed" shaped mandatory @click="controlsClick()">
            <v-btn value="0" prepend-icon="mdi-pause" stacked>
              stop</v-btn>
            <v-btn value="1" prepend-icon="mdi-tortoise" stacked
              >slow</v-btn>
            <v-btn value="2" prepend-icon="mdi-rabbit" stacked>
              fast</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
      <v-col sm="2">
        <v-switch
          color="success"
          :model-value="true"
          append-icon="mdi-stove"
          inset
          v-model="manualControls.boiler"
          @input="controlsClick()"
        ></v-switch>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>

export default {
  props: {
    modelValue: Object,
  },
  computed: {
    manualControls: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update: modelValue', value);
      }
    },
  },
  methods: {
    controlsClick(){
      this.$emit('controlsClick')
    }
  },
};
</script>

