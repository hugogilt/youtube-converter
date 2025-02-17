const express = require("express");
const cors = require("cors");
const youtubeDl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.static("public"));

const DOWNLOAD_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

// Función para limpiar el nombre del archivo
const sanitizeFileName = (name) => {
    return name.replace(/[<>:"/\\|?*]+/g, "").trim(); // Elimina caracteres no válidos
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/download", async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "URL no válida" });

    try {
        // Obtener título del video con cabeceras simulando un navegador
        const title = await youtubeDl(videoUrl, { 
            getTitle: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        });
        const sanitizedTitle = sanitizeFileName(title);
        const fileName = `${sanitizedTitle}.mp3`;
        const outputFilePath = path.join(DOWNLOAD_DIR, fileName);

        // Descargar el audio con cabeceras adicionales
        await youtubeDl(videoUrl, {
            extractAudio: true,
            audioFormat: "mp3",
            output: outputFilePath,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            referer: "https://www.youtube.com/",
            verbose: true,
        });

        // Enviar el archivo al usuario
        res.download(outputFilePath, fileName, (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                return res.status(500).json({ error: "Error al descargar el archivo" });
            }
        });

        // Eliminar el archivo después de la descarga
        res.on("finish", () => {
            fs.unlink(outputFilePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error al eliminar archivo:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("Error en la conversión:", error);
        res.status(500).json({ error: "Error en la conversión" });
    }
});




const PORT = process.env.PORT || 3000; // Usa el puerto proporcionado por Render o el 3000 como fallback

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

