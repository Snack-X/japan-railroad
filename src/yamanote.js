import $ from 'umbrellajs';

import YAMANOTE_INNER_WEEKDAY from '../data/yamanote/inner-weekday.json';
import YAMANOTE_INNER_WEEKEND from '../data/yamanote/inner-weekend.json';
import YAMANOTE_OUTER_WEEKDAY from '../data/yamanote/outer-weekday.json';
import YAMANOTE_OUTER_WEEKEND from '../data/yamanote/outer-weekend.json';

import './yamanote.scss';

//==============================================================================

function convertTime(_time) {
  let time = parseInt(_time, 10);

  const s = (time % 60).toString(10).padStart(2, '0');
  time = (time - s) / 60;

  const m = (time % 60).toString(10).padStart(2, '0');
  time = (time - m) / 60;

  const h = time.toString(10).padStart(2, '0');

  return [ h, m, s ];
}

function convertTimeString(time) {
  const [ h, m, s ] = time.split(':').map(n => parseInt(n, 10));
  return h * 3600 + m * 60 + s;
}

function calculateTimePosition(_from, _to, _time) {
  const from = convertTimeString(_from),
        to = convertTimeString(_to),
        time = convertTimeString(_time);
  return (from - time) / (to - from);
}

const STATIONS = [
  // 0 ~ 8
  '浜松町', '新橋', '有楽町', '東京', '神田(東京都)', '秋葉原', '御徒町', '上野', '鶯谷',
  // 9 ~ 14
  '日暮里', '西日暮里', '田端', '駒込', '巣鴨', '大塚(東京都)',
  // 15 ~ 23
  '池袋', '目白', '高田馬場', '新大久保', '新宿', '代々木', '原宿', '渋谷', '恵比寿',
  // 24 ~ 28
  '目黒', '五反田', '大崎', '品川', '田町(東京都)',
];

function getTrainPosition(trains, time) {
  const result = [];

  for (const train in trains) {
    const events = trains[train];
  
    for (let i = 0 ; i < events.length ; i++) {
      const event = events[i];
      const nextEvent = events[i + 1];
  
      if (event[1] !== '' && event[2] !== '' && event[1] <= time && time <= event[2]) {
        result.push({
          train: train,
          status: 'stopped',
          at: event[0],
        });
  
        break;
      }
  
      else if (event[1] === '' && event[2] === time) {
        result.push({
          train: train,
          status: 'starting',
          from: event[0],
        });
  
        break;
      }
  
      else if (event[1] === time && event[2] === '') {
        result.push({
          train: train,
          status: 'terminated',
          at: event[0],
        });
  
        break;
      }
  
      else if (nextEvent && event[2] <= time && time < nextEvent[1]) {
        result.push({
          train: train,
          status: 'moving',
          from: [ event[0], event[2] ],
          to: [ nextEvent[0], nextEvent[1] ],
        });
  
        break;
      }
    }
  }

  return result;
}

function getStationPosition(direction, from, to, position) {
  const idxFrom = STATIONS.indexOf(from),
        idxTo = STATIONS.indexOf(to);

  const delta = direction === 'outer' ? 35 : -35;

  if (!to) {
    if (0 <= idxFrom && idxFrom <= 8) {
      // bottom
      return [ 100 + (160 * idxFrom), 800 + delta];
    }
    else if (9 <= idxFrom && idxFrom <= 14) {
      // right
      return [ 1480 + delta, 700 - (120 * (idxFrom - 9)) ];
    }
    else if (15 <= idxFrom && idxFrom <= 23) {
      // top
      return [ 1380 - (160 * (idxFrom - 15)), 0 - delta ];
    }
    else if (24 <= idxFrom && idxFrom <= 28) {
      // left
      return [ 0 - delta, 100 + (150 * (idxFrom - 24)) ];
    }
  }
  else {
    const adjust = (idxTo - idxFrom) * position;
    
    if (0 <= idxFrom && idxFrom <= 8 && 0 <= idxTo && idxTo <= 8) {
      // bottom
      return [ 100 + (160 * (idxFrom - adjust)), 800 + delta];
    }
    else if (8 <= idxFrom && idxFrom <= 9 && 8 <= idxTo && idxTo <= 9) {
      const angle = Math.PI / 2 * (direction === 'inner' ? 1 + adjust : adjust);
      // bottom - right
      return [
        1380 + ((100 + delta) * Math.cos(angle)),
        700 + ((100 + delta) * Math.sin(angle)),
      ];
    }
    else if (9 <= idxFrom && idxFrom <= 14 && 9 <= idxTo && idxTo <= 14) {
      // right
      return [ 1480 + delta, 700 - (120 * (idxFrom - 9 - adjust)) ];
    }
    else if (14 <= idxFrom && idxFrom <= 15 && 14 <= idxTo && idxTo <= 15) {
      const angle = Math.PI / 2 * (direction === 'inner' ? -adjust : 1 - adjust);
      // top - right
      return [
        1380 + ((100 + delta) * Math.cos(angle)),
        100 - ((100 + delta) * Math.sin(angle)),
      ];
    }
    else if (15 <= idxFrom && idxFrom <= 23 && 15 <= idxTo && idxTo <= 23) {
      // top
      return [ 1380 - (160 * (idxFrom - 15 - adjust)), 0 - delta ];
    }
    else if (23 <= idxFrom && idxFrom <= 24 && 23 <= idxTo && idxTo <= 24) {
      const angle = Math.PI / 2 * (direction === 'inner' ? 1 + adjust : adjust);
      // top - left
      return [
        100 - ((100 + delta) * Math.cos(angle)),
        100 - ((100 + delta) * Math.sin(angle)),
      ];
    }
    else if (24 <= idxFrom && idxFrom <= 28 && 24 <= idxTo && idxTo <= 28) {
      // left
      return [ 0 - delta, 100 + (150 * (idxFrom - 24 - adjust)) ];
    }
    else if ((28 === idxFrom || idxFrom === 0) && (28 === idxTo || idxTo === 0)) {
      const angle = Math.PI / 2 * (direction === 'inner' ? -position : 1 + position);
      // bottom - left
      return [
        100 - ((100 + delta) * Math.cos(angle)),
        700 + ((100 + delta) * Math.sin(angle)),
      ];
    }
  }
}

