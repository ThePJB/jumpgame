// mat4 multiplication
// actually faster than loops version? who knows
export function mat4_mul(a, b) {
    return [
        a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12],
        a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13],
        a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14],
        a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15],

        a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12],
        a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13],
        a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14],
        a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15],

        a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12],
        a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13],
        a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14],
        a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15],

        a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12],
        a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13],
        a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14],
        a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15],
    ];
}

// mat4 view matrix for camera
export function mat4_view(pos, dir) {
    let up = [0.0, 1.0, 0.0];

    let zaxis = dir;
    let xaxis = normalize(cross(up, zaxis));
    let yaxis = normalize(cross(zaxis, xaxis));
    return [
        xaxis[0], yaxis[0], zaxis[0], 0.0,
        xaxis[1], yaxis[1], zaxis[1], 0.0,
        xaxis[2], yaxis[2], zaxis[2], 0.0,
        dot(pos, xaxis), dot(pos, yaxis), dot(pos, zaxis), 1.0,
    ];
}

// mat4 projection: fov in radians
export function mat4_proj(fov, aspect, z_near, z_far) {
    let tan_half_fov = Math.tan(fov / 2.0);
    let z_range = z_near - z_far;

    return [
        1.0 / (aspect * tan_half_fov), 0.0, 0.0, 0.0,
        0.0, 1.0 / tan_half_fov, 0.0, 0.0,
        0.0, 0.0, (z_near + z_far) / z_range, 2.0 * z_far * z_near / z_range,
        0.0, 0.0, -1.0, 0.0,
    ];
}

// mat4 transpose
export function mat4_transpose(a) {
    return [
        a[0], a[4], a[8], a[12],
        a[1], a[5], a[9], a[13],
        a[2], a[6], a[10], a[14],
        a[3], a[7], a[11], a[15],
    ];
}

// camera view * projection matrix
export function cam_vp(cam_pos, cam_dir, fov, aspect, z_near, z_far) {
    let view_matrix = mat4_view(cam_pos, cam_dir);
    let view_matrix_transposed = mat4_transpose(view_matrix);
    let projection_matrix = mat4_proj(fov, aspect, z_near, z_far);
    return mat4_mul(projection_matrix, view_matrix_transposed);
}

// Helper functions for vector operations
export function cross(a, b) {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
}

export function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

export function normalize(a) {
    let length = Math.sqrt(dot(a, a));
    return [a[0] / length, a[1] / length, a[2] / length];
}
