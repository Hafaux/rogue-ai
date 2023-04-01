//@ts-ignore
import sharpsheet from "sharpsheet";
import fs from "fs";
import sharp from "sharp";
import glob from "glob";
import path from "path";

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
    private outputPath = "./assets/spritesheet/",
    private pixelatedPath = "./assets/pixelated/"
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

  async pixelate(size = 32) {
    const pattern = this.inputPath + "*.png";

    const files = glob.sync(pattern);
    fs.mkdirSync(this.pixelatedPath, { recursive: true });

    const promises: Promise<unknown>[] = [];

    for (const inputFile of files) {
      const outFile = path.join(
        this.pixelatedPath,
        path.basename(inputFile, `${path.extname(inputFile)}.png`)
      );

      const sharpComplete = sharp(inputFile)
        .resize({ width: size, height: size, kernel: sharp.kernel.nearest })
        .png()
        .toFile(outFile);

      promises.push(sharpComplete);
    }

    await Promise.all(promises);
  }

  async pack(pixelate = true) {
    let inPath = this.inputPath;

    if (pixelate) {
      await this.pixelate();
      inPath = this.pixelatedPath;
    }

    await sharpsheet(inPath + "*.png", this.outputPath, this.options);

    const jsonPath = this.outputPath + this.options.outputFilename;

    const fileRaw = fs.readFileSync(jsonPath, { encoding: "utf-8" });

    const sharpSheetOut = JSON.parse(fileRaw) as SharpSheet;

    const pixiSheet = this.convertToPIXI(sharpSheetOut);

    fs.writeFileSync(jsonPath, JSON.stringify(pixiSheet));
  }
}