function calculateTrainPosition(direction, time, event) {
  if (event.status === 'stopped') {
    return getStationPosition(direction, event.at);
  }
  else if (event.status === 'starting') {
    return getStationPosition(direction, event.from);
  }
  else if (event.status === 'terminated') {
    return getStationPosition(direction, event.at);
  }
  else if (event.status === 'moving') {
    return getStationPosition(direction, event.from[0], event.to[0], calculateTimePosition(event.from[1], event.to[1], time));
  }
}

function updateTrainPosition(time, mode) {
  let inner, outer;

  if (mode === 'weekday') {
    inner = getTrainPosition(YAMANOTE_INNER_WEEKDAY, time);
    outer = getTrainPosition(YAMANOTE_OUTER_WEEKDAY, time);
  }
  else if (mode === 'weekend') {
    inner = getTrainPosition(YAMANOTE_INNER_WEEKEND, time);
    outer = getTrainPosition(YAMANOTE_OUTER_WEEKEND, time);
  }

  const modified = [];

  function update(event, direction) {
    let $train = $('#train-' + event.train);

    if (!$train.length) {
      $train = $(document.createElementNS('http://www.w3.org/2000/svg', 'use'));
      $train.attr({ class: 'train', href: '#e231', id: 'train-' + event.train });
      $('.output-svg .trains').append($train);
    }

    modified.push('train-' + event.train);

    const position = calculateTrainPosition(direction, time, event);
    $train.attr({ x: position[0], y: position[1] });
    $train.attr('style', `transform-origin: ${position[0]}px ${position[1]}px`);
  }

  for (const evt of inner) update(evt, 'inner');
  for (const evt of outer) update(evt, 'outer');

  const $existing = $('.output-svg .trains .train');
  $existing.each(node => {
    const $train = $(node), id = $train.attr('id');

    if (!modified.includes(id)) $train.remove();
  });
}

function updateDisplay(_time, mode) {
  let time = parseInt(_time, 10);
  const [ h, m, s ] = convertTime(time);
  const timeHM = `${h}:${m}`, timeHMS = `${h}:${m}:${s}`;

  $time.text(timeHM);
  updateTrainPosition(timeHMS, mode);
}

//==============================================================================

const $time = $('.controls .time');
const $slider = $('.controls .slider input');
const $realtime = $('.controls .options input[name=realtime]');

function update() {
  const time = $slider.first().value;
  const mode = $('.controls .options input:checked').first().value

  updateDisplay(time, mode);
}

function updateWithCurrentTime() {
  // Current time
  const now = new Date();
  let time = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (0 <= time && time <= 5400) time += 86400;
  else if (time < 14400) return;

  $slider.first().value = time;
  update();
}

let realtimeTimer = setInterval(updateWithCurrentTime, 1000);
updateWithCurrentTime();

$slider.on('input', evt => {
  clearInterval(realtimeTimer);
  $realtime.first().checked = false;
  update();
});

$('.controls .options input[name=mode]').on('input', evt => { update(); });


$realtime.on('input', evt => {
  if ($realtime.is(':checked')) {
    realtimeTimer = setInterval(updateWithCurrentTime, 1000);
    updateWithCurrentTime();
  }
  else {
    clearInterval(realtimeTimer);
  }
});
