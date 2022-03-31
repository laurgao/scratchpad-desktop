import { format } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleRight, FaPlus, FaTrash } from "react-icons/fa";
import Accordion from "react-robust-accordion";
import { UiButton } from "../src/App";
import { Folder } from "../utils/types";
import Button from "./headless/Button";
import Input from "./headless/Input";
import Modal from "./headless/Modal";
import ResizableRight from "./ResizableRight";


export const defaultWidth = 200

const FoldersSidebar = ({ mainContainerHeight, folders, handleOpenFile, openFileName, width, setWidth }: { mainContainerHeight: string, folders: Folder[], handleOpenFile: (folderName: string, fileName: string) => void, openFileName: string | null, width: number, setWidth: Dispatch<SetStateAction<number>> }) => {
    const dateFileName = format(new Date(), "yyyy-MM-dd");
    const [newFileName, setNewFileName] = useState<string>(dateFileName);
    const [isNewFolder, setIsNewFolder] = useState<boolean>(false);
    const [hoverCoords, setHoverCoords] = useState<number[] | null>(null);
    const [toDeleteItem, setToDeleteItem] = useState<any>(null);
    const [toDeleteItemForRightClick, setToDeleteItemForRightClick] = useState<any[] | null>(null);
    const [openFolderName, setOpenFolderName] = useState<string | null>(null);

    function onCreateNewFolder() {
        // TODO
    }

    function handleSubmitNewFolder() {
        // TODO
    }

    function deleteFile(x, y) {
        // TODO
    }

    const RightClickMenu = ({ file, x = 0, y = 0 }) => {
        const thisMenu = useRef<HTMLDivElement>(null);
        useEffect(() => {
            const moreButtonClickHandler = e => {
                if (thisMenu.current !== null) {
                    const isNotButton = e.target !== thisMenu.current && !(thisMenu.current.contains(e.target));
                    if (isNotButton) {
                        setToDeleteItemForRightClick(null);
                    }
                }
            };

            window.addEventListener('click', moreButtonClickHandler);

            return function cleanup() {
                window.removeEventListener("click", moreButtonClickHandler);
            }
        }, []);

        return file ? (
            <div
                ref={thisMenu}
                id={file._id}
                className="bg-white shadow-md z-20 absolute text-sm border border-gray-300 text-gray-600"
                style={{ top: y, left: x }}
            >
                <Button onClick={() => {
                    setToDeleteItem(file);
                    setToDeleteItemForRightClick([null, null, null]);
                }} className="hover:bg-gray-100 py-2 px-4" childClassName="flex items-center">
                    <FaTrash /><span className="ml-2">Delete</span>
                </Button>
            </div>
        ) : <></>
    }
    return (
        <>
            {!!hoverCoords &&
                <div
                    className="bg-white border border-gray-400 p-1 z-30 absolute text-xs text-gray-400"
                    style={{ left: (hoverCoords[0] + 20), top: (hoverCoords[1]) }}
                >(win) ctrl + /<br />(mac) cmd + /</div>
            }

            {toDeleteItem && <Modal isOpen={!!toDeleteItem} onClose={() => setToDeleteItem(null)}> {/*  small={true}*/}
                <div className="text-center">
                    <p>Are you sure you want to delete this {"user" in toDeleteItem ? "folder and all its files" : "file"}? This action cannot be undone.</p>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <UiButton
                            onClick={() => deleteFile(toDeleteItem._id, "user" in toDeleteItem ? "folder" : "file")}
                        // isLoading={isLoading}
                        >Delete</UiButton>
                        <Button onClick={() => setToDeleteItem(null)} className="font-semibold text-sm">Cancel</Button>
                    </div>
                </div>
            </Modal>}

            {toDeleteItemForRightClick && <RightClickMenu file={toDeleteItemForRightClick[0]} x={toDeleteItemForRightClick[1]} y={toDeleteItemForRightClick[2]} />}

            <ResizableRight
                width={width}
                setWidth={setWidth}
                style={{ height: mainContainerHeight }}
                draggedBorderHeight={mainContainerHeight}
                className="overflow-auto px-4 bg-gray-100 pb-4"
            >
                <div className="text-xs text-gray-400 my-4">
                    {isNewFolder ? (
                        <p className={(newFileName && openFolderName) ? "" : "invisible"}>Enter to save<br />Esc to exit</p>
                    ) : (
                        <Button
                            childClassName="flex items-center"
                            onClick={onCreateNewFolder}
                            onMouseLeave={(e) => setHoverCoords(null)}
                            onMouseMove={e => setHoverCoords([e.pageX, e.pageY])}
                            onMouseEnter={e => setHoverCoords([e.pageX, e.pageY])}
                        >
                            <FaPlus /><p className="ml-2">New {!openFolderName ? "folder" : "file"}</p>
                        </Button>
                    )}
                </div>
                <div className="">
                    {folders && folders.map(folder => (
                        <div key={folder.name} className="-mt-0.5">
                            <Accordion
                                className="text-base text-gray-500 mb-1"
                                label={
                                    <div
                                        className={`flex items-center rounded-md px-2 py-1`}
                                    >
                                        {openFolderName === folder.name ? <FaAngleDown /> : <FaAngleRight />}
                                        <p className="ml-2">{folder.name}</p>
                                    </div>
                                }
                                openState={openFolderName === folder.name}
                                setOpenState={(event) => {
                                    // Handle only allowing 1 folder open at a time
                                    if (openFolderName === folder.name) setOpenFolderName(null);
                                    else setOpenFolderName(folder.name);
                                }}
                            >
                                <div className="text-base text-gray-500 mb-2 ml-5 mt-1 overflow-x-visible">
                                    {folder.fileNames.map((fileName, idx) =>
                                        <div key={fileName} onClick={() => handleOpenFile(folder.name, fileName)}>
                                            <p
                                                className={`cursor-pointer rounded-md px-2 py-1 ${openFileName === fileName && "bg-blue-400 text-white"}`}
                                            >{fileName}</p>
                                        </div>
                                    )}</div>
                            </Accordion>
                        </div>
                    ))}</div>
                {(isNewFolder && !openFolderName) && (
                    <>
                        <Input
                            value={newFileName}
                            setValue={setNewFileName}
                            type="text"
                            placeholder="Folder name"
                            id="new-file"
                            className="text-base text-gray-500"
                            onKeyDown={e => {
                                if (e.key === "Enter") handleSubmitNewFolder();
                                else if (e.key === "Escape") setIsNewFolder(false);
                            }}
                        />
                        {!!newFileName && <p className="text-xs text-gray-400">Enter to save<br />Esc to exit</p>}
                    </>
                )}
            </ResizableRight>
        </>
    )
}

export default FoldersSidebar