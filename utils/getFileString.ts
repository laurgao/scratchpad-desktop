import { Item } from "./types";

const getFileString = (items: Item[]) => items.map(d => `- [${d.completed ? "x" : ""}] ${d.task}`).join("\n");

export default getFileString;