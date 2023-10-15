

// ------------------gameBoard Control------------------

const gameBoard = (function() {

    // Generate Starting Board / Array
    let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // Retrieve current board state
    const getBoard = () => {
        return board;
    }

    // Update board at boardSpace with playerMarker
    const updateBoard = (boardSpace, playerMarker) => {
        let index = boardSpace.dataset.index;

        if (typeof board[index] === "number") {
            // Check if space is empty before updating with playerMarker
            board[index] = playerMarker;
            return true;
        }
    }

    // Resets board to default position / empty
    const resetBoard = () =>  {
        board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
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
    let gameOver = true;

    const startGame = () => {

        // Initial Start of Game
        if (players.length >= 2 && gameOver === true) {
            gameOver = false;
            UIController.updateResults("Start!");  
        }

        // Automatically start game if two bots detetced
        if (players.length >= 2){
            if (players[0].bot === true && players[1].bot === true) {
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

    // get GameOver Status
    const getGameOver = () => {
        return gameOver;
    }

    // Toggle GameOver
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
    return {addPlayer, getGameOver, toggleGameOver, updateScore, getScore, toggleActivePlayer, 
        getActivePlayer, startGame, getComputerOnly};

}());

// ------------------Manages Player / AI Rounds------------------

const roundController = (function() {
    let roundActive = false
    
    const playRound = (divClicked) => {
        // Get GameOver status and activePlayer
        let isGameOver = gameController.getGameOver();
      
        if (roundActive === false) {
            let activePlayer = gameController.getActivePlayer();

            // If Player is not a bot - run human code block
            if (activePlayer.bot === false && gameController.getGameOver() === false){

                let player = activePlayer;
                let playerMove = divClicked.target;
                let playerName = activePlayer.playerName;
                let playerMarker = activePlayer.playerMarker;
                
                // Update gameBoard - continue code block if successful
                if (gameBoard.updateBoard(playerMove, playerMarker)) {

                    roundActive = true;

                    gameBoard.renderBoard();

                    // Check if player is in a win state - continue if true
                    if(checkForWinner(gameBoard.getBoard(), playerMarker)) {

                        // Update Player Scores
                        gameController.updateScore(player);
                        let newScores = gameController.getScore();
                        UIController.updateScore(newScores);
                    
                        // Update Round Result Message
                        let resultMessage = `${playerName} is the Winner!`
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
                        }, 2000);
                    }

                    // Check if game is a draw - continue if true
                    if(checkForDraw(gameBoard.getBoard())){
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
                        }, 2000);
                    }

                    gameController.toggleActivePlayer();
                    activePlayer = gameController.getActivePlayer()
                    roundActive = false;
                }

                if(isGameOver === false) {
                    UIController.updateResults(`${activePlayer.playerName}'s Turn!`)
                }
            }

            // If player is a bot - run computerAI code block
            if (activePlayer.bot === true && gameController.getGameOver() === false) {

                roundActive = true;

                // Add a small delay so computer does not play instantly ~ more lifelike
                setTimeout(() => {
                    let computer = activePlayer;
                    let computerName = activePlayer.playerName;
                    let computerMarker = activePlayer.playerMarker;

                    let computerMove = computerAI.takeTurn(gameBoard.getBoard(), computerMarker);

                    // Update gameBoard - continue code block if successful
                    if (gameBoard.updateBoard(computerMove, computerMarker)) {
                        gameBoard.renderBoard();

                        // Check if computer is in a win state - continue if true
                        if(checkForWinner(gameBoard.getBoard(), computerMarker)) {

                            // Update Player Scores
                            gameController.updateScore(computer);
                            let newScores = gameController.getScore();
                            UIController.updateScore(newScores);
                    
                            // Update Round Result Message
                            let resultMessage = `${computerName} is the Winner!`
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
                            }, 2000);
                            
                        }

                        // Check if game is a draw - continue if true
                        if(checkForDraw(gameBoard.getBoard())){

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
                            }, 2000);
                        }

                        gameController.toggleActivePlayer();
                        activePlayer = gameController.getActivePlayer().playerName;

                        if (isGameOver === false) {
                            UIController.updateResults(`${activePlayer}'s Turn!`)
                        }
                        
                        roundActive = false;

                        if (gameController.getComputerOnly() === true){
                            playRound();
                        }
                    }

                }, 1000)
            }
        }
    }

    // Checks if the board is in a winner state
    const checkForWinner = (board, player) => {
        // Checks player spaces against all winning combos
        if (
            (board[0] == player && board[1] == player && board[2] == player) ||
            (board[3] == player && board[4] == player && board[5] == player) ||
            (board[6] == player && board[7] == player && board[8] == player) ||
            (board[0] == player && board[3] == player && board[6] == player) ||
            (board[1] == player && board[4] == player && board[7] == player) ||
            (board[2] == player && board[5] == player && board[8] == player) ||
            (board[0] == player && board[4] == player && board[8] == player) ||
            (board[2] == player && board[4] == player && board[6] == player)
          ) {
            return true;
          } 
    }

    
    // Check if the board is in a draw state
    const checkForDraw = (board) => {

        // Get current board with all markers from both players
        let currentBoard = board.filter((element) => {
            if (element === "X" || element === "O"){
            return element;
            }
        })  

        // If all spots on the board are filled = draw (Runs after winner check)
        if (currentBoard.length === board.length) {
            return true
        }
    }

    return {playRound, checkForWinner, checkForDraw};
    
})();

