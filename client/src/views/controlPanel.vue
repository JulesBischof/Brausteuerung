<template>
  <v-card>
    <v-row>
      <v-spacer></v-spacer>
      <v-col sm="6">
        <v-container>
          <v-row>
            <v-spacer></v-spacer>
            <v-card-title>Automode - Controls</v-card-title>
            <v-spacer></v-spacer>
          </v-row>

          <v-row>
            <v-col sm="6">
              <v-combobox
                clearable
                label="select Recipe"
                :items="dropdownItems"
                v-model="selectedRecipeName"
              ></v-combobox>
            </v-col>
            <v-col sm="4">
              <v-btn-toggle v-model="toggle_one" shaped mandatory>
                <v-btn value="left" prepend-icon="mdi-barley" stacked>
                  Brew mode
                </v-btn>
                <v-btn value="center" prepend-icon="mdi-hops" stacked>
                  Boil mode
                </v-btn>
              </v-btn-toggle>
            </v-col>
            <v-col sm="2">
              <v-switch
                color="success"
                :model-value="true"
                label="Auto"
                inset
              ></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col sm="5">
        <v-container>
          <v-row>
            <v-spacer></v-spacer>
            <v-card-title>Manual - Controls</v-card-title>
            <v-spacer></v-spacer>
          </v-row>

          <v-row>
            <v-spacer></v-spacer>
            <v-col sm="5">
              <div>
                <v-btn-toggle v-model="toggleSpeed" shaped mandatory>
                  <v-btn value="left" prepend-icon="mdi-pause" stacked
                    >stop</v-btn
                  >
                  <v-btn value="center" prepend-icon="mdi-tortoise" stacked
                    >slow</v-btn
                  >
                  <v-btn value="right" prepend-icon="mdi-rabbit" stacked
                    >fast</v-btn
                  >
                </v-btn-toggle>
              </div>
            </v-col>
            <v-col sm="3">
              <v-switch
                color="success"
                :model-value="true"
                label="Boiler"
                inset
              ></v-switch>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
        </v-container>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>

    <v-divider :thickness="10"></v-divider>
    <!-- StatusPanel Here -->
    <v-container></v-container>
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
