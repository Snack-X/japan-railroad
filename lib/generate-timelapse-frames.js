const fs = require("fs");
const path = require("path");
const d3 = require("d3-geo");
const topojson = require("topojson-client");
const puppeteer = require("puppeteer");

const graphFrame = require("./generate-timelapse-graph");

module.exports = async function(options) {
  // Settings
  const WIDTH = parseInt(options.width) || 1920,
        HEIGHT = parseInt(options.height) || 1080,
        ROTATE = parseFloat(options.rotate) || 0,
        SCALE = parseFloat(options.scale) || 1,
        TRANSLATE_X = parseFloat(options.translateX) || 0,
        TRANSLATE_Y = parseFloat(options.translateY) || 0;
  const transform = `rotate(${ROTATE}) scale(${SCALE}) ` +
                    `translate(${WIDTH * TRANSLATE_X} ${HEIGHT * TRANSLATE_Y})`;

  const HRES = !!options.hres;
  const YEAR_MIN = Math.max(parseInt(options.yearMin) || 1950, 1950);
        YEAR_MAX = Math.min(parseInt(options.yearMax) || 2016, 2016);

  const YEAR = !!options.year;
  const FONT_FAMILY = options.fontFamily || "Arial",
        FONT_WEIGHT = options.fontWeight || "normal",
        FONT_SIZE = parseFloat(options.fontSize) || 16,
        FONT_X = parseFloat(options.fontX) || 0,
        FONT_Y = parseFloat(options.fontY) || 0;

  const GRAPH = !!options.graph;

  // Load TopoJSONs and convert into GeoJSON
  const geometry = require("../data/japan-geometry" + (HRES ? "-hres" : "") + ".json");
  const objCountry = topojson.feature(geometry, geometry.objects.country);
  const objPrefectures = topojson.feature(geometry, geometry.objects.prefectures);

  const railroads = require("../data/japan-railway-railroad.json");
  const dRailroads = topojson.feature(railroads, railroads.objects.railroads);

  // D3
  const projection = d3.geoMercator().scale(1).translate([0, 0]);
  const geoPath = d3.geoPath().projection(projection);
  const renderObject = obj => geoPath(obj).replace(/(\d+\.\d{3})\d*/g, "$1");

  projection.fitSize([ WIDTH, HEIGHT ], objCountry);

  // Prepare rendering
  const pathCountry = `<path d="${renderObject(objCountry)}" />`;
  const pathPrefectures = `<path d="${renderObject(objPrefectures)}" />`;

  let svgTpl = fs.readFileSync(path.join(__dirname, "timelapse-tpl.svg"), { encoding: "utf8" });
  svgTpl = svgTpl
    .replace("<!--WIDTH-->", WIDTH)
    .replace("<!--HEIGHT-->", HEIGHT)
    .replace("<!--transform-->", transform)
    .replace("<!--pathPrefectures-->", pathPrefectures)
    .replace("<!--pathCountry-->", pathCountry);

  // Railroad <path> cache
  const pathRailroads = dRailroads.features
    .map(f => `<path data-type="${f.properties.type}" d="${renderObject(f)}" />`);

  // Prepare puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Render each frame as SVG
  for(let year = YEAR_MIN ; year <= YEAR_MAX ; year++) {
    const svgPath = path.join(__dirname, `../output/${year}.svg`);
    const pngPath = path.join(__dirname, `../output/${year}.png`);

    let svg = svgTpl;
    svg = svg.replace(
      "<!--railroads-->",
      dRailroads.features
        .map((f, i) => [f,i])
        .filter(([f,i]) => f.properties.startYear <= year && year <= f.properties.endYear)
        .map(([f,i]) => pathRailroads[i]).join("\n")
    );

    if(YEAR) svg = svg.replace(
      "<!--textYear-->",
      `<text font-family="${FONT_FAMILY}" font-weight="${FONT_WEIGHT}" ` +
      `font-size="${FONT_SIZE}" x="${FONT_X}" y="${FONT_Y}">${year}</text>`
    );

    if(GRAPH) svg = svg.replace("<!--graph-->", graphFrame(year));

    // fs.writeFileSync(svgPath, svg);

    // SVG to PNG using Puppeteer
    await page.setContent(
      "<style> * { margin: 0; padding: 0; }</style>" + svg,
      { timeout: 0, waitUntil: "load" }
    );

    const el = await page.$("svg");
    await el.screenshot({ path: pngPath });

    console.log("[v] Saved " + year + ".png");
  }
};
