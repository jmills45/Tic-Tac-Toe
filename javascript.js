

// ------------------gameBoard Control------------------

const gameBoard = (function() {

    // Generate Starting Board / Array
    const board = Array(9).fill("");

    // Retrieve current board state
    const getBoard = () => {
        return board;
    }

    // Update board at boardSpace with playerMarker
    const updateBoard = (boardSpace, playerMarker) => {
        let index = boardSpace.dataset.index;

        if (board[index] === "") {
            board[index] = playerMarker;

            // Return true if marker was successfully placed
            return true;

        } else {

            console.log("This Space is Already Taken")
            return false;
        }   
    }

    // Resets board to default position / empty
    const resetBoard = () =>  {
        const defaultBoard = Array(9).fill("");;
        board.splice(0,board.length, ...defaultBoard);
        console.log("Resetting Board");
    }

    // Render / draws the board
    const renderBoard = () => {
        const boardWrapper = document.querySelector(".boardWrapper");
        boardWrapper.addEventListener("click", onBoardClick);

        // Clear board before rending
        while (boardWrapper.firstChild) {
            boardWrapper.removeChild(boardWrapper.firstChild);
        }

        board.forEach((element, index) => {
            const boardSpace = document.createElement("div");
            boardSpace.dataset.index = index;
            boardSpace.classList.add("space");

            if (element === "X" || element === "O") {
                boardSpace.classList.add(element);
            }

            boardWrapper.appendChild(boardSpace);
        })         
    }

    // return functions / variables to be used
    return {getBoard, updateBoard, resetBoard, renderBoard};

})();

// ------------------Game Controller------------------

const gameController = (function() {
    const players = [];
    let computerOnly = false;
    let activePlayer;
    let gameOver = true;;

    const startGame = () => {

        // Initial Start of Game
        if (players.length >= 2 && gameOver === true) {
            console.log("Starting Game");
            toggleGameOver(); 
            UIController.updateResults("Start!");  
        }

        // Automatically start game if two bots detetced
        if (players.length >= 2){
            if (players[0].bot === true && players[1].bot === true) {
                console.log("Only Bots Detected - Starting Auto Play");
                computerOnly = true;
                roundController.playRound();
            }
        }
    }

    const getComputerOnly = () => {
        return computerOnly;
    }
    
    // Add a player to players array
    const addPlayer = (player) => {
        players.push(player);     
    }

    const getGameOver = () => {
        return gameOver;
    }

    const toggleGameOver = () => {
        gameOver = !gameOver;
    }

    // Adds a point to select player
    const updateScore = (player) => {

        players.forEach((element) => {

            if (element.playerName === player.playerName) {
                element.playerScore++;
            }
        })
    }

    // Retrieve the current score for each player
    const getScore = () => {

        let gamescore = [];

        players.forEach((player) => {
           const {playerName, playerScore} = player;
           gamescore.push({playerName, playerScore})
        })

        return gamescore;
    }

    // Toggles between the two players
    const toggleActivePlayer = () => {
    
        if (activePlayer === players[0]) {
            activePlayer = players[1]
        } else {
            activePlayer = players[0];
        }
    }

    // Retrieves which player is currently active
    const getActivePlayer = () => {

        if (typeof activePlayer === "undefined"){
            activePlayer = players[0];
        }
        
        return activePlayer;
    }

    // Return functions / variables to be used
    return {addPlayer, getGameOver, toggleGameOver, updateScore, getScore, toggleActivePlayer, getActivePlayer, startGame, getComputerOnly};

}());

// ------------------Manages Player / AI Rounds------------------

