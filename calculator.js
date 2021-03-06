var numberDisplay = 0;
var symbol;
var rememberedNumber = 0;
var currentNumber = 0;
var state = "enteringFirstNumber";

var divideSymbol = '\u00f7';
var multiplySymbol = 'x';

$("#zero").click(function(){numberClicked(0)});
$("#one").click(function(){numberClicked(1)});
$("#two").click(function(){numberClicked(2)});
$("#three").click(function(){numberClicked(3)});
$("#four").click(function(){numberClicked(4)});
$("#five").click(function(){numberClicked(5)});
$("#six").click(function(){numberClicked(6)});
$("#seven").click(function(){numberClicked(7);});
$("#eight").click(function(){numberClicked(8);});
$("#nine").click(function(){numberClicked(9);});

$("#minus").click(function(){
    operationClicked("-");
});

$("#plus").click(function(){
    operationClicked("+");
});

$("#divide").click(function(){
    operationClicked(divideSymbol);
});

$("#times").click(function(){
    operationClicked(multiplySymbol);
});

$("#equals").click(equalsClicked);

function equalsClicked(){
    currentNumber = doTheSum(rememberedNumber, symbol, currentNumber);
    state = "justPressedEquals";
    updateTheScreen();
}

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
    if ("enteringSecondNumber" != state ){
        symbol = theOperation;
        rememberedNumber = currentNumber;
        currentNumber = 0;
        state = "enteringSecondNumber";
        updateTheScreen();
    }
}

function doTheSum(oneNumber, symbol, otherNumber){
    if (symbol == "+"){
        return oneNumber+otherNumber;
    }
    else if (symbol == "-"){
        return oneNumber-otherNumber;
    }
    else if (symbol == multiplySymbol){
        return oneNumber*otherNumber;
    }
    else if (symbol == divideSymbol){
        return oneNumber/otherNumber;
    }
    else {
        return currentNumber;
    }
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