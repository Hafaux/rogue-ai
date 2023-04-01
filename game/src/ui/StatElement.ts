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
  label: Text;

  constructor(
    label: string,
    public value: number,
    public config: Partial<Config> = {}
  ) {
    super();

    this.label = this.createTextElement(label + ":", {
      fill: this.config.labelColor ?? 0xffffff,
    });
    this.valueText = this.createTextElement(this.getValueStr(value), {
      fill: this.config.valueColor ?? 0xffff00,
    });

    console.warn(this.config);

    this.x = this.config.padding?.x || 10;
    this.y = this.config.padding?.y || 0;

    this.valueText.x = this.label.width + 10;

    this.alpha = this.config.alpha || 1;

    this.addChild(this.label, this.valueText);
  }

  getValueStr(value: number) {
    const suffix = this.config.type === "percentage" ? "%" : "";

    return `${value}${suffix}`;
  }

  update(newValue: number) {
    this.valueText.text = this.getValueStr(newValue);
  }

  createTextElement = (text: string, textStyle: Partial<TextStyle> = {}) => {
    const defaultStyle = {
      fontFamily: "upheavtt",
      fontSize: 50,
      fill: 0xffffff,
      dropShadow: true,
    };

    return new Text(text, { ...defaultStyle, ...textStyle });
  };
}
