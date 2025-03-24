const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", (req, res) => {
  const videoUrl = req.body.video_url;

  if (!videoUrl) {
    return res.status(400).json({ error: "video_url fehlt im Body." });
  }

  console.log("Empfangene URL:", videoUrl);

  // yt-dlp aus lokalem Ordner aufrufen
  exec(`./bin/yt-dlp -o temp.mp4 "${videoUrl}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Fehler beim Download:", stderr);
      return res.status(500).json({ error: "Fehler beim Video-Download." });
    }

    console.log("Download erfolgreich:", stdout);
    return res.json({ message: "Video erfolgreich heruntergeladen." });
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
