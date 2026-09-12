const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const window = new BrowserWindow({
        width: 1100,
        height: 700,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    window.loadFile("index.html");
    window.setMenuBarVisibility(false);
}

app.whenReady().then(() => {

    createWindow();

    ipcMain.handle("selectMusics", async () => {

        const result = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],

            filters: [
                {
                    name: "Músicas",
                    extensions: [
                        "mp3",
                        "wav",
                        "ogg",
                        "flac",
                        "m4a"
                    ]
                }
            ]
        });

        if (result.canceled) {
            return [];
        }

        // Pasta onde as músicas serão armazenadas
        const pastaMusicas = path.join(
            app.getPath("userData"),
            "musicas"
        );

        // Cria a pasta caso ela não exista
        if (!fs.existsSync(pastaMusicas)) {
            fs.mkdirSync(pastaMusicas, {
                recursive: true
            });
        }

        const musicasSalvas = [];

        for (const arquivo of result.filePaths) {

            const nome = path.basename(arquivo);

            const destino = path.join(
                pastaMusicas,
                nome
            );

            fs.copyFileSync(
                arquivo,
                destino
            );

            musicasSalvas.push({
                name: nome,
                path: destino
            });
        }

        return musicasSalvas;
    });

    ipcMain.handle("loadMusics", async () => {

        const pastaMusicas = path.join(
            app.getPath("userData"),
            "musicas"
        );

        if (!fs.existsSync(pastaMusicas)) {
            fs.mkdirSync(pastaMusicas, {
                recursive: true
            });

            return [];
        }

        const arquivos = fs.readdirSync(pastaMusicas);

        const extensoesPermitidas = [
            ".mp3",
            ".wav",
            ".ogg",
            ".flac",
            ".m4a"
        ];

        return arquivos
            .filter(arquivo => {
                return extensoesPermitidas.includes(
                    path.extname(arquivo).toLowerCase()
                );
            })
            .map(arquivo => ({
                name: arquivo,
                path: path.join(pastaMusicas, arquivo)
            }));
    });

    ipcMain.handle("openMusicFolder", async () => {

        const pastaMusicas = path.join(
            app.getPath("userData"),
            "musicas"
        );

        if (!fs.existsSync(pastaMusicas)) {
            fs.mkdirSync(pastaMusicas, {
                recursive: true
            });
        }

        await shell.openPath(pastaMusicas);
    });
});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});