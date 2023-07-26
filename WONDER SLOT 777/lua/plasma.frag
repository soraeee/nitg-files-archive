#version 120
#define PI 3.14159265

// ------

varying vec2 imageCoord;
varying vec4 color;

uniform vec2 textureSize;
uniform vec2 imageSize;

uniform sampler2D sampler0;
uniform float beat;
uniform float time;

uniform float zoom;

// ------

vec2 img2tex( vec2 v ) { return v / textureSize * imageSize; }

float random(float x) 
{ 
    return fract(sin(x) * 10000.);          
}

float noise(vec2 p) 
{
    return random(p.x + p.y * 10000.);            
}

vec2 sw(vec2 p) { return vec2(floor(p.x), floor(p.y)); }
vec2 se(vec2 p) { return vec2(ceil(p.x), floor(p.y)); }
vec2 nw(vec2 p) { return vec2(floor(p.x), ceil(p.y)); }
vec2 ne(vec2 p) { return vec2(ceil(p.x), ceil(p.y)); }

float smoothNoise(vec2 p) 
{
    vec2 interp = smoothstep(0., 1., fract(p));
    float s = mix(noise(sw(p)), noise(se(p)), interp.x);
    float n = mix(noise(nw(p)), noise(ne(p)), interp.x);
    return mix(s, n, interp.y);        
}

float fractalNoise(vec2 p) 
{
    float x = 0.;
    x += smoothNoise(p      );
    x += smoothNoise(p * 2. ) / 2.;
    // x += smoothNoise(p * 4. ) / 4.;
    // x += smoothNoise(p * 8. ) / 8.;
    // x += smoothNoise(p * 16.) / 16.;
    x /= 1. + 1./2.;
    // x /= 1. + 1./2.;
    return x;            
}

float movingNoise(vec2 p) 
{ 
    float x = fractalNoise(p + time);
    float y = fractalNoise(p - time);
    return fractalNoise(p + vec2(x, y));    
}

float nestedNoise(vec2 p) 
{    
    float x = movingNoise(p);
    float y = movingNoise(p + 100.);
    return movingNoise(p + vec2(x, y));    
}

// ------

void main() {
	vec2 v_coords = gl_FragCoord.xy/(textureSize.xy*20);

	// v_coords.x += tan(v_coords.y*3);

	v_coords *= zoom;
    v_coords -= zoom/2;

    float u_k = 16.0;
    float u_time = mod(beat/2, 12.0*PI);
    
    float v = 0.0;
    vec2 c = v_coords * u_k - u_k/2.0;

    v += nestedNoise(v_coords*8)*2;
    
    v += sin((c.x+u_time));
    v += sin((c.y+u_time)/2.0);
    v += sin((c.x+c.y+u_time)/2.0);
    c += u_k/2.0 * vec2(sin(u_time/3.0), cos(u_time/2.0));
    v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+u_time);
    v = v/2.0;
    
    float mult = sin(beat/4.0)*3.0;
    vec3 col = vec3(sin(PI*mult*v));
    
    // vec4 col = texture2D(sampler0, img2tex(uv));   
    gl_FragColor = vec4(col-0.1, 1)*color;

    // vec2 uv = gl_gl_FragCoord.xy/imageSize.xy;  
    

    // gl_gl_FragColor = col; 
}