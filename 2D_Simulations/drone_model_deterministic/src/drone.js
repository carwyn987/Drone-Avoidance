export default class Drone{

    /**
     * Constructs a new drone object
     * @param {Canvas} canvas Drone canvas. Lets the drone set location to center of the canvas.
     */
    constructor(canvas){
        // Set the drone to center of canvas with 0 velocity
        this.setToMiddle();
        // Set the drone size
        this.width = 50;
        this.height = 30;

        this.accUp = 0.05;
        this.accDown = 0.02;
    }

    /**
     * Set the drone to the center of the canvas with no initial velocity
     */
    setToMiddle(){
        // Set the drone x and y to the center of the screen
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        // Set the drone to be still
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Checks if drone crashed.
     * @param {Canvas} canvas Environment canvas
     * @return {Boolean} Drone crashed?
     */
    crashed(canvas){
        // Check if bottom of drone crossed bottom of canvas
        if(this.y + this.height >= canvas.height){
            return true;
        }
        // Check if top of drone crossed top of canvas
        if(this.y <= 0){
            return true;
        }
    }

    /**
     * Update drone position and velocity based on gravity value.
     * @param {Float} gravity Value to add to vy per update
     */
    update(gravity) {
        // Update drone state
        this.x += this.vx;
        this.y += this.vy;
        this.vy += gravity;
    }

    /**
     * Update drone velocity based on an action
     * Note: Does not update drone position, that is updated every timestep by the update(gravity) function
     * @param {Integer} action Action to perform, (0 : Move down), (1 : Move up)
     */
    move(action){
        if(action === 0){
            this.vy += this.accDown;
        }else if(action === 1){
            this.vy -= this.accUp;
        }
    }

    /**
     * Renders the drone at the current parameters of referenced drone object
     * @param {Object} ctx Context of the canvas. Used to allow drone class to render drone.
     */
    renderDrone(ctx){
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Gets the current attributes of drone and return as an array
     * @returns {tensor2d} 2 attribute tensor of drone y and vy
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy
        }
    }

    /**
     * Simulate updating the state by a move, and return the state after an action
     * @param {Object} state drone state object
     * @param {Number} action integer representing possible action
     * @param {Number} gravity float representing gravity
     */
    simulateUpdateStateAfterGravity(state, action, gravity) {
        if(action === 0){
            state.vy += this.accDown;
        }else if(action === 1){
            state.vy -= this.accUp;
        }
        state.x += state.vx;
        state.y += state.vy;
        state.vy += gravity;
        return state;
    }

    crashWithBall(ball){
        // referencing the ball
        let left;
        let right;
        let top;
        let bottom;
        // If top of ball contacts bottom of drone
        if(ball.y - ball.radius < this.y + this.height){
            top = true;
        }
        // If bottom of ball contacts top of drone
        if(ball.y + ball.radius > this.y){
            bottom = true;
        }
        // If right of ball contacts left of drone
        if(ball.x + ball.radius > this.x){
            right = true;
        }
        // If left of ball contacts right of drone
        if(ball.x < this.x + this.width){
            left = true;
        }

        if(bottom && top && left && right){
            return true;
        }
    }
}