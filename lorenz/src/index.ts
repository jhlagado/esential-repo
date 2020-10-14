import { initializeLegend } from './legend';
import { renderScene } from './render';

initializeLegend();

renderScene();

// function rotateCamera() {
  //   if (event.keyCode == 37) {
  //     // Left key
  //     rotate('left');
  //   } else if (event.keyCode == 39) {
  //     // Right key
  //     rotate('right');
  //   } else {
  //     // Any other key toggles auto-spinning
  //     setCameraMode();
  //   }
  //   camera.lookAt(scene.position);
// }

// function rotate(direction) {
//   const x = camera.position.x,
//     y = camera.position.y,
//     z = camera.position.z;

//   if (direction == 'left') {
//     camera.position.x = x * Math.cos(cameraSpeed) + z * Math.sin(cameraSpeed);
//     camera.position.z = z * Math.cos(cameraSpeed) - x * Math.sin(cameraSpeed);
//   } else if (direction == 'right') {
//     camera.position.x = x * Math.cos(cameraSpeed) - z * Math.sin(cameraSpeed);
//     camera.position.z = z * Math.cos(cameraSpeed) + x * Math.sin(cameraSpeed);
//   }
// }

// function setCameraMode() {
//   return (cameraSpinning = !cameraSpinning);
// }

// document.addEventListener('keydown', rotateCamera, false);
