let orderdata = {};

function handleSubmit(event) { //was passiert mit Formular? 

    const selmodeRadios = document.getElementsByName("selmode");

    switch (event.target.id) {
        case 'Boileron':
            orderdata.heatmanual = true;
            break;
        case 'Boileroff':
            orderdata.heatmanual = false;
            break;
        case 'startauto':
            orderdata.auto = true;
            orderdata.heatmanual = false;
            for (let i = 0; i < selmodeRadios.length; i++) { //Inhalt der Radiobuttons brew und Boil mitgeben
                if (selmodeRadios[i].checked) {
                    orderdata.mode = selmodeRadios[i].id;
                    break;
                }
            }
            break;
        case 'stoppauto':
            orderdata.auto = false;
            orderdata.heatmanual = false;
            break;
        case 'stoppstirr':
            orderdata.stirrspeed = 0;
            break;
        case 'slowstirr':
            orderdata.stirrspeed = 1;
            break;
        case 'faststirr':
            orderdata.stirrspeed = 2;
            break;
        case 'brewmode':
            orderdata.mode = "brew";
            break;
        case 'boilmode':
            orderdata.mode = "boil";
            break;
        default:
            console.log("something went wrong...");
    }

    // Definiere die Konfiguration für den POST-Request
    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // Festlegen des Content-Type auf JSON
        },
        body: JSON.stringify(orderdata) // Umwandeln der orderdata Daten in JSON-Format
    };

    // Sende den POST-Request an die gewünschte URL
    fetch("/order", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log("Response erhalten:", data);
            // Verarbeite die Antwort des Servers
            orderdata = {}; //inhalt von orderdata löschen -> Ziel ist es immer nur relevanten Teil der order übertragen.
        })
        .catch(error => {
            console.log("Fehler beim Senden des Requests:", error);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    let controlpanel = {
        Boileron: document.getElementById("Boileron"),
        Boileroff: document.getElementById("Boileroff"),
        startauto: document.getElementById("startauto"),
        stoppauto: document.getElementById("stoppauto"),
        stoppstirr: document.getElementById("stoppstirr"),
        slowstirr: document.getElementById("slowstirr"),
        faststirr: document.getElementById("faststirr")
    };

    for (let key in controlpanel) {
        if (controlpanel.hasOwnProperty(key)) {
            let button = controlpanel[key];
            if (button.type === "submit") {
                button.addEventListener("click", handleSubmit);
            }
        }
    }
});