type ConstructorType<T extends abstract new (...args: never) => unknown> = new (
  ...params: ConstructorParameters<T>
) => InstanceType<T>;

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

interface System {
  update: (delta: number) => void;
}

interface Window {
  __PIXI_APP__: unknown;
}

type Vec2D<T = number> = {
  x: T;
  y: T;
};

type CollisionMatrix = number[][];
