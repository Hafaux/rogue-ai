import StableDiffusion, { StableResponse } from "../api/stable_diffusion";
import SettingGenerator, {
  AssetDefinition,
  SettingResponse,
} from "./setting_generator";
import TexturePacker from "./texture_packer";

export default class AssetGenerator {
  settingGenerator: SettingGenerator;
  texturePacker: TexturePacker;

  private _theme = "land of kittens";

  private setting: SettingResponse | null = null;

  assets = {
    flat: [
      {
        sd: "roof",
        gpt: "wall",
        file: "wall",
      },
      {
        sd: "ground",
        gpt: "floor",
        file: "floor",
      },
    ],
    isometric: [
      {
        sd: "crate",
        gpt: "crate",
        file: "crate",
      },
      {
        sd: "enemy",
        gpt: "enemy1",
        file: "enemy1",
      },
      {
        sd: "foe",
        gpt: "enemy2",
        file: "enemy2",
      },
      // {
      //   sd: "decoration1",
      //   gpt: "decoration_item",
      //   file: "decoration",
      // },
      // {
      //   sd: "decoration2",
      //   gpt: "decoration_item",
      //   file: "decoration",
      // },
    ],
  } as const;
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
      prompt: `top-down ${asset} texture, ${descrition}`,
      negative_prompt: `landscape photography, depth`,
    };
  }

  isometricPrompt(asset: string, descrition: string) {
    return {
      prompt: `front view, ortographic, 3/4 top down, game asset of ${descrition}`,
    };
  }

  async generate(theme?: string) {
    if (theme) this.theme = theme;

    const setting = await this.getSetting();

    console.log("setting", setting);

    const promises: Promise<unknown>[] = [];

    for (const asset of this.assets.flat) {
      console.log("description", setting.assets, asset.gpt);
      const description = setting.assets[asset.gpt].join(", ");

      const prompt = this.flatPrompt(asset.sd, description);
      console.log("prompt", prompt);

      promises.push(
        this.stableDiffusion.saveImage(
          { ...prompt, tiling: true, remove_background: false },
          `./assets/input/${asset.file}.png`
        )
      );
      console.log("pusehd");
    }

    for (const asset of this.assets.isometric) {
      console.log("description", setting.assets, asset.gpt);

      const description = setting.assets[asset.gpt].join(", ");

      const prompt = this.isometricPrompt(asset.sd, description);

      promises.push(
        this.stableDiffusion.saveImage(
          { ...prompt, tiling: false, remove_background: true },
          `./assets/input/${asset.file}.png`
        )
      );
    }

    console.log("promises", promises);

    await Promise.all(promises);

    return await this.texturePacker.pack();
  }
}
