// =========================================
// DATA: card catalogs + runtime state
// =========================================
const heroNames = [
    "Hero",
    "Lucy",
    "Reggie",
    "Surak",
]

const heartNames = [
    "Heart_of_Body_and_Mind",
    "Heart_of_Brutality",
    "Heart_of_Tenacity",
    "Heart_of_Vigor",
]

const itemNames = [
    "Bomb",
    "Boots",
    "Dagger",
    "Reality_Chip",
    "Shield",
    "Slingshot",
]

const trapNames = [
    "Acid_Cloud",
    "Bear_Trap",
    "Lava_Pit",
    "Runic_Sigil",
]

const landNames = [
    "Forest",
    "Lake",
    "Mountain",
    "Volcano",
]

const priorityOrder = [heroNames, heartNames, itemNames, trapNames, landNames]

// All saved decklists
let deckLists = [];

// The current deck being edited or created
let currentDeck = [];

// Up to 2 stacks selected to play against each other (make an empty array when done)
let selectedStacks = [];

// Current cards and order of builtHand, should always have length 18
let builtHand = [];

// cardPosition: [cardName, isRotated, isFlipped]
let currentHand = {
    0: ["",false,false],
    1: ["",false,false],
    2: ["",false,false],
    3: ["",false,false],
    4: ["",false,false],
    5: ["",false,false],
    6: ["",false,false],
    7: ["",false,false],
    8: ["",false,false],
    9: ["",false,false],
    10: ["",false,false],
    11: ["",false,false],
    12: ["",false,false],
    13: ["",false,false],
    14: ["",false,false],
    15: ["",false,false],
    16: ["",false,false],
    17: ["",false,false],

}

let highlightedCard = -1;

// Play-order template for dealing cards onto the board.
const sortPattern = [
  "hero",
  "item",
  "land",
  "trap",
  "item",
  "land",
  "trap",
  "item",
  "heart",
  "heart",
  "item",
  "trap",
  "land",
  "item",
  "trap",
  "land",
  "item",
  "hero"
];

// =========================================
// INIT: build picker UI + load saved decks
// =========================================
window.addEventListener('load', function() {
    const allCardNames = heroNames.concat(heartNames, itemNames, trapNames, landNames);

    allCardNames.forEach(card => {
        let displayName = ""
        let innerString = '<img src="./Pictures/fronts/'+ card + '.png" alt="" onclick="addCard(\'' + card + '\')"></img>'

        if (heroNames.includes(card)) {
            innerString += '<img src="./Pictures/backs/' + card + '.png" alt="" onclick="addCard(\'' + card + '\')"></img>'
            displayName = "heroDisplay"
        }
        else if (heartNames.includes(card)) {
            displayName = "heartDisplay"
        }
        else if (itemNames.includes(card)) {
            displayName = "itemDisplay"
        }
        else if (trapNames.includes(card)) {
            displayName = "trapDisplay"
        }
        else if (landNames.includes(card)) {
            displayName = "landDisplay"
        }                        
            //<img src="./Pictures/backs/' + card + '.png" alt="">
        this.document.getElementById(displayName).innerHTML = this.document.getElementById(displayName).innerHTML + innerString
    });

    loadDeckLists();
    //Remove "hidden" attribute from main page
    showPage();

});

function showPage() {
    this.document.getElementById("wholePage").style = 'display: "";'
}

// =========================================
// BUILDER: create/edit current deck
// =========================================
function createNewDeck() {
    // currentDeck = [];
    document.getElementById("mainCardDisplay").style = 'display: "";'
    const curDeckDisplay = document.getElementById("currentDeckDisplay");
    curDeckDisplay.getBoundingClientRect();
    curDeckDisplay.classList.add("show");
    updateDeckDisplay();
    updateCardTypeGreyOut();
    document.getElementById("buildButton").style = "display: none";
    document.getElementById("saveButton").style = 'display: ""';
    const loadedCardDisplay = document.getElementById("loadedCardDisplay")
    if (!loadedCardDisplay.classList.contains("minimized")) {
        loadedCardDisplay.classList.add("minimized");
    }
    
}

function addCard(name) {
    console.log("Adding " + name);
    currentDeck.push(name);
    checkDeckValidity();
    updateDeckDisplay();
    updateCardTypeGreyOut();
}

