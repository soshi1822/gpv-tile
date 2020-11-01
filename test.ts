import { GPVTile } from './src';

console.log('File Load.')

const gpvTile = new GPVTile({
  startLatitude: 50,
  startLongitude: 120,
  endLatitude: 20,
  endLongitude: 150

});

console.time()
gpvTile.fillRect('rgb(0, 0, 255)', 45, 130, 46, 133);
console.timeEnd()
console.time();
gpvTile.export();


console.timeEnd();
