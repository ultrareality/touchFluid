out vec4 fragColor;

uniform float dt;
uniform float curlAmt;
uniform vec2 res;
uniform float threshold;

int VEL = 0;
int OBSTACLE = 1;
int CURL = 2;

const float smallf = 0.0000001f;


float curl(int i, int j)
{
  return -0.5 * ( texelFetch(sTD2DInputs[VEL], ivec2(i+1, j), 0).y - texelFetch(sTD2DInputs[VEL], ivec2(i-1, j), 0).y +
                  texelFetch(sTD2DInputs[VEL], ivec2(i, j-1), 0).x - texelFetch(sTD2DInputs[VEL], ivec2(i, j+1), 0).x) * res.x;
}


void main()
{
  ivec2 TC = ivec2(gl_FragCoord.xy);
  vec2 TCf = vUV.st;

  // Find derivative of the magnitude (n = del |w|)
  float dw_dy = ( curl(TC.x+1, TC.y) - curl(TC.x-1, TC.y) ) * 0.5f;
  float dw_dx = ( curl(TC.x, TC.y+1) - curl(TC.x, TC.y-1) ) * 0.5f;


  // Calculate vector length. (|n|)
  float vel = curl(TC.x, TC.y);
  float mag = sqrt(dw_dx * dw_dx + dw_dy * dw_dy);

  // checks for divide by zero
  float fx = mag > smallf ? curlAmt * dt * dw_dy * curl(TC.x, TC.y)/(mag*res.x) : 0.;
  float fy = mag > smallf ? curlAmt * dt * dw_dx * curl(TC.x, TC.y)/(mag*res.x) : 0.;

  // N x w
  vec4 V = texelFetch(sTD2DInputs[VEL], TC, 0);

  float cutoff = smallf + threshold;
  // if (abs(V.x) < cutoff && abs(V.y) < cutoff) {
  //   fx = 0.;
  //   fy = 0.;
  // }

  V.x += fx;
  V.y -= fy;

  fragColor = V;
}
