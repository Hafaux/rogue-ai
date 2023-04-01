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
        messages: [{role: "user", content: data}],
      });

      return completion.data.choices[0].message?.content as string;
    }
}