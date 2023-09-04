<template>
  <v-card>
    <v-card-title>Control Panel</v-card-title>

    <v-container>
      <v-card-title>Automode - Controls</v-card-title>
      <v-row>
        <v-combobox
          clearable
          label="select Recipe"
          :items="dropdownItems"
          v-model="selectedRecipeName"
        ></v-combobox>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="toggle_one" shaped mandatory>
          <v-btn value="left" prepend-icon="mdi-barley" stacked>
            Brew mode
          </v-btn>
          <v-btn value="center" prepend-icon="mdi-hops" stacked>
            Boil mode
          </v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <v-switch
          color="success"
          :model-value="true"
          label="Auto mode"
          inset
        ></v-switch>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>

    <v-container>
      <v-row>
        <v-spacer></v-spacer>
          <v-card-title>Manual - Controls</v-card-title>
          <v-spacer></v-spacer>
      </v-row>
      <v-row>
        <v-spacer></v-spacer>
        <div>
          <v-btn-toggle v-model="toggleSpeed" shaped mandatory>
            <v-card-text>Stirrer</v-card-text>
            <v-btn value="left" prepend-icon="mdi-pause" stacked>stop</v-btn>
            <v-btn value="center" prepend-icon="mdi-tortoise" stacked
              >slow</v-btn
            >
            <v-btn value="right" prepend-icon="mdi-rabbit" stacked>fast</v-btn>
          </v-btn-toggle>
        </div>
        <v-spacer></v-spacer>
        <v-switch
          color="success"
          :model-value="true"
          label="Boiler"
          inset
        ></v-switch>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: "controlPanel",
  components: {},

  data() {
    return {
      tickLabels: {
        0: "stop",
        1: "slow",
        2: "fast",
      },
      toggle_one: 0,
      toggleSpeed: 0,
    };
  },
};
</script>