const roundController = (function() {

    const playRound = (divClicked) => {
        // Get GameOver status and activePlayer
        let isGameOver = gameController.getGameOver();
        let player = gameController.getActivePlayer();
        
        // Human Player Code Block - check if bot and gameOver status
        if (player.bot === false && isGameOver === false) {

            let playerMove = divClicked.target;
            let playerMarker = player.playerMarker;
            
            // Updates board - returns true if successful - continues code block
            if (gameBoard.updateBoard(playerMove, playerMarker)){
                gameBoard.renderBoard();

                // Check board state for win - if return true - continue code block
                if (checkForWinner(gameBoard.getBoard())) {
                
                    // Update Player Scores
                    gameController.updateScore(player);
                    let newScores = gameController.getScore();
                    UIController.updateScore(newScores);
                    
                    // Update Round Result Message
                    let resultMessage = `${player.playerName} is the Winner!`
                    UIController.updateResults(resultMessage);
    
                    // Toggle gameOver and activePlayer
                    gameController.toggleGameOver();
                    gameController.toggleActivePlayer();
                    isGameOver = gameController.getGameOver();

                    // Toggle gameOverDisplay and reset board after small delay
                    setTimeout(() => {
                        UIController.toggleGameOverDisplay();
                        gameBoard.resetBoard();
                        gameBoard.renderBoard();
                    },2000)
                }

                // Check board state for draw - will not run if board was in a win state
                if(checkForDraw(gameBoard.getBoard())){
                    console.log("Its a Draw");

                    // Update Round Result Message
                    let resultMessage = "Its a Draw";
                    UIController.updateResults(resultMessage);
                    
                    // Toggle gameOver and activePlayer
                    gameController.toggleActivePlayer();
                    gameController.toggleGameOver();
                    isGameOver = gameController.getGameOver();

                    // Toggle gameOverDisplay and reset board after small delay
                    setTimeout(() => {
                        UIController.toggleGameOverDisplay();
                        gameBoard.resetBoard();
                        gameBoard.renderBoard();
                    },2000)
                };
    
                gameController.toggleActivePlayer();
                player = gameController.getActivePlayer();
            }; 
            
            if(isGameOver === false) {
                UIController.updateResults(`${player.playerName}'s Turn`)
            }
        } 
        
        // Computer Player Code Block - check if bot and gameOver status
        if (player.bot === true && isGameOver === false) {

            let currentBoardState = gameBoard.getBoard();
            let computerMove = computerAI.takeTurn(currentBoardState);
            let computerMarker = player.playerMarker;

            // Updates board - returns true if successful - continues code block
            if (gameBoard.updateBoard(computerMove, computerMarker)) {

                //Small delay so computer doesn't place marker instantly
                setTimeout(() => {
                    gameBoard.renderBoard();

                    // Check board state for win - if return true - continue code block
                    if (checkForWinner(gameBoard.getBoard())) {

                        // Update Player Scores
                        gameController.updateScore(player);
                        let newScores = gameController.getScore();
                        UIController.updateScore(newScores);
                        
                        // Update Round Result Message
                        let resultMessage = `${player.playerName} is the Winner!`
                        UIController.updateResults(resultMessage);
        
                        // Toggle gameOver
                        gameController.toggleGameOver();
                        isGameOver = gameController.getGameOver();

                        // Toggle gameOverDisplay and reset board after small delay
                        setTimeout(() => {
                            UIController.toggleGameOverDisplay();
                            gameBoard.resetBoard();
                            gameBoard.renderBoard();
                        },2000)
                    }

                    if(checkForDraw(gameBoard.getBoard())){
                        console.log("Its a Draw");
    
                        // Update Round Result Message
                        let resultMessage = "Its a Draw";
                        UIController.updateResults(resultMessage);
        
                        // Toggle gameOver
                        gameController.toggleGameOver();
                        isGameOver = gameController.getGameOver();
                        
                        // Small Delay to prevent results from being cleared early
                        setTimeout(() => {
                            UIController.toggleGameOverDisplay();
                            gameBoard.resetBoard();
                            gameBoard.renderBoard();
                        },2000)
                    };

                    gameController.toggleActivePlayer();
                    player = gameController.getActivePlayer();

                    if (gameController.getComputerOnly() === true && isGameOver === false) {
                        playRound();
                    }
                }, 1000)
            }

            if(isGameOver === false) {
                UIController.updateResults(`${player.playerName}'s Turn`)
            }
        }     
    }

    // Checks if the board is in a winner state
    const checkForWinner = (board) => {

        let isGameOver = gameController.getGameOver();

        // check if game is over
        if (isGameOver === false) {

            console.log("Checking For Win");

            let activePlayer = gameController.getActivePlayer();
            let currentBoard = board; 
            let playerBoard = [];
            let winner = false;

            // Create an array of indexes based on player markers
            currentBoard.forEach((element, index) => {
                if (element === activePlayer.playerMarker) {
                    playerBoard.push(index);
                };
            })

            // All possible winning board combinations
            const winningCombos = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ]
            
            // Only check for winner if at least 3 pieces have been placed
            if (playerBoard.length >= winningCombos[0].length) {
                winningCombos.forEach((combo) => {

                    let possibleCombo = []
        
                    playerBoard.filter((element) => {
                        if(combo.toString().includes(element.toString())){
                            possibleCombo.push(element);
                        }
                    })
        
                    if (possibleCombo.toString() === combo.toString()){
                        console.log(`${activePlayer.playerName} Wins!`);

                        winner = true;                 
                    }
                })
            }

            // Return true if a winning combination is found
            return winner;
        }
    }

    // Check if the board is in a draw state
    const checkForDraw = (board) => {

        let isGameOver = gameController.getGameOver();
        let draw = false;

        // Check if game is over
        if(isGameOver === false) {

            console.log("Check for Draw");

            // Get current board with all markers from both players
            let currentBoard = board.filter((element) => {
                if (element === "X" || element === "O"){
                return element;
                }
            })  

            // If all spots on the board are filled = draw (Runs after winner check)
            if (currentBoard.length === board.length) {
                draw = true;
            }
        } 
        return draw;
    }

    return {playRound};
    
})();

// ------------------Computer AI------------------

const computerAI = (function() {

    let difficulty = "easy";

    // Generate random move for computer based on empty spaces on board
    const takeTurn = (board) => {
        let currentBoard = board;
        let possibleMoves = [];
        let move;
        let selectedSpace;

        // Find empty spaces on board
        currentBoard.forEach((element, index) => {
            if (element != "X" && element != "O") {
                possibleMoves.push(index);
            }
        })

        // Randomly choose one of the available empty spaces
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        selectedSpace = document.querySelector(`[data-index="${move}"]`);
        
        return selectedSpace;
    }

    const setDifficulty = (level) => {
        difficulty = level;
    }

    return {takeTurn, setDifficulty}
}())

