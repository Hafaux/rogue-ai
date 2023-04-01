import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: 'openai-secret-key'
  // TODO: Replace upper line with the following when server is setup.
  // apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const openAiRequest = async (data: string) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: data}],
  });
  return completion.data.choices[0].message?.content;
}