export function NewIndexedMesh() {
    return {
        verts: [],
        inds: [],
        push_triangle: function(verts, colour) {
            verts = verts.map(v => [...v, 0]);
            this.verts.push(...verts.map(v => [...v, ...colour]));
            this.inds.push(this.verts.length - 3);
            this.inds.push(this.verts.length - 2);
            this.inds.push(this.verts.length - 1);
        },
        push_quad: function(verts, colour) {
            verts = verts.map(v => [...v, 0]);
            this.verts.push(...verts.map(v => [...v, ...colour]));
            this.inds.push(this.verts.length - 4);
            this.inds.push(this.verts.length - 3);
            this.inds.push(this.verts.length - 2);
            this.inds.push(this.verts.length - 4);
            this.inds.push(this.verts.length - 2);
            this.inds.push(this.verts.length - 1);
        },
        push_poly: function(center, r, initial_phase, n_sides, colour) {
            let center_ind = 0;
            let verts = [];
            let inds = [];
            verts.push(center);
            let theta = 2*Math.PI/n_sides;
            const poly_point_fn = (i => [center[0] + r*Math.cos(i*theta + initial_phase), center[1]+r*Math.sin(i*theta + initial_phase)]);
            let prev = poly_point_fn(0);
            verts.push(prev);
            let prev_ind = verts.length;
            let first_ind = prev_ind;
            for (let i = 1; i < n_sides; i++) {
                let curr = poly_point_fn(i);
                let curr_ind = verts.length;
                verts.push(curr);
                inds.push(center_ind);
                inds.push(curr_ind);
                inds.push(prev_ind);
                prev = curr;
                prev_ind = curr_ind;
            }
            inds.push(center_ind);
            inds.push(first_ind);
            inds.push(prev_ind);

            let o = this.verts.length;
            verts = verts.map(v => [...v, 0]);
            this.verts.push(...verts.map(v => [...v, ...colour]));
            this.inds.push(...(inds.map(i => i+o)));
        },
        push_circle: function(center, r, colour) {
            this.push_poly(center, r, 0, 50, colour);
        },
    };
}