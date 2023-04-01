import StableDiffusion, { StableResponse } from "../api/stable_diffusion";
import SettingGenerator, { SettingResponse } from "./setting_generator";
import TexturePacker from "./texture_packer";

export default class AssetGeneratpor {
  settingGenerator: SettingGenerator;
  texturePacker: TexturePacker;

  private _theme = "land of kittens";

  private setting: SettingResponse | null = null;

  assets = {
    flat: ["wall", "floor"],
    isometric: ["crate", "enemy", "misc"],
  };
  stableDiffusion: StableDiffusion;

  constructor() {
    this.settingGenerator = new SettingGenerator();
    this.texturePacker = new TexturePacker();
    this.stableDiffusion = new StableDiffusion();
  }

  set theme(t: string) {
    this._theme = t;
    this.setting = null;
  }

  get theme() {
    return this._theme;
  }

  async getSetting() {
    if (this.setting === null) {
      this.setting = await this.settingGenerator.generate(this.theme, [
        ...this.assets.flat,
        ...this.assets.isometric,
      ]);
    }

    return this.setting;
  }

  flatPrompt(asset: string, descrition: string) {
    return {
      prompt: `front view, ortographic, 3/4 top down, game asset of a ${asset} on a white background, ${descrition}`,
    };
  }

  isometricPrompt(asset: string, descrition: string) {
    return {
      prompt: `top-down ${asset} texture, ${descrition}`,
      negative_prompt: `landscape photography, depth`,
    };
  }

  async generate(theme?: string) {
    if (theme) this.theme = theme;

    const setting = await this.getSetting();

    const promises: Promise<StableResponse>[] = [];

    for (const asset of this.assets.flat) {
      const description = setting.assets[asset].join(", ");

      const prompt = this.flatPrompt(asset, description);

      promises.push(this.stableDiffusion.request(prompt));
    }

    for (const asset of this.assets.isometric) {
      const description = setting.assets[asset].join(", ");

      const prompt = this.isometricPrompt(asset, description);

      promises.push(this.stableDiffusion.request(prompt));
    }

    const assets = await Promise.all(promises);

    console.log(assets.map((res) => res.filenames[0]));
  }
}
