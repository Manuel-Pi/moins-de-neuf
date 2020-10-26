const CardManager = require('./pizi-moins-de-neuf-gameManager.js');
var mongoose = require('mongoose');
const PlayerModel = require('./database/models/player');

module.exports = function(socketServer, console){
    // Get io for a specific namespace
    const io = socketServer.of('/pizi-moins-de-neuf');

    // Init state
    let CONNEXION_ON = true;
    let PLAYERS = {};
    let GAMES = {};
    let KICKABLE_PLAYERS = {};
    let KICKABLE_GAMES = {};

    // Init game from DB
    mongoose.connection.once('open', () => {
        CardManager.getGames( games => GAMES = games);
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
            if(!game || !player || game.action || game.players.length > 7 || game.players.length > game.conf.maxPlayer) return;

            // If player already in game, kick before allowing him to join again
            if(socket.game && GAMES[socket.game] && CardManager.updatePlayer(player, GAMES[socket.game])){
                CardManager.kickPlayer(CardManager.updatePlayer(player, GAMES[socket.game]), GAMES[socket.game], GAMES);
            }

            socket.game = gameName;
            game.players.push({
                ...player,
                score: 0,
                scoreStreak: 0,
                hand: [],
                ready: false,
                stats: {
                    games: {
                        played: 0,
                        won: 0,
                        lost: 0
                    },
                    moinsdeneuf: {
                        call: 0,
                        won: 0,
                        lost: 0
                    },
                    quickplay:{
                        done: 0,
                        taken: 0
                    }
                }
            });

            // Join Room
            socket.join(gameName);
            CardManager.saveGame(game);

            // Clean players
            let i = game.players.length;
            while(i--){
                if(!io.sockets[game.players[i].id]){
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
        });

        socket.on('removeGame', gameName => {
            let game = gameName && GAMES[gameName];
            if(!gameName || !game || game.players.length) return;
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
}
