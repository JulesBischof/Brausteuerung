<template>
  <v-card>
    <v-toolbar color="primary">
      <v-spacer></v-spacer>

      <!-- dropdown -->
      <v-combobox
        clearable
        label="select Recipe"
        :items="dropdownItems"
        v-model="selectedRecipeName"
      ></v-combobox>

      <!-- button create master  -->
      <v-btn
        @click="
          handleButton(
            'recipepanelAPI/',
            { master, rests, hops, malts },
            'post',
            `new Recipe created!`
          )
        "
        :disabled="createButtonDisabled"
        >create</v-btn
      >

      <!-- button update master -->
      <v-btn
        @click="
          handleButton(
            `recipepanelAPI/${selectedRecipeId}`,
            {
              master,
              rests,
              hops,
              malts,
            },
            'put',
            `Recipe id ${this.selectedRecipeId} got updated!`
          )
        "
        :disabled="updateButtonDisabled"
        >update</v-btn
      >
      <!-- button delete master  -->
      <v-btn
        @click="
          handleButton(
            `recipepanelAPI/${selectedRecipeId}`,
            {},
            'delete',
            `Recipe id ${this.selectedRecipeId} got deleted!`
          )
        "
        >delete</v-btn
      >
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
                { name: 'style', label: 'Style' },
                { name: 'stw', label: 'STW [°P]' },
                { name: 'abv', label: 'ABV [%]' },
                { name: 'yeast', label: 'Yeast' },
                { name: 'totboiltime', label: 'Boil Time [min]' },
                { name: 'mashvol', label: 'Mashing Water [ltr]' },
                { name: 'spargevol', label: 'Sparge Water [ltr]' },
              ]"
              v-model="master"
              @validation="handleValidation"
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
              dataName="restdata"
              v-model="rests"
              @validation="handleValidation"
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
              dataName="boildata"
              v-model="hops"
              @validation="handleValidation"
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
              dataName="gristdata"
              title="Grist"
              v-model="malts"
              @validation="handleValidation"
            />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <Snackbar
      ref="snackbarComponent"
      :message="SnackbarMessage"
      :color="SnackbarColor"
      :timeout="5000"
    ></Snackbar>
  </v-card>
</template>

<!-- ******************************************************************************************* Vue Instance -->
<script>
import InputTable from "@/components/InputTable.vue";
import MasterInputs from "@/components/MasterInputs.vue";
import Snackbar from "@/components/ShowSnackbar.vue";
import axios from "axios";

const serverUrl = "http://localhost:5000";

