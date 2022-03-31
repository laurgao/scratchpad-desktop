import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent } from "electron";
import isDev from "electron-is-dev";
import * as fs from "fs";
import path, { join } from "path"; // Native
import getFileString from "../utils/getFileString";
// import getTodoStringIndices from "../utils/getTodoStringIndices";
import { Folder, Section } from "../utils/types";


const height = 600, width = 800, minWidth = 100, minHeight = 100;
let window: BrowserWindow;
let currentFilePath: string = "";

function createWindow() {
    // Create the browser window.
    window = new BrowserWindow({
        width,
        height,
        minWidth,
        minHeight,
        //  change to false to use AppBar
        frame: false,
        show: true,
        resizable: true,
        fullscreenable: true,
        webPreferences: {
            preload: join(__dirname, "preload.js"),
            webSecurity: false,
        }
    });

    const port = process.env.PORT || 4000;
    const url = isDev ? `http://localhost:${port}` : join(__dirname, "../../src/out/index.html");

    // and load the index.html of the app.
    if (isDev) {
        window?.loadURL(url);
    } else {
        window?.loadFile(url);
    }
    // Open the DevTools.
    // window.webContents.openDevTools();

    // For AppBar
    ipcMain.on("minimize", () => {
        // eslint-disable-next-line no-unused-expressions
        window.isMinimized() ? window.restore() : window.minimize();
        // or alternatively: win.isVisible() ? win.hide() : win.show()
    });
    ipcMain.on("maximize", () => {
        // eslint-disable-next-line no-unused-expressions
        window.isMaximized() ? window.restore() : window.maximize();
    });

    ipcMain.on("close", () => {
        window.close();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.on("openDir", (event: IpcMainEvent) => {
    dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
    }).then(({ filePaths }) => {
        if (filePaths && filePaths[0]) {
            const dirPath = filePaths[0];
            // ohhhhh fs.readdir is an async function
            // the 2nd argument is a callback function that is run after the directory is read
            fs.readdir(dirPath, (err, subFolders) => {
                if (err) console.log("error with opening the directory " + dirPath);
                let folders: Folder[] = [];

                for (const subFolder of subFolders) {
                    const fichiers = fs.readdirSync(dirPath + "\\" + subFolder);
                    folders.push({ name: subFolder, fileNames: fichiers })
                }
                event.sender.send("openDir", { path: dirPath, folders });
            });
            // so the stuff here will not be run after the fs.readdir is run but potentially before the directory is read.
            // since it's not a promise, awaiting it won't help.
        }
    })
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("open", (event: IpcMainEvent, filePath: string) => {
    currentFilePath = filePath;
    const filename = path.basename(filePath);
    fs.readFile(filePath, "utf-8", (err, content) => {
        if (err) {
            console.log("error with opening the file path " + filePath);
        } else {
            const lines = content.split(/\r\n|\n\r|\n|\r/);
            let id = 1;

            let sections = [];
            let currSectionBody = null;
            let currSectionTitle = null;
            for (let line of lines) {
                // starts with # followed by space
                let match = line.match(/^#+ /);
                if (match && match.index === 0 && match[0] == "# ") {
                    if (!(currSectionBody === null || currSectionTitle === null)) sections.push({ title: currSectionTitle, body: currSectionBody, _id: id.toString() });
                    id++;
                    currSectionBody = "";
                    currSectionTitle = line.slice(2); // Get rid of `# `
                } else {
                    currSectionBody += (line + "\n");
                }
            }
            sections.push({ title: currSectionTitle, body: currSectionBody, _id: id.toString() });
            event.sender.send("open", { filename, sections });
        }
    });
});

ipcMain.on("save", (event: IpcMainEvent, items: Section[]) => {
    fs.writeFileSync(currentFilePath, getFileString(items));
    event.sender.send("save");
});

ipcMain.on("newFile", (event: IpcMainEvent, filePath: string) => {
    if (!filePath) return;
    currentFilePath = filePath;
    const startingFileContent = `# `
    fs.writeFileSync(filePath, startingFileContent);
    const filename = path.basename(filePath);
    event.sender.send("newFile", filename);
})

ipcMain.on("new", () => {
    currentFilePath = "";
});