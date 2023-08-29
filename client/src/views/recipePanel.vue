<template>
  <v-card>
    <v-toolbar color="primary">
      <v-toolbar-title>Recipe Panel</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-combobox
        clearable
        label="select Master"
        :items="dropdownItems"
      ></v-combobox>
      <v-btn @click="handleButton('recipepanelAPI/', { master, rests, hops, malts }, 'post')">create Master</v-btn>
      <v-btn>update Master</v-btn>
      <v-btn>delete Master</v-btn>
    </v-toolbar>
    <v-row>
      <v-col cols="12" sm="2">
        <v-tabs v-model="tab" direction="vertical" color="primary">
          <v-tab Value="Master">Master</v-tab>
          <v-tab value="Rests"> Rests </v-tab>
          <v-tab value="Hops"> Hops </v-tab>
          <v-tab value="Grist"> Grist </v-tab>
        </v-tabs>
      </v-col>
      <v-col cols="12" sm="10">
        <v-window v-model="tab">
          <!-- MASTER PANEL -->
          <v-window-item value="Master">
            <MasterInputs
              :fields="[
                { name: 'name', label: 'Name' },
                { name: 'lastbrewed', label: 'Brewdate' },
                { name: 'style', label: 'Style' },
                { name: 'stw', label: 'STW [°P]' },
                { name: 'abv', label: 'ABV [%]' },
                { name: 'yeast', label: 'Yeast' },
                { name: 'boil time', label: 'Boil Time [min]' },
                { name: 'grist', label: 'Grist [g]' },
                { name: 'mashvol', label: 'Mashing Water [ltr]' },
                { name: 'spargevol', label: 'Sparge Water [ltr]' },
              ]"
              v-model="master"
            />
          </v-window-item>
          <!-- REST PANEL -->
          <v-window-item value="Rests">
            <InputTable
              :fields="[
                { name: 'name', label: 'Name' },
                { name: 'temperature', label: 'Temperature [°C]' },
                { name: 'duration', label: 'Rest for... [min]' },
              ]"
              title="Rests"
              v-model="rests"
            />
          </v-window-item>
          <!-- HOPS PANEL -->
          <v-window-item value="Hops">
            <InputTable
              :fields="[
                { name: 'name', label: 'Name' },
                { name: 'alphaacid', label: 'Alpha-Acid [%a]' },
                { name: 'droptime', label: 'Drop after... [min]' },
                { name: 'weight', label: 'Weight [g]' },
              ]"
              title="Hops"
              v-model="hops"
            />
          </v-window-item>
          <!-- GRIST PANEL -->
          <v-window-item value="Grist">
            <InputTable
              :fields="[
                { name: 'name', label: 'Name' },
                { name: 'ebc', label: 'EBC' },
                { name: 'weight', label: 'Weight [g]' },
              ]"
              title="Grist"
              v-model="malts"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import InputTable from "@/components/InputTable.vue";
import MasterInputs from "@/components/MasterInputs.vue";
import axios from "axios";

const serverUrl = "http://localhost:5000";

export default {
  name: "recipePanel",
  components: {
    InputTable,
    MasterInputs,
  },
  data() {
    return {
      // ________________________________________________________________________________________ View / Components Data:
      tab: "Master",
      items: ["Master", "Rests", "Hops", "Grist"],
      dropdownItems: ["item1", "item2"],
      // ________________________________________________________________________________________ Formdata:
      selectedMasterdata: "",
      master: [{}],
      prevmaster: [{}],
      rests: [{}],
      hops: [{}],
      malts: [{}],
    };
  },
  methods: {

    async handleButton(url_ending, data, method) {
      try {
        //submit does not need the id of data
        if ("id" in data.master) {
          delete data.master.id;
        }
        console.log(data);
        const response = await axios({
          method: method,
          url: `${serverUrl}/${url_ending}`,
          data: data,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Response erhalten:", response.data);
        console.log("method = ", method);
        // update select Dropdown!
        // this.fetchmasterdata();

        if (method === "DELETE") {
          //set back entries to default, when delete button got hit
        }
      } catch (error) {
        console.log("Fehler bei handleButton:", error);
      }
    },
  },
  mounted() {
    // this.fetchmasterdata();
  },
};
</script>
