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

const SectionEditor = ({ section, isOpen, sectionsOrder, setOpenSectionId, sectionKwargs, setSectionKwargs, setSections }: {
    section: Section,
    isOpen: boolean,
    sectionsOrder: string[],
    setOpenSectionId: Dispatch<SetStateAction<string | null>>,
    sectionKwargs: SectionKwargsObj | null,
    setSectionKwargs: Dispatch<SetStateAction<SectionKwargsObj | null>>,
    setSections: Dispatch<SetStateAction<Section[]>>
}) => {
    const [editingTitleValue, setEditingTitleValue] = useState<string | null>(null);
    // codemirror
    const [codemirror, setCodemirrorInstance] = useState<Editor | null>(null);
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

                // Get name of new section
                const h1LineContent = instance.doc.getLine(h1Line)
                const name: string = h1LineContent.substr(2, h1LineContent.length)

                // Get body of new section
                const newBodyArr = instance.doc.children[0].lines.filter((l, idx) => idx > h1Line).map(l => l.text)
                const newBody: string = newBodyArr.join(`
`)

                // Delete everything under and including the h1.
                instance.doc.replaceRange(
                    "",
                    { line: h1Line, ch: 0 },
                    { line: instance.doc.lineCount(), ch: 0 }
                );

                // Create the section
                const newId = (sectionsOrder.length + 2).toString()
                const newSection: Section = {
                    title: name || "",
                    body: newBody || "",
                    _id: newId,
                }
                // TOOD: put new section right after curr section.
                setSections(prev => [...prev, newSection])

                if (shouldGoToNewSection) {
                    setSectionKwargs({ sectionId: newId, condition: "initiate-on-specified-cursor-pos", initialCursorPos: { line: cursorInfo.line - h1Line - 1, ch: cursorInfo.ch } })
                    setOpenSectionId(newId)
                }

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
            if (codemirror) {
                if (sectionKwargs && sectionKwargs.sectionId === section._id) {
                    // Run kwargs when section opens
                    if (sectionKwargs.condition === "initiate-with-cursor-on-bottom") {
                        // @ts-ignore
                        codemirror.focus()
                        // @ts-ignore
                        const lowestLine = codemirror.doc.lineCount() - 1
                        // @ts-ignore
                        const rightMostChar = codemirror.doc.getLine(lowestLine).length;
                        codemirror.setCursor({ line: lowestLine, ch: rightMostChar })
                    }
                    else if (sectionKwargs.condition === "initiate-on-specified-cursor-pos") {
                        codemirror.focus()
                        if (sectionKwargs.initialCursorPos) {
                            codemirror.setCursor(sectionKwargs.initialCursorPos)
                        } else {
                            console.warn("No initial cursor pos specified when sectionKwargs.condition === 'initiate-on-specified-cursor-pos'. Codemirror will be focused but no cursor will be set.")
                        }
                    } else if (sectionKwargs.condition === "initiate-on-editing-title") {
                        console.log("Initatiating on editing title.")
                        setEditingTitleValue("# " + section.title);
                        waitForEl(`${section._id}-edit-section-title`);
                    }
                } else {
                    // When section opens, focus editor at the beginning (unless we're editing title).
                    codemirror.focus()
                    codemirror.setCursor({ line: 0, ch: 0 })
                }
                setSectionKwargs(null);
            } else {
                console.warn("Codemirror instance not detected when open this section");
            }
        }
    }, [isOpen])


    // Stupid memoized function declaration #3: Set is editing section name
    const initiateEditingTitleValueRef = useRef<() => (void)>();
    const initiateEditingTitleValueMemoized = useCallback(() => {
        setEditingTitleValue("# " + (section.title || ""))
        waitForEl(`${section._id}-edit-section-title`)
    }, [section.title, section._id])
    useEffect(() => {
        initiateEditingTitleValueRef.current = initiateEditingTitleValueMemoized
    }, [initiateEditingTitleValueMemoized])


    // Stupid memoized function declaration #2: Going to the section below
    const goToSectionBelowRef = useRef<() => (void)>();
    const goToSectionBelowMemoized = useCallback(() => {
        const thisSectionIdx = sectionsOrder.findIndex(id => id.toString() === section._id)
        if (thisSectionIdx < sectionsOrder.length - 1) {
            const belowSectionId = sectionsOrder[thisSectionIdx + 1]
            setSectionKwargs({ sectionId: belowSectionId, condition: "initiate-on-editing-title" })
            setOpenSectionId(belowSectionId)
            // TODO: update last opened section ID
        }
    }, [sectionsOrder, section._id, setOpenSectionId, setSectionKwargs])

    useEffect(() => {
        goToSectionBelowRef.current = goToSectionBelowMemoized
    }, [goToSectionBelowMemoized])

    const events = useMemo(() => ({
        cursorActivity: (instance) => {
            // @ts-ignore
            createSectionFromH1Ref.current(instance)
        },
        keydown: (instance, event) => {
            // Every keydown that changes cursor (letter key or space, backspace, enter, etc.) is also a cursorActivity. (but not shift, alt, ctrl)
            const cursorInfo = instance.getCursor();

            const willEditTitle = cursorInfo.line === 0 &&
                (event.key === "ArrowUp" || cursorInfo.ch === 0 && event.key === "Backspace")
            // @ts-ignore
            if (willEditTitle) initiateEditingTitleValueRef.current()

            else if (event.key === "ArrowDown" && cursorInfo.line === instance.doc.lineCount() - 1) {
                // @ts-ignore
                goToSectionBelowRef.current()
            }
        },
        // blur: (instance) => {
        //     createSectionFromH1Ref.current(instance, true)
        // }
    }), [])


    // For editing section body
    const [body, setBody] = useState<string>(section.body);
    const onChange = useCallback((value: string) => {
        setBody(value);
        setSections(prevSections => prevSections.map(s => s._id === section._id ? { ...s, body: value } : s))
    }, []);

    // For editing section name
    const saveSectionName = () => {
        if (editingTitleValue && editingTitleValue.substring(0, 2) === "# ") {
            // saveSection(section._id, editingTitleValue.substring(2), body, setIsSaved)
            setSections(prev => prev.map(s => s._id === section._id ? { ...s, title: editingTitleValue.substring(2) } : s));
            setEditingTitleValue(null);
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

        // append this body to prev body. delete this section. 
        // TODO: update file.lastOpenSection
        setSections(prev => prev.filter(s => s._id !== section._id).map(s => s._id === prevSectionId ? { ...s, body: s.body + addBody } : s))
    }

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
                                codemirror.focus()
                            } else if (e.key === "ArrowUp") {
                                const thisSectionIdx = sectionsOrder.findIndex(id => id === section._id)
                                if (thisSectionIdx !== 0) {
                                    // Save name and open the section above this section
                                    saveSectionName();
                                    const prevSectionId = sectionsOrder[thisSectionIdx - 1]
                                    setSectionKwargs({ sectionId: prevSectionId, condition: "initiate-with-cursor-on-bottom" })
                                    setOpenSectionId(prevSectionId)
                                    // TODO: save last opened section id.
                                }

                            } else if (e.key === "Backspace" && editingTitleValue.length === 0) {
                                const thisSectionIdx = sectionsOrder.findIndex(id => id === section._id)
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
                    getCodemirrorInstance={getCmInstanceCallback}
                    events={events}
                />
            </Accordion>
            <hr />
        </div>
    )
}

export default SectionEditor

// Your user does not care how clean your code is. As long as the functionality works.