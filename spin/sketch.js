let numBoxes = 400

let boxes = []

let minSize = 4
let maxSize = 140
let zPeriod = 25 // seconds
let xPeriod = 30
let yPeriod = 40
let maxSpinSpeed = Math.PI/3 // Radians per second
let maxGloss = 200
let minGloss = 100

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  let biggerSize = Math.max(width, height)/1.5
    for (let i = 0; i < numBoxes; i++) {
      boxes.push({position: p5.Vector.random3D().mult(random(biggerSize/3, biggerSize)),
                  rotation: createVector(   // Spin rate, not position
                                    random(-maxSpinSpeed, maxSpinSpeed),
                                    random(-maxSpinSpeed, maxSpinSpeed),
                                    random(-maxSpinSpeed, maxSpinSpeed)
                                  ),
                  size: {width: random(minSize, maxSize),
                         height: random(minSize, maxSize),
                         depth: random(minSize, maxSize)},
                  colour: {red: random(50, 255),
                           green: random(255),
                           blue: random(255),
                           shiny: random(minGloss, maxGloss)
                          }
                 }
                )
    }
}

function draw() {
  background(30);
  orbitControl();
  noStroke();
  //lights();
//   Turn on a red ambient light.
   ambientLight(255, 110, 110);

    // Get the mouse's coordinates.
    // Touch events?
    let mx = mouseX - (width/2);
    let my = mouseY - (height/2);

    // Turn on a white point light that follows the mouse.
    pointLight(255, 255, 255, mx, my, 1000);

  console.log(mx)

  // Doing this before pushing the state onto the stack.
  let elapsedSeconds = millis()/1000
//  rotateX(TWO_PI * elapsedSeconds / xPeriod)
  rotateY(TWO_PI * elapsedSeconds / yPeriod)
//  rotateZ(TWO_PI * elapsedSeconds / zPeriod)

    // Gravity, based on the orientation of the device?

  for (let bx of boxes){
    push()
    bx.size.width = map(mx, 0, width, minSize, maxSize, true)
    bx.size.height = map(my, 0, height, minSize, maxSize, true)
    translate(bx.position.x, bx.position.y, bx.position.z)
//    rotateX(bx.rotation.x * elapsedSeconds)
//    rotateY(bx.rotation.y * elapsedSeconds)
//    rotateZ(bx.rotation.z * elapsedSeconds)
    fill(bx.colour.red, bx.colour.green, bx.colour.blue)
    specularMaterial(255)
    shininess(bx.colour.shiny)
    box(bx.size.width, bx.size.height, bx.size.depth)
    pop()
  }
  //    //scale(scales[i]);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
