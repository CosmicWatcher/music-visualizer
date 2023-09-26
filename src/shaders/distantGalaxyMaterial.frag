#include ./glsl-noise/classic/3d;

uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
varying vec2 vUv;
void main() {
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 10.0, uTime * 0.1));
    float strength = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));
    float outerGlow = distance(vUv, vec2(0.5)) * 4.0 - 1.4;
    strength += outerGlow;
    strength += step(-0.2, strength) * 0.8;
    strength = clamp(strength, 0.0, 1.0);
    vec4 color = mix(vec4(uColorStart,1.0), vec4(uColorEnd,0), strength);
    gl_FragColor = color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}