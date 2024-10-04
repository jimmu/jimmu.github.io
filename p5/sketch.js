let numBoxes = 400

let boxes = []

let minSize = 20
let maxSize = 80
let zPeriod = 25 // seconds
let xPeriod = 30
let yPeriod = 40
let maxSpinSpeed = Math.PI/3 // Radians per second

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
                  colour: {red: random(255),
                           green: random(255),
                           blue: random(255)
                          }
                 }
                )
    }
}

function draw() {
  background(40);
  orbitControl();
  noStroke();
  lights();

  rotateX(TWO_PI * (millis()/(1000 * xPeriod)))
  rotateY(TWO_PI * (millis()/(1000 * yPeriod)))
  rotateZ(TWO_PI * (millis()/(1000 * zPeriod)))

  let elapsedSeconds = millis()/1000
  for (let bx of boxes){
    push()
    translate(bx.position.x, bx.position.y, bx.position.z)
    rotateX(bx.rotation.x * elapsedSeconds)
    rotateY(bx.rotation.y * elapsedSeconds)
    rotateZ(bx.rotation.z * elapsedSeconds)
    fill(bx.colour.red, bx.colour.green, bx.colour.blue)
    box(bx.size.width, bx.size.height, bx.size.depth)
    pop()
  }
  //    //scale(scales[i]);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
