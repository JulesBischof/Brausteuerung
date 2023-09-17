//output - controls
const { boiler, stirrer, setup } = require("./03-controlobjects");
//tempsensor - library
const ds18b20 = require('ds18b20');
//import object to handle Database
const { recipe_db, dbHandlerClass } = require("../database/01-db-object.js");



function manualControl(order) {
  return new Promise((resolve, reject) => {

    // switch boiler
    if (order.boiler) {
      boiler.on();
    } else if (!order.boiler) {
      boiler.off();
    } else {
      reject(new Error("boiler order value undefined"));
    }

    // switch stirrer
    switch (order.stirrspeed) {
      case '0':
        stirrer.stop();
        resolve();
        break;
      case '1':
        stirrer.goslow();
        resolve();
        break;
      case '2':
        stirrer.gofast();
        resolve();
        break;
      default:
        reject(new Error("something went wrong during handle stirrspeed manually"));
    }
  });

}

async function setAutocontrolConfig(order) {

  let returnValue = {};

  if (order.automode) {

    //get recipe_data
    const selected_id = order.selectedID;
    console.log("get request on ID ", selected_id);

    const recipe_array = []; // Array to save the recipe

    // create Objects, that handle database! 
    const masterdbHandler = new dbHandlerClass(
      null,
      "recipe_master",
      "id",
      recipe_db.master_columns,
      selected_id
    );
    const restdbHandler = new dbHandlerClass(
      null,
      "recipe_rests",
      "recipe_master_id",
      recipe_db.rests_columns,
      selected_id
    );
    const boildbHandler = new dbHandlerClass(
      null,
      "recipe_hops",
      "recipe_master_id",
      recipe_db.hops_columns,
      selected_id
    );
    const gristdbHandler = new dbHandlerClass(
      null,
      "recipe_grist",
      "recipe_master_id",
      recipe_db.grist_columns,
      selected_id
    );

    try {
      // use promise.all to get all entries
      const results = await Promise.all([
        await masterdbHandler.getEntries(),
        await restdbHandler.getEntries(),
        await boildbHandler.getEntries(),
        await gristdbHandler.getEntries(),
      ]);

      // set configuration - settings
      returnValue.recipe = results;
      const config = setup.brewmode(results);
      returnValue.gradientfactor = config.gradientfactor;
      returnValue.startupDealy = config.startupDelay;

      // give back gathered data back 
      return returnValue;

    } catch (err) {
      console.error(err);
    }
  } else if (!order.automode) {
    boiler.off();
  } else {
    console.error("automode order undefined! ")
  }
}


module.exports = { manualControl, setAutocontrolConfig }