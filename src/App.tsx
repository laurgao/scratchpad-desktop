import Mousetrap from "mousetrap";
import "mousetrap-global-bind";
import { ButtonHTMLAttributes, DetailedHTMLProps, useContext, useEffect, useState } from "react";
import { FaAngleDown, FaAngleRight, FaCog } from "react-icons/fa";
import Accordion from "react-robust-accordion";
import FileWithSections from "../components/FileWithSections";
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

function App() {
    const [isAwaitingOpen, setIsAwaitingOpen] = useState<boolean>(false);
    const [isAwaitingSave, setIsAwaitingSave] = useState<boolean>(false);
    const [isAwaitingSaveAs, setIsAwaitingSaveAs] = useState<boolean>(false);
    const [fileContent, setFileContent] = useState<Section[] | null>(null);
    const [content, setContent] = useState<Section[] | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const fileIsOpen = !!content;
    const [settingsIsOpen, setSettingsIsOpen] = useState<boolean>(false);
    const [vaultPath, setVaultPath] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);

    const { language, setLanguage } = useContext(LanguageContext);

    const topBarHeight = 40;
    const mainContainerHeight = (fileIsOpen) ? `calc(100vh - ${footerHeight}px)` : "100vh"

    function handleSave() {
        if (!filename) return handleSaveAs();
        if (content) {
            setIsAwaitingSave(true);
            window.Main.Save(content);
        }
    }

    function handleSaveAs() {
        if (content) {
            setIsAwaitingSaveAs(true);
            window.Main.SaveAs(content);
        }
    }

    function handleOpen() {
        setIsAwaitingOpen(true);
        window.Main.OpenDir();
    }

    function handleNew() {
        setFileContent(null);
        setContent(null);
        setFilename(null);
        window.Main.New();
    }

    useEffect(() => {
        if (isAwaitingOpen && window.Main)
            // window.Main.on("open", ({ filename, sections }: { filename: string, sections: Section[] }) => {
            //     setFilename(filename);
            //     setFileContent(sections);
            //     setContent(sections);
            //     setIsAwaitingOpen(false);
            // });
            window.Main.on("openDir", (returned: { filePath: string, folders: Folder[] }) => {
                console.log("returned!", returned)
                setVaultPath(returned.filePath)
                setFolders(returned.folders);
                setIsAwaitingOpen(false);
            })
    }, [isAwaitingOpen]);

    useEffect(() => {
        if (isAwaitingSave && window.Main)
            window.Main.on("save", () => {
                setFileContent(content);
                setIsAwaitingSave(false);
            });
    }, [isAwaitingSave]);

    useEffect(() => {
        if (isAwaitingSaveAs && window.Main)
            window.Main.on("saveAs", (filename: string) => {
                setFilename(filename);
                setContent(content);
                setFileContent(content);
                setIsAwaitingSave(false);
            });
    }, [isAwaitingSaveAs]);

    useEffect(() => {
        if (content) {
            // @ts-ignore doesn't recognize global
            Mousetrap.bindGlobal("mod+s", handleSave);
            // @ts-ignore doesn't recognize global
            Mousetrap.bindGlobal("mod+shift+s", handleSaveAs);
        }

        return () => {
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+s");
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+shift+s");
        }
    }, [content]);

    useEffect(() => {
        // @ts-ignore doesn't recognize global
        Mousetrap.bindGlobal("mod+o", handleOpen);
        // @ts-ignore doesn't recognize global
        Mousetrap.bindGlobal("mod+n", handleNew);

        return () => {
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+o");
            // @ts-ignore doesn't recognize global
            Mousetrap.unbindGlobal("mod+n");
        }
    })

    return (
        <>
            <div className="w-full flex items-center h-10 draggable text-sm fixed bg-stone-200 z-50">
                <span className="ml-4">
                    {/* TOOD: saved status in the title. */}
                    {`${content ? (filename || "New list*") : "Scratchpad"}${(!!filename && !!content && !!fileContent && !(content === fileContent) ? "*" : "")}`}
                </span>
                {/* {content && (
                    <div className="flex items-center ml-3 undraggable h-full">
                        <div
                            className="h-full flex items-center px-3 text-gray-400 hover:bg-gray-100 relative"
                            tabIndex={0}
                            onMouseEnter={() => setIsFileOpen(true)}
                            onFocus={() => setIsFileOpen(true)}
                            onMouseLeave={() => setIsFileOpen(false)}
                            onBlur={() => setIsFileOpen(false)}
                        >
                            <span>File</span>
                            {isFileOpen && (
                                <div className="absolute bg-white top-10 left-0">
                                    <MenuButton onClick={handleNew}>New (Ctrl+N)</MenuButton>
                                    <MenuButton onClick={handleSave}>Save (Ctrl+S)</MenuButton>
                                    <MenuButton onClick={handleSaveAs}>Save as (Ctrl+Shift+S)</MenuButton>
                                    <MenuButton onClick={handleOpen}>Open (Ctrl+O)</MenuButton>
                                </div>
                            )}
                        </div>
                    </div>
                )} */}
                <div className="ml-auto flex items-center undraggable h-full">
                    <AppBarButton onClick={window.Main.Minimize}>&#8211;</AppBarButton>
                    <AppBarButton onClick={window.Main.Close}>&#10005;</AppBarButton>
                </div>
            </div>
            <Container className="flex overflow-y-hidden" width="full" padding={0} style={{ height: mainContainerHeight, paddingTop: topBarHeight }}>
                {fileIsOpen ? (
                    <div className="px-4 overflow-y-auto flex-grow pt-4">
                        {filename && <FileWithSections filename={filename} sections={content} />}
                    </div>
                ) : vaultPath ? (
                    <div className="px-4 overflow-y-auto flex-grow pt-4">
                        {folders && folders.map(folder => (
                            <div key={folder.name} className="-mt-0.5">
                                <Accordion
                                    className="text-base text-gray-500 mb-1"
                                    label={
                                        <div
                                            className={`flex items-center rounded-md px-2 py-1`}
                                        >
                                            {false ? <FaAngleDown /> : <FaAngleRight />}
                                            <p className="ml-2">{folder.name}</p>
                                        </div>
                                    }
                                >
                                    <div className="text-base text-gray-500 mb-2 ml-5 mt-1 overflow-x-visible">
                                        {folder.fileNames.map((file, idx) =>
                                            <div key={file}>
                                                <p
                                                    className={`cursor-pointer rounded-md px-2 py-1 ${false && "bg-blue-400 text-white"}`}
                                                >{file}</p>
                                            </div>
                                        )}</div>
                                </Accordion>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 flex-grow">
                        <p className="text-center text-gray-400">{language === "EN" ? "No file open." : "Aucun fichier ouvert."}</p>
                        <div className="flex my-4">
                            <UiButton className="mx-auto" onClick={handleOpen}>{language === "FR" ? "Ouvrez" : "Open"}</UiButton>
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
