Serverseitige API:

/recipepanelAPI/:selected_id           <- Modifizieren von einzelnen Einträgen
    .delete[masterID]                   <- einen Masterdata Eintrag löschen
    .get[masterID]                      <- Daten holen um damit Tabelle zu füllen
    .put[masterID]                      <- einmal alle Zeilen durchgehen und Updaten
        body:
            [
                selectedMasterdata,     <- int
                master,                 <- array
                rests,                  <- array
                hops,                   <- array
                malts                   <- array
            ]

/recipepanelAPI                        <- Wichtig! ohne ID am schluss
    .post                               <- neues Recept inserieren
        body:
            [
                master,                 <- array
                rests,                  <- array
                hops,                   <- array
                malts                   <- array
            ]
    .get                                <-get masternames für das Dropdown Menü