let numBoxes = 600

let positions = []
let rotations = []
let scales = []
let colours = []

let boxSize = 20
let zPeriod = 10000 // seconds?
let xPeriod = 9000
let yPeriod = 10000

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
    for (let i = 0; i < numBoxes; i++) {
      positions.push(createVector(
        random(-width / 2, width / 2),
        random(-height / 2, height / 2),
        random(-width / 2, width / 2)
      ));
      rotations.push(createVector(
        random(TWO_PI),
        random(TWO_PI),
        random(TWO_PI)
      ));
      scales.push(random(0.5, 2));
      colours.push({red: random(255), green: random(255), blue: random(255)})
    }
}

function draw() {
  background(40);
  orbitControl();
  noStroke();
  lights();

  for (let i = 0; i < numBoxes; i += 1) {
    // Before the push()
    rotateX(TWO_PI * (millis()/(1000 * xPeriod)))
    rotateY(TWO_PI * (millis()/(1000 * yPeriod)))
    rotateZ(TWO_PI * (millis()/(1000 * zPeriod)))

    push();
    translate(
      positions[i].x,
      positions[i].y,
      positions[i].z
    );
    rotateX(rotations[i].x + millis()/1000);
    rotateY(rotations[i].y);
    rotateZ(rotations[i].z);
    scale(scales[i]);
    fill(colours[i].red, colours[i].green, colours[i].blue);
    box(boxSize);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}