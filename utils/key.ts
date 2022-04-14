import { useEffect, useRef } from "react";

export function useKey(key, cb) {
    const callbackRef = useRef(cb);

    useEffect(() => {
        callbackRef.current = cb;
    })

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === key) {
                callbackRef.current(e)
            }
        }

        document.addEventListener("keydown", handleKeyPress)
        return () => document.removeEventListener("keydown", handleKeyPress)
        // "keydown" instead of "keypress" allows us to use ctrl, alt, escape, etc.
    }, [key])
}

export function waitForEl(selector: string) {
    const input = document.getElementById(selector);
    if (input) {
        input.focus();
    } else {
        setTimeout(function () {
            waitForEl(selector);
        }, 100);
    }
};
