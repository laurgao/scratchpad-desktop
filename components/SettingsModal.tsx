import { createContext, useContext, useState } from "react";
import { UiButton } from "../src/App";
import Modal from "./headless/Modal";
import Select from "./headless/Select";
import A from "./style/A";
import H3 from "./style/H3";

export const LOCAL_STORAGE_KEY = "scratchpad.language";

export type language = "EN" | "FR";
const languageOptions: { label: string, value: language }[] = [{ label: "English", value: "EN" }, { label: "Français", value: "FR" }]

export const LanguageContext = createContext({
    // Default values
    language: "EN",
    setLanguage: (language: language) => {
        console.warn("You tried to update the language context but nothing happened because there isn't a parent <LanguageContext.Provider> component higher up in the tree.")
    }
});

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { language, setLanguage } = useContext(LanguageContext);
    const [languageOption, setLanguageOption] = useState<{ label: string, value: language }>(languageOptions.find(l => l.value === language) || languageOptions[0]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <H3>{language === "EN" ? "Settings" : "Paramètres"}</H3>
            <p className="text-sm text-gray-700 font-semibold mt-4">{language === "EN" ? "Language" : "Langue"}</p>
            <div className="mt-2">
                <Select
                    options={languageOptions}
                    selected={languageOption}
                    setSelected={setLanguageOption}
                />
            </div>

            <div className="mt-4">
                <UiButton onClick={() => {
                    setLanguage(languageOption.value);
                    onClose()
                }}>{language === "EN" ? "Save" : "Enregistrer"}</UiButton>
            </div>

            <hr className="my-10" />

            <p className="text-sm text-gray-500">
                {language === "EN" ? (
                    <>Want to report a bug? I&apos;d greatly appreciate if you contact me @ gaolauro@gmail.com or make an issue on <A href="https://github.com/laurgao/scratchpad/issues/new">GitHub</A>. Thank you :D</>
                ) : (
                    <>Voulez signaler un bogue ? Je l'apprécie si vous me contactez @ gaolauro@gmail.com ou créez une issue sur <A href="https://github.com/laurgao/scratchpad/issues/new">GitHub</A>. Merci :D</>
                )}

            </p>
        </Modal>

    )

}

export default SettingsModal