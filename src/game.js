import { NewIndexedMesh } from "./indexed_mesh";

export function NewGame() {
    const player_r = 0.1;
    const powerup_r = 0.1;
    const ground_y = 0;
    const gravity = 0.5;

    console.log("initializing game");

    return {
        jumps_remaining: 1,
        max_height: ground_y + player_r,
        player_x: 0,
        player_y: ground_y + player_r,
        player_vx: 0,
        player_vy: 0,
        left_held: false,
        right_held: false,
        powerup_positions: new Array(200).fill(0).map((x, i) => i)
            .map(i => [Math.random() * 2 - 1, i * 0.5 + 0.5 + i*i*0.01]),
        powerup_vx: new Array(200).fill(0).map((x, i) => i)
            .map(i => Math.random() * 0.2),
        get_camera: function() {
            return [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, -this.player_y, 0, 1,
            ];
        },
        get_geometry: function() {
            let mesh = NewIndexedMesh();

            const cull_fn = (p => {
                let dx = p[0] - this.player_x;
                let dy = p[1] - this.player_y;
                return dx*dx + dy*dy > 4.0;
            });

            this.powerup_positions.forEach(pp => {
                if (!cull_fn(pp)) {
                    mesh.push_circle(pp, powerup_r, [0, 1, 1])
                }
            });

            mesh.push_circle([this.player_x, this.player_y], player_r, [1, 0, 0]);
            mesh.push_quad([[-1000, ground_y], [1000, ground_y], [-1000, ground_y-1000], [1000, ground_y-1000]], [0, 1, 0]);
            mesh.push_quad([[-1000, this.max_height], [1000, this.max_height], [-1000, this.max_height-0.01], [1000, this.max_height-0.01]], [0, 0, 1]);
            // mesh.push_triangle([[0, 1], [1, 0], [-1, 0]]);
            return mesh;
        },
        // draw: function(p) {
        //     let cam_y = this.player_y + p.height/2;
        //     p.background(255);

        //     // Draw a circle in the middle of the screen
        //     p.fill(0, 128, 255); // Set fill color (in this case, blue)
        //     p.ellipse(this.player_x + p.width/2, -(this.player_y - cam_y), 100, 100); // Draw a circle at the center

        //     // Draw ground
        //     p.fill(0, 255, 0); // Set fill color for the ground (in this case, green)
        //     p.rect(0, (ground_y + cam_y), p.width, ground_h); // Draw a rectangle for the ground
        // },
        jump: function() {
            if (this.jumps_remaining == 0) {
                return;
            }
            this.jumps_remaining -= 1;
            this.player_vy = Math.max(this.player_vy, 0);
            this.player_vy += 1;
            this.player_vy = Math.min(this.player_vy, 3);
        },
        update: function(dt) {
            // console.log(this.player_x, this.player_y, this.player_vy)
            this.player_vx = 0;
            if (this.left_held) {
                this.player_vx -= 1.0;
            }
            if (this.right_held) {
                this.player_vx += 1.0;
            }
            this.player_vy -= dt*gravity;
            this.player_y += dt*this.player_vy;
            this.player_x += dt*this.player_vx;
            this.player_x = wrap(this.player_x);
            if (this.player_y <= (ground_y + player_r)) {
                this.player_y = ground_y + player_r;
                this.player_vy = 0;
            }
            if (this.player_y > this.max_height) {
                this.max_height = this.player_y;
            }
            for (let i = 0; i < this.powerup_positions.length; i++) {
                this.powerup_positions[i][0] = this.powerup_positions[i][0] + this.powerup_vx[i]*dt;
                this.powerup_positions[i][0] = wrap(this.powerup_positions[i][0]);
                let dx = this.player_x - this.powerup_positions[i][0];
                let dy = this.player_y - this.powerup_positions[i][1];
                let r = player_r + powerup_r;
                if (dx*dx + dy*dy < r*r) {
                    this.powerup_positions.splice(i, 1);
                    this.powerup_vx.splice(i, 1);
                    this.jumps_remaining += 1;
                }
            }
        },
    }
}

function wrap(x) {
    if (x > 1.0) {
        return -1.0;
    }
    if (x < -1.0) {
        return 1.0;
    }
    return x;
}