#define numSectors 12.0 // n-fold symmetry
#define PI 3.14159265359

uniform float iTime;
uniform float iBass;
uniform float iTreb;
uniform float iTimeSpeed;
varying vec2 vUv;


vec2 toPolar(vec2 cartesianCoords) {
    float radius = length(cartesianCoords); // Distance from center
    float angle = atan(cartesianCoords.y, cartesianCoords.x); // Angle from the horizontal axis
    return vec2(radius, angle);
}

vec3 palette(float t)
{
    vec3 a = vec3(0.938, 0.328, 0.718);
    vec3 b = vec3(0.659, 0.438, 0.328);
    vec3 c = vec3(0.388, 0.388, 0.296);
    vec3 d = vec3(2.538, 2.478, 0.168);
    
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 createTex(vec2 uv, float radius)
{
    vec3 finalColor = vec3(0.);
    
    for (float i = 0.; i < 4.; i++) {
        uv = fract(1.6*uv) - 0.5;

        float d = length(uv);// * exp(-.5*radius);
        d = sin(d*6.)/6.;
        d = abs(d);
        
        //d = 0.01/d;
        d = pow(.02/d, 2.7);

        vec3 col = palette(radius + 0.2*iTreb);
        finalColor += col * d;
    }
    
    return finalColor;
}

void main() {
    // Convert to polar coordinates
    vec2 polarCoord = toPolar(vUv);
    // polarCoord.y += 0.5*iTimeSpeed*iTime - 0.5*iBass;
    polarCoord.x = sin(polarCoord.x*4. - iTimeSpeed*iTime - iBass)/4.;

    // Create the kaleidoscopic effect by adjusting the angle
    polarCoord.y = mod(polarCoord.y, 2.0 * PI / numSectors);

    // Optionally, reflect every other sector to create more complex patterns
    float sectorIndex = floor(polarCoord.y / (1.0 * PI) * numSectors);
    if (mod(sectorIndex, 2.0) >= 1.0) {
        polarCoord.y = (2.0 * PI / numSectors) - polarCoord.y;
    }
    
    polarCoord.y += 0.5*iTimeSpeed*iTime - 0.5*iBass;
    // polarCoord.y = sin(polarCoord.y*4. - 0.8*iTime)/4.;

    // Convert back to Cartesian coordinates
    vec2 kaleidoscopeUV = vec2(cos(polarCoord.y), sin(polarCoord.y)) * polarCoord.x;
    
    kaleidoscopeUV = sin(kaleidoscopeUV*1. - 0.2*iBass) / 1.;
    // kaleidoscopeUV -= 0.15*iTime - 0.1*iBass;
    
    // Perform texture lookup with corrected coordinates
    // vec4 texColor = texture(iChannel0, kaleidoscopeUV);
    
    // Modify texColor using time-based calculations if desired
    // texColor *= 0.5 + 0.5 * cos(iTime + texColor.r * 2.0 * PI);
    
    vec3 texColor = createTex(kaleidoscopeUV, polarCoord.x);

    gl_FragColor = vec4(texColor, 1. /*- 0.7*length(vUv)*/);
    
    #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}