// ------------------Computer AI------------------

const computerAI = (function() {

    // Determine what space the bot should place their marker
    const takeTurn = (board, player) => {
        // Set Default bot level
        let difficulty = gameController.getActivePlayer().difficulty;

        const currentBoard = Array(9).fill("")
        currentBoard.splice(0,currentBoard.length, ...board);
        let move;

        if (difficulty === "easy") {
            move = randomChoice(board).dataset.index;

        } else if (difficulty === "hard"){
            move = minimax(board, player).index;
        }

        selectedSpace = document.querySelector(`[data-index="${move}"]`);
        return selectedSpace;
    }

    // Generate random move for computer based on empty spaces on board
    const randomChoice = (board) => {

        let emptySpaces = getEmptySpaces(board);
        let move = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];

        selectedSpace = document.querySelector(`[data-index="${move}"]`);
        return selectedSpace;
    }
    
    // Use the Minimax algorithm to find the best space possible
    const minimax = (reboard, player) => {

        let player1 = "X"; //Tries to Win - AiPlayer
        let player2 = "O";

        // Get Available spaces on the gameBoard
        let emptySpaces = getEmptySpaces(reboard);

        // Check if board is in a win, loss, or draw state
        if (roundController.checkForWinner(reboard, player2)) {
            return {score: -10};

        } else if (roundController.checkForWinner(reboard, player1)) {
            return {score: 10};

        } else if (emptySpaces.length === 0) {
            return {score: 0};
        }

        // Run through all possible moves until a win, loss, or draw
        let moves = [];
        for (let i = 0; i < emptySpaces.length; i++) {

            let move = {};

            move.index = reboard[emptySpaces[i]];
            reboard[emptySpaces[i]] = player;

            if (player == player1) {
                let result = minimax(reboard, player2);
                move.score = result.score;

            } else {
                let result = minimax(reboard, player1);
                move.score = result.score;
            }

            reboard[emptySpaces[i]] = move.index;
            moves.push(move);
        }

        // Determine best move via the score property
        let bestMove;

        if (player === player1) {

            let bestScore = -10000;

            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }

        } else {

            let bestScore = 10000;

                for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        // Return best move
        return moves[bestMove];
    }
    
    // Set the computer AI difficulty
    const setDifficulty = (level) => {
        difficulty = level;
    }

    // Determine what spaces are empty on the board
    const getEmptySpaces = (board) => {
        return board.filter(element => element != "X" && element != "O");  
    }

    return {takeTurn, setDifficulty, minimax, takeTurn}
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
    const player1Label = document.querySelector(".player1 > .selection > .postSelection")
    const player2Label = document.querySelector(".player2 > .selection > .postSelection")

    // Player 1 Button
    const player1Button = document.querySelector(".player1 > .selection > .playerButton");
    player1Button.addEventListener("click", addPlayer);

    // Player 2 Button
    const player2Button = document.querySelector(".player2 > .selection > .playerButton");
    player2Button.addEventListener("click", addPlayer);

    // Bot 1 Buttons
    const player1BotButton = document.querySelector(".player1 > .selection > .botButton");
    player1BotButton.addEventListener("click", addBot);

    const player1BotEasyButton = document.querySelector(".player1 > .selection > .easy");
    const player1BotHardButton = document.querySelector(".player1 > .selection > .hard");

    // Bot 2 Buttons
    const player2BotButton = document.querySelector(".player2 > .selection > .botButton");
    player2BotButton.addEventListener("click", addBot);

    const player2BotEasyButton = document.querySelector(".player2 > .selection > .easy");
    const player2BotHardButton = document.querySelector(".player2 > .selection > .hard");


    // Add Player onClick Function
    function addPlayer(button) {

        let player = button.target.innerHTML;
    
        // Checks if the button pressed resides in the player 1 div / section
        if (button.target.closest(".player1")) {

            // Checks if the button pressed was either Player 1 or Bot

            if (player === "Player 1") {
                gameController.addPlayer(createPlayer(player1, player1Marker, false))
                player1Label.classList.remove("hidden");
                player1Label.innerHTML = player1;

                // Hide selection buttons after selection
                player1Button.classList.add("hidden");
                player1BotButton.classList.add("hidden");

                gameController.startGame();
            };
        }

        // Checks if the button pressed resides in the player 2 div / section
        if (button.target.closest(".player2")) {

            // Checks if the button pressed was either Player 2 or Bot

            if (player === "Player 2") {
                gameController.addPlayer(createPlayer(player2, player2Marker, false))
                player2Label.classList.remove("hidden");
                player2Label.innerHTML = player2;

                // Hides buttons after selection
                player2Button.classList.add("hidden");
                player2BotButton.classList.add("hidden");

                gameController.startGame();
            };
        };
    }

    function addBot(button) {

        let player = button.target.innerHTML;

        // Checks if the button pressed resides in the player 1 div / section
        if (button.target.closest(".player1")) {

            // Checks if the button pressed was either Player 1 or Bot

            if (player === "Bot") {
                
                // Hide selection buttons after selection
                player1Button.classList.add("hidden");
                player1BotButton.classList.add("hidden");

                // Display difficulty settings
                player1BotEasyButton.classList.remove("hidden");
                player1BotHardButton.classList.remove("hidden");

                // Create bot with easy difficulty
                player1BotEasyButton.addEventListener("click", () => {
                    gameController.addPlayer(createPlayer(player1Bot, player1Marker, true, "easy"))
                    player1Label.classList.remove("hidden");
                    player1Label.innerHTML = `Easy ${player1Bot}`;

                    player1BotEasyButton.classList.add("hidden");
                    player1BotHardButton.classList.add("hidden");

                    gameController.startGame();
                });

                // Create bot with hard difficulty 
                player1BotHardButton.addEventListener("click", () => {
                    gameController.addPlayer(createPlayer(player1Bot, player1Marker, true, "hard"))
                    player1Label.classList.remove("hidden");
                    player1Label.innerHTML = `Hard ${player1Bot}`;

                    player1BotEasyButton.classList.add("hidden");
                    player1BotHardButton.classList.add("hidden");

                    gameController.startGame();
                });
            }
        }

        // Checks if the button pressed resides in the player 2 div / section
        if (button.target.closest(".player2")) {

            // Checks if the button pressed was either Player 2 or Bot

            if (player === "Bot") {
               
                // Hide selection buttons after selection
                player2Button.classList.add("hidden");
                player2BotButton.classList.add("hidden");

                // Display difficulty settings
                player2BotEasyButton.classList.remove("hidden");
                player2BotHardButton.classList.remove("hidden");

                // Create bot with easy difficulty
                player2BotEasyButton.addEventListener("click", () => {
                    gameController.addPlayer(createPlayer(player2Bot, player2Marker, true, "easy"));
                    player2Label.classList.remove("hidden");
                    player2Label.innerHTML = `Easy ${player2Bot}`;

                    player2BotEasyButton.classList.add("hidden");
                    player2BotHardButton.classList.add("hidden");

                    gameController.startGame()
                });

                // Create bot with hard difficulty
                player2BotHardButton.addEventListener("click", () => {
                    gameController.addPlayer(createPlayer(player2Bot, player2Marker, true, "hard"));
                    player2Label.classList.remove("hidden");
                    player2Label.innerHTML = `Hard ${player2Bot}`;

                    player2BotEasyButton.classList.add("hidden");
                    player2BotHardButton.classList.add("hidden");

                    gameController.startGame()
                });
            }  
        }
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

function createPlayer(name, marker, isBot, difficultySetting){

    const playerName = name;
    const playerMarker = marker;
    const bot = isBot;
    let difficulty = difficultySetting;

    let playerScore = 0;

    return {playerName, playerMarker, bot, difficulty, playerScore};
}

// ------------------OnClick Fucntion------------------

function onBoardClick(event) {
    roundController.playRound(event);  
}

gameBoard.renderBoard();