//@ts-ignore
import sharpsheet from "sharpsheet";
import fs from "fs";
import sharp from "sharp";
import glob from "glob";
import path from "path";

sharp.cache({ files: 0 });
sharp.cache(false);

export type SheetOptions = {
  border: number;
  sheetDimension: number;
  sheetBackground?: { r: number; g: number; b: number; a: number };
  outputFormat: string;
  outputQuality: number;
  outputFilename: string;
};

type Point = { x: number; y: number };
type Bounds = { w: number; h: number };
type Rect = Point & Bounds;

type SSMeta = {
  type: string;
  version: number;
  app: string;
};

type SSSprite = {
  name: string;
  position: Point;
  dimension: Bounds;
};

type SharpSheet = {
  meta: SSMeta;
  spritesheets: { image: string; sprites: SSSprite[] }[];
};

type PIXIFrame = {
  frame: Rect;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: Rect;
  sourceSize: Bounds;
  pivot: Point;
};

type PIXIMeta = {
  image: string;
  format: string;
  size: Bounds;
  scale: number;
};

type PIXISheet = {
  meta: PIXIMeta;
  frames: Record<string, PIXIFrame>;
};

export default class TexturePacker {
  constructor(
    private options: SheetOptions = {
      border: 1,
      sheetDimension: 1024,
      outputFormat: "png",
      outputQuality: 100,
      outputFilename: "spritesheet.json",
    },
    private inputPath = "./assets/input/",
    private outputPath = "./assets/spritesheet/"
  ) {}

  private convertToPIXI(input: SharpSheet) {
    const output = {} as PIXISheet;

    const dim = this.options.sheetDimension;

    const sheet = input.spritesheets[0];
    output.meta = {
      format: "RGBA8888",
      scale: 1,
      size: { w: dim, h: dim },
      image: sheet.image,
    };

    output.frames = {};

    for (const sprite of sheet.sprites) {
      output.frames[sprite.name] = {
        frame: { ...sprite.position, ...sprite.dimension },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, ...sprite.dimension },
        sourceSize: sprite.dimension,
        pivot: { x: 0.5, y: 0.5 },
      };
    }

    return output;
  }

  async pack() {
    let inPath = this.inputPath;

    let i = 0;
    glob.sync(inPath + "*").forEach((file) => {
      i++;
    });
    console.log("asset count", i);

    await sharpsheet(inPath + "*.png", this.outputPath, this.options);

    const jsonPath = this.outputPath + this.options.outputFilename;
    const fileRaw = fs.readFileSync(jsonPath, { encoding: "utf-8" });
    const sharpSheetOut = JSON.parse(fileRaw) as SharpSheet;

    const pixiSheet = this.convertToPIXI(sharpSheetOut);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const imageData = fs.readFileSync(this.outputPath + pixiSheet.meta.image);

    // delete files
    glob.sync(inPath + "*").forEach((file) => {
      fs.unlinkSync(file);
    });
    fs.unlinkSync(this.outputPath + pixiSheet.meta.image);

    return { atlas: pixiSheet, image: imageData.toString("base64") };
  }
}
