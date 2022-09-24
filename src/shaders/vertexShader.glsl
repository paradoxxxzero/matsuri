uniform float pointSize;
uniform float time;
attribute vec3 color;
varying vec3 tColor;
varying vec2 tUv;
// const float k = 1.62; // (1 + sqrt(5)) / 2 : normalized 1/x
const float PI = 3.1415926535897932384626433832795;
const float easingShift = 1.25;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
  tColor = color;
  tUv = uv;

  // float easedFading = k + (1. / (time - k));
  // float easedFading = cos(2.3207962 * time - .75);
  float easedFading = time == 0. ? 1. : cos((PI / 2. + easingShift) * time - easingShift);
  float scale = uv[1] == 0. ? 1. : .9 - uv[1] * .7;

  gl_PointSize = easedFading * pointSize * scale * (300. / length(mvPosition.xyz));
  gl_Position = projectionMatrix * mvPosition;
}
