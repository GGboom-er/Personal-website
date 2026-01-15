import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend, ThreeElement } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGlassSettings } from '../../contexts/GlassSettingsContext';

// Define the shader material
const GlassRefractionMaterial = shaderMaterial(
    {
        uTime: 0,
        uTexture: null,
        uRefraction: 0.1,
        uChromatic: 0.05,
        uFlowSpeed: 0.5,
        uNoiseScale: 5.0,
        uOpacity: 1.0,
        uResolution: new THREE.Vector2(),
        uBorder: 0,
        uBorderOpacity: 0.1,
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
  uniform float uRefraction;
  uniform float uChromatic;
  uniform float uFlowSpeed;
  uniform float uNoiseScale;
  uniform float uOpacity;
  uniform vec2 uResolution;
  uniform float uBorder;
  uniform float uBorderOpacity;
  varying vec2 vUv;

  // Simple Noise Function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 g = a0 * vec3(x0.x,x12.xz) + h * vec3(x0.y,x12.yw);
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 v_res;
    v_res.x = dot(g.x, x0);
    v_res.y = dot(g.yz, x12.xz);
    v_res.z = dot(g.zw, x12.zw);
    return 130.0 * dot(m, v_res);
  }

  void main() {
    float time = uTime * uFlowSpeed * 0.2;
    
    // Screen coords for background projection
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    
    // Noise distortion
    float noise = snoise(vUv * uNoiseScale + time);
    float noise2 = snoise(vUv * uNoiseScale * 0.5 - time * 0.7);
    
    vec2 distortion = vec2(noise, noise2) * uRefraction * 0.1;
    
    // Chromatic Aberration sampling
    float r = texture2D(uTexture, screenUv + distortion + vec2(uChromatic * 0.01, 0.0)).r;
    float g = texture2D(uTexture, screenUv + distortion).g;
    float b = texture2D(uTexture, screenUv + distortion - vec2(uChromatic * 0.01, 0.0)).b;
    
    vec3 color = vec3(r, g, b);
    
    // Surface tint
    color = mix(color, vec3(1.0), 0.05); // Subtle white tint
    
    // Border
    float border = 0.0;
    if(vUv.x < 0.01 || vUv.x > 0.99 || vUv.y < 0.01 || vUv.y > 0.99) {
        border = uBorderOpacity;
    }
    
    gl_FragColor = vec4(color, uOpacity);
  }
  `
);

extend({ GlassRefractionMaterial });

// Add types for the new material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            glassRefractionMaterial: ThreeElement<any>;
        }
    }
}

interface LiquidRefractionCardProps {
    children?: React.ReactNode;
    bgImage: string;
    className?: string;
}

const RefractivePlane = ({ bgImage }: { bgImage: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport, size } = useThree();
    const { settings } = useGlassSettings();
    const texture = useTexture(bgImage);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as any;
            material.uTime = state.clock.getElapsedTime();
            material.uRefraction = settings.glassRefraction / 100;
            material.uChromatic = settings.glassChromatic / 100;
            material.uFlowSpeed = settings.glassFlowSpeed / 50;
            material.uNoiseScale = settings.glassNoiseScale / 10;
            material.uOpacity = settings.glassOpacity / 100;
            material.uResolution.set(size.width, size.height);
            material.uBorder = settings.glassBorder;
            material.uBorderOpacity = settings.glassBorderOpacity / 100;
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <glassRefractionMaterial
                uTexture={texture}
                transparent={true}
            />
        </mesh>
    );
};

const LiquidRefractionCard: React.FC<LiquidRefractionCardProps> = ({ children, bgImage, className = '' }) => {
    const { settings } = useGlassSettings();

    return (
        <div className={`relative ${className}`} style={{ isolation: 'isolate' }}>
            {/* Background Canvas */}
            <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden rounded-[inherit]">
                <Canvas
                    camera={{ position: [0, 0, 1], fov: 50 }}
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: true }}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                >
                    <RefractivePlane bgImage={bgImage} />
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default LiquidRefractionCard;