function removeCard(name) {
    console.log("Removing " + name)
    let index = currentDeck.indexOf(name);
    if (index > -1) {
        currentDeck.splice(index, 1);
    }
    updateDeckDisplay();
    checkDeckValidity();
    updateCardTypeGreyOut();
}

// =========================================
// GAME: stack selection + play board
// =========================================
function selectDeck(deckID) {
    if (selectedStacks.includes(deckID)) {
        selectedStacks.splice(selectedStacks.indexOf(deckID),1);
        document.getElementById(deckID).classList.toggle("selected")
    }
    else if (selectedStacks.length < 2) {
        selectedStacks.push(deckID)
        document.getElementById(deckID).classList.toggle("selected")
    }
    validatePlayButton();
}

function validatePlayButton() {
    const playbtn = document.getElementById("playButton");
    if (selectedStacks.length == 0) {
        playbtn.classList = "playButtonNotReady";
    }
    else if (selectedStacks.length == 1) {
        playbtn.classList = "playButtonHalfReady";
    }
    else if (selectedStacks.length == 2) {
        playbtn.classList = "playButtonReady";
    }
}

function launchGame() {
    //select 2 stacks - make stacks selectable
    if (selectedStacks.length != 2) {
        alert("You must have 2 saved stacks selected to play!\n\nTo build a stack, click build and add cards until you meet the requirements (the Save button will turn green)\n\nTo select a stack, have the Saved Stacks pop up open and click on 2 different stacks.");
        return;
    }

    let startX = 0;



    
    //using the names provided in selectedStacks, determine 
    // selectedStacks.forEach(stack => {
    //     console.log(stack);
    //     stack = stack.split("oadedDeck")[1];
    //     console.log(stack);
    //     stack1 = deckLists[stack];
    //     console.log(stack1);
    // })

    builtHand = deckLists[selectedStacks[0].split("loadedDeck")[1]].concat(deckLists[selectedStacks[1].split("loadedDeck")[1]]);
    
    let heroHeartLookup = {
        hero1: builtHand[0],
        heart1: builtHand[1],
        heart2: builtHand[10]

    };

    builtHand = shuffleArray(builtHand);


    //transform selected Stacks in actual Cards
    //shuffle and form stack
    // builtHand = selectedStacks[0].concat(selectedStacks[1]);
    // builtHand = shuffleArray(builtHand);

    let buckets = {
        hero: [],
        item: [],
        land: [],
        trap: [],
        heart: []
    }

    for (let card of builtHand) {
        let type = getCardType(card);
        if (!type) {
            throw new Error(`Unknown card type: ${card}`);
        }
        buckets[type].push(card); 
    }

    let result = [];
    let nextHeart = "";
    let noSkip = true;

    //Need to lock the next heart pick a hero is picked
    for (const type of sortPattern) {
        if (buckets[type].length === 0) {
            throw new Error(`Not enough cards of type: ${type}`);
        }
        
        //Specific Heart per Hero logic
        if (type == "hero") {
            if (buckets[type][0] == heroHeartLookup.hero1 && noSkip) {
                nextHeart = heroHeartLookup.heart1
                noSkip = false;
            }
            else {
                nextHeart = heroHeartLookup.heart2
            }
        }
        if (type == "heart") {
            result.push(nextHeart);
            if (nextHeart == heroHeartLookup.heart1) {
                nextHeart = heroHeartLookup.heart2
            }
            else {
                nextHeart = heroHeartLookup.heart1
            }
        }
        else {
            result.push(buckets[type].shift());
        }
    }

    builtHand = result;

    //Clear screen of all other cards, buttons, and titles first!
    document.getElementById("wholePage").style="display: none;"
    document.getElementById("gameScreen").style='display: "";'

    for (let i = 0; i < builtHand.length; i++) {
        currentHand[i][0] = builtHand[i];
    }

    //build carousel display of stack
    updateBoard();

    //slide to front of stack and begin
    addKeyboardControls();

    gameBoard.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;

});

scrollBoardToPosition(100);

gameBoard.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) selectCard(highlightedCard + 1);
  if (startX - endX > 50) selectNextCard(highlightedCard - 1);
});

selectCard(17); //Selects hero that will go first
}

function addKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        console.log(event.key);
        if (event.key == 'ArrowRight') {
            startScroll(-1);
        }
        if (event.key == 'ArrowLeft') {
            startScroll(1);
        }        
        if (event.key == "ArrowUp") {
            scrollBase += 5;
        }
        if (event.key == "ArrowDown") {
            scrollBase -= 5;
        }
        if (event.key == 'd') {
            if (highlightedCard < 18) {
                selectCard(highlightedCard + 1);
            }
        }
        if (event.key == "a") {
            if (highlightedCard > 0) {
                selectCard(highlightedCard - 1);
            }
        }
        if (event.key == "w") {
            rotateCard(highlightedCard);
        }
        if (event.key == "s") {
            flipCard(highlightedCard);
        }
        if (event.key == "q") {
            moveSelectedCardLeft(highlightedCard);
        }
        if (event.key == "e") {
            moveSelectedCardRight(highlightedCard);
        }
    })

    document.addEventListener('keyup', function(event) {
        if (event.key == 'ArrowRight' || event.key == 'ArrowLeft') {
            stopScroll();
        }
    })

    document.addEventListener('wheel', function(event) {
        const deltaY = event.deltaY; // Vertical scroll amount
        console.log(deltaY);

        if (deltaY < 0) {
            startScroll(1, true);
        } else if (deltaY > 0) {
            startScroll(-1, true)
        }
        wheelStopTimer = setTimeout(() => {
        
            stopScroll();
        
        }, 150);
    })
}

function showControls() {
    document.getElementById("imgControlsContainer").style = 'display: "";';
}

function hideControls() {
    document.getElementById("imgControlsContainer").style = 'display: none;';
}

function updateBoard() {
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";
    let tmpOuterHTML = gameBoard.outerHTML.split(' style=')[0] + "></div>"
    let minimapHTML = tmpOuterHTML.split('"><')[0] + 'mini" class="miniGameBoard">'; //HERE

    let position = 0;

    Object.values(currentHand).forEach(card => {
        let flippedText = "fronts";
        let rotatedText = "";

        if (card[1]) {
            rotatedText = ' rotated'
        }

        if (card[2] && getCardType(card[0]) == "hero") {
            flippedText = "backs/" + card[0] + ".png"
        } else if(card[2]) {
            flippedText = "cardBack.png"
        }
        else {
            flippedText = "fronts/" + card[0] + ".png";
        }

        if (card == highlightedCard) {
            gameBoard.innerHTML += '<div><div id="button' + position + '" class="gameCardButtons" style="display: none;"><button onclick="moveSelectedCardLeft('+ position +')">\<--</button><button onclick="rotateCard('+ position +')">Rotate</button><button onclick="flipCard('+ position +')">Flip</button><button onclick="moveSelectedCardRight('+ position +')">--\></button></div><img id="'+position+'" class="hoverZoom' + rotatedText + '" src="./Pictures/' + flippedText + '" alt="" onclick="selectCard(' + position + ')" /></div>'    
        }
        else {
            gameBoard.innerHTML += '<div><div id="button' + position + '" class="gameCardButtons" style="display: none;"><button onclick="moveSelectedCardLeft('+ position +')">\<--</button><button onclick="rotateCard('+ position +')">Rotate</button><button onclick="flipCard('+ position +')">Flip</button><button onclick="moveSelectedCardRight('+ position +')">--\></button></div><img id="'+position+'" class="hoverZoom' + rotatedText + '" src="./Pictures/' + flippedText + '" alt="" onclick="selectCard(' + position + ')" /></div>'
        }
        minimapHTML +='<img id="0.'+position+'" class="' + rotatedText + '" src="./Pictures/' + flippedText + '" alt=""/>'
        position ++;
    })
    
    minimapHTML += "<" + gameBoard.outerHTML.split("><")[1];

    //update mini map
    const miniMap = document.getElementById("gameMiniMap");
    miniMap.innerHTML = minimapHTML;
    selectCard(highlightedCard);
}

function addRotateClass(position) {
        document.getElementById(position).classList.toggle("rotated");

}

