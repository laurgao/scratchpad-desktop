import Mousetrap from "mousetrap";
import "mousetrap-global-bind";
import React, { ButtonHTMLAttributes, DetailedHTMLProps, useEffect, useState } from "react";
import FileWithSections from "../components/FileWithSections";
import { Section } from "../utils/types";

const AppBarButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} hover:bg-gray-100 h-full w-10`} />
);

const UiButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
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

    const topBarThingyHeight = 40;

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
        window.Main.Open();
    }

    function handleNew() {
        setFileContent(null);
        setContent(null);
        setFilename(null);
        window.Main.New();
    }

    useEffect(() => {
        if (isAwaitingOpen && window.Main)
            window.Main.on("open", ({ filename, sections }: { filename: string, sections: Section[] }) => {
                setFilename(filename);
                setFileContent(sections);
                setContent(sections);
                setIsAwaitingOpen(false);
            });
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
            <div className="w-full flex items-center h-10 draggable text-sm fixed bg-gray-50 z-50">
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
            {content ? (
                <div className="px-4" style={{ paddingTop: topBarThingyHeight }}>
                    {content && filename && <FileWithSections
                        filename={filename}
                        sections={content}
                    />}
                </div>
            ) : (
                <div className="p-4" style={{ paddingTop: topBarThingyHeight }}>
                    <p className="text-center text-gray-400">No todo list open</p>
                    <div className="flex my-4">
                        <UiButton className="mx-auto" onClick={() => {
                            window.Main.Open();
                            setIsAwaitingOpen(true);
                        }}>Open</UiButton>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
