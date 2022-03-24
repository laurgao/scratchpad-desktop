import React, { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { waitForEl } from "../utils/key";
import { Section } from "../utils/types";
import Button from "./Button";
import H2 from "./H2";
import Input from "./Input";
import SectionEditor from "./SectionEditor";

export interface SectionKwargsObj {
    sectionId: string,
    condition: "initiate-on-editing-title" | "initiate-with-cursor-on-bottom" | "initiate-on-specified-cursor-pos",
    initialCursorPos?: { line: number, ch: number }
};

const FileWithSections = ({ filename, sections }: {
    filename: string,
    sections: Section[]
}) => {
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);

    const [newSectionName, setNewSectionName] = useState<string>("");
    const [isCreateNewSection, setIsCreateNewSection] = useState<boolean>(false);


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
                {sections.map(s => {
                    const thisSectionIsOpen = openSectionId == s._id
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
                        />
                    )
                })}
            </div>
        </>
    )
}

export default FileWithSections
