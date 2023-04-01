import { DisplayObject, IRenderer, Sprite } from "pixi.js";

export function centerObjects(...toCenter: DisplayObject[]) {
  const center = (obj: DisplayObject) => {
    obj.x = window.innerWidth / 2;
    obj.y = window.innerHeight / 2;

    if (obj instanceof Sprite) {
      obj.anchor.set(0.5);
    }
  };

  toCenter.forEach(center);
}

export function wait(seconds: number) {
  return new Promise<void>((res) => setTimeout(res, seconds * 1000));
}

export async function after(
  seconds: number,
  callback: (...args: unknown[]) => unknown
) {
  await wait(seconds);
  return callback();
}

export function getEntries<T extends object>(obj: T) {
  return Object.entries(obj) as Entries<T>;
}

export function getPixels(renderer: IRenderer, image: string) {
  const sprite = Sprite.from(image);

  return [
    renderer.extract.pixels(sprite),
    sprite.texture.width,
    sprite.texture.height,
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = Record<string, any>;

export function deepMerge<T extends Obj, U extends Obj>(
  target: T,
  source: U
): T & U {
  const output: Obj = { ...target };
  Object.keys(source).forEach((key) => {
    if (
      output[key] &&
      typeof output[key] === "object" &&
      typeof source[key] === "object"
    ) {
      output[key] = deepMerge(output[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output as T & U;
}
