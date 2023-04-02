import { GptController } from "../api/gpt_controller";

export type AssetDefinition = {
  sd: string;
  gpt: string;
  file: string;
};

export type SettingResponse = {
  setting: string[];
  assets: Record<string, AssetDefinition[]>;
};

export default class SettingGenerator {
  getPrompt(theme: string, assets: AssetDefinition[]) {
    return `generate a video game setting with a ${theme} theme, describe it in\
            a json format, the setting is an array of keywords that describe the setting,\
            the assets property describes each asset, in a key value pair, where the key\
            is the name of the asset and the value is an array of visual keywords that describe how a single asset looks\
            (defining visual details and characteristics), for the following assets: ${assets
              .map((a) => a.gpt)
              .join(", ")}.`;
  }

  async generate(theme: string, assets: AssetDefinition[]) {
    const textResponse = await GptController.request(
      this.getPrompt(theme, assets)
    );

    return GptController.extractJson(textResponse) as SettingResponse;
  }
}
