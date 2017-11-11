const path = require("path");
const generate = require("./lib/generate-timelapse-frames");
const ffmpeg = require("fluent-ffmpeg");

const optBase = {
  width: 3840, height: 2160,
  yearMin: 1950, yearMax: 2016,
  year: true, fontFamily: "Noto Sans", fontWeight: 900, fontSize: 150, fontX: 3450, fontY: 150,
};
const optBaseMinor = {
  width: 1920, height: 1080,
  yearMin: 1950, yearMax: 2016,
  year: true, fontFamily: "Noto Sans", fontWeight: 900, fontSize: 150, fontX: 1530, fontY: 150,
};

const optAllMain = { rotate: 15, scale: 2.5, translateX: -0.3255, translateY: -0.3472 };
const optAllHokkaido = { rotate: 0, scale: 2.5, translateX: -0.6068, translateY: 0.0046 };
const optAllOkinawa = { hres: true, rotate: 15, scale: 10, translateX: -0.3021, translateY: -0.9074 };

const optTokyo = { hres: true, scale: 90, translateX: -0.6055, translateY: -0.4861 };
const optOsaka = { hres: true, scale: 90, translateX: -0.5099, translateY: -0.5324 };

const optYokohama = { hres: true, scale: 90, translateX: -0.6016, translateY: -0.4944 };
const optNagoya = { hres: true, scale: 70, translateX: -0.5417, translateY: -0.5093 };
const optSapporo = { hres: true, scale: 50, translateX: -0.6328, translateY: -0.1204 };
const optFukuoka = { hres: true, scale: 40, translateX: -0.4031, translateY: -0.5685 };

function render(output, cmdFunc) {
  return new Promise((resolve, reject) => {
    const command = new ffmpeg();
    cmdFunc(output, command);
    command.on("start", cmd => { console.log(cmd); });
    command.on("end", (out, err) => { resolve(); });
    command.run();
  });
}

function commandBase(output, command) {
  return command
    .input(path.join(__dirname, "output/%04d.png"))
    .inputFps(6)
    .inputFormat("image2")
    .inputOptions("-start_number " + optBase.yearMin)
    .output(output)
    .outputOptions("-crf 1")
    .fps(30)
    .videoCodec("libx264");
}

(async function() {
  await generate(Object.assign({}, optBase, optAllMain, { graph: true }));
  await render(path.join(__dirname, "output/all_01_main.mp4"), commandBase);
  console.log("[+] Generated all_01_main.mp4");

  await generate(Object.assign({}, optBase, optAllHokkaido));
  await render(path.join(__dirname, "output/all_02_hokkaido.mp4"), commandBase);
  console.log("[+] Generated all_02_hokkaido.mp4");

  await generate(Object.assign({}, optBase, optAllOkinawa));
  await render(path.join(__dirname, "output/all_03_okinawa.mp4"), commandBase);
  console.log("[+] Generated all_03_okinawa.mp4");

  await generate(Object.assign({}, optBase, optTokyo));
  await render(path.join(__dirname, "output/major_01_tokyo.mp4"), commandBase);
  console.log("[+] Generated major_01_tokyo.mp4");

  await generate(Object.assign({}, optBase, optOsaka));
  await render(path.join(__dirname, "output/major_02_osaka.mp4"), commandBase);
  console.log("[+] Generated major_02_osaka.mp4");

  await generate(Object.assign({}, optBaseMinor, optYokohama, { year: false }));
  await render(path.join(__dirname, "output/minor_01_yokohama.mp4"), commandBase);
  console.log("[+] Generated minor_01_yokohama.mp4");

  await generate(Object.assign({}, optBaseMinor, optNagoya));
  await render(path.join(__dirname, "output/minor_02_nagoya.mp4"), commandBase);
  console.log("[+] Generated minor_02_nagoya.mp4");

  await generate(Object.assign({}, optBaseMinor, optSapporo, { year: false }));
  await render(path.join(__dirname, "output/minor_03_sapporo.mp4"), commandBase);
  console.log("[+] Generated minor_03_sapporo.mp4");

  await generate(Object.assign({}, optBaseMinor, optFukuoka, { year: false }));
  await render(path.join(__dirname, "output/minor_04_fukuoka.mp4"), commandBase);
  console.log("[+] Generated minor_04_fukuoka.mp4");
})()
  .then(() => { process.exit(0); })
  .catch(err => { console.error(err.stack || err); process.exit(1); });

