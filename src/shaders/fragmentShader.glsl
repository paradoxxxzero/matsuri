uniform float time;
varying vec3 tColor;
varying float tW;

const float maxR = 0.5;
const float k = 1.62; // (1 + sqrt(5)) / 2 : normalized 1/x

void main() {
  float fading = 1.0 - time;
  float easedFading = k + (1.0 / (time - k));
  float blink = cos(100. * time + tW * 2. * 3.1416);
  float normalizedBlink = (blink + 1.0) / 2.0;
  float blinkingFading = clamp(fading + normalizedBlink * time * time, 0., 1.);
  float r = length(gl_PointCoord - vec2(0.5, 0.5));
  if(r > maxR * clamp(easedFading, 0.5, 1.))
    discard;

  gl_FragColor = vec4(tColor * blinkingFading, 1.0);
}
