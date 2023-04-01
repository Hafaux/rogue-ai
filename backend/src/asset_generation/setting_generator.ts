import { GptController } from "../api/gpt_controller";

export type SettingResponse = {
  setting: string[];
  assets: Record<string, string[]>;
};

export default class SettingGenerator {
  getPrompt(theme: string, assets: string[]) {
    return `generate a video game setting with a ${theme} theme, describe it in\
            a json format, the setting is an array of keywords that describe the setting,\
            the assets property describes each asset, in a key value pair, where the key\
            is the name of the asset and the value is an array of keywords that describe a\
            single asset, for the following assets: ${assets.join(", ")}.`;
  }

  async generate(theme: string, assets: string[]) {
    const textResponse = await GptController.request(
      this.getPrompt(theme, assets)
    );

    return GptController.extractJson(textResponse) as SettingResponse;
  }
}
