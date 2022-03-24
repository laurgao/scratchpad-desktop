import { contextBridge, ipcRenderer } from "electron";
import { Section } from "../utils/types";

declare global {
    interface Window {
        Main: typeof api;
        ipcRenderer: typeof ipcRenderer;
    }
}

const api = {
    /**
     * Here you can expose functions to the renderer process
     * so they can interact with the main (electron) side
     * without security problems.
     *
     * The function below can accessed using `window.Main.sayHello`
     */
    /**
     Here function for AppBar
     */
    Minimize: () => {
        ipcRenderer.send("minimize");
    },
    Maximize: () => {
        ipcRenderer.send("maximize");
    },
    Close: () => {
        ipcRenderer.send("close");
    },
    Open: () => {
        ipcRenderer.send("open");
    },
    Save: (content: Section[]) => {
        ipcRenderer.send("save", content);
    },
    SaveAs: (content: Section[]) => {
        ipcRenderer.send("saveAs", content);
    },
    New: () => {
        ipcRenderer.send("new");
    },
    /**
     * Provide an easier way to listen to events
     */
    on: (channel: string, callback: (data: any) => void) => {
        ipcRenderer.on(channel, (_, data) => callback(data));
    }
};
contextBridge.exposeInMainWorld("Main", api);
/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
