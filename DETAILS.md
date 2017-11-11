# Data

Source data is provided from [*National Land Information Division, National Spatial Planning and Regional Policy Bureau, MLIT of Japan*](http://nlftp.mlit.go.jp/ksj/).

Since source data is too big and too complex, I needed to simplify and convert them into more handy format.

Luckily, [mapshaper](https://github.com/mbloch/mapshaper) does all the hard work. I was able to convert original shapefile into few megabytes of [TopoJSON](https://github.com/topojson/topojson) files.

## Geometry

* Organize the properties by prefectures, municipalities
* Filter out some geometries
  * Ogasawara Islands are too far from the mainland and they make bounding box way bigger than needed. This is pretty problematic.
  * Kuril Islands are on dispute between Russia and Japan. They are included on the data, but technically they are useless for this visualization since they don't have any railroads on them.
* Dissolve them into three types
  * One country geometry
  * 47 prefecture geometries
  * Many smaller municipalities
  * TopoJSON is a great format and it can remove duplicated borders, thus results smaller files
* Simplify borders (simplification is done again for lower resolution file)

## Railroad

* Rename and organize the properties
* Filter out closed railroads and stations.
* By saving into TopoJSON, it can remove a lot of duplicated lines

# Visualization

[D3](https://github.com/d3/d3) for the job.

Converted data is projected into a SVG file with D3 and TopoJSON. Then the result SVG file is converted into PNG file with [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Every year's railroad map is generated as a single frame, and since the railroad data has history of 1950 to 2016, there are 67 frames in total. Finally, individual frames are concatenated with [FFmpeg](https://www.ffmpeg.org/) into a single mp4 video file.

* First scene shows all Japan's map, divided into three parts: Honshu (mainland), Hokkaido, and Okinawa.
  * Honshu video file also includes a line graph about the numbers of stations for each year.
  * This line graph is also rendered with D3.
* Second scene shows two big cities in Japan: Tokyo and Osaka.
* Third scene shows four other cities: Yokohama (and Kawasaki, etc.), Nagoya, Sapporo, and Fukuoka.

In result, nine mp4 files are generated, and they are composited into one video file with Adobe's After Effects.

# Possible Improvements

* Visualization style is not so good.
* Transition between frames is not smooth.
* Rendering is inefficient. I may write all railroads and stations into puppeteer's page and inject script to toggle each year's railroads and stations.
* Number of stations are inaccurate, maybe.
* I don't need to composite parts of each scenes with external software. D3 supports [composite projections](https://github.com/d3/d3-geo/blob/master/README.md#geoAlbersUsa).
* All the codes are complete mess. I need to clean them up.
* I could make an interactive version on a webpage.
  * I tried, but applying `transform` on a huge SVG with hundreds of complex `<path>`s in it is extremely slow.
