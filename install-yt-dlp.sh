#!/bin/bash

# Lade die Linux-Version von yt-dlp herunter (damit es auf Render funktioniert)
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o yt-dlp
chmod +x yt-dlp
mv yt-dlp /usr/local/bin/yt-dlp
