import React, { ButtonHTMLAttributes, DetailedHTMLProps, useEffect, useState } from "react";
import { Item } from "../utils/types";
import Mousetrap from "mousetrap";
import "mousetrap-global-bind";

const AppBarButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} hover:bg-gray-100 h-full w-10`} />
);

const UiButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} py-1 px-2 text-sm text-gray-500 border rounded`} />
);

const MenuButton = (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => (
    <button {...props} className={`${props.className || ""} h-10 w-full flex items-center px-4 text-gray-400 hover:bg-gray-100 whitespace-nowrap`} />
);

function areItemsEqual(a: Item[], b: Item[]) {
    if (a.length !== b.length) return false;
    if (!a.every((d, i) => d.completed === b[i].completed && d.task === b[i].task)) return false;
    return true;
}

function App() {
    const [isAwaitingOpen, setIsAwaitingOpen] = useState<boolean>(false);
    const [isAwaitingSave, setIsAwaitingSave] = useState<boolean>(false);
    const [isAwaitingSaveAs, setIsAwaitingSaveAs] = useState<boolean>(false);
    const [fileItems, setFileItems] = useState<Item[] | null>(null);
    const [items, setItems] = useState<Item[] | null>(null);
    const [filename, setFilename] = useState<string | null>(null);
    const [newTask, setNewTask] = useState<string>("");
    const [isFileOpen, setIsFileOpen] = useState<boolean>(false);

    function handleSave() {
        if (!filename) return handleSaveAs();
        if (items) {
            setIsAwaitingSave(true);
            window.Main.Save(items);
        }
    }

    function handleSaveAs() {
        if (items) {
            setIsAwaitingSaveAs(true);
            window.Main.SaveAs(items);
        }
    }

    function handleOpen() {
        setIsAwaitingOpen(true);
        window.Main.Open();
    }

    function handleNew() {
        setFileItems([]);
        setItems([]);
        setFilename(null);
        window.Main.New();
    }

    useEffect(() => {
        if (isAwaitingOpen && window.Main)
            window.Main.on("open", ({ filename, items }: { filename: string, items: Item[] }) => {
                setFilename(filename);
                setFileItems(JSON.parse(JSON.stringify(items)));
                setItems(JSON.parse(JSON.stringify(items)));
                setIsAwaitingOpen(false);
            });
    }, [isAwaitingOpen]);

    useEffect(() => {
        if (isAwaitingSave && window.Main)
            window.Main.on("save", () => {
                setFileItems(JSON.parse(JSON.stringify(items)));
                setIsAwaitingSave(false);
            });
    }, [isAwaitingSave]);

    useEffect(() => {
        if (isAwaitingSaveAs && window.Main)
            window.Main.on("saveAs", (filename: string) => {
                setFilename(filename);
                setItems(JSON.parse(JSON.stringify(items)));
                setFileItems(JSON.parse(JSON.stringify(items)));
                setIsAwaitingSave(false);
            });
    }, [isAwaitingSaveAs]);

    useEffect(() => {
        if (items) {
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
    }, [items]);

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
            <div className="w-full flex items-center h-10 draggable text-sm">
                <span className="ml-4">
                    {`${items ? (filename || "New list*") : "dotTodo"}${(!!filename && !!items && !!fileItems && !areItemsEqual(items, fileItems)) ? "*" : ""}`}
                </span>
                {items && (
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
                )}
                <div className="ml-auto flex items-center undraggable h-full">
                    <AppBarButton onClick={window.Main.Minimize}>&#8211;</AppBarButton>
                    <AppBarButton onClick={window.Main.Close}>&#10005;</AppBarButton>
                </div>
            </div>
            {items ? (
                <div className="px-4">
                    {items.map((item, i) => (
                        <div className="flex items-center my-2" key={i}>
                            <input
                                type="checkbox"
                                className="w-4 h-4 mr-3"
                                checked={item.completed}
                                onChange={e => {
                                    let newItems = [...items];
                                    newItems[i].completed = e.target.checked;
                                    setItems(newItems);
                                }}
                            />
                            <input
                                type="text"
                                className={`flex-1 border-b py-1 outline-none ${item.completed ? "line-through text-gray-500" : ""}`}
                                value={item.task}
                                onChange={e => {
                                    let newItems = [...items];
                                    newItems[i].task = e.target.value;
                                    setItems(newItems);
                                }}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        if (e.ctrlKey) {
                                            let newItems = [...items];
                                            newItems[i].completed = !item.completed;
                                            setItems(newItems);
                                        } else {
                                            // focus on next item
                                        }
                                    } else if (e.ctrlKey && e.key === "s") {
                                        handleSave();
                                    } else if (e.ctrlKey && e.key === "Delete") {
                                        let newItems = [...items];
                                        newItems.splice(i, 1);
                                        setItems(newItems);
                                    }
                                }}
                            />
                        </div>
                    ))}
                    <div className="flex items-center my-2">
                        <div className="w-4 h-4 mr-3 text-gray-300 text-center">
                            <span>+</span>
                        </div>
                        <input
                            type="text"
                            className={`flex-1 border-b py-1 outline-none`}
                            placeholder="Add new task"
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                            onKeyPress={e => {
                                if (e.key === "Enter") {
                                    setItems([...items, {task: newTask, completed: false}]);
                                    setNewTask("");
                                }
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="p-4">
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
