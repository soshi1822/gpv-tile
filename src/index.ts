import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

export class GPVTile {
  private readonly start: [number, number];
  private readonly end: [number, number];
  private readonly maxZoom: number;
  private readonly minZoom: number;
  private readonly canvas: Canvas;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(option: { startLatitude: number, startLongitude: number, endLatitude: number, endLongitude: number, maxZoom?: number, minZoom?: number }) {
    this.maxZoom = option.maxZoom ?? 9;
    this.minZoom = option.minZoom ?? 3;
    this.start = [lat2pint(option.startLatitude, this.maxZoom), lon2pint(option.startLongitude, this.maxZoom)];
    this.end = [lat2pint(option.endLatitude, this.maxZoom), lon2pint(option.endLongitude, this.maxZoom)];
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
    writeFileSync('./out.png', this.canvas.toBuffer('image/png', { compressionLevel: 0 }));
  }
}

function lat2pint(lat: number, zoom: number) {
  return ~~(2 ** (zoom + 7) / Math.PI * (-Math.atanh(Math.sin(Math.PI / 180 * lat)) + Math.atanh(Math.sin(Math.PI / 180 * 85.05112878))));
}

function lon2pint(lon: number, zoom: number) {
  return ~~(2 ** (zoom + 7) * (lon / 180 + 1));
}