function selectCard(position) {
    //add a class to that card, which the ID will also be the position
    if (highlightedCard >= 0) {
        const curHighlight = document.getElementById(highlightedCard);
        const miniHighlight = document.getElementById("0." + highlightedCard)
        curHighlight.classList.remove("highlight");
        miniHighlight.classList.remove("highlightMini")
        document.getElementById("button"+highlightedCard).style = 'display: none;'
    }
    if (position >= 0) {
        const newMiniHighlight = document.getElementById("0." + position)
        const newHighlight = document.getElementById(position);
        newHighlight.classList.add("highlight");
        newMiniHighlight.classList.add("highlightMini")
        //display movement, flip, and rotate options above card
        document.getElementById("button"+position).style = 'display: "";'
    }
    highlightedCard = position;
}

function deselectCard() {

    if (highlightedCard < 0) {
        return;
    }

    const curHighlight = document.getElementById(highlightedCard);
    const miniHighlight = document.getElementById("0." + highlightedCard)
    curHighlight.classList.remove("highlight");
    miniHighlight.classList.remove("highlightMini");
    document.getElementById("button"+highlightedCard).style = 'display: none;'
    highlightedCard = -1;
}

function moveSelectedCardLeft(position) {

    console.log(position);

    if (position < 1 || position > 17) {
        return;
    }
    let selectedCard = currentHand[position];
    let movedCard = currentHand[position - 1];

    currentHand[position] = movedCard;
    currentHand[position - 1] = selectedCard;

    highlightedCard = position - 1;

    document.getElementById(position).parentElement.classList.add("moveLeft")
    document.getElementById(position - 1).parentElement.classList.add("moveRight")
    document.getElementById("button" + position).style = "display: none"

    //set timout on this function for the animation time, give the cards a class that transitions them in the correct direction over the same amount of time
    this.setTimeout(() => {
        updateBoard();
    }, 325);
}

function moveSelectedCardRight(position) {

    console.log(position);
    
    if (position < 0 || position > 16) {
        return;
    }
    let selectedCard = currentHand[position];
    let movedCard = currentHand[position + 1];

    currentHand[position] = movedCard;
    currentHand[position + 1] = selectedCard;

    highlightedCard = position + 1;
    document.getElementById(position).parentElement.classList.add("moveRight")
    document.getElementById(position + 1).parentElement.classList.add("moveLeft")
    document.getElementById("button" + position).style = "display: none"

    //set timout on this function for the animation time, give the cards a class that transitions them in the correct direction over the same amount of time
    this.setTimeout(() => {
        updateBoard();
    }, 325);
}

function rotateCard(position) {
    currentHand[position][1] = !currentHand[position][1];
    document.getElementById(position).classList.toggle("rotated")
    document.getElementById("0." + position).classList.toggle("rotated");
    //updateBoard();
}

function flipCard(position) {

        currentHand[position][2] = !currentHand[position][2];


    updateBoard();
}

