import './heatmap.scss';

import PASSENGER_DATA from '../data/heatmap/S12-16_NumberOfPassengers.geojson';

function init() {
  window.googleMap = new google.maps.Map(document.getElementById("google-map"), {
    center: { lat: 37, lng: 137 },
    zoom: 5,
  });

  const heatmapRawData = [];
  let heatmapMax = -Infinity;

  for(const feature of PASSENGER_DATA.features) {
    if(feature.properties["有無2015"] !== 1) continue;
    if(feature.properties["重複2015"] !== 1) continue;

    let number = feature.properties["乗降客数15"];
    if(number === 0) continue;
    number = Math.log(number);

    const bound = new google.maps.LatLngBounds();
    for(const coordinate of feature.geometry.coordinates)
      bound.extend({ lat: coordinate[1], lng: coordinate[0] });

    const center = bound.getCenter();
    heatmapRawData.push({ location: center, value: number });
    if(heatmapMax < number) heatmapMax = number;
  }

  const heatmapData = heatmapRawData.map(row => {
    return { location: row.location, weight: row.value / heatmapMax };
  });

  window.heatmap = new google.maps.visualization.HeatmapLayer({
    dissipating: true,
    data: heatmapData,
    map: window.googleMap,
    radius: 10,
    maxIntensity: 10,
  });
}

window.init = init;

const s = document.createElement('script');
s.src = 'https://maps.googleapis.com/maps/api/js?callback=init&libraries=visualization&key=AIzaSyDXfYkzPkfNqI8ZjHsgzuraxhOjMsPg-O8';

document.body.appendChild(s);

document.getElementById('range-radius').addEventListener('input', e => {
  window.heatmap.set('radius', e.target.value);
});

document.getElementById('range-intensity').addEventListener('input', e => {
  window.heatmap.set('maxIntensity', e.target.value);
});
