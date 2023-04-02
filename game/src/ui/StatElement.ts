import { TextStyle, Text, Container } from "pixi.js";

interface Config {
  type: "percentage" | "normal";
  padding: Partial<{
    x: number;
    y: number;
  }>;
  alpha: number;
  valueColor: number;
  labelColor: number;
}

export default class StatElement extends Container {
  valueText: Text;
  labelText: Text;

  constructor(
    public label: string,
    public value: number,
    public config: Partial<Config> = {},
    public addAmount = 0,
    public onUpdate?: (el: StatElement) => void
  ) {
    super();

    if (addAmount) this.cursor = "pointer";

    this.labelText = createTextElement(label + ":", {
      fill: this.config.labelColor ?? 0xffffff,
    });

    this.valueText = createTextElement(this.getValueStr(value), {
      fill: this.config.valueColor ?? 0xffff00,
    });

    this.interactive = true;
    this.on("click", () => {
      if (!this.addAmount) return;

      if (onUpdate?.(this)) this.update(this.value + this.addAmount);
    });

    console.warn(this.config);

    this.x = this.config.padding?.x || 10;
    this.y = this.config.padding?.y || 0;

    this.valueText.x = this.labelText.width + 10;

    this.alpha = this.config.alpha || 1;

    this.addChild(this.labelText, this.valueText);
  }

  getValueStr(value: number) {
    const suffix = this.config.type === "percentage" ? "%" : "";

    return `${value}${suffix}`;
  }

  update(newValue: number) {
    this.valueText.text = this.getValueStr(newValue);
    this.value = newValue;
  }
}

export const createTextElement = (
  text: string,
  textStyle: Partial<TextStyle> = {}
) => {
  const defaultStyle = {
    fontFamily: "upheavtt",
    fontSize: 50,
    fill: 0xffffff,
    dropShadow: true,
  };

  return new Text(text, { ...defaultStyle, ...textStyle });
};
