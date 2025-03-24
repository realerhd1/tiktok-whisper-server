import express from "express";
import { execSync } from "child_process";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

app.post("/transcribe", async (req, res) => {
  const { tiktok_url } = req.body;
  const id = uuidv4();
  const videoPath = `/tmp/${id}.mp4`;

  try {
    execSync(`yt-dlp -o ${videoPath} ${tiktok_url}`);

    const form = new FormData();
    form.append("file", fs.createReadStream(videoPath));
    form.append("model", "whisper-1");

    const whisperRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    fs.unlinkSync(videoPath);
    res.json({ transcript: whisperRes.data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler bei Verarbeitung", details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server läuft auf Port 3000");
});
