import { CheckIcon } from '@heroicons/react/solid';
import Mousetrap from "mousetrap";
import "mousetrap-global-bind";
import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode, useContext, useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";
import FileWithSections from "../components/FileWithSections";
import FoldersSidebar, { defaultWidth } from "../components/FoldersSidebar";
import { footerHeight } from "../components/Footer";
import Button from "../components/headless/Button";
import Container from "../components/headless/Container";
import SettingsModal, { LanguageContext } from "../components/SettingsModal";
import { Folder, Section } from "../utils/types";

const AppBarButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} hover:bg-stone-300 h-full w-10`} />
);

export const UiButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} bg-blue-400 hover:bg-blue-700 text-white transition font-semibold py-1 px-2 text-sm border rounded`} />
);

const UiButton2 = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} py-1 px-2 text-sm text-gray-500 border rounded`} />
);

const MenuButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} h-10 w-full flex items-center px-4 text-gray-400 hover:bg-gray-100 whitespace-nowrap`} />
);

const MenuItem = ({ name, children }: { name: string, children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div
            className="h-full flex items-center px-3 text-gray-400 hover:bg-stone-100 relative"
            tabIndex={0}
            onMouseEnter={() => setIsOpen(true)}
            onFocus={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onBlur={() => setIsOpen(false)}
        >
            <span>{name}</span>
            {isOpen && children}
        </div>
    )
}

function App() {
    const [isAwaitingOpen, setIsAwaitingOpen] = useState<boolean>(false);
    const [isAwaitingOpenFile, setIsAwaitingOpenFile] = useState<boolean>(false);
    const [content, setContent] = useState<Section[] | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const fileIsOpen = !!content;
    const [settingsIsOpen, setSettingsIsOpen] = useState<boolean>(false);
    const [vaultPath, setVaultPath] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderbarWidth, setFolderbarWidth] = useState<number>(defaultWidth);
    const vaultIsOpen = !!vaultPath;

    const { language, setLanguage } = useContext(LanguageContext);

    const topBarHeight = 40;
    const mainContainerHeight = (fileIsOpen) ? `calc(100vh - ${footerHeight}px)` : "100vh"

    function handleOpenDir() {
        setIsAwaitingOpen(true);
        window.Main.OpenDir();
    }

    function handleOpenFile(folderName, fileName) {
        setIsAwaitingOpenFile(true);
        window.Main.Open(vaultPath + "\\" + folderName + "\\" + fileName);
    }

    useEffect(() => {
        if (isAwaitingOpen && window.Main)
            window.Main.on("openDir", (returned: { path: string, folders: Folder[] }) => {
                setVaultPath(returned.path)
                setFolders(returned.folders);
                setIsAwaitingOpen(false);
            })
    }, [isAwaitingOpen]);

    useEffect(() => {
        if (isAwaitingOpenFile && window.Main)
            window.Main.on("open", ({ filename, sections }: { filename: string, sections: Section[] }) => {
                setFilename(filename);
                setContent(sections);
                setIsAwaitingOpenFile(false);
            });
    }, [isAwaitingOpenFile]);

    useEffect(() => {
        // @ts-ignore doesn't recognize global
        Mousetrap.bindGlobal("mod+o", handleOpenDir);

        return () => {
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+o");
        }
    })

    function handleToggleFolderBar() {
        // Toggle open/close
        const folderBarIsOpen = folderbarWidth >= 50
        if (folderBarIsOpen) {
            setFolderbarWidth(0);
        } else {
            setFolderbarWidth(defaultWidth);
        }
    }

    useEffect(() => {
        if (vaultIsOpen) {
            // @ts-ignore doesn't recognize global
            Mousetrap.bindGlobal("mod+b", handleToggleFolderBar);
        }

        return () => {
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+b");
        }
    }, [vaultIsOpen]);

    return (
        <>
            <div className="w-full flex items-center h-10 draggable text-sm fixed bg-stone-200 z-50">
                <span className="ml-4">
                    {vaultIsOpen ? vaultPath.split("\\")[vaultPath.split("\\").length - 1] : "Scratchpad"}
                </span>
                <div className="flex items-center ml-3 undraggable h-full">
                    <MenuItem name="File">
                        <div className="absolute bg-white top-10 left-0">
                            {/* <MenuButton onClick={handleNew}>New (Ctrl+N)</MenuButton> */}
                            {/* <MenuButton onClick={handleSave}>Save (Ctrl+S)</MenuButton> */}
                            {/* <MenuButton onClick={handleSaveAs}>Save as (Ctrl+Shift+S)</MenuButton> */}
                            <MenuButton onClick={handleOpenDir}>{language === "EN" ? "Open vault" : "Ouvrir un dossier"} (Ctrl+O)</MenuButton>
                        </div>
                    </MenuItem>
                    {vaultIsOpen && <MenuItem name="View">
                        <div className="absolute bg-white top-10 left-0">
                            <MenuButton onClick={handleToggleFolderBar} className="flex">
                                <CheckIcon /><span className="ml-2">{language === "EN" ? "Folders" : "Dossiers"} (Ctrl+B)</span>
                            </MenuButton>
                        </div>
                    </MenuItem>}
                </div>
                <div className="ml-auto flex items-center undraggable h-full">
                    <AppBarButton onClick={window.Main.Minimize}>&#8211;</AppBarButton>
                    <AppBarButton onClick={window.Main.Close}>&#10005;</AppBarButton>
                </div>
            </div >
            <Container className="flex overflow-y-hidden" width="full" padding={0} style={{ height: mainContainerHeight, paddingTop: topBarHeight }}>
                {vaultPath ? (
                    <>
                        <FoldersSidebar
                            mainContainerHeight={mainContainerHeight}
                            folders={folders}
                            handleOpenFile={handleOpenFile}
                            openFileName={filename}
                            width={folderbarWidth}
                            setWidth={setFolderbarWidth}
                            vaultPath={vaultPath}
                        />
                        {fileIsOpen ? (
                            <div className="px-4 overflow-y-auto flex-grow pt-4">
                                {filename && <FileWithSections filename={filename} sections={content} />}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center text-center h-1/2 flex-grow">
                                {language === "EN" ? (
                                    <p>No file is open.<br />Ctrl + n or Cmd + n to create a new {false ? "folder to store your files" : "file"}.</p>
                                ) : (
                                    <p>Aucun fichier ouvert.<br />Utilisez Ctrl + n ou Cmd + n afin de créer un nouveau {false ? "dossier" : "fichier"}.</p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-4 flex-grow">
                        <p className="text-center text-gray-400">{language === "EN" ? "No folder is open." : "Aucun dossier ouvert."}</p>
                        <div className="flex my-4">
                            <UiButton className="mx-auto" onClick={handleOpenDir}>{language === "FR" ? "Ouvrez" : "Open"}</UiButton>
                        </div>
                    </div>
                )}
                <div className="w-12 flex flex-col justify-end items-center bg-gray-100 gap-2" >
                    <Button onClick={() => setSettingsIsOpen(true)}><FaCog className="text-gray-400" size={20} /></Button>
                </div>
            </Container>

            <SettingsModal isOpen={settingsIsOpen} onClose={() => setSettingsIsOpen(false)} />
        </>
    );
}

export default App;
