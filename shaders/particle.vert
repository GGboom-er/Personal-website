attribute float aShapeType;
attribute vec3 aColorStart;
attribute vec3 aColorEnd;
attribute float aRandom;

varying float vShapeType;
varying vec3 vColor;
varying float vRandom;

uniform float uTime;
uniform float uFocusFactor;
uniform float uSpeed;

void main() {
    vShapeType = aShapeType;
    vRandom = aRandom;

    // Movement Logic
    vec3 pos = position;
    
    // 1. Looping Descent
    float loopTime = uTime * uSpeed * (0.8 + aRandom * 0.4);
    pos.y = 5.0 - mod(loopTime + aRandom * 10.0, 10.0);
    
    // 2. Swirl / Vortex
    // Increase swirl intensity on focus
    float swirlIntensity = 0.5 + uFocusFactor * 1.5;
    float swirlSpeed = uTime * (1.0 + aRandom);
    pos.x += sin(swirlSpeed + pos.y) * swirlIntensity * aRandom;
    pos.z += cos(swirlSpeed + pos.y) * swirlIntensity * aRandom;

    // 3. Color Interpolation
    vColor = mix(aColorStart, aColorEnd, sin(uTime + aRandom * 6.28) * 0.5 + 0.5);
    // Add aqua/blue shift on focus
    vColor = mix(vColor, vec3(0.0, 1.0, 1.0), uFocusFactor * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // 4. Perspective Size
    gl_PointSize = (20.0 + aRandom * 20.0) * (1.0 + uFocusFactor * 0.5) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
