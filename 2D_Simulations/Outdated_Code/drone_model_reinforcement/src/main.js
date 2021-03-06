import Drone from './drone.js';
import Memory from './memory.js';
import Model from './model.js';
import draw from './draw.js';
import sleep from './sleep.js';
import calculateReward from './reward.js';
import rewardRange from './visual_extras.js';

// Set up environment/global variables
let MEMORY_SIZE = 500;
let GRAVITY = 0.02;
let NUM_SIMULATIONS = 99999;
let RAND_ACTION_PROB = 0.9;
let REWARD_TOP_BOUNDARY = 250;
let REWARD_BOTTOM_BOUNDARY = 350;
let DISCOUNT_RATE = 0.9;

/**
 * Begins execution of main program loop in async function.
 */
async function beginExecution(){
    // Set up canvas (width, height, etc).
    let canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let ctx = canvas.getContext('2d');

    // Create a memory object for storing drone state
    let memory = new Memory(MEMORY_SIZE);

    // Create a new model object for predicting drone action
    let model = new Model(10, 2, 2, 100, DISCOUNT_RATE); // Currently set to 10 hidden layer nodes, 2 states (drone y, vy), 2 actions (up, down), 100 batch size
    
    // Set up variable for number of iterations of training
    let sims = 0;

    // Attempt to load a model saved in local storage
    try{
        let network = await tf.loadLayersModel('localstorage://my-model-1');
        model.network = network;
        model.network.summary();
        model.network.compile({optimizer: 'adam', loss: 'meanSquaredError'});
        sims = localStorage.getItem('numIterations');
    }catch(err){
        console.log("No model exists, generating model with random parameters.");
    }

    // Create a drone and render its current position
    let drone = new Drone(canvas, ctx);
    drone.renderDrone(ctx);

    // Allocate droneState variable in memory
    let droneState;
    let action;
    let reward;
    let numFrames;

    // Run NUM_SIMULATIONS simulations
    for( ;sims<NUM_SIMULATIONS; sims++){
        // Run the current simulation until drone crashes
        numFrames = 0;
        let crashed = false;
        while(!crashed){
            // Saves browser from crashing
            await sleep(0);

            // Get current drone state
            droneState = drone.getState(canvas);

            // Choose and perform action
            action = model.chooseAction(droneState, RAND_ACTION_PROB);
            drone.move(action)

            // Get the current calculated reward
            reward = calculateReward(drone, REWARD_TOP_BOUNDARY, REWARD_BOTTOM_BOUNDARY);

            // Push the current drone state, action, and reward to memory
            memory.addSample([droneState, action, reward]);

            // Draw on canvas updated parameters
            crashed = draw(canvas, ctx, drone, GRAVITY);

            // Set up green reward range visual
            rewardRange(canvas, ctx, REWARD_TOP_BOUNDARY, REWARD_BOTTOM_BOUNDARY);

            // Increment numFrames
            numFrames++;
        }

        // Reset drone to initial position
        drone.setToMiddle();

        // Decrement RAND_ACTION_PROB exponentially
        RAND_ACTION_PROB *= 0.9;

        // Commence model training
        model.commenceTraining(memory, numFrames);

        // Save the current model to local storage
        if(sims%50 == 0 && sims>0){
            let saveResult = await model.network.save('localstorage://my-model-1');
            localStorage.setItem('numIterations', sims);
            console.log("Saved model, iteration: ", sims);
        }

    }
}

/**
 * Execute main program execution on page load
 */
window.onload = function(){
    beginExecution();
}