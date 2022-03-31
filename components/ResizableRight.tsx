import { Dispatch, SetStateAction, useState } from "react";

const snapWidth = 50; // feels right from my UX POV
export default function ResizableRight(props: React.HTMLProps<HTMLDivElement> & { draggedBorderHeight: string, width: number, setWidth: Dispatch<SetStateAction<number>> }) {
    const { width, setWidth } = props;
    const [isDragging, setIsDragging] = useState<boolean>(false)

    let propsCopy = { ...props, draggedBorderHeight: undefined, width: undefined, setWidth: undefined };
    const displayedWidth = width > snapWidth ? width : 0

    propsCopy.style = { ...props.style, width: displayedWidth };
    const [dragImg, setDragImg] = useState<HTMLImageElement>(() => {
        let dragImgTemp = new Image(0, 0);
        dragImgTemp.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        // Transparent img from https://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
        return dragImgTemp
    });

    return (
        <div className="flex">
            {(width >= snapWidth || (!width && width !== 0)) && <div {...propsCopy}>
            </div>}

            <div
                className={`bg-invisible hover:bg-blue-100 transition w-1 ${isDragging ? "absolute z-10 bg-blue-300" : ""}`}
                style={{ cursor: "col-resize", left: displayedWidth, height: props.draggedBorderHeight }}
                draggable={true}
                onDragStart={e => {
                    setIsDragging(true)
                    setWidth(e.pageX)
                    e.dataTransfer.setDragImage(dragImg, 0, 0);
                    e.dataTransfer.effectAllowed = "copyMove";
                }}
                onDrag={e => {
                    setWidth(e.pageX)
                }}
                onDragEnd={e => {
                    setIsDragging(false);
                    setWidth(e.pageX)
                }}
            />
        </div>
    )
}