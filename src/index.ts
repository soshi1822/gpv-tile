import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { mkdirSync, writeFileSync } from 'fs';

export class GPVTile {
  private readonly start: [number, number];
  private readonly end: [number, number];
  private readonly maxZoom: number;
  private readonly minZoom: number;
  private readonly dir: string;
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  constructor(option: { startLatitude: number, startLongitude: number, endLatitude: number, endLongitude: number, maxZoom?: number, minZoom?: number, dir: string }) {
    this.maxZoom = option.maxZoom ?? 9;
    this.minZoom = option.minZoom ?? 3;
    this.dir = option.dir;
    this.start = [
      toTileSize(lat2pint(option.startLatitude, this.maxZoom), false),
      toTileSize(lon2pint(option.startLongitude, this.maxZoom), false)
    ];
    this.end = [
      toTileSize(lat2pint(option.endLatitude, this.maxZoom), true),
      toTileSize(lon2pint(option.endLongitude, this.maxZoom), true)
    ];
    this.canvas = createCanvas(this.end[1] - this.start[1], this.end[0] - this.start[0]);
    this.ctx = this.canvas.getContext('2d');
  }

  fillRect(color: string, startLatitude: number, startLongitude: number, endLatitude: number, endLongitude: number) {
    const start = [
      lat2pint(startLatitude, this.maxZoom),
      lon2pint(startLongitude, this.maxZoom)
    ];
    const end = [
      lat2pint(endLatitude, this.maxZoom),
      lon2pint(endLongitude, this.maxZoom)
    ];

    this.ctx.fillStyle = color;
    this.ctx.fillRect(start[1] - this.start[1], start[0] - this.start[0], end[1] - start[1], end[0] - start[0]);
  }

  export() {
    this.ctx.save();
    this.output(this.maxZoom, this.start, this.end);
  }

  private output(zoom: number, start: [number, number], end: [number, number]) {
    if (zoom < this.minZoom) {
      return;
    }

    const dir = `${this.dir}/${zoom}`;

    mkdirSync(dir, { recursive: true });

    const xStart = start[1] / 256;
    const yStart = start[0] / 256;
    const xEnd = end[1] / 256;
    const yEnd = end[0] / 256;

    for (let x = xStart; x <= xEnd; x++) {
      const xPx = (x - xStart) * 256;
      for (let y = yStart; y <= yEnd; y++) {
        const yPx = (y - yStart) * 256;

        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.canvas, xPx, yPx, 256, 256, 0, 0, 256, 256);
        writeFileSync(`${dir}/${x}_${y}.png`, canvas.toBuffer('image/png'));
      }
    }

    const halfStart: [number, number] = [toTileSize(start[0] / 2, false), toTileSize(start[1] / 2, false)];
    const halfEnd: [number, number] = [toTileSize(end[0] / 2, true), toTileSize(end[1] / 2, true)];

    const canvas = createCanvas(halfEnd[1] - halfStart[1], halfEnd[0] - halfStart[0]);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      this.canvas, 0, 0, end[1] - start[1], end[0] - start[0],
      start[1] / 2 - halfStart[1], start[0] / 2 - halfStart[0], (end[1] - start[1]) / 2, (end[0] - start[0]) / 2
    );

    this.canvas = canvas;
    this.ctx = ctx;

    this.output(zoom - 1, halfStart, halfEnd);
  }

}

function toTileSize(num: number, blend = false) {
  return (~~(num / 256) + (blend ? 1 : 0)) * 256;
}

function lat2pint(lat: number, zoom: number) {
  return ~~(2 ** (zoom + 7) / Math.PI * (-Math.atanh(Math.sin(Math.PI / 180 * lat)) + Math.atanh(Math.sin(Math.PI / 180 * 85.05112878))));
}

function lon2pint(lon: number, zoom: number) {
  return ~~(2 ** (zoom + 7) * (lon / 180 + 1));
}
