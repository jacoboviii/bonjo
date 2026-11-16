import Phaser from 'phaser';

const FRAG = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uTime;
uniform vec4 uLight0;
uniform vec4 uLight1;
uniform vec4 uLight2;
uniform vec4 uLight3;
uniform vec4 uLight4;
uniform vec4 uLight5;
uniform vec4 uLight6;
uniform vec4 uLight7;

varying vec2 outTexCoord;
varying vec2 outFragCoord;

float lampContribution(vec2 pixel, vec4 light) {
  float dist = distance(pixel, light.xy);
  float falloff = 1.0 - smoothstep(0.0, light.z, dist);
  return falloff * falloff * light.w;
}

void main () {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  vec2 pixel = outFragCoord * uResolution;
  float light = 0.0;

  light += lampContribution(pixel, uLight0);
  light += lampContribution(pixel, uLight1);
  light += lampContribution(pixel, uLight2);
  light += lampContribution(pixel, uLight3);
  light += lampContribution(pixel, uLight4);
  light += lampContribution(pixel, uLight5);
  light += lampContribution(pixel, uLight6);
  light += lampContribution(pixel, uLight7);

  float flicker = 0.94 + 0.06 * sin(uTime * 2.4 + pixel.x * 0.006);
  color.rgb += vec3(1.0, 0.78, 0.48) * light * uIntensity * flicker;
  gl_FragColor = color;
}
`;

/**
 * A lightweight, additive screen-space lamp pass. It does not darken the
 * scene; the existing night wash handles ambient darkness. This keeps the
 * pixel art untouched while making the street lamps feel like real light
 * sources instead of flat cones.
 */
export default class LampLightingPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: 'LampLighting',
      fragShader: FRAG,
    });
    this.intensity = 0;
    this.time = 0;
    this.lights = [];
  }

  onDraw(renderTarget) {
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set1f('uIntensity', this.intensity);
    this.set1f('uTime', this.time);

    for (let i = 0; i < 8; i++) {
      const light = this.lights[i] || { x: -9999, y: -9999, r: 1, s: 0 };
      this.set4f(`uLight${i}`, light.x, light.y, light.r, light.s);
    }

    this.bindAndDraw(renderTarget);
  }
}
