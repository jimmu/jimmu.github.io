var numberDisplay = 0;
var symbol;
var rememberedNumber = 0;
var currentNumber = 0;
var state = "enteringFirstNumber";

$("#seven").click(function(){numberClicked(7);});
$("#eight").click(function(){numberClicked(8);});
$("#nine").click(function(){numberClicked(9);});
$("#four").click(function(){numberClicked(4)});
$("#five").click(function(){numberClicked(5)});
$("#six").click(function(){numberClicked(6)});
$("#one").click(function(){numberClicked(1)});
$("#two").click(function(){numberClicked(2)});
$("#three").click(function(){numberClicked(3)});
$("#zero").click(function(){numberClicked(0)});

$("#minus").click(function(){
    symbol = "-";
    numberDisplay = numberDisplay + "-";
    updateTheScreen();
});

$("#plus").click(function(){
    operationClicked("+");
});

$("#divide").click(function(){
    operationClicked("/");
});

$("#times").click(function(){
    operationClicked("*");
});

$("#equals").click(function(){
    // Work out the answer
    currentNumber = 11111;

    state = "justPressedEquals";
    // Write it on the screen.
    updateTheScreen();
});


function numberClicked(theNumber){
    if ("justPressedEquals" == state){
        rememberedNumber = 0;
        currentNumber = 0;
        state = "enteringFirstNumber";
    }
    currentNumber = (currentNumber * 10) + theNumber;
    updateTheScreen();
}

function operationClicked(theOperation){
    symbol = theOperation;
    rememberedNumber = currentNumber;
    currentNumber = 0;
    state = "enteringSecondNumber";
    updateTheScreen();
}

function updateTheScreen(){
    var whatToDisplay;
    if ("enteringFirstNumber" == state){
        whatToDisplay = currentNumber;
    }
    else if ("justPressedEquals" == state) {
        whatToDisplay = currentNumber;
    }
    else if ("enteringSecondNumber" == state) {
        whatToDisplay = rememberedNumber + " " + symbol + " " + currentNumber;
    }
    else {
        whatToDisplay = "poo";
    }
    $("#screenDisplay").text(whatToDisplay);
}

//$("body").append($("<div>").attr("class", "calculator").text("Helloo"));