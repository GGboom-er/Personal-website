varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uBreathIntensity;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // Breathing effect: slight expansion/contraction based on time
    float breath = sin(uTime * 1.5) * uBreathIntensity;
    vec3 newPosition = position + normal * breath * (1.0 - uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
