import { IRenderer } from "pixi.js";
//@ts-ignore
import wfc from "wavefunctioncollapse";
import { getPixels } from "../utils/misc";

export default class MapGenerator {
  model: any;
  constructor(
    private renderer: IRenderer,
    public width: number,
    public height: number,
    referenceImage: string
  ) {
    const [data, w, h] = getPixels(this.renderer, referenceImage);

    this.model = new wfc.OverlappingModel(
      data,
      w,
      h,
      3,
      this.width,
      this.height,
      true,
      true,
      4
    );
  }

  generate(attempts = 30) {
    this.model.iterate(attempts, Math.random);

    return this.model.graphics() as Uint8Array;
  }
}
