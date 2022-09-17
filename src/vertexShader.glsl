attribute float scale;
attribute vec3 speed;
attribute vec3 color;

varying vec3 tSpeed;
varying vec3 tColor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  tSpeed = speed;
  tColor = color;
  gl_PointSize = scale * (300. / length(mvPosition.xyz));

  gl_Position = projectionMatrix * mvPosition;
}
