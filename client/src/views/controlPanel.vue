<template>
  <div>
    <v-card>
      <!-- Control Panel here!  -->
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
    </v-card>
    <v-divider :thickness="10"></v-divider>

    <!-- StatusPanel Here -->

    <v-card>
      <!-- Temperature Panel -->
      <v-container>
        <v-card>
          <v-card-item title="Temperature">
            <v-card-text>
              <v-row>
                <v-col class="text-h2" cols="6"> 64&deg;C </v-col>
                <v-col cols="6">
                  <v-icon v-if="gradient < -0.3" size="64" color="blue"
                    >mdi-thermometer-minus</v-icon
                  >
                  <v-icon v-if="gradient >= -0.3 && gradient <= 0.3" size="64"
                    >mdi-thermometer</v-icon
                  >
                  <v-icon v-if="gradient > 0.3" size="64" color="green"
                    >mdi-thermometer-plus</v-icon
                  >
                </v-col>
              </v-row>
            </v-card-text>
          </v-card-item>
        </v-card>
      </v-container>

      <!-- next Step -->
      <v-container>
        <v-card title="Task">
          <v-card-item>
            <v-row>
              <v-col cols="8"
                ><v-card subtitle="Name" prepend-icon="mdi-tag"
                  ><v-card-text class="text-h4">{{
                    datarow.name
                  }}</v-card-text></v-card
                ></v-col
              >
              <v-col cols="4"
                ><v-card subtitle="Number / of" prepend-icon="mdi-counter"
                  ><v-card-text class="text-h4"
                    >{{ datarow.numberCURRENTLY }} /
                    {{ datarow.numberALL }}</v-card-text
                  ></v-card
                ></v-col
              > </v-row
            ><v-row>
              <v-col cols="6"
                ><v-card
                  subtitle="HOLD Temperature"
                  prepend-icon="mdi-thermometer-auto"
                  ><v-card-text class="text-h4"
                    >{{ datarow.temperature }}&deg;C</v-card-text
                  ></v-card
                ></v-col
              >
              <v-col cols="6"
                ><v-card subtitle="HOLD Time" prepend-icon="mdi-timer"
                  ><v-card-text class="text-h4"
                    >{{ datarow.duration }} min</v-card-text
                  ></v-card
                ></v-col
              >
            </v-row>
          </v-card-item>
        </v-card>
      </v-container>

      <!-- Timer Panel -->
      <v-container>
        <v-card title="Timer">
          <v-card-text>
            <v-row>
              <v-col cols="6" class="text-h2">{{ timer.leftmin }} min</v-col>
              <v-col cols="6">
                <v-icon v-if="!timer.toggle" size="64" color="red"
                  >mdi-timer-off</v-icon
                >
                <v-icon v-if="timer.toggle" size="64" color="green"
                  >mdi-timer-play</v-icon
                >
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>

      <!-- GPIO Status -->
      <v-container>
        <v-card>
          <v-row>
            <v-card title="Boiler">
              <v-col>
                <v-icon size="64" color="red" v-if="!GPIO.boiler"
                  >mdi-lightbulb-outline</v-icon
                >
                <v-icon size="64" color="green" v-if="GPIO.boiler"
                  >mdi-lightbulb-on-outline</v-icon
                >
              </v-col>
            </v-card>
            <v-card title="Stirrer">
              <v-col
                ><v-icon size="64" color="red" v-if="!GPIO.stirrer"
                  >mdi-lightbulb-outline</v-icon
                >
                <v-icon size="64" color="green" v-if="GPIO.stirrer"
                  >mdi-lightbulb-on-outline</v-icon
                ></v-col
              >
            </v-card>
          </v-row>
        </v-card>
      </v-container>
    </v-card>
  </div>
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

      gradient: -1,

      datarow: {
        name: "Maltose Rast",
        numberCURRENTLY: 1,
        numberALL: 3,
        temperature: 72,
        duration: 45,
      },
      timer: {
        leftmin: 10,
        toggle: true,
      },
      GPIO: {
        boiler: true,
        stirrer: false,
      },
    };
  },
};
</script>
