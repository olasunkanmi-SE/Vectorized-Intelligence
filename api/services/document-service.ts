import fs from "fs";
import pdf from "pdf-parse";
import { IDocumentService } from "../interfaces/document-service.interface";

export class DocumentService implements IDocumentService {
  async convertPDFToText(pdfFilePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(pdfFilePath);
      const data = await pdf(dataBuffer);
      const text = data.text;
      const formatedText = this.formatText(text);
      return formatedText;
    } catch (error) {
      console.error("Error while converting pdf to text", error);
    }
  }

  writeToFile(outputFilePath: string, text: string): void {
    fs.writeFile(outputFilePath, text, (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("File written successfully!");
      }
    });
  }
  /**
   * Splits the input text into chunks of approximately equal sizes, ensuring that words are not broken in the middle.
   *
   * @param {string} text - The input text to be divided into chunks.
   * @param {number} partSize - The desired size of each chunk (in number of characters).
   * @returns {string[]} An array containing the divided chunks of text.
   */
  breakTextIntoChunks(text: string, partSize: number): string[] {
    const chunks: string[] = [];
    let startIndex = 0;
    while (startIndex < text.length) {
      const chunkSize = startIndex + partSize;
      let chunk = text.substring(startIndex, chunkSize);
      //Check if a chunk ends in the middle of a word
      if (chunkSize < text.length && !/\s[---]/.test(text[chunkSize - 1])) {
        //Find the last natural break within the chunk
        const lastSpaceIndex = chunk.lastIndexOf("");
        const lastDashIndex = Math.max(chunk.lastIndexOf("-"), chunk.lastIndexOf("–"), chunk.lastIndexOf("—"));
        const breakIndex = Math.max(lastSpaceIndex, lastDashIndex);
        if (breakIndex !== -1) {
          //Recreate the chunck based on the next break
          chunk = chunk.substring(0, breakIndex + 1);
        }
      }
      chunks.push(chunk);
      startIndex += chunk.length;
    }
    return chunks;
  }

  /**
   * Formats the input text by removing certain patterns, converting to lowercase,
   * removing stop words, and returning the preprocessed text.
   *
   * @param {string} text - The input text to be formatted.
   * @returns {string} The preprocessed text after formatting.
   */
  formatText = (text: string) => {
    const formattedText = text
      .replace(/(\*|_)/g, " ")
      .replace(/\[.*?\]/g, "")
      .replace(/<.*?>/g, "")
      .replace(/\n/g, " ");
    const lowercaseText = formattedText.toLowerCase();
    const stopWords = [
      "a",
      "an",
      "and",
      "are",
      "as",
      "at",
      "be",
      "but",
      "by",
      "for",
      "if",
      "in",
      "into",
      "is",
      "it",
      "no",
      "not",
      "of",
      "on",
      "or",
      "such",
      "that",
      "the",
      "their",
      "there",
      "these",
      "they",
      "this",
      "to",
      "was",
      "will",
      "with",
    ];
    const words = lowercaseText.split(" ");
    const filteredWords = words.filter((word) => !stopWords.includes(word));
    const preprocessedText = filteredWords.join(" ");
    return preprocessedText;
  };
}
