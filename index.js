// #region Variable Declarations
//setting up database
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

// not sure this is used
let allCards = [];

// All saved decklists
let deckLists= [];

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

// #endregion


// Wait for the entire page to load
  window.addEventListener('load', function() {

    this.deckLists = heroNames.concat(heartNames, itemNames, trapNames, landNames);

    this.deckLists.forEach(card => {
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

    // loadDeckLists();
    //Remove "hidden" attribute from main page
    fetchSavedStacks(); //HERE
    showPage();

  });


function createNewDeck() {
    currentDeck = [];
    document.getElementById("mainCardDisplay").style = 'display: "";'
    const curDeckDisplay = document.getElementById("currentDeckDisplay");
    curDeckDisplay.getBoundingClientRect();
    curDeckDisplay.classList.add("show");
    updateDeckDisplay();
}

function addCard(name) {
    currentDeck.push(name);
    updateDeckDisplay();
}

function removeCard(name) {
    console.log("Removing " + name)
    let index = currentDeck.indexOf(name);
    if (index > -1) {
        currentDeck.splice(index, 1);
    }
    updateDeckDisplay();
}

function selectDeck(deckID) {
    if (selectedStacks.includes(deckID)) {
        selectedStacks.splice(selectedStacks.indexOf(deckID),1);
        document.getElementById(deckID).classList.toggle("selected")
    }
    else if (selectedStacks.length < 2) {
        selectedStacks.push(deckID)
        document.getElementById(deckID).classList.toggle("selected")
    }
}

function launchGame() {
    //select 2 stacks - make stacks selectable
    if (selectedStacks.length != 2) {
        alert("You must have 2 stacks selected!");
        return;
    }
    
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

    //later create a class for selected and have a search for if something has the classlist class "selected", then add arrows to move, flip, and rotate
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


        //EVERYTHING IS FLIPPED FOR SOME REASON!
        console.log(card[2]);
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
        curHighlight.classList.remove("highlight");
        document.getElementById("button"+highlightedCard).style = 'display: none;'
    }
    if (position >= 0) {
        const newHighlight = document.getElementById(position);
        newHighlight.classList.add("highlight");
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
    curHighlight.classList.remove("highlight");
    document.getElementById("button"+highlightedCard).style = 'display: none;'
    highlightedCard = -1;
}

function moveSelectedCardLeft(position) {

    if (position == 0) {
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
    
    if (position == 17) {
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

    htmlString += '<div id="cardCounter">'
    htmlString += '<div>Hero</div><div class="counter">' + heroCount + '/1</div>'
    htmlString += '<div>Heart</div><div class="counter">' + heartCount + '/1</div>'
    htmlString += '<div>Items</div><div class="counter">' + itemCount + '/3</div>'
    htmlString += '<div>Traps</div><div class="counter">' + trapCount + '/2</div>'
    htmlString += '<div>Lands</div><div class="counter">' + landCount + '/2</div>'
    htmlString += '</div>';
    return htmlString;
}

function updateDeckDisplay() {

    let displayCounter = getDeckDisplayCountersHTML()

    this.document.getElementById("currentDeckDisplay").innerHTML = '<div id="counterHelper"><button id="deckDisplayButton" onclick="hideCurrentDeckDisplay()">Hide</button>' + displayCounter + "</div>";

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
        this.document.getElementById("currentDeckDisplay").innerHTML = this.document.getElementById("currentDeckDisplay").innerHTML + updatedHTML
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

function saveDeckLists(save) {
    if (save == null) {
        save == true;
    }
    if (checkDeckList() == true && save) {
        deckLists.push(currentDeck);
    }
    localStorage.setItem("DeckLists", JSON.stringify(deckLists));
    if (save) {
        currentDeck = [];
        document.getElementById("mainCardDisplay").style = 'display: none;'
        updateDeckDisplay();
        loadDeckLists();
    }
    showCurrentDeck(false);
    document.getElementById("currentDeckDisplay").classList.remove("show");
    document.getElementById("currentDeckDisplay").classList.remove("minimized");
    document.getElementById("loadedCardDisplay").classList.remove("minimized");
}

function checkDeckList() {
    
    let sortedArray1 = []
    let sortedArray2 = []

    if (currentDeck.length != 9) {
        return false;
    }
        if (deckLists.length == 0) {
            return true;
        }
        let counter = 0;
        deckLists.forEach(deckList => {
            sortedArray1 = deckList.sort()
            sortedArray2 = currentDeck.sort()
            for (let i = 0; i < sortedArray1.length; i++) {
                if (sortedArray1[i] == sortedArray2[i]) {
                    counter++;
                }
                else {
                    if (counter == 9) {
                        return false
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

function fetchSavedStacks() {
    let myJson = localStorage.getItem("DeckLists");
    if (myJson == "undefined")
    {
        console.log("No saved decks found");
        return;
    }
    deckLists = JSON.parse(myJson) || [];
}

function minimizeLoadedStacks() {
    const loadedDeckTitle = document.getElementById("loadedDeckTitle");
    const loadedStackDisplay = document.getElementById("loadedCardDisplay")
    loadedStackDisplay.classList.toggle("minimized");
    if (loadedStackDisplay.classList.contains("minimized")) {
        loadedDeckTitle.innerHTML = "- Current Stacks -";
    }
    else {
        loadedDeckTitle.innerHTML = "v Current Stacks v";
    }
    //WORKING ON THIS SO YOU CAN MINIMIZE THE CURRENT STACKS SECTION
}

//Gemini Solution
function loadDeckLists() {
    fetchSavedStacks();

    const deckDisplayHTML = document.getElementById("loadedCardDisplay");

    // 1. Handle the "Hidden" logic for the Title
    let hiddenClass = "";
    if (!deckDisplayHTML.classList.contains("hidden")) {
        hiddenClass = "hidden";
    }
    
    // 2. Start building the HTML String
    // We add the Title first
    let finalHTML = '<div id="loadedDeckTitle" class="' + hiddenClass + '" onclick="minimizeLoadedStacks()">v Current Stacks v</div>';
    
    // 3. Open the Wrapper Div (This prevents the animation bugs)
    finalHTML += '<div id="loadedCardWrapper">';

    // 4. Build the Decks and Buttons Structure
    if (deckLists.length > 0) {
        // Note: toggling class on an element that doesn't exist yet (loadedDeckTitle) 
        // via getElementById here would fail, so we handle visibility via CSS classes later if needed.
    }

    // We use 'map' or 'forEach' to build the string structure first
    deckLists.forEach((deckList, index) => {
        // Sort the deck
        deckList.sort((a, b) => {
            return getRank(a) - getRank(b);
        });

        // Append the Deck DIV and the Buttons to our string
        finalHTML += `
            <div id="loadedDeck${index}"></div>
            <button onclick="editDeck(${index})">Edit</button>
            <button onclick="deleteDeck(${index}, true)">Delete</button>
        `;
    });

    // 5. Close the Wrapper Div
    finalHTML += '</div>';

    // 6. INJECT into the DOM (This creates the elements)
    deckDisplayHTML.innerHTML = finalHTML;

    // 7. Populate Images (Now that the elements actually exist)
    deckLists.forEach((deckList, index) => {
        const imageHTML = document.getElementById("loadedDeck" + index);
        
        let imagesString = ""; // Build image string efficiently
        deckList.forEach(card => {
            imagesString += '<img class="loadedCard" src="./Pictures/fronts/' + card + '.png" alt="">';
            if (heroNames.includes(card)) {
                imagesString += '<img class="loadedCard" src="./Pictures/backs/' + card + '.png" alt="">';
            }
        });
        
        imageHTML.innerHTML = imagesString;
        
        // Add the click listener
        imageHTML.addEventListener('click', () => {
            selectDeck("loadedDeck" + index);
        });
    });

    // 8. Handle Title Visibility Toggle Logic (Post-Injection)
    if (deckLists.length > 0) {
        // Now we can safely find the title and toggle if needed
        const titleEl = document.getElementById("loadedDeckTitle");
        if(titleEl) titleEl.classList.toggle(hiddenClass); 
    }
}

function loadDeckLists2() {

    fetchSavedStacks()

    const deckDisplayHTML = document.getElementById("loadedCardDisplay");

    // if (!deckDisplayHTML.classList.contains("hidden")) {
    //     deckDisplayHTML.classList.toggle("hidden");
    //     return;
    // }

    let hidden = "";

    if (!deckDisplayHTML.classList.contains("hidden")) {
        hidden="hidden";
    }

    deckDisplayHTML.innerHTML = '<div id="loadedDeckTitle" class="' + hidden + '" onclick="minimizeLoadedStacks()">v Current Stacks v</div>';
    let deckCount = -1;

    if (deckLists.length > 0) {
        document.getElementById("loadedDeckTitle").classList.toggle(hidden);
    }
    deckLists.forEach(deckList => {
        deckList.sort((a,b) => {
            return getRank(a) - getRank(b);
        })
        deckCount++;
        deckDisplayHTML.innerHTML = deckDisplayHTML.innerHTML + '<div id="loadedDeck' + deckCount + '"></div><button onclick="editDeck(' + deckCount + ')">Edit</button><button onclick="deleteDeck(' + deckCount + ',true)">Delete</button>'

        const imageHTML = document.getElementById("loadedDeck" + deckCount);

            deckList.forEach(card => {
            imageHTML.innerHTML = imageHTML.innerHTML + '<img class="loadedCard" src="./Pictures/fronts/' + card + '.png" alt="">'
            if (heroNames.includes(card)) {
                imageHTML.innerHTML = imageHTML.innerHTML + '<img class="loadedCard" src="./Pictures/backs/' + card + '.png" alt="">'
            }
            })
        })

        
        // deckDisplayHTML.innerHTML = '<div id="loadedStacksContainer">' + deckDisplayHTML.innerHTML + '</div>'

    for (let i = 0; i <= deckCount; i++) {
            document.getElementById("loadedDeck" + i).addEventListener('click',() => {
            selectDeck("loadedDeck" + i);
        })
    }
}

function editDeck(deckNumber) {
    createNewDeck();
    currentDeck = deckLists[deckNumber];
    deleteDeck(deckNumber, false);
    updateDeckDisplay();
    showCurrentDeck(true);
    minimizeLoadedStacks();
}

function deleteDeck(deckNumber, save) {
    if (save == null) {
        save = true;
    }

    let myDecks = deckLists
    myDecks.splice(deckNumber,1);
    deckLists = myDecks;
    saveDeckLists(save);
    loadDeckLists();
}

function showPage() {
    this.document.getElementById("wholePage").style = 'display: "";'
}

function scrollBoardToPosition(position) {
    //not done yet, button inside playmat div, planning to have this allow the startScroll function to instead just jump to a specific position
}

//chat gpt code being tested --------------------------------------------------------------------

let animationFrameId = null; // Replaces scrollInterval
let currentX = 0;
let lastTime = 0; // Tracks the timestamp of the previous frame

// We keep your speed of 10, but treat it as "10px per 60hz frame"
let scrollSpeed = 18; 

const gameBoard = document.getElementById("gameBoard");
const gameScreen = document.getElementById("gameScreen");
const miniMapBox = document.getElementById("miniMapBox");

function startScroll(direction) {
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








// let scrollInterval = null;
// let currentX = 0;
// let scrollSpeed = 10; // px per frame

// const gameBoard = document.getElementById("gameBoard");
// const gameScreen = document.getElementById("gameScreen");
// const miniMapBox = document.getElementById("miniMapBox");

// function startScroll(direction) {
//     if (scrollInterval) return;

//     scrollInterval = setInterval(() => {
//         const boardWidth = gameBoard.scrollWidth;
//         const screenWidth = gameScreen.clientWidth;

//         currentX += direction * scrollSpeed;

//         // Clamp scrolling
//         const maxLeft = 0;
//         const maxRight = screenWidth - boardWidth;

//         if (currentX > maxLeft) currentX = maxLeft;
//         if (currentX < maxRight) currentX = maxRight;

//         gameBoard.style.transform = `translateX(${currentX}px)`;
//         miniMapBox.style.transform = `translateX(${currentX / -3.03}px)`;
//     }, 16);
// }

function increaseScrollSpeed(yes) {
    if (yes) {
        scrollSpeed += 3
    }
    else {
        scrollSpeed -= 3
    }
}

// function stopScroll() {
//     clearInterval(scrollInterval);
//     scrollInterval = null;
// }

document.getElementById("leftArrowContainer")
    .addEventListener("mouseenter", () => startScroll(1));

document.getElementById("rightArrowContainer")
    .addEventListener("mouseenter", () => startScroll(-1));

document.getElementById("leftArrowContainer")
    .addEventListener("mouseleave", stopScroll);

document.getElementById("rightArrowContainer")
    .addEventListener("mouseleave", stopScroll);