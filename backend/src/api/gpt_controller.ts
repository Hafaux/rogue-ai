import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

export class GptController {
  private static configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private static gpt = new OpenAIApi(GptController.configuration);

  static async request(data: string): Promise<string> {
    const completion = await GptController.gpt.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: data }],
    });

    return completion.data.choices[0].message?.content as string;
  }

  /**
   * Extracts a json from a ChatGPT message
   * @param buffer
   * @returns parsed json
   */
  static extractJson(buffer: string) {
    let openingIndex: number = -1;
    let closingIndex: number = -1;

    for (let index = 0; index < buffer.length; index++) {
      const foundOpening = openingIndex !== -1;
      const foundClosing = closingIndex !== -1;

      if (!foundOpening && buffer[index] === "{") {
        openingIndex = index;
      }

      const revIndex = buffer.length - 1 - index;

      if (!foundClosing && buffer[revIndex] === "}") {
        closingIndex = revIndex;
      }

      if (foundOpening && foundClosing) break;
    }

    return JSON.parse(buffer.slice(openingIndex, closingIndex + 1));
  }
}
