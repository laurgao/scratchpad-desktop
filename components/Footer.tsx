import { useContext, useEffect, useState } from 'react';
import { Section } from "../utils/types";
import { LanguageContext } from "./SettingsModal";

const Footer = ({ sections, openSectionId, eq, isSaved }: { sections: Section[], openSectionId: string | null, eq: boolean, isSaved: boolean }) => {
    const { language, setLanguage } = useContext(LanguageContext);

    // Get data from simpleMDE
    function waitForEls(selector: string, cb: (x) => void) {
        const x = document.getElementsByClassName(selector)
        if (x && x.length > 0) {
            cb(x)
        } else {
            setTimeout(function () {
                waitForEls(selector, cb);
            }, 100);
        }
        return x
    }
    const [lines, setLines] = useState<string>("0");
    const [words, setWords] = useState<string>("0");
    const [cursorPos, setCursor] = useState<string>("0:0");

    useEffect(() => {
        if (openSectionId) {
            const openSectionIdx = sections.findIndex(s => s._id === openSectionId)
            waitForEls("lines", (x) => {
                setLines(x[openSectionIdx].innerHTML)
            })
            waitForEls("words", (x) => {
                setWords(x[openSectionIdx].innerHTML)
            })
        } else {
            setLines("0");
            setWords("0");
        }
    }, [openSectionId, sections])

    useEffect(() => {
        if (openSectionId) {

            const openSectionIdx = sections.findIndex(s => s._id === openSectionId)
            const cb = (e) => {
                waitForEls("cursor", (x) => {
                    setCursor(x[openSectionIdx].innerHTML)
                })
            }
            document.addEventListener('mousemove', cb);
            return () => document.removeEventListener("mousemove", cb)
        } else {
            setCursor("0:0");
        }
    })
    return (
        <div className="fixed z-40 bottom-0 right-0 w-screen text-slate-400 bg-slate-100 border-t border-slate-400 py-2 text-xs">
            <div className="flex gap-4 mx-4 relative float-right">
                <div>
                    {language === "FR" ? (eq ? "Tous les changements sont enregistrés" : isSaved ? "Enregistré" : "En train d'enregistrer...") : (eq ? "All changes updated" : isSaved ? "Saved" : "Saving...")}
                </div>
                {lines && <div>{language === "FR" ? "Lignes" : "Lines"}: {lines}</div>}
                {words && <div>{language === "FR" ? "Mots" : "Words"}: {words}</div>}
                <div>{cursorPos}</div>
            </div>
        </div>
    )
}

export default Footer