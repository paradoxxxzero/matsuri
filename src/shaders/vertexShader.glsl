attribute float scale;
attribute float w;
attribute vec3 color;

varying vec3 tColor;
varying float tW;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  tColor = color;
  tW = w;
  gl_PointSize = scale * (300. / length(mvPosition.xyz));

  gl_Position = projectionMatrix * mvPosition;
}
