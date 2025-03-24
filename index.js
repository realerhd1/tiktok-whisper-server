import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/", (req, res) => {
  const videoUrl = req.body.video_url;

  if (!videoUrl) {
    return res.status(400).json({ error: "video_url fehlt im Body." });
  }

  console.log("🎥 Empfange Video-URL:", videoUrl);

  // Schritt 1: TikTok-Video herunterladen
  exec(`./bin/yt-dlp -o temp.mp4 "${videoUrl}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Fehler beim Download:", stderr);
      return res.status(500).json({ error: "Fehler beim Video-Download." });
    }

    console.log("✅ Download erfolgreich:", stdout);

    // Schritt 2: Audio extrahieren
    exec(`ffmpeg -i temp.mp4 -ar 16000 -ac 1 -c:a mp3 audio.mp3 -y`, (err2, stdout2, stderr2) => {
      if (err2) {
        console.error("❌ Fehler bei ffmpeg:", stderr2);
        return res.status(500).json({ error: "Fehler beim Extrahieren der Audiodatei." });
      }

      console.log("🎧 Audio extrahiert:", stdout2);

      // Schritt 3: Whisper API aufrufen
      const formData = new FormData();
      formData.append("file", fs.createReadStream("audio.mp3"));
      formData.append("model", "whisper-1");

      axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
        })
        .then((response) => {
          console.log("📝 Transkript:", response.data);
          res.json({ transcription: response.data.text });

          // Optional: temporäre Dateien löschen
          fs.unlinkSync("temp.mp4");
          fs.unlinkSync("audio.mp3");
        })
        .catch((err3) => {
          console.error("❌ Fehler bei Whisper:", err3.response?.data || err3.message);
          res.status(500).json({ error: "Fehler bei der Transkription." });
        });
    });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
