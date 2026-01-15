varying float vShapeType;
varying vec3 vColor;
varying float vRandom;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdDiamond(vec2 p, float r) {
    vec2 q = abs(p);
    return (q.x + q.y) - r;
}

float sdRing(vec2 p, float r, float t) {
    return abs(length(p) - r) - t;
}

float sdStar(vec2 p, float r) {
    // Simplified 4-point star
    vec2 q = abs(p);
    return (q.x + q.y) * 0.707 + max(q.x, q.y) * 0.5 - r;
}

float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
}

void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float dist = 0.0;
    
    int shape = int(vShapeType);
    
    if (shape == 0) dist = sdCircle(p, 0.4);
    else if (shape == 1) dist = sdDiamond(p, 0.35);
    else if (shape == 2) dist = sdRing(p, 0.3, 0.05);
    else if (shape == 3) dist = sdStar(p, 0.3);
    else if (shape == 4) dist = sdHexagon(p, 0.35);
    else dist = sdCircle(p, 0.4);

    if (dist > 0.0) discard;

    // Glow effect based on distance to edge
    float glow = smoothstep(0.0, -0.1, dist);
    
    gl_FragColor = vec4(vColor, glow);
}
