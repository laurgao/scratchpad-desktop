import { useEffect, useState } from "react";
import { UiButton } from "../src/App";
import Modal from "./headless/Modal";
import Select from "./headless/Select";
import A from "./style/A";
import H3 from "./style/H3";

const LOCAL_STORAGE_KEY = "scratchpad.language";

type language = "EN" | "FR";
const languageOptions: { label: string, value: language }[] = [{ label: "English", value: "EN" }, { label: "Français", value: "FR" }]

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [language, setLanguage] = useState<{ label: string, value: language }>(languageOptions.find(l => l.value === localStorage.getItem(LOCAL_STORAGE_KEY)) || languageOptions[0]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, language.value);
    }, [language])
    console.log(language)

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <H3>Settings</H3>
            <div className="mt-2">
                <Select
                    options={languageOptions}
                    selected={language}
                    setSelected={setLanguage}
                />
            </div>

            <div className="mt-4">
                <UiButton onClick={() => onClose()}>Save</UiButton>
            </div>

            <hr className="my-10" />

            <p className="text-sm text-gray-500">Want to report a bug? I&apos;d greatly appreciate if you contact me @ gaolauro@gmail.com or make an issue on <A href="https://github.com/laurgao/scratchpad/issues/new">GitHub</A>. Thank you :D</p>
        </Modal>

    )

}

export default SettingsModal