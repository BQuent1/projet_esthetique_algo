#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture;
uniform float u_modifier;

varying vec2 vTexCoord;

void main() {
  // Coordonnées normalisées
  vec2 uv = vTexCoord;

  // Calcul des ondulations
  float wave = sin(uv.y * 10.0 * u_modifier + u_time * u_modifier) * 0.02;
  float wave2 = cos(uv.x * 10.0 * u_modifier + u_time * u_modifier) * 0.02;
  uv.x += wave;
  uv.y += wave2;

  // Récupérer la texture avec l'ondulation
  vec4 texColor = texture2D(u_texture, uv);

  // Sortie finale
  gl_FragColor = texColor;
}
