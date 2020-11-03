"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPVTile = void 0;
const canvas_1 = require("canvas");
const fs_1 = require("fs");
class GPVTile {
    constructor(option) {
        this.maxZoom = option.maxZoom ?? 9;
        this.minZoom = option.minZoom ?? 3;
        this.start = [lat2pint(option.startLatitude, this.maxZoom), lon2pint(option.startLongitude, this.maxZoom)];
        this.end = [lat2pint(option.endLatitude, this.maxZoom), lon2pint(option.endLongitude, this.maxZoom)];
        this.canvas = canvas_1.createCanvas(this.end[1] - this.start[1], this.end[0] - this.start[0]);
        this.ctx = this.canvas.getContext('2d');
    }
    fillRect(color, startLatitude, startLongitude, endLatitude, endLongitude) {
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
        fs_1.writeFileSync('./out.png', this.canvas.toBuffer('image/png', { compressionLevel: 0 }));
    }
}
exports.GPVTile = GPVTile;
function lat2pint(lat, zoom) {
    return ~~(2 ** (zoom + 7) / Math.PI * (-Math.atanh(Math.sin(Math.PI / 180 * lat)) + Math.atanh(Math.sin(Math.PI / 180 * 85.05112878))));
}
function lon2pint(lon, zoom) {
    return ~~(2 ** (zoom + 7) * (lon / 180 + 1));
}
