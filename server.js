const express = require("express");
const cors = require("cors");
const { exec } = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const DOWNLOAD_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

app.get("/download", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL no válida" });

    const outputFilePath = path.join(DOWNLOAD_DIR, "audio.mp3");

    try {
        await exec(videoUrl, {
            extractAudio: true,
            audioFormat: "mp3",
            output: outputFilePath,
            ffmpegLocation: "/usr/bin/ffmpeg", // Ruta a ffmpeg
            verbose: true,
        });

        res.download(outputFilePath, "audio.mp3", (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                res.status(500).json({ error: "Error al descargar el archivo" });
            }
            fs.unlinkSync(outputFilePath); // Elimina el archivo después de la descarga
        });

    } catch (error) {
        console.error("Error al descargar:", error);
        res.status(500).json({ error: "Error en la conversión" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
