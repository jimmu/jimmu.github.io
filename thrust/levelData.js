"use strict";
import {decorate, makeSwitch} from './levelMethods.js'
import {point, triangle, rectangle, quadrilateral, circle} from './shapes.js'
import {colours} from './config.js'

const downwardDynamicBlock = decorate("b", {coords: [-0.5, -0.5, 1, 1], isDamaging: true, permanent: true, isDynamic: true, period: 8, phase: 0, heightOffsetFn: ["posCos", "originalHeight", 2.8], colour: "#595c30"})
const upwardDynamicBlock = decorate(downwardDynamicBlock, {heightOffsetFn: ["posSin", "originalHeight", 2.8], yOffsetFn: ["posSin", "originalHeight", -2.8]})
export const levels = [
    {
        name: "Land Carefully",
        // GroundBlocks are a way to quickly express some version of background.
        // An array of equal length strings, representing the full scene.
        // So an array of 10 string of length 10 would be a 100 pixel version of the background.
        // Treat each character as a rectangle. No properties set on any of them.
        // Can optimise later be merging the rectangles in to a smaller number of larger shapes.
        groundBlocks: {
            size: {x:3, y:3},   // Optional. How many screens wide/high do these blocks cover?
            blocks: [
            "###",
            "# #",
            "###"
            ]
        },
        ground: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.05], landingPad: true}
        ],
        objects: [
            {type: rectangle, coords:[-0.05, 0.25, 0.1, 0.01], landingPad: true, permanent: true},
        ],
        isComplete: function(){
            return true
        },
        usePatternFill: false,
        generatePattern: (canvas)=>{
            // TODO. Canvas is 8x8, but how do we know that and can we specify the dimensions
            canvas.point(4,4)
        }
    },
    {
        name: "Collect",
        backgroundColour: "#595c00",    // Dark drab olive
        groundBlocks: {
            size: {x:2, y:1.5},
            blocks: [
            "##############",
            "##############",
            "###        ###",
            "###   c    ###",
            "###      . ###",
            "### L      ###",
            "##############",
            "##############",
            ]
        },
    },
    {
        name: "Refuel",
        groundBlocks: {
            size: {x:6, y:2},
            blocks: [
            "########################",
            "########################",
            "#.                    /#",
            "#####################/ #",
            "#####################/F#",
            "#L                    /#",
            "########################",
            "########################"
            ]
        },
        usePatternFill: true,
        backgroundColour: "#506050",
        objectTypes: new Map([
            ["F", decorate("F", {coords:[0, -0.5, 0.25]})]    // Overriding the position and size of the fuel object.
        ])
    },
    {
        name: "Steer",
        backgroundColour: "darkOrange",
        groundBlocks: {
            size: {x:1.75, y:1},
            blocks: [
            "###############################",
            "###############################",
            "###############################",
            "###/     //     //      ///####",
            "###  ///    ///    ///   /#####",
            "### .///    ///    ///    /####",
            "###/     //     //     //L /###",
            "###############################",
            "###############################",
            "###############################",
            ]
        },
        objectTypes: new Map([
            ["L", decorate("L", {coords:[-0.5, 0.4, 2, 0.1]})]    // Overriding the width of the landing pad
        ])
    },
    {
        name: "Fetch",
        backgroundColour: "saddleBrown",
        groundBlocks: {
            size: {x:1, y:1},
            blocks: [
            "############",
            "#/   //   /#",
            "#     .    #",
            "#/   B//B /#",
            "##/ /#######",
            "#/     /  /#",
            "#F     p p #",
            "#/  //    /#",
            "############"
            ]
        },
        isComplete: function(){
            for (let collectable of this.objects){
                if (collectable.bucket && !collectable.full){
                    return false
                }
            }
            return true
        }
    },
    {
        name: "Unlock",
        groundBlocks: {
            size: {x:2, y:1},
            blocks: [
            "#################",
            "##     ///     ##",
            "##     ///     ##",
            "##     ///     ##",
            "##  .   D      ##",
            "##     ///     ##",
            "##  K  ///  L  ##",
            "##     ///     ##",
            "#################",
            ]
        },
    },
    {
        name: "Steady On",
        backgroundColour: "#595c30",
        groundBlocks: {
            size: {x:2.5, y:1},
            blocks: [
            "#######################",
            "# babcdedcbabcdedcba  #",
            "#                     #",
            "#                   X #",
            "#                     #",
            "#                     #",
            "#                     #",
            "#.                    #",
            "# BABCDEDCBABCDEDCBAL #",
            "#######################",
            "#######################",
            ]
        },
        objectTypes: new Map([
            ["X", decorate("E")],   // Extra life.
            ["L", decorate("L", {coords:[-0.5, 0.4, 2, 0.1]})],    // Overriding the width of the landing pad
            ["a", downwardDynamicBlock],
            ["b", decorate(downwardDynamicBlock, {phase: Math.PI/32})],
            ["c", decorate(downwardDynamicBlock, {phase: 2 * Math.PI/32})],
            ["d", decorate(downwardDynamicBlock, {phase: 3 * Math.PI/32})],
            ["e", decorate(downwardDynamicBlock, {phase: 4 * Math.PI/32})],
            ["A", upwardDynamicBlock],
            ["B", decorate(upwardDynamicBlock, {phase: Math.PI/32})],
            ["C", decorate(upwardDynamicBlock, {phase: 2 * Math.PI/32})],
            ["D", decorate(upwardDynamicBlock, {phase: 3 * Math.PI/32})],
            ["E", decorate(upwardDynamicBlock, {phase: 4 * Math.PI/32})],
        ]),
    },
    {
        name: "Repair",
        groundBlocks: {
            size: {x:1, y:1},
            blocks: [
            "##################################",
            "##################################",
            "######/ /##############/    /#####",
            "######                   //  #####",
            "######  /##/    /#####/ /##  #####",
            "######  /####/  ######/ ### /#####",
            "###### h #####  #####/ H ##h######",
            "######/  #####  ###/   /### /#####",
            "#######  #####  /#/ /######  #####",
            "######/ /####  h    #######  /####",
            "#####/  ######  /#/ /#####/   /###",
            "###/    ######ff###  /###/     ###",
            "## .   /######/ ###/       LL /###",
            "############### ##################",
            "##################################",
            "##################################",
            ]
        },
        ground: [],
        objectTypes: new Map([
            ["K", {type: triangle, coords:[0, -0.25, 0.25, 0.25, -0.25, 0.25], key: "A"}],
            ["D", {type: rectangle, coords:[0, -1, 0.5, 2], needsKey: "A"}],
            ["h", decorate("h", {coords:[0, 0, 0.6]})], // Making these larger than the default
            ["H", decorate("H", {coords:[0, 0, 0.6]})], // Making these larger than the default
            ["f", decorate("f", {coords:[0, 0, 0.6]})], // Making these larger than the default
        ]),
        usePatternFill: true,
        isComplete: function(){
            return true
        }
    },
    {
        name: "Switch",
        groundBlocks: {
            size: {x:1, y:1},
            blocks: [
            "#############",
            "#############",
            "##   sa  L###",
            "##.   #######",
            "##    btdcu##",
            "#############",
            "#############"
            ]
        },
        objectTypes: new Map([
            ["s", makeSwitch("a", "click")],
            ["t", makeSwitch("a", "click")],
            ["u", makeSwitch("b", "click")],
            ["a", {type: rectangle, coords:[-0.1, -0.6, 0.2, 1.2], switchedBy: ["a"], disabled: true, needsKey: "-", message: "Nope", orientation: "vertical", bouncy: true}],
            ["b", {type: rectangle, coords:[-0.1, -0.6, 0.2, 1.2], switchedBy: ["a", "b"], disabled: false, needsKey: "-", message: "Nope", orientation: "vertical", bouncy: true}],
            ["d", {type: rectangle, coords:[-0.1, -0.6, 0.2, 1.2], switchedBy: ["a"], disabled: true, needsKey: "-", message: "Nope", orientation: "vertical", bouncy: true}],
        ])
    },
    {
        name: "Gotta Catch All Of Them",
        groundBlocks: {
            size: {x:1.5, y:1},
            blocks: [
                "#///////////////#",
                "/////////////////",
                "//fcccccccccccf//",
                "//c///c///c///c//",
                "//c///c///c///c//",
                "//c///c///c///c//",
                "//fccc.cccccccf//",
                "//c///c///     //",
                "//c///c///     //",
                "//c///c///     //",
                "//fcccccccLLLLL//",
                "/////////////////",
                "#///////////////#",
            ]
        }
    },
    {
        name: "Maze",
        groundBlocks: {
            size: {x:2.5, y:2},
            blocks: [
            "##################################",
            "+---------+------+---------------+",
            "|         |      |               |",
            "|    +-+  |      |      +----+   |",
            "|    | |  |   +  |      |  F +   |",
            "|  +-+ |  |   |  |      |        |",
            "|     f|  |   |Hf+---+  +--------+",
            "|  +-+-+  |   +--+               |",
            "|    |    +   | H|       f       |",
            "|    |    F   |  |               |",
            "|    |        +  |               |",
            "+-+  +----+      +------+F +--+  +",
            "|f       f|      |      |     |  |",
            "|         |      +      |     |  |",
            "|         |             |     |  |",
            "|         |             |     |  |",
            "|         |      +      +-+  ++  |",
            "|         |      |      +     |  |",
            "|         |      |           ++  |",
            "+-----++f +------+      +    |   |",
            "|    F|          |      |    |   |",
            "|   +-+    +     |      +-+ F++f++",
            "|     |    |   f |      |    |   |",
            "|     |    |     |      |    |   |",
            "|     |    |     |      +----+   |",
            "| .   +----+     |      |        |",
            "|                |   F  |     L  |",
            "+----------------+------+--------+",
            "##################################",
            ]
        },
        objectTypes: new Map([
            ["|", decorate("|", {colour: "orange"})],
            ["-", decorate("-", {colour: "orange"})],
            ["L", decorate("L", {coords: [-0.5, 0.6, 3, 0.2]})],
            ["#", decorate("b", {colour: colours.background})],
            ["+", decorate("c", {coords:[0, 0, 0.9], bouncy: true, permanent: true, colour: "darkOrange", mandatory: false})],
        ]),
        backgroundColour: colours.background,
        // TODO. On this level we could run out of fuel and just get stuck lying on the ground.
    },
    {
        name: "Slight Squeeze",
        groundBlocks: {
            size: {x:2, y:1.5},
            blocks: [
            "##################################",
            "##################################",
            "##################################",
            "#######                 ##########",
            "####### ############### ##########",
            "####### ############### ##########",
            "####### ############### ##########",
            "####### ###########     ##########",
            "####### ########### ##############",
            "####### ##### f     ##############",
            "####### ######## ## ######  K  ###",
            "####### ########f## ######  F  ###",  // This f is the name of an object which will be fully defined in the object types array.
            "##LfD . ###########            ###",  // This . is the start point. L will be the landing pad. D the door. K the key
            "##################################",
            "##################################",
            "##################################",
            ]
        },
        ground: [],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Frogger",
        backgroundColour: "#595c00",    // Dark drab olive
        groundBlocks: {
            size: {x:2, y:1.5},
            blocks: [
            "##############",
            "##############",
            "###ce  b   ###",
            "###   a    ###",
            "###  b     ###",
            "### a  .  b###",
            "###b     a ###",
            "###     b  ###",
            "### d  a   ###",
            "##############",
            "##############",
            ]
        },
        objectTypes: new Map([
            ["b", decorate("b", {coords: [-0.5, -0.5, 2, 1], permanent: true, isDynamic: true, period: 16, phase: 0, xOffsetFn: ["sin", "originalWidth", 1], /*yOffsetFn: ["cos", "originalHeight", 0.5]*/})],
            ["a", decorate("b", {coords: [-0.5, -0.5, 2, 1], permanent: true, isDynamic: true, period: 16, phase: 0.5, xOffsetFn: ["sin", "originalWidth", 1], /*yOffsetFn: ["cos", "originalHeight", 1]*/})],
            ["c", decorate("b", {coords: [-0.5, -0.5, 1, 1], permanent: true, isDynamic: true, period: 8, phase: 0, heightOffsetFn: ["rampUp", "originalHeight", 7], /*yOffsetFn: ["cos", "originalHeight", 1]*/})],
            ["d", decorate("b", {coords: [-0.5, -0.5, 1, 1], isDamaging: true, permanent: true, isDynamic: true, period: 8, phase: 0, heightOffsetFn: ["rampUpAndBack", "originalHeight", 4], yOffsetFn: ["rampUpAndBack", "originalHeight", -4]})],
            ["e", decorate("b", {coords: [-0.5, -0.5, 1, 4], isDamaging: true, permanent: true, isDynamic: true, period: 8, phase: 0, heightOffsetFn: ["rampUpAndBack", "originalHeight", -3/4]})],
        ]),
    },
    {
        name: "Tight Squeeze",
        startCoords: {x:-0.2, y:0},
        ground: [
            {type: quadrilateral, coords:[-1, -0.85, 0, -0.85, 0, -0.05, -1, -0.05]},
            {type: quadrilateral, coords:[-1, 0.05, 2, 0.05, 2, 1.05, -1, 1.05]},
            {type: quadrilateral, coords:[0.05, -0.75, 0.55, -0.75, 0.55, 0.05, 0.05, 0.05]},
            {type: quadrilateral, coords:[-1, -1.05, 2, -1.05, 2, -0.85, -1, -0.85]},
            {type: quadrilateral, coords:[0.6, -1, 1.1, -1, 1.1, -0.05, 0.6, -0.05]},
            {type: quadrilateral, coords:[1.7, -1.05, 2.7, -1.05, 2.7, 1.05, 1.7, 1.05]}
        ],
        objects: [
            {type: quadrilateral,coords:[-0.75, 0.045, -0.65, 0.045, -0.65, 0.055, -0.75, 0.055], landingPad: true, permanent: true},
            {type: triangle, coords:[1.45, -0.45, 1.445, -0.425, 1.455, -0.425], key: "A"},
            {type: circle, coords:[1.45, -0.3, 0.025], fuel:100, message: "Fuel"},
            {type: circle, coords:[-0.4, 0, 0.025], fuel:100, message: "Fuel"},
            {type: quadrilateral, coords:[-0.375, -0.1, -0.37, -0.1, -0.37, 0.1, -0.375, 0.1], needsKey: "A"}
        ],
        isComplete: function(){
            return true
        }
    },
    {
        name: "Level x",
        ground: [
            {type: triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.01], landingPad: true, permanent: true},
            {type: circle, coords:[-0.1, 0.1, 0.01], fuel: 25, message: "Fuel"},
            {type: circle, coords:[-0.2, 0.1, 0.01], health: 50, message: "Undamage"}
        ],
        isComplete: function(){
            // Has the ship landed?
            for (let landingPad of this.objects.filter((e)=>{return e.landingPad})){
                return landingPad.collected
            }
            return false
        }
    },
    {
        name: "Level y",
        ground: [
            {type: triangle, coords:[-0.5, 0.4, 0, 0.3, 0.5, 0.5]},
            {type: triangle, coords:[0.5, -0.4, 0, -0.3, -0.5, -0.5]},
            {type: quadrilateral, coords:[-0.5, -0.4, -0.3, -0.3, -0.4, 0.4, -0.6, 0.45]},
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true},
        ],
        objects: [
            {type: rectangle, coords:[0.2, 0.1, 0.1, 0.05], landingPad: true, permanent: true},
            {type: circle, coords:[-0.1, 0.1, 0.01], fuel: 25},
            {type: circle, coords:[-0.2, 0.1, 0.01], health: 50}
        ],
        isComplete: function(){
            return false
        }
    }
]
