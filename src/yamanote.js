import $ from 'umbrellajs';
import { convertTime, updateTrainPosition } from './yamanote.common';
import './yamanote.scss';

//==============================================================================

function updateDisplay(_time, mode) {
  let time = parseInt(_time, 10);
  const [ h, m, s ] = convertTime(time);
  const timeHM = `${h}:${m}`, timeHMS = `${h}:${m}:${s}`;

  $time.text(timeHM);
  updateTrainPosition(timeHMS, mode);
}

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
