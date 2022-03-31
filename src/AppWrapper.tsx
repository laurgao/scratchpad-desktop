import { useEffect, useState } from "react";
import { language, LanguageContext } from "../components/SettingsModal";
import App from "./App";

const LOCAL_STORAGE_KEY = "scratchpad.language";

const AppWrapper = () => {
    const [language, setLanguage] = useState<language>(localStorage.getItem(LOCAL_STORAGE_KEY) as language || "EN");
    const value = { language, setLanguage };

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, language);
    }, [language])

    return (
        <LanguageContext.Provider value={value}>
            <App />
        </LanguageContext.Provider>
    )
}

export default AppWrapper
