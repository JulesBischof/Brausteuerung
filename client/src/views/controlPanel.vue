<template>
  <div>
    <v-card>
      <!-- Control Panel here!  -->
      <v-row>
        <v-spacer></v-spacer>

        <v-col sm="6">
          <automaticControls
            v-model="automaticControls"
            @switch-click="
              handleButton(
                'controlAPI/auto',
                automaticControls,
                'post',
                'send autocontrol request to server'
              )
            "
          />
        </v-col>

        <v-col sm="6">
          <manualControls
            v-model="manualControls"
            @controlsClick="
              handleButton(
                'controlAPI/manual',
                manualControls,
                'post',
                'send stirrspeed request'
              )
            "
          />
        </v-col>

        <v-spacer></v-spacer>
      </v-row>
    </v-card>
    <v-divider :thickness="10"></v-divider>

    <!-- StatusPanel Here -->

    <v-card>
      <v-row>
        <v-col sm="3">
          <!-- Temperature Panel -->
          <TemperatureCard v-model="thermometer" />
        </v-col>
        <v-col sm="3">
          <!-- Timer Panel -->
          <TimerCard v-model="timer" />
        </v-col>
        <v-col sm="5">
          <!-- next Step -->
          <TaskCard v-model="datarow" />
        </v-col>
        <v-col sm="1">
          <!-- GPIO Status -->
          <GPIOCard v-model="GPIO" />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
const serverUrl = "http://localhost:5000";
import axios from "axios";

import TemperatureCard from "@/components/TemperatureCard.vue";
import TaskCard from "@/components/TaskCard.vue";
import TimerCard from "@/components/TimerCard.vue";
import GPIOCard from "@/components/GPIOCard.vue";
import automaticControls from "@/components/automaticControls.vue";
import manualControls from "@/components/manualControls.vue";

export default {
  name: "controlPanel",
  components: {
    TemperatureCard,
    TaskCard,
    TimerCard,
    GPIOCard,
    automaticControls,
    manualControls,
  },

  data() {
    return {
      temperatureData: [],
      chart: null,

      thermometer: {
        temperature: 62,
        gradient: -1,
      },

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
        boiler: false,
        stirrer: false,
      },

      automaticControls: {
        selectedID: null,
        brewmode: "brew",
        autoMode: false,
      },

      manualControls: {
        stirrspeed: 0,
        boiler: false,
      },
    };
  },

  methods: {
    //handle toolbar buttons such as create, update and delete
    async handleButton(url_ending, data, method, successMessage = "empty") {
      try {
        console.log(data);
        const response = await axios({
          method: method,
          url: `${serverUrl}/${url_ending}`,
          data: data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Response handleButton: ", response.data);
        //succes?? -> show message in snackbar
        this.snackbarmessage(response, successMessage);
      } catch (error) {
        console.log("Error handleButton: ", error.response.data.message);
      }
    },
  },
};
</script>
