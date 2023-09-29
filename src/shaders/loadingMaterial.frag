uniform float iTime;
uniform float PI;
uniform float pixelSize;
uniform float screenRatio;
varying vec2 vUv;
void main() {
	float radius = max(5.0*pixelSize, 0.05);
	float lineWidth = 20.0*radius; // in pixels
	float glowSize = 17.0*radius; // in pixels

	lineWidth *= pixelSize;
	glowSize *= pixelSize;
    glowSize *= 2.0;
    
  	vec2 uv = vUv-0.5;
    uv.x *= screenRatio;
    
    float len = length(uv);
	float angle = atan(uv.y, uv.x);
    
	float fallOff = fract(-0.5*(angle/PI)-iTime*0.7);
    
    lineWidth = (lineWidth-pixelSize)*0.5*fallOff;
	float color = smoothstep(pixelSize, 0.0, abs(radius - len) - lineWidth)*fallOff;
	color += 1.2*smoothstep(glowSize*fallOff, 0.0, abs(radius - len) - lineWidth)*fallOff*0.5;    
    
	gl_FragColor = vec4(vec3(color-0.9, color-0.4, color-0.9), 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}