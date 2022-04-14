import { useEffect, useState } from "react";

export default function ResizableRight(props: React.HTMLProps<HTMLDivElement> & { minWidth: number, defaultWidth: number, draggedBorderHeight: string }) {
    const [width, setWidth] = useState(props.defaultWidth);
    const [isDragging, setIsDragging] = useState(false)

    let propsCopy = { ...props, defaultWidth: undefined, minWidth: undefined, draggedBorderHeight: undefined };
    propsCopy.style = { ...props.style, width: width }

    // @ts-ignore
    const [dragImg, setDragImg] = useState<HTMLImageElement>(null);
    useEffect(() => {
        let dragImgTemp = new Image(0, 0);
        dragImgTemp.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        // Transparent img from https://stackoverflow.com/questions/6018611/smallest-data-uri-image-possible-for-a-transparent-image
        setDragImg(dragImgTemp)
    }, [])

    return (
        <div className="flex">
            <div {...propsCopy}>
            </div>

            <div
                className={`bg-invisible hover:bg-blue-100 transition w-1 ${isDragging ? "absolute z-10 bg-blue-300" : ""}`}
                style={{ cursor: "col-resize", left: width, height: props.draggedBorderHeight }}
                draggable={true}
                onDragStart={e => {
                    setIsDragging(true)
                    setWidth(e.pageX > props.minWidth ? e.pageX : props.minWidth)
                    e.dataTransfer.setDragImage(dragImg, 0, 0);
                    e.dataTransfer.effectAllowed = "copyMove";
                }}
                onDrag={e => {
                    setWidth(e.pageX > props.minWidth ? e.pageX : props.minWidth)
                }}
                onDragEnd={e => {
                    setIsDragging(false);
                    setWidth(e.pageX > props.minWidth ? e.pageX : props.minWidth)
                }}
            />
        </div>
    )
}