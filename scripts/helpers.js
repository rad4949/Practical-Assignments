const { PI, sin, cos } = Math
function deg2rad(angle) {
    return angle * PI / 180;
}
const shaderHelpers = `
mat4 translation(vec2 t) {
    mat4 dst;

    dst[0][0] = 1.0;
    dst[0][ 1] = 0.0;
    dst[0][ 2] = 0.0;
    dst[0][ 3] = 0.0;
    dst[1][ 0] = 0.0;
    dst[1][ 1] = 1.0;
    dst[1][ 2] = 0.0;
    dst[1][ 3] = 0.0;
    dst[2][ 0] = 0.0;
    dst[2][ 1] = 0.0;
    dst[2][ 2] = 1.0;
    dst[2][ 3] = 0.0;
    dst[3][ 0] = t.x;
    dst[3][ 1] = t.y;
    dst[3][ 2] = 0.0;
    dst[3][ 3] = 1.0;

    return dst;
}

mat4 scaling(float s){
    mat4 dst;

    dst[0][0] = s;
    dst[0][ 1] = 0.0;
    dst[0][ 2] = 0.0;
    dst[0][ 3] = 0.0;
    dst[1][ 0] = 0.0;
    dst[1][ 1] = s;
    dst[1][ 2] = 0.0;
    dst[1][ 3] = 0.0;
    dst[2][ 0] = 0.0;
    dst[2][ 1] = 0.0;
    dst[2][ 2] = s;
    dst[2][ 3] = 0.0;
    dst[3][ 0] = 0.0;
    dst[3][ 1] = 0.0;
    dst[3][ 2] = 0.0;
    dst[3][ 3] = 1.0;

    return dst;
}
`