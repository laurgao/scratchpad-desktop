import { useContext, useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { waitForEl } from "../utils/key";
import { Section } from "../utils/types";
import Button from "./headless/Button";
import Input from "./headless/Input";
import SectionEditor from "./SectionEditor";
import { LanguageContext } from "./SettingsModal";
import H2 from "./style/H2";

const AUTOSAVE_INTERVAL = 1000;

export interface SectionKwargsObj {
    sectionId: string,
    condition: "initiate-on-editing-title" | "initiate-with-cursor-on-bottom" | "initiate-on-specified-cursor-pos",
    initialCursorPos?: { line: number, ch: number }
};

const FileWithSections = ({ filename, sections }: {
    filename: string,
    sections: Section[]
}) => {
    const lastOpenSection = sections[0]._id; // For now by default open the first section when we open a file.
    const [openSectionId, setOpenSectionId] = useState<string | null>(lastOpenSection);
    const [sectionsState, setSectionsState] = useState<Section[]>(sections); // Exposed to the editor components
    const [sectionsStateSaved, setSectionsStateSaved] = useState<Section[]>(sections); // Not exposed to the editor components, represents the content of the markdown files. 

    const [newSectionName, setNewSectionName] = useState<string>("");
    const [isCreateNewSection, setIsCreateNewSection] = useState<boolean>(false);
    const { language, setLanguage } = useContext(LanguageContext);


    function saveFile(sectionsToSave: Section[]): void {
        // if (!filename) return handleSaveAs();
        window.Main.on("save", () => {
            setIsSaved(true);
            setSectionsStateSaved(sectionsToSave);
        });
        window.Main.Save(sectionsToSave);
    }

    // Autosave stuff
    const eq = sectionsStateSaved.every((s, i) => Object.keys(s).every(k => s[k] === sectionsState[i][k])) // check the contents of the 2 vars
    const [isSaved, setIsSaved] = useState<boolean>(true);
    useEffect(() => {
        if (!eq) setIsSaved(false);
    }, [sectionsState])

    // Change footer to french on mount
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
    const [lines, setLines] = useState<string>("");
    const [words, setWords] = useState<string>("");
    const [cursorPos, setCursor] = useState<string>("");

    useEffect(() => {
        const openSectionIdx = sections.findIndex(s => s._id === openSectionId)
        waitForEls("lines", (x) => {
            setLines(x[openSectionIdx].innerHTML)
        })
        waitForEls("words", (x) => {
            setWords(x[openSectionIdx].innerHTML)
        })

    }, [openSectionId, sectionsState])

    useEffect(() => {
        const openSectionIdx = sections.findIndex(s => s._id === openSectionId)
        const cb = (e) => {
            waitForEls("cursor", (x) => {
                setCursor(x[openSectionIdx].innerHTML)
            })
        }
        document.addEventListener('mousemove', cb);
        return () => document.removeEventListener("mousemove", cb)
    })

    // MAIN AUTOSAVE INTERVAL
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSaved) saveFile(sectionsState)

        }, AUTOSAVE_INTERVAL);

        return () => {
            clearInterval(interval);
        }
    }, [sectionsState, isSaved])

    useEffect(() => {
        // Save section when component is unmounted
        return () => {
            if (!isSaved) saveFile(sectionsState);
        }
    }, [])


    // Used for passing information between sections
    // SectionEditor will run functions on open depending on sectionkwargs and will set sectionkwargs as null right after.
    const [sectionKwargs, setSectionKwargs] = useState<SectionKwargsObj | null>(null);
    return (
        <>
            {/* File title */}
            <div className="mb-4">
                {/* Display filename without the `.md` */}
                {<H2>{filename.slice(0, -3)}</H2>}
            </div>

            {/* Create new section form */}
            <div className="text-base text-gray-400">
                <div className="flex flex-col">
                    {isCreateNewSection ? (
                        <div className="mb-4">
                            <Input
                                value={newSectionName}
                                setValue={setNewSectionName}
                                id="new-section"
                                placeholder="New section name"
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        // Create the section
                                        const newId = (sectionsState.length + 2).toString()
                                        const newSection: Section = {
                                            title: newSectionName || "",
                                            body: "",
                                            _id: newId,
                                        }
                                        setSectionsState(prev => [...prev, newSection])
                                        setOpenSectionId(newId);
                                        setIsCreateNewSection(false);
                                        setNewSectionName("");
                                    }
                                    else if (e.key === "Escape") {
                                        setIsCreateNewSection(false);
                                        setNewSectionName("");
                                    }
                                }}
                            />
                            {!!newSectionName && <p className="text-xs">Enter to save<br />Esc to exit</p>}
                        </div>
                    ) : (
                        <Button onClick={() => {
                            setIsCreateNewSection(true);
                            waitForEl("new-section");
                        }} className="ml-auto"><FaPlus size={10} /></Button>
                    )}
                    <hr />
                </div>

                {/* File sections */}
                {sectionsState.map(s => {
                    const thisSectionIsOpen = openSectionId === s._id
                    return (
                        <SectionEditor
                            key={s._id}
                            section={s}
                            isOpen={thisSectionIsOpen}
                            setOpenSectionId={setOpenSectionId}
                            sectionsOrder={sectionsState.map(s => s._id)}
                            sectionKwargs={sectionKwargs}
                            setSectionKwargs={setSectionKwargs}
                            setSections={setSectionsState}
                        />
                    )
                })}
            </div>

            {/* Footer */}
            <div className="fixed z-40 bottom-0 right-0 w-screen text-slate-400 bg-slate-100 border-t border-slate-400 py-2 text-xs">
                <div className="flex gap-4 mx-4 relative float-right">
                    <div>
                        {language === "FR" ? (eq ? "Tous changements sont enregistrés" : isSaved ? "Enregistré" : "En train d'enregistrer...") : (eq ? "All changes updated" : isSaved ? "Saved" : "Saving...")}
                    </div>
                    {lines && <div>{language === "FR" ? "Lignes" : "Lines"}: {lines}</div>}
                    {words && <div>{language === "FR" ? "Mots" : "Words"}: {words}</div>}
                    <div>{cursorPos}</div>
                </div>
            </div>
        </>
    )
}

export default FileWithSections