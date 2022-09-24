uniform float time;
varying vec3 tColor;
varying vec2 tUv;

const float PI = 3.1415926535897932384626433832795;
const float maxR = .5;

void main() {
  // Make the point it a circle
  float r = length(gl_PointCoord - vec2(.5, .5));
  if(r > maxR)
    discard;

  float fading = 1. - time;
  float blink = cos(10. * time + tUv[0] * 2. * PI);
  float normalizedBlink = (blink + 1.) / 2.;
  float blinkingFading = clamp(fading + normalizedBlink * time * time, 0., 1.);
  float queueFading = tUv[1] == 0. ? 1. : .6 - (.4 * tUv[1]);

  gl_FragColor = vec4(tColor * blinkingFading * queueFading, 1.);
}
