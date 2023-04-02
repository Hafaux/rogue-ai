import { CRTFilter } from "@pixi/filter-crt";
import { GlitchFilter } from "@pixi/filter-glitch";
import { Container } from "pixi.js";
import Entity from "../prefabs/Entity";
import gsap from "gsap";

export default class ShaderSystem implements System {
  glitchTimer = 0;
  crtFilter: CRTFilter;
  glitchFilter: GlitchFilter;

  constructor(private toShade: Container, private entityRef: Entity) {
    this.crtFilter = new CRTFilter();
    this.glitchFilter = new GlitchFilter({
      fillMode: 2,
    });

    toShade.filters = [this.crtFilter];
  }

  async update(delta: number) {
    if (!this.toShade.filters) return;

    this.glitchTimer += delta;

    this.crtFilter.time += delta;

    if (this.glitchTimer > 60) {
      this.glitchTimer = 0;
      if (this.entityRef.hp > 20) return;

      this.toShade.filters = [
        ...(this.toShade.filters || []),
        this.glitchFilter,
      ];

      this.glitchFilter.offset = 20;
      this.glitchFilter.slices = 20;
      // this.glitchFilter.red = [50];

      await gsap.to(this.glitchFilter, {
        offset: 0,
        slices: 2,
      });

      this.toShade.filters?.splice(
        this.toShade.filters.indexOf(this.glitchFilter),
        1
      );
    }
  }
}