// =========================================
// HELPERS: card type, shuffle, validation
// =========================================
function getCardType(card) {
  if (heroNames.includes(card)) return "hero";
  if (itemNames.includes(card)) return "item";
  if (landNames.includes(card)) return "land";
  if (trapNames.includes(card)) return "trap";
  if (heartNames.includes(card)) return "heart";
  return null;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getDeckDisplayCountersHTML() {
    let htmlString = "";
    let heroCount = 0;
    let heartCount = 0;
    let itemCount = 0;
    let trapCount = 0;
    let landCount = 0;

    currentDeck.forEach(card => {
        switch(getCardType(card)) {
            case "hero":
                heroCount++;
                break;
            case "heart":
                heartCount++;
                break;
            case "item":
                itemCount++;
                break;
            case "trap":
                trapCount++;
                break;
            case "land":
                landCount++;
                break;
            default:
                break;
        }

    })

    let heroValid = " ";
    let heartValid = "";
    let itemValid = "";
    let trapValid = "";
    let landValid = "";

    if (heroCount == 1) {
        heroValid = " validated";
    }
        if (heartCount == 1) {
        heartValid = " validated";
    }
        if (itemCount == 3) {
        itemValid = " validated";
    }
        if (trapCount == 2) {
        trapValid = " validated";
    }
        if (landCount == 2) {
        landValid = " validated";
    }

    htmlString += '<div id="cardCounter">'
    htmlString += '<div class="' + heroValid + '">Hero</div><div class="counter' + heroValid + '">' + heroCount + '/1</div>'
    htmlString += '<div class="' + heartValid + '">Heart</div><div class="counter' + heartValid + '">' + heartCount + '/1</div>'
    htmlString += '<div class="' + itemValid + '">Items</div><div class="counter' + itemValid + '">' + itemCount + '/3</div>'
    htmlString += '<div class="' + trapValid + '">Traps</div><div class="counter' + trapValid + '">' + trapCount + '/2</div>'
    htmlString += '<div class="' + landValid + '">Lands</div><div class="counter' + landValid + '">' + landCount + '/2</div>'
    htmlString += '</div>';
    return htmlString;
}

function updateDeckDisplay() {

    let displayCounter = getDeckDisplayCountersHTML()

    const currentDeckDisplay = this.document.getElementById("currentDeckDisplay");
    let curDeckShowHide = "Hide"
    if (document.getElementById("deckDisplayButton").innerHTML == "Show"){
        curDeckShowHide = "Show"
    }
    currentDeckDisplay.innerHTML = '<div id="counterHelper"><button id="deckDisplayButton" onclick="hideCurrentDeckDisplay()">' + curDeckShowHide + '</button>' + displayCounter + "</div>";

    if (currentDeck.length == 0) {
        return;
    }

    let heroes = [];
    let hearts = [];
    let items = [];
    let traps = [];
    let lands = [];

    currentDeck.forEach(card => {
        if (heroNames.includes(card)) {
            heroes.push(card);
        }
        else if (heartNames.includes(card)) {
            hearts.push(card);
        }
        else if (itemNames.includes(card)) {
            items.push(card);
        }
        else if (trapNames.includes(card)) {
            traps.push(card);
        }
        else if (landNames.includes(card)) {
            lands.push(card);
        }
    });

    currentDeck = heroes.concat(hearts, items, traps, lands);
    currentDeck.forEach(card => {
        let updatedHTML = '<img src="./Pictures/fronts/'+ card + '.png" alt="" onclick="removeCard(\'' + card + '\')">'
        if (heroNames.includes(card)) {
            updatedHTML += '<img src="./Pictures/backs/' + card + '.png" alt="" onclick="removeCard(\'' + card + '\')">'
        }
        currentDeckDisplay.innerHTML += updatedHTML;
    });
}

function hideCurrentDeckDisplay() {
    const deckDisplay = document.getElementById("currentDeckDisplay");
    const deckDisplayButton = document.getElementById("deckDisplayButton");
    deckDisplay.classList.toggle("minimized");
    if (deckDisplay.classList.contains("minimized")) {
        deckDisplayButton.innerHTML = "Show"
    }
    else {
        deckDisplayButton.innerHTML = "Hide"
    }

}

function showCurrentDeck(show) {
    const deckDisplay = document.getElementById("currentDeckDisplay");
    const deckDisplayButton = document.getElementById("deckDisplayButton");

    if (deckDisplay.classList.contains("minimized") && show) {
            deckDisplay.classList.toggle("minimized");
    }
    else if (!deckDisplay.classList.contains("minimized") && !show) {
        deckDisplay.classList.toggle("minimized");
    }
    if (show) {
        deckDisplayButton.innerHTML = "Hide";
        deckDisplay.classList.add("show")
    }
    else {
        deckDisplayButton.innerHTML = "Show";
    }
}

function checkDeckValidity() {
    if (checkDeckList() == true) {
        document.getElementById("saveButton").style = 'display: none;';
        document.getElementById("saveStack").style = 'display: "";';
    }
    else {
        document.getElementById("saveButton").style = 'display: "";';
        document.getElementById("saveStack").style = 'display: none;';
    }
}

function checkDeckList(ignoreDuplicates = false) {
    
    let sortedArray1 = []
    let sortedArray2 = []

    if (currentDeck.length != 9) {
        return false;
    }
    if (deckLists.length == 0) {
        return true;
    }
    let counter = 0;

    let heroCards = 0;
    let heartCards = 0;
    let itemCards = 0;
    let trapCards = 0;
    let landCards = 0;

    currentDeck.forEach(card => {
        switch (getCardType(card)) {
            case "hero":
            heroCards++;
            break;
            case "heart":
            heartCards++;
            break;
            case "item":
            itemCards++;
            break;
            case "trap":
            trapCards++;
            break;
            case "land":
            landCards++;
            break;                                
        }
    })
    
    if (heroCards != 1 || heartCards != 1 || itemCards != 3 || trapCards != 2 || landCards != 2) {
        return false;
    }

    // if (heroCards == 1) {
    //     document.getElementById("heroTitle").classList.add("validated");
    // }

    deckLists.forEach(deckList => {

        sortedArray1 = deckList.sort()
        sortedArray2 = currentDeck.sort()
        for (let i = 0; i < sortedArray1.length; i++) {
            if (sortedArray1[i] == sortedArray2[i]) {
                counter++;
            }
            else {
                if (counter == 9) {
                    return ignoreDuplicates;
                }
                counter = 0;
            }
        }
    })

    return true;
}

function getRank(cardName) {
    // Look through our priority arrays
    for (let i = 0; i < priorityOrder.length; i++) {
        // If the card is inside this array, return the index (0, 1, 2, etc.)
        if (priorityOrder[i].includes(cardName)) {
            return i;
        }
    }
    // If not found in any list, give it a high number to put it at the very bottom
    return 99; 
}

function updateCardTypeGreyOut() {
    // Count cards by type
    let heroCount = 0;
    let heartCount = 0;
    let itemCount = 0;
    let trapCount = 0;
    let landCount = 0;

    currentDeck.forEach(card => {
        switch(getCardType(card)) {
            case "hero":
                heroCount++;
                break;
            case "heart":
                heartCount++;
                break;
            case "item":
                itemCount++;
                break;
            case "trap":
                trapCount++;
                break;
            case "land":
                landCount++;
                break;
        }
    });

    // Maximum desired counts
    const maxCounts = {
        hero: 1,
        heart: 1,
        item: 3,
        trap: 2,
        land: 2
    };

    // Map card types to their display element IDs
    const typeToDisplay = {
        hero: "heroDisplay",
        heart: "heartDisplay",
        item: "itemDisplay",
        trap: "trapDisplay",
        land: "landDisplay"
    };

    // Update grey out state for each type
    const types = [
        { type: "hero", count: heroCount },
        { type: "heart", count: heartCount },
        { type: "item", count: itemCount },
        { type: "trap", count: trapCount },
        { type: "land", count: landCount }
    ];

    types.forEach(({ type, count }) => {
        const displayElement = document.getElementById(typeToDisplay[type]);
        if (displayElement) {
            if (count >= maxCounts[type]) {
                displayElement.classList.add("greyedOut");
            } else {
                displayElement.classList.remove("greyedOut");
            }
        }
    });
}

// =========================================
// SAVED STACKS: storage + sidebar UI
// =========================================
let editing = false;

function writeToStorage() {
    localStorage.setItem("DeckLists", JSON.stringify(deckLists));
}

function readFromStorage() {
    let myJson = localStorage.getItem("DeckLists");
    console.log(myJson);
    if (!myJson || myJson === "undefined") {
        deckLists = [];
    } else {
        deckLists = JSON.parse(myJson);
    }
}

function renderSavedStacksSidebar() {
    const deckDisplayHTML = document.getElementById("loadedCardDisplay");
    console.log("here!")
    console.log(deckLists);
    if (deckLists.length == 0) {
        deckDisplayHTML.style = "display: none;"
        return;
    }
    else {
        deckDisplayHTML.style = 'display: ""'
    }
    
    // Handle the "v Saved Stacks v" Title visibility
    let hiddenClass = "";
    if (!deckDisplayHTML.classList.contains("hidden")) {
        hiddenClass = "hidden";
    }

    let finalHTML = '<div id="loadedDeckTitle" class="' + hiddenClass + '" onclick="minimizeLoadedStacks()">v Saved Stacks v</div>';
    finalHTML += '<div id="loadedCardWrapper">';

    // Build the list of decks
    deckLists.forEach((deckList, index) => {
        // Sort for display
        deckList.sort((a, b) => {
            return getRank(a) - getRank(b);
        });

        // Add the buttons, pointing to the MAIN functions
        finalHTML += `
            <div id="loadedDeck${index}"></div>
            <button onclick="editDeck(${index})">Edit</button>
            <button onclick="deleteDeck(${index})">Delete</button>
        `;
    });

    finalHTML += '</div>';
    deckDisplayHTML.innerHTML = finalHTML;

    // Inject Images and add Click Listeners
    deckLists.forEach((deckList, index) => {
        const imageHTML = document.getElementById("loadedDeck" + index);
        let imagesString = ""; 
        
        deckList.forEach(card => {
            imagesString += '<img class="loadedCard" src="./Pictures/fronts/' + card + '.png" alt="">';
            if (heroNames.includes(card)) {
                imagesString += '<img class="loadedCard" src="./Pictures/backs/' + card + '.png" alt="">';
            }
        });
        
        imageHTML.innerHTML = imagesString;
        imageHTML.addEventListener('click', () => {
            selectDeck("loadedDeck" + index);
        });
    });

    // Finalize Title Toggle
    if (deckLists.length > 0) {
        const titleEl = document.getElementById("loadedDeckTitle");
        if(titleEl) titleEl.classList.toggle(hiddenClass); 
    }
}

function minimizeLoadedStacks() {
    const loadedDeckTitle = document.getElementById("loadedDeckTitle");
    const loadedStackDisplay = document.getElementById("loadedCardDisplay")
    loadedStackDisplay.classList.toggle("minimized");
    if (loadedStackDisplay.classList.contains("minimized")) {
        loadedDeckTitle.innerHTML = "- Saved Stacks -";
    }
    else {
        loadedDeckTitle.innerHTML = "v Saved Stacks v";
    }
}

function loadDeckLists() {
    readFromStorage();          
    renderSavedStacksSidebar(); 
}

function editDeck(deckNumber) {
    // 1. Check if the current workspace is occupied
    if (currentDeck.length != 0) {
        // Ask ONCE. If they click Cancel/No, we stop immediately.
        if (!confirm("WARNING - This will delete the stack you are currently building. Would you like to proceed?")) {
            return;
        }
    }
    
    // 2. Prepare the UI/Variables
    // (Assuming createNewDeck clears the board, we do this after the confirm)
    createNewDeck(); 

    // 3. Capture the deck you want to edit BEFORE deleting it from the list
    // We create a reference to it so we don't lose it when we splice the array
    let deckToLoad = deckLists[deckNumber];

    // 4. Delete the deck from the saved list
    // We pass 'false' for save (per your original code) and 'true' to SKIP confirmations
    deleteDeck(deckNumber, false, true); 

    // 5. Set the current deck to the one we just pulled
    currentDeck = deckToLoad;

    selectedStacks = [];
    // 6. Update UI
    updateDeckDisplay();
    updateCardTypeGreyOut();
    showCurrentDeck(true);
    minimizeLoadedStacks();
    checkDeckValidity();
    validatePlayButton();
    
    // if (deckLists.length == 0) {
        document.getElementById("loadedCardDisplay").classList.add("minimized");
    // }
}

function deleteDeck(deckNumber, save = true, skipConfirm = false) {
    
    // Only ask for confirmation if skipConfirm is FALSE
    if (!skipConfirm) {
        if (currentDeck.length > 0) {
            if (!confirm("Editing this deck will delete the current stack, continue?")) return;
        } 
        if (!editing) {
            if (!confirm("Are you sure you want to delete this deck?")) return;
        }
    }

    console.log("Deleting Deck " + deckNumber);

    // 1. Modify Data
    deckLists.splice(deckNumber, 1);

    // 2. Save Data
    if (save) {
        writeToStorage();
    }

    // 3. Update UI
    renderSavedStacksSidebar();
    selectedStacks = [];
    validatePlayButton();
}

function clearBuilderInterface() {
    // Hide the builder area
    document.getElementById("mainCardDisplay").style = 'display: none;';
    
    // Hide the current deck lists
    showCurrentDeck(false);
    const curDeckDisp = document.getElementById("currentDeckDisplay");
    curDeckDisp.classList.remove("show");
    curDeckDisp.classList.remove("minimized");
    
    // Reset buttons
    document.getElementById("loadedCardDisplay").classList.remove("minimized");
    document.getElementById("saveButton").style = "display: none;";
    document.getElementById("saveStack").style = "display: none;";
    document.getElementById("buildButton").style = ""; 

    window.scrollTo({top: 0, left: 0, behavior: 'instant'})
    
    // NOTE: We do NOT clear currentDeck = [] here anymore. 
    // We let the save function decide if the data should be wiped.
}

function saveDeckLists(save = true) {
    if (save) {
        // 1. Check if Valid and Unique
        if (checkDeckList() === true) {
            console.log("Deck Valid. Saving...");
            deckLists.push(currentDeck);
            writeToStorage();
            renderSavedStacksSidebar();
            
            // Success! We can wipe the board now.
            currentDeck = []; 
        } 
        // 2. Check if Valid but Duplicate
        else if (checkDeckList(true) === true) {
            console.log("Duplicate deck. Not saving, but clearing board.");
            // We treat this as "done", so we wipe the board.
            currentDeck = []; 
        }
        // 3. Invalid (Wrong number of cards, etc.)
        else {
            console.log("Deck Invalid. Hiding screen, but keeping current draft.");
            // We do NOT wipe currentDeck, so the user can fix it later.
        }
    }

    // 4. ALWAYS hide the interface, regardless of what happened above
    clearBuilderInterface();
}

// =========================================
// SCROLL: board carousel controls
// =========================================
function scrollBoardToPosition(position) {
    // not done yet; planned for jumping to a specific stack position
    if (position && position >= 0 && position <=100) {

        let boardWidth = gameBoard.scrollWidth;
        let screenWidth = gameScreen.clientWidth;
        let maxRight = screenWidth - boardWidth;

        let moveTo = (maxRight / 100) * position;
        if (currentX < maxRight) currentX = maxRight;
        else currentX = moveTo;

        gameBoard.style.transform = `translateX(${moveTo}px)`;
        miniMapBox.style.transform = `translateX(${moveTo / -3.03}px)`;
    }
}

let animationFrameId = null; // Replaces scrollInterval
let currentX = 0;
let lastTime = 0; // Tracks the timestamp of the previous frame

// We keep your speed of 10, but treat it as "10px per 60hz frame"
let scrollSpeed = 0; 
let scrollBase = 25;

const gameBoard = document.getElementById("gameBoard");
const gameScreen = document.getElementById("gameScreen");
const miniMapBox = document.getElementById("miniMapBox");

function startScroll(direction, isScroll = false) {
    // If already scrolling, don't start a new loop
    if (animationFrameId) return;

    // Initialize the time tracker to 'now' so the first frame doesn't jump
    lastTime = performance.now();

    function animate(timestamp) {
        // 1. Calculate Delta Time (time passed since last frame in ms)
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // 2. Calculate smooth movement
        // We normalize to 60FPS (16.67ms). 
        // If the screen is 144hz, deltaTime is lower, so movement is smaller.
        if (isScroll) {
            scrollSpeed = scrollBase * 2;
        }
        else {
            scrollSpeed = scrollBase;
        }
        const timeScale = deltaTime / 16.67; 
        const moveAmount = (direction * scrollSpeed) * timeScale;

        // 3. Update Position
        const boardWidth = gameBoard.scrollWidth;
        const screenWidth = gameScreen.clientWidth;

        currentX += moveAmount;

        // Clamp scrolling
        const maxLeft = 0;
        const maxRight = screenWidth - boardWidth;

        if (currentX > maxLeft) currentX = maxLeft;
        if (currentX < maxRight) currentX = maxRight;

        gameBoard.style.transform = `translateX(${currentX}px)`;
        miniMapBox.style.transform = `translateX(${currentX / -3.03}px)`;

        // 4. Request the next frame
        animationFrameId = requestAnimationFrame(animate);
    }

    // Start the loop
    animationFrameId = requestAnimationFrame(animate);
}

// You will likely need a function to stop the animation as well
function stopScroll() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function increaseScrollSpeed(yes) {
    if (yes) {
        scrollBase += 3
    }
    else {
        scrollBase -= 3
    }
}
// Hover-based controls for the carousel arrows.
document.getElementById("leftArrowContainer")
    .addEventListener("mouseenter", () => startScroll(1));

document.getElementById("rightArrowContainer")
    .addEventListener("mouseenter", () => startScroll(-1));

document.getElementById("leftArrowContainer")
    .addEventListener("mouseleave", stopScroll);

document.getElementById("rightArrowContainer")
    .addEventListener("mouseleave", stopScroll);
