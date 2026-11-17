import Phaser from 'phaser';

const FRAG = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uTime;
uniform vec3 uAmbient;
uniform vec4 uHeroLight;

uniform vec4 uLight0;
uniform vec4 uLight1;
uniform vec4 uLight2;
uniform vec4 uLight3;
uniform vec4 uLight4;
uniform vec4 uLight5;
uniform vec4 uLight6;
uniform vec4 uLight7;

uniform vec3 uLightColor0;
uniform vec3 uLightColor1;
uniform vec3 uLightColor2;
uniform vec3 uLightColor3;
uniform vec3 uLightColor4;
uniform vec3 uLightColor5;
uniform vec3 uLightColor6;
uniform vec3 uLightColor7;

uniform vec4 uBloom0;
uniform vec4 uBloom1;
uniform vec4 uBloom2;
uniform vec4 uBloom3;
uniform vec4 uBloom4;
uniform vec4 uBloom5;
uniform vec4 uBloom6;
uniform vec4 uBloom7;

uniform vec3 uBloomColor0;
uniform vec3 uBloomColor1;
uniform vec3 uBloomColor2;
uniform vec3 uBloomColor3;
uniform vec3 uBloomColor4;
uniform vec3 uBloomColor5;
uniform vec3 uBloomColor6;
uniform vec3 uBloomColor7;

varying vec2 outTexCoord;
varying vec2 outFragCoord;

float lightFalloff(vec2 pixel, vec4 light) {
  float dist = distance(pixel, light.xy);
  float falloff = 1.0 - smoothstep(0.0, light.z, dist);
  return falloff * falloff;
}

float bloomFalloff(vec2 pixel, vec4 bloom) {
  float dist = distance(pixel, bloom.xy);
  float falloff = 1.0 - smoothstep(0.0, bloom.z, dist);
  return falloff * falloff;
}

void main () {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  vec2 pixel = outFragCoord * uResolution;

  vec3 light = vec3(0.0);
  light += uLightColor0 * lightFalloff(pixel, uLight0) * uLight0.w;
  light += uLightColor1 * lightFalloff(pixel, uLight1) * uLight1.w;
  light += uLightColor2 * lightFalloff(pixel, uLight2) * uLight2.w;
  light += uLightColor3 * lightFalloff(pixel, uLight3) * uLight3.w;
  light += uLightColor4 * lightFalloff(pixel, uLight4) * uLight4.w;
  light += uLightColor5 * lightFalloff(pixel, uLight5) * uLight5.w;
  light += uLightColor6 * lightFalloff(pixel, uLight6) * uLight6.w;
  light += uLightColor7 * lightFalloff(pixel, uLight7) * uLight7.w;

  vec3 bloom = vec3(0.0);
  bloom += uBloomColor0 * bloomFalloff(pixel, uBloom0) * uBloom0.w;
  bloom += uBloomColor1 * bloomFalloff(pixel, uBloom1) * uBloom1.w;
  bloom += uBloomColor2 * bloomFalloff(pixel, uBloom2) * uBloom2.w;
  bloom += uBloomColor3 * bloomFalloff(pixel, uBloom3) * uBloom3.w;
  bloom += uBloomColor4 * bloomFalloff(pixel, uBloom4) * uBloom4.w;
  bloom += uBloomColor5 * bloomFalloff(pixel, uBloom5) * uBloom5.w;
  bloom += uBloomColor6 * bloomFalloff(pixel, uBloom6) * uBloom6.w;
  bloom += uBloomColor7 * bloomFalloff(pixel, uBloom7) * uBloom7.w;

  float flicker = 0.94 + 0.06 * sin(uTime * 2.4 + pixel.x * 0.006);
  float amount = flicker * uIntensity;
  float hero = lightFalloff(pixel, uHeroLight) * uHeroLight.w * uIntensity;
  vec3 moon = vec3(0.62, 0.76, 1.0);
  vec3 ambient = mix(vec3(1.0), uAmbient, uIntensity);

  color.rgb *= ambient + light * amount * 1.5 + moon * hero * 0.85;
  color.rgb += light * amount * 0.12 + moon * hero * 0.04 + bloom;
  gl_FragColor = color;
}
`;

/**
 * A screen-space night-lighting and selective-bloom pass. On WebGL the HUD is
 * rendered by a second camera, so this only affects the world: ambient darkness
 * is multiplied in, street lamps carve warm or spark-blue pools out of it, and
 * a small set of emissive points (shards, lamps, signs, sun/moon) receive a soft
 * additive bloom. Nothing here blurs or darkens the UI.
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
    this.bloom = [];
    this.hero = { x: -9999, y: -9999, r: 1, s: 0 };
    this.ambient = { r: 0.52, g: 0.5, b: 0.64 };
  }

  onDraw(renderTarget) {
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
    this.set1f('uIntensity', this.intensity);
    this.set1f('uTime', this.time);
    this.set3f('uAmbient', this.ambient.r, this.ambient.g, this.ambient.b);
    this.set4f('uHeroLight', this.hero.x, this.hero.y, this.hero.r, this.hero.s);

    for (let i = 0; i < 8; i++) {
      const light = this.lights[i] || {
        x: -9999,
        y: -9999,
        r: 1,
        s: 0,
        color: { r: 1, g: 0.78, b: 0.48 },
      };
      const color = light.color || { r: 1, g: 0.78, b: 0.48 };
      this.set4f(`uLight${i}`, light.x, light.y, light.r, light.s);
      this.set3f(`uLightColor${i}`, color.r, color.g, color.b);

      const bloom = this.bloom[i] || {
        x: -9999,
        y: -9999,
        r: 1,
        s: 0,
        color: { r: 1, g: 1, b: 1 },
      };
      const bloomColor = bloom.color || { r: 1, g: 1, b: 1 };
      this.set4f(`uBloom${i}`, bloom.x, bloom.y, bloom.r, bloom.s);
      this.set3f(
        `uBloomColor${i}`,
        bloomColor.r,
        bloomColor.g,
        bloomColor.b,
      );
    }

    this.bindAndDraw(renderTarget);
  }
}
