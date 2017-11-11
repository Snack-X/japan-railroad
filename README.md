# Japan Railroad Visualization

![](/images/img_01.png)
![](/images/img_02.png)
![](/images/img_03.png)

[Watch on YouTube](https://www.youtube.com/watch?v=C69lpWR6x6Y).

For more details, please read [DETAILS.md](/DETAILS.md).

## Data

Source data and converted data are quite huge and not included on this repository. You should download source data by yourself and place them under `data_raw` directory.

* http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_3.html
* http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N05-v1_3.html

`data_raw` directory tree should look like this:

```
data_raw/
    japan-geometry/
        KS-META-N03-17_170101.xml
        N03-17_170101.dbf
        N03-17_170101.prj
        N03-17_170101.shp
        N03-17_170101.shx
        N03-17_170101.xml
    japan-railway/
        KS-META-N05-16.xml
        N05-16.xml
        N05-16_RailroadSection2.dbf
        N05-16_RailroadSection2.geojson
        N05-16_RailroadSection2.prj
        N05-16_RailroadSection2.shp
        N05-16_RailroadSection2.shx
        N05-16_Station2.dbf
        N05-16_Station2.geojson
        N05-16_Station2.prj
        N05-16_Station2.shp
        N05-16_Station2.shx
```

After running `npm install` and `build-data.js` scripts, `data` directory will contain coverted smaller data.

For more information, please refer to the website.

* http://nlftp.mlit.go.jp/ksj/

*All rights reserved. Copyright (c) 1974-2017 National Land Information Division, National Spatial Planning and Regional Policy Bureau, MLIT of Japan.*
