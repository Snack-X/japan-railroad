const fs = require("fs");
const d3 = require("d3-shape");

// Data
const dataStations = require("../data/japan-railway-station.json");
const stations = dataStations.objects.stations.geometries;

const data = [], dataMap = {};
for(let y = 1950 ; y <= 2016 ; y++) {
  const current = stations.filter(s => s.properties.startYear <= y && y <= s.properties.endYear);
  data.push([ y, current.length ]);
  dataMap[y] = current.length;
}

module.exports = function(year) {
  // Settings
  const AREA = [[2790, 200], [3790, 2110]];
  const WIDTH = AREA[1][0] - AREA[0][0];
  const HEIGHT = AREA[1][1] - AREA[0][1];

  const X_MIN = 9000, X_MAX = 14000;
  const Y_MIN = 1950, Y_MAX = 2016;

  const LINE = "#e40112";
  const FILL = "rgba(228, 1, 18, 0.5)";

  // Make a path
  // X axis = number of stations (9000 - 14000, right to left)
  const _X = n => {
    const ratio = (n - X_MIN) / (X_MAX - X_MIN);
    return AREA[1][0] - (WIDTH * ratio);
  };

  // Y axis = year (bottom to top)
  const _Y = y => {
    const ratio = (y - Y_MIN) / (Y_MAX - Y_MIN);
    return AREA[1][1] - (HEIGHT * ratio);
  };

  const line = d3.line()
    .x(d => _X(d[1]))
    .y(d => _Y(d[0]))
    .curve(d3.curveCatmullRom);
  const pathData = line(data);
  const pathClosing = `L ${AREA[1][0]},${AREA[0][1]} L ${AREA[1][0]},${AREA[1][1]} Z`;

  const curX = _X(dataMap[year]), curY = _Y(year);
  const pathCurrent = `M ${curX - 100}, ${curY} L ${AREA[1][0]}, ${curY}`;

  // Return graph components
  return [
    `<path stroke="${LINE}" stroke-width="3px" fill="none" d="${pathData}" />`,
    `<path stroke="none" fill="${FILL}" d="${pathData}${pathClosing}" />`,
    `<path stroke="#000" stroke-width="5px" d="${pathCurrent}" />`,
    `<text font-family="Noto Sans" text-anchor="end" font-size="50" x="${curX - 120}" y="${curY + 19}">${dataMap[year]}</text>`,
  ].join("\n");
};
