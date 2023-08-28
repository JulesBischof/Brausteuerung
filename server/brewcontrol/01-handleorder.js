const { ProcessData, boiler, stirrer } = require("./03-controlobjects");

let autocontrolProcess;




function handleorder(order){

        if ('auto' in order){
            if(order.auto === true){
                startAutoControl(); //functions declared end of page
            } else { 
                stopAutoControl();  //functions declared end of page
                }
            }



//switch on/off boiler manually
        if('heatmanual' in order){ 
            switch(order.heatmanual){
                case true:
                    boiler.on();
                    break;
                case false:
                    boiler.off();
                    break
                default:
                    console.log("heatmanual out of Range");
            }
        }

//switch on/off stirrer manually     
        if('stirrspeed' in order){ 
            switch(order.stirrspeed){
            case 0:
                stirrer.stop();
                break;
            case 1:
                stirrer.goslow();
                break;
            case 2:
                stirrer.gofast();
                break;
            default:
                console.log("stirrspeed out of Range"); 
            }
        }
}


//start Autocontrol
function startAutoControl() {
    //start autoprocess only when either the variable is empty, or autoprocess was ready and got closed already
    if(!autocontrolProcess || autocontrolProcess.exitCode !== null) {
        autocontrolProcess = fork('./02-autocontrol.js');
        ProcessData.boilermode = "auto";

        //handle incoming data from childprocess
        autocontrolProcess.on('message', (data) => {
        console.log('childprocessdata:', data);
            //safe data to global variable!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        });

        autocontrolProcess.on('error', (error) => {
            console.error('Fehler im chiuldprocess:', error);
            //safe error to global variable!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! (or make bad http response,...)
        });

        autocontrolProcess.on('exit', () => {
            console.log('Childprocess closed.');
        });
    }
}

function stopAutoControl() {
    if (autocontrolProcess) {
        autocontrolProcess.kill();
    }
}









module.exports = {handleorder, startAutoControl}