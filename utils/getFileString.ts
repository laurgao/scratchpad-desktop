import { Section } from "./types";

const getFileString = (items: Section[]) => {
    let markdownTextOfCombinedSections = "";
    for (let section of items) {
        markdownTextOfCombinedSections += "# " + section.title
        markdownTextOfCombinedSections += `
`
        markdownTextOfCombinedSections += section.body || ""
        markdownTextOfCombinedSections += `


`
    }
    return markdownTextOfCombinedSections;
}

export default getFileString;