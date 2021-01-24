export default function getTodoStringIndices(todoString: string) {
    const openBracketIndex = 1 + +(todoString.charAt(1) === " ");
    const closeBracketIndex = openBracketIndex + 1 + +(todoString.charAt(openBracketIndex + 1).toLowerCase() === "x");
    const messageIndex = closeBracketIndex + 1 + +(todoString.charAt(closeBracketIndex + 1) === " ");
    return {openBracketIndex, closeBracketIndex, messageIndex};
}