//------------------Display / UI Controller------------------

const UIController = (function() {

    // Player Names and Markers

    let player1 = "Player 1";
    let player2 = "Player 2";

    let player1Marker = "X";
    let player2Marker = "O";

    let player1Bot = "Bot 1";
    let player2Bot = "Bot 2";

    // Game Over Display Boolean
    let gameOverDisplay = false;

    // ------Button and Text Elements------

    // Who will win / Play Again / Player Won
    const resultMessage = document.querySelector(".result > p");

    // Player Score Displays
    const player1Score = document.querySelector(".player1 > .score > p");
    const player2Score = document.querySelector(".player2 > .score > p");

    // Displays Player name after score
    const player1ButtonResult = document.querySelector(".player1 > .selection > .postSelection")
    const player2ButtonResult = document.querySelector(".player2 > .selection > .postSelection")

    // Player 1 Button
    const player1Button = document.querySelector(".player1 > .selection > .playerButton");
    player1Button.addEventListener("click", addPlayer);

    // Player 2 Button
    const player2Button = document.querySelector(".player2 > .selection > .playerButton");
    player2Button.addEventListener("click", addPlayer);

    // Bot 1 Button
    const player1BotButton = document.querySelector(".player1 > .selection > .botButton");
    player1BotButton.addEventListener("click", addPlayer);

    // Bot 2 Button
    const player2BotButton = document.querySelector(".player2 > .selection > .botButton");
    player2BotButton.addEventListener("click", addPlayer);

    // Add Player onClick Function
    function addPlayer(button) {

        let player = button.target.innerHTML;
    
        // Checks if the button pressed resides in the player 1 div / section
        if (button.target.closest(".player1")) {

            // Checks if the button pressed was either Player 1 or Bot

            if (player === "Player 1") {
                gameController.addPlayer(createPlayer(player1, player1Marker, false))
                player1ButtonResult.classList.remove("hidden");
                player1ButtonResult.innerHTML = player1;
            };
    
            if (player === "Bot") {
                gameController.addPlayer(createPlayer(player1Bot, player1Marker, true))
                player1ButtonResult.classList.remove("hidden");
                player1ButtonResult.innerHTML = player1Bot;
            }
    
            // Hides buttons after selection
            player1Button.classList.add("hidden");
            player1BotButton.classList.add("hidden");
        }

        // Checks if the button pressed resides in the player 2 div / section
        if (button.target.closest(".player2")) {

            // Checks if the button pressed was either Player 2 or Bot

            if (player === "Player 2") {
                gameController.addPlayer(createPlayer(player2, player2Marker, false))
                player2ButtonResult.classList.remove("hidden");
                player2ButtonResult.innerHTML = player2;
            };
    
            if (player === "Bot") {
                gameController.addPlayer(createPlayer(player2Bot, player2Marker, true));
                player2ButtonResult.classList.remove("hidden");
                player2ButtonResult.innerHTML = player2Bot;
            }
    
            // Hides buttons after selection
            player2Button.classList.add("hidden");
            player2BotButton.classList.add("hidden");
        };

        gameController.startGame();

    }

    // Game Over Display - triggers when one player wins a round
    const toggleGameOverDisplay = () => {

        // Game Board Element
        const gameBoard = document.querySelector(".boardWrapper");

        // Play Again Screen element
        const playAgainScreen = document.querySelector(".playAgain");

        // Play Again Button
        const playAgainButton = document.querySelector(".playAgainButton");
        playAgainButton.addEventListener("click", toggleGameOverDisplay);

        if (gameOverDisplay === false) {

            // Display Play Again Screen & hide Gameboard
            playAgainScreen.classList.remove("hidden");
            gameBoard.classList.add("hidden");

            updateResults("Play Again?");

            gameOverDisplay = true;

        } else {

            // Display Gameboard and hide Play Again Screen
            playAgainScreen.classList.add("hidden");
            gameBoard.classList.remove("hidden");

            updateResults("Start!");

            gameOverDisplay = false;
            gameController.toggleGameOver();
            gameController.startGame();
        }
    }
    
    const updateScore = (scores) => {
        
        player1Score.innerHTML = scores[0].playerScore;
        player2Score.innerHTML = scores[1].playerScore;
    }

    const updateResults = (result) => {
        resultMessage.innerHTML = result;
    }

    return {updateScore, updateResults, toggleGameOverDisplay}

})();


// ------------------Player Factory Function------------------

function createPlayer(name, marker, isBot){

    const playerName = name;
    const playerMarker = marker;
    const bot = isBot;
    let playerScore = 0;

    return {playerName, playerMarker,bot, playerScore};
}

// ------------------OnClick Fucntion------------------

function onBoardClick(event) {

    let isGameOver = gameController.getGameOver();

    if (isGameOver === false) {
        roundController.playRound(event);
    }
}

gameBoard.renderBoard();