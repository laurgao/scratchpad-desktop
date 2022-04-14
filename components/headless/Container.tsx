import { ReactNode } from "react";

export default function Container({ children, className, width = "4xl", padding = 4, style = {} }: { children: ReactNode, className?: string, width?: "4xl" | "7xl" | "full", padding?: 0 | 4 | 6 | 8, style?}) {
    return (
        <div
            className={"mx-auto " + ({
                0: "px-0",
                4: "px-4 ",
                6: "px-6 ",
                8: "px-8 ",
            }[padding]) + ({
                "4xl": "max-w-4xl ",
                "7xl": "max-w-7xl ",
                "full": " "
            }[width]) + (className || "")}
            style={style}
        >
            {children}
        </div>
    );
}