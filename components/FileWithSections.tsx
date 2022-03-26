import { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { waitForEl } from "../utils/key";
import { Section } from "../utils/types";
import Button from "./Button";
import H2 from "./H2";
import Input from "./Input";
import SectionEditor from "./SectionEditor";

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
    const lastOpenSection = "1"; // For now by default open the first section when we open a file.
    const [openSectionId, setOpenSectionId] = useState<string | null>(lastOpenSection);
    const [sectionsState, setSectionsState] = useState<Section[]>(sections); // Exposed to the editor components
    const [sectionsStateSaved, setSectionsStateSaved] = useState<Section[]>(sections); // Not exposed to the editor components, represents the content of the markdown files. 


    const [newSectionName, setNewSectionName] = useState<string>("");
    const [isCreateNewSection, setIsCreateNewSection] = useState<boolean>(false);

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

    useEffect(() => {
        const x = document.getElementsByClassName("autosave")
        if (x && x.length > 0) x[x.length - 1].innerHTML = eq ? "All changes updated" : isSaved ? "Saved" : "Saving..."
    }, [isSaved, eq])

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
                {<H2>{filename}</H2>}
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
                            // createSection={createSection}
                            setOpenSectionId={setOpenSectionId}
                            sectionsOrder={sections.map(s => s._id)}
                            sectionKwargs={sectionKwargs}
                            setSectionKwargs={setSectionKwargs}
                            setSections={setSectionsState}
                        />
                    )
                })}
            </div>
        </>
    )
}

export default FileWithSections
