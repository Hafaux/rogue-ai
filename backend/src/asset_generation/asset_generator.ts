import SettingGenerator, { SettingResponse } from "./setting_generator";
import TexturePacker from "./texture_packer";

export default class AssetGeneratpor {
  settingGenerator: SettingGenerator;
  texturePacker: TexturePacker;

  private _theme = "land of kittens";

  private setting: SettingResponse | null = null;

  assets = ["wall", "floor", "crate", "enemy", "misc"];

  constructor() {
    this.settingGenerator = new SettingGenerator();
    this.texturePacker = new TexturePacker();
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
      this.setting = await this.settingGenerator.generate(
        this.theme,
        this.assets
      );
    }

    return this.setting;
  }

  async generate(theme?: string) {
    if (theme) this.theme = theme;

    const setting = await this.getSetting();
  }
}
