/********************************************//**
 *  REQUIRE (COMPONENTS)
 ***********************************************/

var Scene = require('Scene');
var TouchGesture = require("TouchGestures");

const Reactive = require('Reactive');
const FaceTracking = require('FaceTracking');
const Time = require('Time');
const Diagnostics = require('Diagnostics');
const Animation = require('Animation');
const Materials = require('Materials');
const CameraInfo = require('CameraInfo');


/********************************************//**
 *  INIT
 ***********************************************/

// Tracking face0 in the scene
var face = FaceTracking.face(0);

// A common practice is to parent most scene objects to the Focal Distance
const fd = Scene.root.child('Device').child('Camera').child('Focal Distance');

// Filter(s)
var filter_kiss = fd.child('filter_kiss');

// Lenght of effect duration
var effectDuration = 1000;

// Particle Systems
var particle_system_emitter_kiss = filter_kiss.child('facetracker0').child('particles_kiss');

//instructios variables
var instructions = fd.child('instructions').child("instructions_image");
var instructionsMaterial = Materials.get('intro_copyMaterial');
var timoutInstructionDriver = Animation.timeDriver({durationMilliseconds: 4000});
var instructionsDriver = Animation.timeDriver({durationMilliseconds: 1000});
var instructionsValues = Animation.samplers.linear(1, 0);
var instructionsAnimation = Animation.animate(instructionsDriver, instructionsValues);

//instructions default
instructionsMaterial.opacity = instructionsAnimation;
timoutInstructionDriver.start();



/********************************************//**
    * UTILITY
    * There is no .length for groups, so we do horrible things and find out the length
***********************************************/


function childrenCount(groupName, booleanValue) { //sceneObj, boolean

    var value = booleanValue; //find a better name
    var group = groupName;

    var childNumber = 0;
    var particleIndex = 1;

    while (value) {
        var particleSystem = 'particle_system_' + particleIndex;

        // We are using a try-catch statement because the check within the if isn't enough due to its nature.
        // Facebook AR breaks when out of bounds, and this saves from a lot of extra checks by catching the error directly.

        try {
            if (typeof group.child(particleSystem) != null) {
                particleIndex += 1;
                childNumber += 1; 
            } 
        }
        catch (err) {
            value = false;
            break;
        }    

    }

    return childNumber;
}


/********************************************//**
    *  INSTRUCTIONS SHOW/HIDE
***********************************************/
timoutInstructionDriver.onCompleted().subscribe(function(e){
    hideInstructions(true);
    });

    // Subscribe to the video recording state
    var driver = CameraInfo.isRecordingVideo.monitor().subscribe(
    function (result) {
        // Respond to the status change
        if (result.newValue) { 
            // Camera is recording
            hideInstructions();
        }
    }
    );
 

    function hideInstructions(fade) {
        if (fade) {
            instructionsDriver.start();
        } else {
            instructionsMaterial.opacity = 0;
        }
    }


/********************************************//**
 *  KISS GESTURE RECOGNITION
 ***********************************************/

 /** Function startKissFilterParticles
 *  
 * The kiss gesture is currently not natively supported. Therefore, we fake it by calculating raw mouth corners and shooting a signal when optimal.
 * Sadly, the kiss is fine-tuned on lips and the values are fixed, so it might not work with all the lips (ie. big lips vs thin lips). You might want to
 * fine tune the following variables to find the values that are working for you.
 */


var mouth_width_corners = 36;
var mouth_height_lipCenter = 3;
var mouth_pouting_value = 2.5;

var mouthWidthSignal = face.mouth.leftCorner.x.sub(face.mouth.rightCorner.x).sub(mouth_width_corners);
var mouthHeightSignal = face.mouth.upperLipCenter.y.sub(face.mouth.lowerLipCenter.y).div(mouth_height_lipCenter);
var mouthKissTriggerSignal = mouthWidthSignal.sub(mouthHeightSignal).lt(mouth_pouting_value);

var triggeringDiff = -40;

 /**
 * We take into account both width and height of the mouth, in order to detect a pout.
 */

// mouthWidthSignal.sub(mouthHeightSignal).monitor().subscribe(function(e){
//     hideInstructions();
//     startKissFilterParticles();
// })


 /**
 * If you want the kiss to be a bit more forgiving, take into account the mouth width only. Uncomment the following lines to test it.
 */

mouthWidthSignal.lt(triggeringDiff).monitor().subscribe(function(e){
    hideInstructions();
    startKissFilterParticles();
})

/********************************************//**
 *  PARTICLE SYSTEMS SPAWNING FUNCTIONS
 ***********************************************/

/** Function startKissFilterParticles
 *  
 * Managers the spawning, visibility and duration of the Kiss effect per emitter.
 */

function startKissFilterParticles() {
    particle_system_emitter_kiss.hidden = false;
        
        particle_system_emitter_kiss.child('particle_system_1').birthrate = 5;
        particle_system_emitter_kiss.child('particle_system_2').birthrate = 5;
        particle_system_emitter_kiss.child('particle_system_3').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_4').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_5').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_6').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_7').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_8').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_9').birthrate = 2;
        particle_system_emitter_kiss.child('particle_system_10').birthrate = 3;
        particle_system_emitter_kiss.child('particle_system_11').birthrate = 3;



        Time.setTimeout(function(){ 
            var particleSystemCount = childrenCount(particle_system_emitter_kiss, true);

            for (var ind = 1; ind <= particleSystemCount; ind++) {                
                var particleSystem = 'particle_system_' + ind;
                particle_system_emitter_kiss.child(particleSystem).birthrate = 0;
            }
            
        }, effectDuration);
}


