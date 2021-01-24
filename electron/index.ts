// Native
import path, { join } from "path";

// Packages
import { BrowserWindow, app, ipcMain, dialog, IpcMainEvent } from "electron";
import isDev from "electron-is-dev";
import * as fs from "fs";
import getTodoStringIndices from "../utils/getTodoStringIndices";
import { Item } from "../utils/types";
import getFileString from "../utils/getFileString";

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

    const port = process.env.PORT || 3000;
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("open", (event: IpcMainEvent) => {
    dialog.showOpenDialog(window, {
        filters: [{name: "todo files", extensions: ["todo"]}],
        // multiSelections: false,
    }).then(({filePaths}) => {
        if (filePaths && filePaths[0]) {
            const filePath = filePaths[0];
            currentFilePath = filePath;
            const filename = path.basename(filePath);
            fs.readFile(filePath, "utf-8", (err, content) => {
                if (err) {
                    console.log("error");
                } else {
                    // check if format is correct
                    const lines = content.split(/\r\n|\n\r|\n|\r/);
                    const valid = lines.every(d => {
                        const {openBracketIndex, closeBracketIndex, messageIndex} = getTodoStringIndices(d);
                        const startsWithDash = d.charAt(0) === "-";
                        const hasOpenBracket = d.charAt(openBracketIndex) === "[";
                        const hasCloseBracket = d.charAt(closeBracketIndex) === "]";
                        const hasMessage = !!d.charAt(messageIndex);
                        return startsWithDash && hasOpenBracket && hasCloseBracket && hasMessage;
                    });

                    if (!valid) {
                        console.log("error");
                        return;
                    }

                    const items = lines.map(d => {
                        const {openBracketIndex, messageIndex} = getTodoStringIndices(d);
                        const completed = d.charAt(openBracketIndex + 1).toLowerCase() === "x";
                        const task = d.substring(messageIndex);
                        return ({task, completed})
                    });

                    event.sender.send("open", {filename, items});
                }
            })
        }
    });
});

ipcMain.on("save", (event: IpcMainEvent, items: Item[]) => {
    fs.writeFileSync(currentFilePath, getFileString(items));
    event.sender.send("save");
});

ipcMain.on("saveAs", (event: IpcMainEvent, items: Item[]) => {
    dialog.showSaveDialog(window, {
        filters: [{name: "todo files", extensions: ["todo"]}],
    }).then(({filePath}) => {
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