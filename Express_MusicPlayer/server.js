const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Imposta la cartella statica per servire i file musicali e altri file statici
app.use(express.static(path.join(__dirname, "public")));

// Endpoint per ottenere la lista dei brani musicali
app.get("/api/songs", (req, res) => {
    const songsDir = path.join(__dirname, "public/songs");

    fs.readdir(songsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Errore nella lettura dei file nella cartella 'songs'." });
        }

        const songList = files.map(file => {
            return {
                name: file,
                path: `/songs/${encodeURIComponent(file)}`
            };
        });

        res.json(songList);
    });
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});

// Gestione della rotta principale
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html"); 
});
