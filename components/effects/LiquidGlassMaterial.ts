import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// 经典的 Simplex Noise 算法
const simplexNoise = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const LiquidGlassMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uIntensity: 0.2,
    uSpeed: 0.1,
    uBrightness: 1.0, // Default 1.0
    uSaturation: 1.0, // Default 1.0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uBrightness;
    uniform float uSaturation;
    varying vec2 vUv;

    ${simplexNoise}

    // 饱和度调整
    vec3 adjustSaturation(vec3 color, float value) {
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        return mix(vec3(gray), color, value);
    }

    void main() {
      vec2 uv = vUv;
      
      // 平滑噪声
      float noise1 = snoise(uv * 0.8 + vec2(uTime * uSpeed * 0.1, uTime * uSpeed * 0.05));
      float noise2 = snoise(uv * 1.5 - vec2(uTime * uSpeed * 0.05, uTime * uSpeed * 0.1));
      
      // 这里的 distortion 非常微小，只影响光感，几乎不影响几何形状
      vec2 distortion = vec2(noise1, noise2) * uIntensity * 0.015; 
      
      // 采样原图
      vec4 texColor = texture2D(uTexture, uv + distortion);
      vec3 color = texColor.rgb;

      // Applied Parameters
      color = adjustSaturation(color, uSaturation);
      color *= uBrightness;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ LiquidGlassMaterial });

export { LiquidGlassMaterial };
