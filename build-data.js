const mapshaper = require("mapshaper");
mapshaper.enableLogging();

const runMapshaper = commands => new Promise((resolve, reject) => {
  mapshaper.runCommands(commands, err => {
    if(err) reject(err);
    else resolve();
  });
});

(async function() {
  // Build Japan geometry data
  await runMapshaper(
   `-i data_raw/japan-geometry/N03-17_170101.shp encoding=shiftjis snap \
    -filter 'this.area > 1000000' \
    -each 'prefecture = N03_001,
           municipallity = (N03_003 || "") + (N03_004 || ""),
           fullname = prefecture + municipality' \
    -filter 'fullname != "東京都小笠原村"' \
    -filter '!(N03_001 == "北海道" && N03_003 == "色丹郡")' \
    -filter '!(N03_001 == "北海道" && N03_003 == "国後郡")' \
    -filter '!(N03_001 == "北海道" && N03_003 == "択捉郡")' \
    -filter '!(N03_001 == "北海道" && N03_003 == "紗那郡")' \
    -filter '!(N03_001 == "北海道" && N03_003 == "蘂取郡")' \
    -dissolve target=1 + name=country \
    -dissolve prefecture target=1 + name=prefectures \
    -dissolve fullname copy-fields=prefecture,municipality target=1 + name=municipalities \
    -drop target=1 \
    -filter-islands min-area=1000000 \
    -simplify 3% stats \
    -o data/japan-geometry-hres.json precision=0.00001 format=topojson combine-layers`);

  await runMapshaper(
   `-i data/japan-geometry-hres.json
    -simplify 15% stats
    -o data/japan-geometry.json`);

  // Build Japan railroad data
  await runMapshaper(
   `-i data_raw/japan-railway/N05-16_RailroadSection2.shp encoding=shiftjis \
    -rename-fields 'type=N05_001,lineName=N05_002,company=N05_003,openYear=N05_004,startYear=N05_005b,endYear=N05_005e,groupId=N05_006' \
    -drop fields=N05_007,N05_008,N05_009,N05_010 \
    -each 'type = parseInt(type),
           openYear = parseInt(openYear),
           startYear = parseInt(startYear),
           endYear = parseInt(endYear)' \
    -rename-layers railroads \
    -o data/japan-railway-railroad.json format=topojson precision=0.00001`);

  await runMapshaper(
   `-i data/japan-railway-railroad.json \
    -filter 'endYear == 9999' \
    -o data/japan-railway-railroad-current.json format=topojson`);

  await runMapshaper(
   `-i data_raw/japan-railway/N05-16_Station2.shp encoding=shiftjis \
    -rename-fields 'type=N05_001,lineName=N05_002,company=N05_003,openYear=N05_004,startYear=N05_005b,endYear=N05_005e,groupId=N05_006,stationName=N05_011' \
    -drop fields=N05_007,N05_008,N05_009,N05_010 \
    -each 'type = parseInt(type),
           openYear = parseInt(openYear),
           startYear = parseInt(startYear),
           endYear = parseInt(endYear)' \
    -rename-layers stations \
    -o data/japan-railway-station.json format=topojson precision=0.00001`);

  await runMapshaper(
   `-i data/japan-railway-station.json \
    -filter 'endYear == 9999' \
    -o data/japan-railway-station-current.json format=topojson`);
})()
  .then(() => { process.exit(0); })
  .catch(err => { console.error(err.stack || err); process.exit(1); });