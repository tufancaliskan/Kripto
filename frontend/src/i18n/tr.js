/** Quiz soru tipleri ve backend prompt çevirileri */
export const QUESTION_TYPE_LABELS = {
  multiple_choice: "çoktan seçmeli",
  text_input: "metin girişi",
  audio: "sesli",
};

export function translateQuizPrompt(question) {
  if (question.type === "multiple_choice") {
    return `Hangi harf: ${question.morse}?`;
  }
  if (question.type === "text_input") {
    return `Bu Mors kodunun harfini yazın: ${question.morse}`;
  }
  if (question.type === "audio") {
    return "Dinleyin ve doğru harfi yazın.";
  }
  return question.prompt;
}
