import $ from 'umbrellajs';
import { updateTrainPosition } from './yamanote.common';
import './yamanote2.scss';

//==============================================================================

const $time = $('.time');

window.update = function (h, m, s, mode) {
  const timeHM = `${h}:${m}`, timeHMS = `${h}:${m}:${s}`;

  $time.text(timeHM);
  updateTrainPosition(timeHMS, mode);
};
