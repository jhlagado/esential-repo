import { LORENZ_SIGMA, LORENZ_RHO, LORENZ_BETA, LORENZ_POS_INITIAL } from "./constants";
import { elapsedTime } from "./render";

export function initializeLegend() {
  // Display initial value in the legend
  const initialValue = document.getElementById('initialValue');
  initialValue.innerText = LORENZ_POS_INITIAL.toString();

  const s = document.getElementById('sigma');
  const r = document.getElementById('rho');
  const b = document.getElementById('beta');

  s.innerText = LORENZ_SIGMA.toFixed(2);
  r.innerText = LORENZ_RHO.toFixed(2);
  b.innerText = LORENZ_BETA.toFixed(2);
}

export function updateLegend() {
  // Updates the elapsed time
  const time = document.getElementById('time');
  time.innerText = elapsedTime.toFixed(2);
}
