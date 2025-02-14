const express = require("express");
const cors = require("cors");
const youtubeDl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.static("public"));

const COOKIES_FILE_PATH = "./cookies.txt"; // Render no admite archivos JSON, usa formato Netscape
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// Crear carpeta si no existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

// Función para limpiar nombres de archivos
const sanitizeFileName = (name) => {
    return name.replace(/[<>:"/\\|?*]+/g, "").trim();
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/download", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL no válida" });

    try {
        // Obtener título del video
        const title = await youtubeDl(videoUrl, { 
            dumpJson: true,
            cookies: COOKIES_FILE_PATH,
        }).then((output) => JSON.parse(output).title);

        const sanitizedTitle = sanitizeFileName(title);
        const fileName = `${sanitizedTitle}.mp3`;
        const outputFilePath = path.join(DOWNLOAD_DIR, fileName);

        // Descargar el audio
        await youtubeDl(videoUrl, {
            extractAudio: true,
            audioFormat: "mp3",
            output: outputFilePath,
            cookies: COOKIES_FILE_PATH,
            verbose: true,
        });

        // Servir el archivo en una URL en lugar de `res.download()`
        res.json({ 
            message: "Descarga lista",
            url: `/downloads/${fileName}`,
        });

    } catch (error) {
        console.error("Error en la conversión:", error);
        res.status(500).json({ error: "Error en la conversión" });
    }
});

// Servir archivos estáticos desde la carpeta de descargas
app.use("/downloads", express.static(DOWNLOAD_DIR));

// Definir puerto dinámico de Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
