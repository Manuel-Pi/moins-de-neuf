const CardManager = require('./pizi-moins-de-neuf-gameManager.js');
const CardGame = require('./pizi-card-game');
const mongoose = require('mongoose');
const ioClient = require('socket.io-client');

module.exports = function(socketServer, console, url){
    // Get io for a specific namespace
    const io = socketServer.of('/pizi-moins-de-neuf');
    const ioClientChat = ioClient(url + '/pizi-chat/moinsdeneuf');

    // Init state
    let CONNEXION_ON = true;
    let PLAYERS = {};
    let GAMES = {};
    let KICKABLE_PLAYERS = {};
    let KICKABLE_GAMES = {};

    // Init game from DB
    mongoose.connection.once('open', () => {
        CardManager.getGames( games => {
            GAMES = games;
            Object.values(GAMES).forEach(game => {
                ioClientChat.emit("addRoom", {
                    id: game.name,
                    name: "[game] " + game.name,
                    private: true,
                    allowedUsers: game.players.filter(player => !player.bot).map(player => player.name)
                })
            })
        });
    });

    io.on('connection', function (socket) {
        console.debug("connection of " + socket.id);

        /*************** CONNECTIONS *****************/

        socket.on('login', (username, token) => {
            if(!username) return;
            login(socket, username, token);
        });

        socket.on('reconnectUser', (username, token) => {
            if(!username) return;
            login(socket, username, token);

            // Retrieve current game 
            Object.keys(GAMES).forEach(name => {
                let g = GAMES[name];
                g.players.forEach(player => {
                    if(player.name !== username) return;
                    socket.game = g.name;
                    socket.join(g.name);
                    CardManager.updatePlayer(PLAYERS[socket.player], g);
                    socket.emit('gameInfo', CardManager.getPublicGameInfo(g));
                    socket.emit('setHand', player.hand);
                    CardManager.saveGame(g);

                    // Play for bot
                    playForBot(g, socket);

                    // Clear from kickable players
                    if(KICKABLE_PLAYERS[username]){
                        clearTimeout(KICKABLE_PLAYERS[username]);
                        delete KICKABLE_PLAYERS[username];
                        console.info(username + ' removed from timeouts!');
                    }

                    console.info(username + ' successfully reconnected!');
                });
            });
            socket.emit('setGames', CardManager.getPublicGames(GAMES));
            socket.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));            
         });

        socket.on('disconnect', function(reason){
            console.info(socket.player + ' disconnected because ' + reason);
            let [game, player] = getGameAndPlayer(socket);
            if(!player) return;

            if(game.conf.playerKickTimeout !== "Jamais") KICKABLE_PLAYERS[player.name] = setTimeout( () => {
                CardManager.kickPlayer(player, game, GAMES);
                CardManager.saveGame(game);
                io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game));
                io.emit('setGames', CardManager.getPublicGames(GAMES));
                io.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));
                socket.leave(game.name);
            }, valueToMillisecond(game.conf.playerKickTimeout), this);
        });

        /******************* JOIN / QUIT GAME **********************/

        socket.on('join', gameName => {
            let game = GAMES[gameName];
            let player = PLAYERS[socket.player];
            const totalConnected = game.players.length + (game.spectators ? game.spectators.length : 0);
            if(!game || !player || totalConnected > 7 || totalConnected >= game.conf.maxPlayer) return;

            // If player already in game, kick before allowing him to join again
            if(socket.game && GAMES[socket.game] && CardManager.updatePlayer(player, GAMES[socket.game])){
                CardManager.kickPlayer(CardManager.updatePlayer(player, GAMES[socket.game]), GAMES[socket.game], GAMES);
            }

            socket.game = gameName;
            game.spectators = game.spectators || [];
            !game.action ? CardManager.addPlayer(player, game) : CardManager.addSpectator(player, game);

            // Join Room
            socket.join(gameName);
            CardManager.saveGame(game);

            // Update chat room
            ioClientChat.emit("updateRoom", {
                id: game.name,
                allowedUsers: [...game.players.filter(p => !p.bot).map(player => player.name)]
            })

            // Clean players
            let i = game.players.length;
            while(i--){
                if(!game.players[i].bot && !io.sockets[game.players[i].id]){
                    CardManager.kickPlayer(game.players[i], GAMES[socket.game], GAMES);
                    console.info("Kick " + game.players[i].name);
                    return;
                }
            }

            io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game));
            io.emit('setGames', CardManager.getPublicGames(GAMES));
            io.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));
        });

        socket.on('quit', (disconnect) => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player) return;

            CardManager.kickPlayer(player, game, GAMES);
            socket.leave(game.name);
            socket.broadcast.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game));
            socket.emit('gameInfo', null);
            CardManager.saveGame(game);
            io.emit('setGames', CardManager.getPublicGames(GAMES));
            io.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));
            // Disconnect from socket if needed
            disconnect && socket.disconnect();
        });

        socket.on('createGame', gameProps => {
            const gameNumber = Object.keys(GAMES).length;
            if(gameNumber > 10) return;
            CardManager.saveGame(CardManager.createGame(GAMES, gameProps));
           
            if(Object.keys(GAMES).length > gameNumber){
                io.emit('setGames', CardManager.getPublicGames(GAMES));
                console.info('Game created: ' + gameProps.name);
                socket.emit('gameCreated');
            }

            ioClientChat.emit("addRoom", {
                id: gameProps.name,
                name: "[game] " + gameProps.name,
                private: true
            });

        });

        ioClientChat.on('roomAdded', room => {
            if(room.id.includes("[game]")) {}
        });

        socket.on('removeGame', gameName => {
            let game = gameName && GAMES[gameName];
            const bots = game.conf.bots || 0;
            if(!gameName || !game || (game.players.length - bots > 0)) return;
            CardManager.removeGame(GAMES[gameName]);
            delete GAMES[gameName];
            io.emit('setGames', CardManager.getPublicGames(GAMES));
            console.info('Game removed: ' + gameName);
        });

        /**************** GAME ACTIONS ***********************/

        socket.on('isReady', data => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player) return;
            player = CardManager.updatePlayer({...player, ready: !player.ready}, game);

            // If all ready
            let readyCount = 0;
            let allReady = true;
            game.players.forEach((player) => {
                if(player.ready) readyCount++;
                allReady = allReady && player.ready
            });
  
            if(allReady && game.conf.minPlayer <= readyCount){
                CardManager.startGame(game);
                socket.emit('setGames', CardManager.getPublicGames(GAMES));
                game.players.forEach( player => io.sockets[player.id] && io.sockets[player.id].emit('setHand', player.hand));
                // Play for bot
                playForBot(game, socket);
            }

            CardManager.saveGame(game);
            io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, false, true));
        });

        socket.on('selectPick', cards => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player) return;

            // Not the good player, should not happen front-end should block!
            if(socket.player !== game.currentPlayer || game.action !== "pick") return;

            // Already have the maximum cards
            player = CardManager.updatePlayer(player, game);
            if(player.hand.length > 6) return;

            let card = null;
            if(cards && cards[0] && cards[0].value === "0" && cards[0].color === "heart") card = cards[0];
            // Pick card
            let lastPlayed = [...game.playedCards[game.playedCards.length - 2]];
            console.debug("Last played " + JSON.stringify(lastPlayed));
            if(!card && cards && cards.length && CardManager.contains(cards[0], lastPlayed)){
                card = cards[0];
                lastPlayed = lastPlayed.filter(c => (c.value !== card.value) ||  (c.color !== card.color));
                console.debug("Last played filtered" + JSON.stringify(lastPlayed));
            }

            CardManager.saveGame(game);
            
            console.debug(player.name + " select pick " + JSON.stringify(card));
            socket.broadcast.to(game.name).emit('selectedPick', card);
        });

        socket.on('pick', cards => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player) return;

            // Not the good player, should not happen front-end should block!
            if(socket.player !== game.currentPlayer || game.action !== "pick") return;

            // Already have the maximum cards
            if(player.hand.length > 6) return;

            // Pick card
            let card;
            let lastPlayed = game.playedCards[game.playedCards.length - 2];
            console.debug("Last played " + JSON.stringify(lastPlayed));
            if(cards && cards.length && CardManager.contains(cards[0], lastPlayed)){
                card = cards[0];
                lastPlayed = lastPlayed.filter(c => (c.value !== card.value) ||  (c.color !== card.color));
                console.debug("Last played filtered" + JSON.stringify(lastPlayed));
            } else if(!cards) {
                card = game.pickStack.splice(0,1)[0];
            }

            if(!card){
                console.error("Not card matching pick!");
                return;
            }
            
            // Card is valid
            player.hand =[...player.hand, card];
            game.pickStack = game.pickStack.concat(lastPlayed);
            console.debug(player.name + " pick " + JSON.stringify(card));
            CardManager.updatePlayer(player, game);
            CardManager.nextAction(game);

            // For Front-End
            game.quickPlay = !!CardManager.quickPlay(player, [card], game);
            CardManager.saveGame(game);
            socket.emit('setHand', player.hand);
            io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, false, true));

            // Play for bot
            playForBot(game, socket);
        });

        socket.on('play', cards => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player || game.action !== "play") return;

            console.debug(socket.player + " wants to play " + JSON.stringify(cards));
            var originalCards = [...cards];

            // Is it a quick play ?
            const qp = CardManager.quickPlay(player, originalCards, game);
            if(qp === "bash") io.to(game.name).emit('bash', player.name);
            if(socket.player !== game.currentPlayer && !qp) return;

            // Check played cards
            if(!CardManager.checkPlayedCards(originalCards)){
                io.to(game.name).emit('notAllowed', player.name);
                return;
            } 

            // If validation succeed, set hand
            player.hand = player.hand.filter(userCard => {
                let found = null;
                for(let i = 0; i < cards.length; i++){
                    if(cards[i].value === userCard.value && cards[i].color === userCard.color){
                        found = i;
                        break;
                    }
                }
                if(found !== null && cards.length) cards.splice(found, 1);  
                return found === null;
            });
            
            if(!cards.length){
                if(qp === "quick"){
                    CardManager.updatePlayer(player, game);
                    let lastPlay = game.playedCards[game.playedCards.length - 1];
                    game.playedCards[game.playedCards.length - 1] = lastPlay.concat(originalCards);
                    io.to(game.name).emit('quickPlayed', player.name);

                    // Stats
                    const p = game.players.filter(player => player.name === game.currentPlayer)[0];
                    p.stats.quickplay.taken++;
                    player.stats.quickplay.done++;
                    
                } else {
                    CardManager.updatePlayer(player, game);
                    CardManager.nextAction(game);
                    game.playedCards.push(originalCards);
                }
                game.quickPlay = false;
                socket.emit('setHand', player.hand);
                CardManager.saveGame(game);
                io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, false, true));
                console.debug(player.name + " played " + JSON.stringify(originalCards));
            } else {
                console.error("Cards are not matching what server excpect! " + JSON.stringify(cards));
            }
        });

        socket.on('moinsDeNeuf', data => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player || game.action !== "play" || socket.player !== game.currentPlayer) return;

            console.debug(player.name + " call for 'moins de neuf' with " + JSON.stringify(player.hand));

            const scores = CardManager.endRound(game, player.name);
            CardManager.saveGame(game, true);
            console.debug("Scores: " + JSON.stringify(scores));
            if(scores.winners.names.length){
                io.to(game.name).emit('roundEnd', scores);
                io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, true, true));
            }
        });

        socket.on('refresh', data => {
            let [game, player] = getGameAndPlayer(socket);
            if(!player) {
                socket.emit('setGames', CardManager.getPublicGames(GAMES));
                socket.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));
                return;
            }

            console.info(player.name + " call for refresh. ");
            socket.emit('gameInfo', CardManager.getPublicGameInfo(game));
            socket.emit('setHand', player.hand);
        });
    });

    /*************** UTILITIES ******************/

    function getGameAndPlayer(socket){
        let game = GAMES[socket.game];
        let player = CardManager.updatePlayer(PLAYERS[socket.player], game);
        return player ? [game, player] : [];
    }

    function login(socket, username, token){
        if(!username) return;

        PLAYERS[username] = {
            id: socket.id,
            name: username
        };
        
        socket.player = username;
        console.info('Connection: ' + username);
        socket.emit('setGames', CardManager.getPublicGames(GAMES));
        socket.emit('setPlayers', CardManager.getPublicPlayers(PLAYERS, GAMES));
    }

    function valueToMillisecond(value){
        switch(value){
            case "30s":
                return 30 * 1000;
            case "1min":
                return 60 * 1000;
            case "2min":
                return 2 * 60 * 1000;
            case "5min":
                return 5 * 60 * 1000;
            case "10min":
                return 10 * 60 * 1000;
            case "30min":
                return 30 * 60 * 1000;
        }
    }

    let botPlaying = false;
    function playForBot(game, socket){
        if(botPlaying || game.endGame) return;
        let currentPlayer;
        let onePlayerHaveLessThan3Cards = false;
        game.players.forEach(player => {
            if(!currentPlayer && player.name === game.currentPlayer){
                currentPlayer = player;
            } else if(!onePlayerHaveLessThan3Cards && player.hand.length < 4){
                onePlayerHaveLessThan3Cards = true;
            }
        });

        if(currentPlayer && currentPlayer.bot){
            botPlaying = true;
            console.debug(currentPlayer.name + " hand: " + JSON.stringify(currentPlayer.hand));
            switch(game.action){
                case "pick":

                    let pickCard = null;
                    const lastPlayFull = game.playedCards[game.playedCards.length - 2];
                    let lastPlay = lastPlayFull.filter((card, index) => (index === 0) || (index === lastPlayFull.length - 1));

                    // Check matching card
                    const matchingCards = lastPlay.filter(card => currentPlayer.hand.filter(c => CardGame.getValue(c) === CardGame.getValue(card)).length !== 0);
                    matchingCards.sort((c1, c2) => CardGame.getValue(c1) - CardGame.getValue(c2));

                    if(matchingCards.length){
                        pickCard = matchingCards.splice(0,1)[0];
                    }

                    // Take small cards
                    if(!pickCard){
                        lastPlay.sort((c1, c2) => CardGame.getValue(c2) - CardGame.getValue(c1));
                        if(CardGame.getValue(lastPlay[0]) < 3) pickCard = lastPlay.splice(0,1)[0];
                    }

                    let selected = pickCard;

                    // Pick from stack
                    if(!pickCard){
                        pickCard = pickCard || game.pickStack.splice(0,1)[0];
                        game.pickStack = game.pickStack.concat(lastPlayFull);
                        selected = {color: 'heart', value: '0'};
                    }
                    
                    currentPlayer.hand.push(pickCard);
                    console.debug(currentPlayer.name + " is picking: " + JSON.stringify(pickCard));

                    setTimeout(() => {
                        CardManager.updatePlayer(currentPlayer);
                        io.to(game.name).emit('selectedPick', selected);
                        setTimeout(() => {
                            CardManager.nextAction(game);
                            io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, false, true));
                            botPlaying = false;
                            playForBot(game, socket);
                        }, 800)
                    }, 2000);
                    return;
        
                case "play":
                    
                    let cards = [];
                    const hand = [...currentPlayer.hand].sort((c1, c2) => CardGame.getValue(c2) - CardGame.getValue(c1));
                    
                    // Check moins de neuf
                    const sum = hand.reduce((a, b) => a + CardGame.getValue(b), 0);
                    if(sum < 10){
                        setTimeout(() => {
                            const scores = CardManager.endRound(game, currentPlayer.name);
                            CardManager.saveGame(game, true);
                            console.debug("Scores: " + JSON.stringify(scores));
                            botPlaying = false;
                            if(scores.winners.names.length){
                                io.to(game.name).emit('roundEnd', scores);
                                io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, true, true));
                            }
                        }, 1000);
                        return;
                    }

                    let lastPlayedCards = game.playedCards[game.playedCards.length - 1];
                    const lastPlayValues = lastPlayedCards.map(c => CardGame.getValue(c));

                    const jokers = hand.filter(card => card.color === "joker");

                    // Check same card values 
                    const sameValue = {};
                    for(let i = 0; i < hand.length - 1; i++){
                        const card = hand[i];
                        const nextCard = hand[i + 1];
                        if(CardGame.getValue(card) === CardGame.getValue(nextCard)) {
                            if(sameValue[CardGame.getValue(card)]){
                                sameValue[CardGame.getValue(card)]++;
                            } else {    
                                sameValue[CardGame.getValue(card)] = 1;
                            }
                        }
                    }

                    let highestValue = 0;
                    Object.keys(sameValue).forEach( v => {
                        const value = parseInt(v);
                        if(value > highestValue) highestValue = value;
                    });
                    if(highestValue && !lastPlayValues.includes(highestValue)){
                        cards = hand.filter(card => CardGame.getValue(card) === highestValue);
                        if(cards.length && jokers.length) while(jokers.length) cards.splice(1, 0, jokers.shift());
                    }

                    // If no cards selected take highest
                    if(!cards.length) hand.forEach(card => {
                        if(cards.length) return;
                        if(!lastPlayValues.includes(CardGame.getValue(card))){
                            cards.push(card);
                            return;
                        }
                        if(onePlayerHaveLessThan3Cards && jokers.length) while(jokers.length) cards.push(jokers.shift());
                    });

                     // Set hand
                     const finalCards = [...cards];
                     currentPlayer.hand = currentPlayer.hand.filter(userCard => {
                        let found = null;
                        for(let i = 0; i < cards.length; i++){
                            if(cards[i].value === userCard.value && cards[i].color === userCard.color){
                                found = i;
                                break;
                            }
                        }
                        if(found !== null && cards.length) cards.splice(found, 1);  
                        return found === null;
                    });

                    console.debug(currentPlayer.name + " is playing: " + JSON.stringify(finalCards));
                    setTimeout(() => {
                        CardManager.updatePlayer(currentPlayer);
                        game.playedCards.push(finalCards);
                        CardManager.nextAction(game);
                        io.to(game.name).emit('gameInfo', CardManager.getPublicGameInfo(game, false, true));
                        botPlaying = false;
                        playForBot(game, socket);
                    }, 2000);
                    return;
            }
        }
    }
}
