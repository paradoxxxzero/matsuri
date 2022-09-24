uniform float time;
varying vec3 tColor;

const float maxR = 0.5;
const float k = 1.62; // (1 + sqrt(5)) / 2;

void main() {
  float fading = 1.0 - time - cos(gl_PointCoord[0] * time) * 0.25;
  float easedFading = k + (1.0 / (time - k));
  float r = length(gl_PointCoord - vec2(0.5, 0.5));
  if(r > maxR * easedFading)
    discard;

  gl_FragColor = vec4(tColor * fading, 1.0);
}