export default {
  name: "recipePanel",
  components: {
    InputTable,
    MasterInputs,
    Snackbar,
  },
  data() {
    return {
      // ________________________________________________________________________________________ View / Components Data:
      tab: "Master",
      items: ["Master", "Rests", "Hops", "Grist"],
      dropdownObjects: [], // gets filles by fetchDropdownEntries-Objects!
      dropdownItems: [], //gets filled by fetchDropdownEntries-names!

      //Ids are generated by a computed functionn name comes directly from dropdown
      selectedRecipeName: null,
      selectedRecipeId: null,

      // ________________________________________________________________________________________ Formdata:
      master: [{}],
      rests: [{}],
      hops: [{}],
      malts: [{}],

      // _________________________________________________________________________________________ Layout binding Variables

      SnackbarMessage: "",
      SnackbarColor: "",
      ValidationStatus: false,
      ValidationErrorCount: [],

      createButtonDisabled: true,
      updateButtonDisabled: true,

      createButtonDisabledstate: true,
      updateButtonDisabledstate: true,

      ButtonDisableValidation: false,
    };
  },

  // _________________________________________________________________________________________ methods
  methods: {
    snackbarmessage(ServerResponse, OKmessage) {
      if (ServerResponse.status !== 200) {
        this.showSnackbar(
          `Server ERROR: ${ServerResponse.data.message}`,
          "error"
        );
      } else {
        this.showSnackbar(OKmessage, "success");
      }
    },

    //when Validation is false -> safe status and disable buttons. For that count nuber of Validation errors
    handleValidation(ValidationValue) {
      console.log(ValidationValue)
      if (ValidationValue) {
        this.ButtonDisableValidation = true;
      } else {
        this.ButtonDisableValidation = false;
      }
      console.log(this.ButtonDisableValidation)
    },

    //handle toolbar buttons such as create, update and delete
    async handleButton(url_ending, data, method, successMessage = "empty") {
      try {
        //submit does not need the id of data

        if (data.master && "id" in data.master[0]) {
          // 0 due to master is an array -> we need the first object. Array makes it easier for server
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
        console.log("Response handleButton: ", response.data);
        //succes?? -> show message in snackbar
        this.snackbarmessage(response, successMessage);

        // update select Dropdown!
        this.fetchSelectEntries();

        //set back entries to default, when delete button got hit
        if (method === "delete") {
          this.emptyForms();
        }
      } catch (error) {
        console.log("Error handleButton: ", error.response.data.message);
        this.snackbarmessage(error.response, "Server detected ERROR: ");
      }
    },

    //update Formulars, after Recipe got selected
    async updateForms() {
      try {
        const response = await axios.get(
          `${serverUrl}/recipepanelAPI/${this.selectedRecipeId}`
        );
        console.log("Response updateForms: ", response.data);
        //fill Form-data objects
        this.master = response.data[0];
        delete this.master[0].id; //there is no need for master id -> gets fetched by dropdown menu
        this.rests = response.data[1];
        this.hops = response.data[2];
        this.malts = response.data[3];
      } catch (err) {
        console.log("Error updateForms Request: ", err);
      }
    },

    //get items / objects for the recipe-selection
    async fetchSelectEntries() {
      // Axios GET-Request (dropdown!)
      try {
        const response = await axios.get(`${serverUrl}/recipepanelAPI/`);
        this.dropdownObjects = response.data;
        this.dropdownItems = this.dropdownObjects.map((item) => item.name);
      } catch (error) {
        console.error("Error fetchSelectEntries: ", error);
      }
    },

    emptyForms() {
      (this.selectedRecipeId = null),
        (this.selectedRecipeName = null),
        (this.master = [{}]),
        (this.rests = [{}]),
        (this.hops = [{}]),
        (this.malts = [{}]);
    },

    showSnackbar(msg, color) {
      this.SnackbarMessage = msg;
      this.$refs.snackbarComponent.snackbar = true;
      this.SnackbarColor = color;
    },

  },

  // _________________________________________________________________________________________ watch
  watch: {
    selectedRecipeName: function (newVal) {
      if (newVal) {
        // Find the corresponding ID for the selected name
        const selectedObject = this.dropdownObjects.find(
          (obj) => obj.name === newVal
        );
        this.selectedRecipeId = selectedObject.id;
        this.updateForms();
      } else {
        // If no item is selected, reset the selectedItemId
        this.selectedRecipeId = null;
        this.emptyForms();
      }
    },

    master: {
      deep: true,

      handler(newMaster) {

        //disable buttons, when nothing is selected
        if(this.selectedRecipeName === null || this.selectedRecipeId === null){
          this.createButtonDisabled = true;
          this.updateButtonDisabled = true;

          this.createButtonDisabledstate = true,
          this.updateButtonDisabledstate = true
          return;
        }
        // Überprüfe, ob der Name im ersten Objekt des Arrays geändert wurde
        if (newMaster[0].name === this.selectedRecipeName) {
          this.createButtonDisabled = true;
          this.updateButtonDisabled = false;

          this.createButtonDisabledstate = true,
          this.updateButtonDisabledstate = false
        } else {
          this.createButtonDisabled = false;
          this.updateButtonDisabled = true;

          this.createButtonDisabledstate = false,
          this.updateButtonDisabledstate = true
        }
      },
    },
    ButtonDisableValidation: {
      handler (newVal) {
        if(newVal){
          this.createButtonDisabled = true;
          this.updateButtonDisabled = true;
        } else {
          this.createButtonDisabled = this.createButtonDisabledstate;
          this.updateButtonDisabled = this.updateButtonDisabledstate;
        }
      }
    }

  },

  // _________________________________________________________________________________________ mounted
  mounted() {
    this.fetchSelectEntries();
  },
};
</script>
