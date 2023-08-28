// Function for all the API requests
function sendRequest(url, method, data = null) {
  const requestOptions = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  return fetch(url, requestOptions)
    .then((response) => response.json())
    .catch((error) => {
      console.log("Fehler beim Senden des Requests:", error);
    });
}






var recipe_vm = new Vue({
    el: "#recipepanel",
    data: {

      //empty objects -> are getting filled by method resetForm
      master: {},
      rests: [{}],
      hops: [{}],
      malts: [{}],
      numberofhops: null,
      numberofrests: null,
      numberofmalts: null, 

      // Array for the database entries (names for dropdown ;) )
      masterdata: [], 
      
      // ID from currentlyselected masterdata
      selectedMasterdata: null, 

      //defaults needed to set back form after something got deleted. Otherwise this Code gets even more spaghetti
      defaults: {
        numberofrests: 1,
        numberofhops: 1,
        numberofmalts: 1,
        // recipe rest and boildata
        rests: [{ name: "", temperature: null, duration: null }],
        // recipe rest and boildata
        hops: [{ name: "", alphaacid: null, droptime: null, weight: null}],
        //recipe grist
        malts: [{name: "", ebc: null, weight: null}],
        // recipe masterdata
        master: {
          id: 0,
          name: "",
          lastbrewed: null,
          style: "",
          grist: null,
          mashvol: null,
          spargevol: null,
          totboiltime: null,
          yeast: "",
          Stw: null,
          ABV: null,
        },
      },

      prevmaster: {},

    },

    computed: {

      disable_mastersubmit() {
        if(this.master.name === ""){
          return false;
        } else {
          return (
          this.master.name === this.prevmaster.name
          );
        }
      },
      disable_masterupdate() {
        if(this.selectedMasterdata === null){
          return true;
        } else {
          return !this.disable_mastersubmit;
        }
      },
    },
    

    mounted() {
      this.resetForm();
      this.fetchmasterdata();

    },

    methods: {
    
    //set default on the cue object. this way its easier to delete the form-entries after some db entries are getting deleted 
    resetForm: function (){
      this.master = JSON.parse(JSON.stringify(this.defaults.master));
      this.selectedMasterdata = null;

      this.rests = JSON.parse(JSON.stringify(this.defaults.rests));
      this.numberofrests = JSON.parse(JSON.stringify(this.defaults.numberofrests));

      this.hops = JSON.parse(JSON.stringify(this.defaults.hops));
      this.numberofhops = JSON.parse(JSON.stringify(this.defaults.numberofhops));

      this.malts = JSON.parse(JSON.stringify(this.defaults.malts));
      this.numberofmalts = JSON.parse(JSON.stringify(this.defaults.numberofmalts));
    }, 


    // handles update, create submit: data = {master, rests, hops, malts} 
    handleButton: function (url_ending, data, method) {
      //submit does not need the id of data
      if ('id' in data.master) {
        delete data.master.id;
      }
      
      console.log(data);
      sendRequest(`/recipe/${url_ending}`, method, data)
        .then((data) => {
          console.log("Response erhalten:", data);
          console.log("method = ", method)
          this.fetchmasterdata(); // Get back and update select dropdown!
          if (method === 'DELETE'){ //set back entries to default, when delete button got hit
            this.resetForm();
          }
        })
        .catch((error)=>{
          console.log("aufgetretener Fehler bei handlesubmit: ", error);
        });
    },


    //fetchmasterdata: updates the dropdwon menu
    fetchmasterdata: function () {
      // Fetch API (dropdown!)
      fetch("/recipe/masterdata")
        .then((response) => response.json())
        .then((data) => {
          this.masterdata = data;
        })
        .catch((error) => console.error("Error fetching data:", error));
    },
  
    //updates form after something got selected
      updatetable: function (selected_id) {
        // nothing selected: Server gets confused
        if (this.selectedMasterdata !== null) {
          let requestOptions = {
            method: "GET",
          };
          // Send Request
          fetch(`/recipe/${selected_id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
              console.log("Response erhalten:", data);
              //safe data to vue instance -> fill form
              this.master = data[0];
              this.rests = data[1];
              this.numberofrests = data[1].length;
              this.hops = data[2];
              this.numberofhops = data[2].length;
              this.malts = data[3];
              this.numberofmalts = data[3].length;

              this.prevmaster.name = data[0].name;  //to indicate, if masterdata got changed or not
            })
            .catch((error) => {
              console.log("Fehler beim Senden des Requests:", error);
            });
        }
      },
    },
  
    
    watch: {

      numberofrests(newVal) {
        // Runs, wenn die Anzahl der rests geändert wird
        if (newVal > this.rests.length) {
          for (let i = this.rests.length; i < newVal; i++) {
            // Erstellt Zeilen!
            this.rests.push({ name: "", temperature: null, duration: null });
          }
        } else if (newVal < this.rests.length) {
          // Entfernt Zeilen! !!!!!!!!! Maybe Cancelbutton to undo mistakes? Would be a good idea..
          this.rests.splice(newVal);
        }
      },
      numberofhops(newVal) {
        // Runs, wenn die Anzahl der hops geändert wird
        if (newVal > this.hops.length) {
          for (let i = this.hops.length; i < newVal; i++) {
            // Erstellt Zeilen!
            this.hops.push({ name: "", alphaacid: null, droptime: null });
          }
        } else if (newVal < this.hops.length) {
          // Entfernt Zeilen! !!!!!!!!! Maybe Cancelbutton to undo mistakes? Would be a good idea..
          this.hops.splice(newVal);
        }
      },
      numberofmalts(newVal) {
        // Runs, wenn die Anzahl der rests geändert wird
        if (newVal > this.malts.length) {
          for (let i = this.malts.length; i < newVal; i++) {
            // Erstellt Zeilen!
            this.malts.push({ name: "", temperature: null, duration: null });
          }
        } else if (newVal < this.malts.length) {
          // Entfernt Zeilen! !!!!!!!!! Maybe Cancelbutton to undo mistakes? Would be a good idea..
          this.malts.splice(newVal);
        }
      },
    },
  });