// import "easymde/dist/easymde.min.css";
import { Editor } from "codemirror";
import SimpleMDE from "easymde";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import Accordion from "react-robust-accordion";
import SimpleMDEEditor from "react-simplemde-editor";
import { waitForEl } from "../utils/key";
import { Section } from "../utils/types";
import { SectionKwargsObj } from "./FileWithSections";
import Input from "./Input";


const AUTOSAVE_INTERVAL = 1000;

const SectionEditor = ({ section, isOpen, sectionsOrder, setOpenSectionId, sectionKwargs, setSectionKwargs, saveSection }: {
    section: Section,
    isOpen: boolean,
    sectionsOrder: string[],
    setOpenSectionId: Dispatch<SetStateAction<string | null>>,
    sectionKwargs: SectionKwargsObj | null,
    setSectionKwargs: Dispatch<SetStateAction<SectionKwargsObj | null>>,
    saveSection: (id: string, title: string, body: string, setIsSaved: Dispatch<SetStateAction<boolean>>) => void,
}) => {
    const [editingTitleValue, setEditingTitleValue] = useState<string | null>(null);
    // codemirror
    const [cm, setCodemirrorInstance] = useState<Editor | null>(null);
    const getCmInstanceCallback = useCallback((editor: Editor) => {
        setCodemirrorInstance(editor);
    }, []);

    // H1 new section stuff
    const [lastIsH1, setLastIsH1] = useState<boolean>(false)
    // @ts-ignore
    const [h1Line, setH1Line] = useState<number>(null)

    // Stupid memoized fn declaration in 3 parts
    // Need to put these before the useEffect that runs on open
    const createSectionFromH1Ref = useRef<(instance: any, isBlur?: boolean) => (void)>()

    const createSectionFromH1Memoized = useCallback(
        (instance, isBlur?) => {
            const cursorInfo = instance.getCursor()
            const thisLine = instance.doc.getLine(cursorInfo.line)
            const isH1 = !isBlur && thisLine.substr(0, 2) === "# ";

            if (isH1) setH1Line(cursorInfo.line)
            if (!isH1 && lastIsH1) {
                // If just clicked off a h1
                const shouldGoToNewSection = !isBlur && cursorInfo.line >= h1Line
                const newCursorPosition = shouldGoToNewSection ? { line: cursorInfo.line - h1Line - 1, ch: cursorInfo.ch } : null

                // Get name of new section
                const h1LineContent = instance.doc.getLine(h1Line)
                const name = h1LineContent.substr(2, h1LineContent.length)

                // Get body of new section
                const newBodyArr = instance.doc.children[0].lines.filter((l, idx) => idx > h1Line).map(l => l.text)
                const newBody = newBodyArr.join(`
`)

                // Delete everything under and including the h1.
                instance.doc.replaceRange(
                    "",
                    { line: h1Line, ch: 0 },
                    { line: instance.doc.lineCount(), ch: 0 }
                );

                // Create the section
                // TODO

                // Reset
                // @ts-ignore
                setH1Line(null);
                setLastIsH1(false)

            } else setLastIsH1(isH1)
        },
        [setLastIsH1, h1Line, lastIsH1, section._id, setOpenSectionId, setSectionKwargs],
    );
    useEffect(() => {
        createSectionFromH1Ref.current = createSectionFromH1Memoized
    }, [createSectionFromH1Memoized])

    useEffect(() => {
        if (isOpen && !editingTitleValue) {
            if (sectionKwargs && sectionKwargs.sectionId === section._id) {
                // Run kwargs when section opens
                if (sectionKwargs.condition === "initiate-with-cursor-on-bottom") {
                    // @ts-ignore
                    // const codemirror = editorRef.current.simpleMde.codemirror;
                    // codemirror.focus()
                    // const lowestLine = codemirror.doc.lineCount() - 1
                    // const rightMostChar = codemirror.doc.getLine(lowestLine).length;
                    // codemirror.setCursor({ line: lowestLine, ch: rightMostChar })

                } else if (sectionKwargs.condition === "initiate-on-specified-cursor-pos") {
                    // @ts-ignore
                    // const codemirror = editorRef.current.simpleMde.codemirror;
                    // codemirror.focus()
                    // codemirror.setCursor(sectionKwargs.initialCursorPos)
                } else if (sectionKwargs.condition === "initiate-on-editing-title") {
                    setEditingTitleValue("# " + (section.title || "")); // In case section.name is undefined for files created before the advent of SectionModel
                    waitForEl(`${section._id}-edit-section-title`);
                }

                setSectionKwargs(null);

            } else {
                // When section opens, focus editor unless we're editing title.
                // @ts-ignore
                // const codemirror = editorRef.current.simpleMde.codemirror;
                // codemirror.focus()
            }
        }
    }, [isOpen])

    // Autosave stuff
    const [body, setBody] = useState<string>(section.body);
    useEffect(() => { /*if (editorContent !== section.body)*/ setIsSaved(false); }, [body])

    const [isSaved, setIsSaved] = useState<boolean>(true);
    useEffect(() => {
        const x = document.getElementsByClassName("autosave")
        if (x && x.length > 0) x[x.length - 1].innerHTML = isSaved ? "Saved" : "Saving..."
    }, [isSaved])
    // MAIN AUTOSAVE INTERVAL
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSaved) saveSection(section._id, section.title, body, setIsSaved)

        }, AUTOSAVE_INTERVAL);

        // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
        return () => {
            clearInterval(interval);
            // if (!isSaved) saveSection(section._id, body)
        }
    }, [body, isSaved])

    useEffect(() => {
        // Save section when component is unmounted
        return () => {
            if (!isSaved) saveSection(section._id, section.title, body, setIsSaved)
        }
    }, [])


    // For editing section name

    const saveSectionName = () => {
        if (editingTitleValue && editingTitleValue.substring(0, 2) === "# ") {
            // TODO: save section
        } else {
            deleteSection()
        }
    }

    const deleteSection = () => {
        // Delete section and append its name + body onto the previous section's body.
        const thisSectionIdx = sectionsOrder.findIndex(id => id.toString() === section._id)
        if (thisSectionIdx === 0) {
            // If this is the first section, don't delete it.
            // Will only come here on keydown enter and arrowdown, so save name as empty string.
            // TODO: delete section
            return;
        }
        const prevSectionId = sectionsOrder[thisSectionIdx - 1]

        let addBody = ""
        addBody += `

`
        addBody += editingTitleValue
        addBody += `


`
        addBody += body

        // This is rlly jank
        // TODO: append this body to prev body. delete this section. update file.lastOpenSection
    }

    const onChange = useCallback((value: string) => {
        setBody(value);
    }, []);

    const mdeOptions = useMemo(() => {
        return {
            autofocus: true,
            spellChecker: false,
            placeholder: "Unload your working memory ✨ ...",
            toolbar: []
        } as SimpleMDE.Options;
    }, []);


    return (
        <div className="relative">
            {(editingTitleValue || typeof (editingTitleValue) === "string") && (
                <div className="absolute left-2">
                    <Input
                        value={editingTitleValue}
                        // @ts-ignore
                        setValue={setEditingTitleValue}
                        id={`${section._id}-edit-section-title`}
                        placeholder="# Section name"
                        type="text"
                        onBlur={() => saveSectionName()}
                        onKeyDown={e => {
                            if (e.key === "Escape") {
                                setEditingTitleValue(null)
                                // @ts-ignore
                                // editorRef.current.simpleMde.codemirror.focus()
                            }
                            else if (e.key === "ArrowDown" || e.key === "Enter") {
                                e.preventDefault()
                                saveSectionName()
                                // @ts-ignore
                                // editorRef.current.simpleMde.codemirror.focus()
                            } else if (e.key === "ArrowUp") {
                                const thisSectionIdx = sectionsOrder.findIndex(id => id.toString() === section._id)
                                if (thisSectionIdx !== 0) {
                                    // Save name and open the section above this section
                                    saveSectionName();
                                    const prevSectionId = sectionsOrder[thisSectionIdx - 1]
                                    setSectionKwargs({ sectionId: prevSectionId, condition: "initiate-with-cursor-on-bottom" })
                                    setOpenSectionId(prevSectionId)
                                    // TODO: save section.
                                }

                            } else if (e.key === "Backspace" && editingTitleValue.length === 0) {
                                const thisSectionIdx = sectionsOrder.findIndex(id => id.toString() === section._id)
                                if (thisSectionIdx !== 0) deleteSection()
                            }
                        }}
                    />
                </div>
            )}
            <Accordion
                label={
                    <div className="flex p-2 items-center" style={{ height: "30px" }}>
                        {!(editingTitleValue || typeof (editingTitleValue) === "string") && (<p>{section.title}</p>)}
                        {isOpen ? <FaAngleDown size={14} className="ml-auto" /> : <FaAngleLeft size={14} className="ml-auto" />}
                    </div>
                }
                setOpenState={(event) => {
                    // Handle only allowing 1 section to be open at a time
                    if (isOpen) setOpenSectionId(null);
                    else setOpenSectionId(section._id);

                    // Make sure we're not on name editing mode
                    setEditingTitleValue(null);

                    // TODO: Update file.lastOpenSection
                }}
                openState={isOpen}
            >
                <SimpleMDEEditor
                    // @ts-ignore
                    onChange={value => onChange(value)}
                    value={section.body}
                    options={mdeOptions}
                    className="text-lg"
                    getCodemirrorInstance={getCmInstanceCallback}

                />
            </Accordion>
            <hr />
        </div>
    )
}

export default SectionEditor

// Your user does not care how clean your code is. As long as the functionality works.