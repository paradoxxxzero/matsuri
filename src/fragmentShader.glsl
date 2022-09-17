uniform float potential;
varying vec3 tColor;
varying vec3 tSpeed;

const float maxR = 0.5;

void main() {
  float r = length(gl_PointCoord - vec2(0.5, 0.5));
  if (r > maxR) discard;

  gl_FragColor = vec4(tColor * potential * potential , 1.0 );
}
