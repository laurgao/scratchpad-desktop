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

const filters = [{ name: "Markdown files", extensions: ["md"] }];

ipcMain.on("openDir", (event: IpcMainEvent) => {
    dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
    }).then(({ filePaths }) => {
        if (filePaths && filePaths[0]) {
            // let fileContents: { title: string, sections: Section[] }[] = [];
            const dirPath = filePaths[0];
            fs.readdir(dirPath, (err, subFolders) => {
                if (err) {
                    console.log("error");
                }
                let folders: Folder[] = []
                console.log(dirPath)
                // files.forEach((f) => {
                //     // var folder: Folder = { name: f, files: [] };
                //     console.log(filePath + "\\" + f)
                //     fs.readdir((filePath + "\\" + f), (error, fichiers) => {
                //         if (error) console.log("error")
                //         // returned = returned.map(folder => folder.name === f ? { ...folder, files: fichiers } : folder)
                //         // folder.files = fichiers;
                //         console.log(fichiers)
                //         // console.log(f, returned, fichiers)
                //         returned.push({ name: f, files: fichiers })
                //     })
                //     // console.log(folder);
                //     // returned.push(folder)
                // })
                for (const subFolder of subFolders) {
                    fs.readdir((dirPath + "\\" + subFolder), (error, fichiers) => {
                        if (error) console.log("error")
                        folders.push({ name: subFolder, fileNames: fichiers })
                        console.log(folders)
                    })
                }
                event.sender.send("openDir", { filePath: dirPath, folders });
            });
        }
    })
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("open", (event: IpcMainEvent) => {
    dialog.showOpenDialog(window, {
        filters: filters,
        // multiSelections: false,
    }).then(({ filePaths }) => {
        if (filePaths && filePaths[0]) {
            const filePath = filePaths[0];
            currentFilePath = filePath;
            const filename = path.basename(filePath);
            fs.readFile(filePath, "utf-8", (err, content) => {
                if (err) {
                    console.log("error");
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
                    console.log(content);
                    console.log(sections);
                    event.sender.send("open", { filename, sections });
                }
            })
        }
    });
});

ipcMain.on("save", (event: IpcMainEvent, items: Section[]) => {
    fs.writeFileSync(currentFilePath, getFileString(items));
    event.sender.send("save");
});

ipcMain.on("saveAs", (event: IpcMainEvent, items: Section[]) => {
    dialog.showSaveDialog(window, {
        filters: filters,
    }).then(({ filePath }) => {
        if (!filePath) return;
        currentFilePath = filePath;
        fs.writeFileSync(filePath, getFileString(items));
        const filename = path.basename(filePath);
        event.sender.send("saveAs", filename);
    });
})

ipcMain.on("new", () => {
    currentFilePath = "";
});