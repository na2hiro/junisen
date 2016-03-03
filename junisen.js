var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Player = (function () {
    function Player(name) {
        this.name = name;
        this.win = 0;
        this.lose = 0;
        this.countChallenge = 0;
        this.countPlayoff = 0;
        this.countDown = 0;
    }
    Player.prototype.resetCounts = function () {
        this.countDown = this.countChallenge = this.countPlayoff = 0;
    };
    Player.prototype.resetFlags = function () {
        this.down = this.challenge = this.playoff = false;
    };
    return Player;
})();
var PlayerTable = (function () {
    function PlayerTable(players) {
        this.players = players;
        players.map(function (player) {
            for (var l = 2; l <= player.name.length; l++) {
                var abbrev = player.name.slice(0, l);
                if (players.every(function (p) {
                    return player.name == p.name || p.name.indexOf(abbrev) != 0;
                })) {
                    player.abbrev = abbrev;
                    return;
                }
            }
        });
    }
    PlayerTable.prototype.writeOrder = function () {
        this.players.forEach(function (player, num) {
            player.order = num;
        });
    };
    return PlayerTable;
})();
var Game = (function () {
    function Game(players, result) {
        if (result === void 0) { result = false; }
        this.players = players;
        this.result = result;
    }
    Game.prototype.getLog = function (player) {
        var enemy = this.players[0] == player ? this.players[1] : this.players[0];
        if (this.result) {
            return { enemy: enemy, win: this.players[0] == player };
        }
        else if (this.temp != null) {
            return { enemy: enemy, win: this.temp == player, temp: true };
        }
        else {
            return { enemy: enemy };
        }
    };
    Game.prototype.tempWin = function (player) {
        this.temp = player;
    };
    Game.prototype.tempWinBack = function () {
        this.temp = null;
    };
    return Game;
})();
var NullGame = (function (_super) {
    __extends(NullGame, _super);
    function NullGame() {
        _super.apply(this, arguments);
    }
    NullGame.prototype.getLog = function (player) {
        return { enemy: null };
    };
    return NullGame;
})(Game);
var GameTable = (function () {
    function GameTable(playerTable, setting) {
        var _this = this;
        this.playerTable = playerTable;
        this.setting = setting;
        this.map = {};
        this.games = [];
        playerTable.writeOrder();
        playerTable.players.forEach(function (player) {
            _this.map[player.name] = [];
        });
    }
    GameTable.getWinMark = function (win) {
        return win ? "○" : "●";
    };
    GameTable.prototype.add = function (game) {
        this.games.push(game);
        for (var i = 0; i < game.players.length; i++) {
            this.map[game.players[i].name].push(game);
        }
        if (game.result) {
            game.players[0].win++;
            game.players[1].lose++;
        }
    };
    GameTable.tempWin = function (game) {
        game.players[0].win++;
        game.players[1].lose++;
        game.tempWin(game.players[0]);
    };
    GameTable.tempWinBack = function (game) {
        game.players[0].win--;
        game.players[1].lose--;
        game.tempWinBack();
    };
    GameTable.tempLose = function (game) {
        game.players[0].lose++;
        game.players[1].win++;
        game.tempWin(game.players[1]);
    };
    GameTable.tempLoseBack = function (game) {
        game.players[0].lose--;
        game.players[1].win--;
        game.tempWinBack();
    };
    GameTable.prototype.printSearched = function () {
        var _this = this;
        var max = this.search();
        var div = document.getElementById("table");
        var table = document.createElement("table");
        var newTr = table.insertRow(table.rows.length);
        var texts = ["棋士", "勝敗", "順", "確"];
        if (this.setting.playoff) {
            texts.push("挑");
            texts.push("プ");
        }
        else {
            texts.push("昇");
        }
        texts.push("降");
        texts.forEach(function (text) {
            var t = document.createTextNode(text);
            var newTh = document.createElement("th");
            newTh.appendChild(t);
            newTr.appendChild(newTh);
        });
        var numRounds = 0;
        this.playerTable.players.forEach(function (player) {
            var newTr = table.insertRow(table.rows.length);
            var mark = "";
            if (player.countChallenge == max) {
                newTr.className = "challenge";
                mark = _this.setting.playoff ? "挑" : "昇";
            }
            else if (player.countPlayoff == max) {
                newTr.className = "playoff";
                mark = "プ";
            }
            else if (player.countDown == max) {
                newTr.className = "down";
                mark = "降";
            }
            var newTd = newTr.insertCell(newTr.cells.length);
            newTd.appendChild(document.createTextNode(player.name));
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.appendChild(document.createTextNode(player.win + "-" + player.lose));
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.appendChild(document.createTextNode((player.rank + 1).toString()));
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.appendChild(document.createTextNode(mark));
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.className = "count";
            newTd.appendChild(document.createTextNode(player.countChallenge.toString()));
            if (_this.setting.playoff) {
                newTd = newTr.insertCell(newTr.cells.length);
                newTd.className = "count";
                newTd.appendChild(document.createTextNode(player.countPlayoff.toString()));
            }
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.className = "count";
            newTd.appendChild(document.createTextNode(player.countDown.toString()));
            var numRoundsInner = 0;
            _this.map[player.name].forEach(function (game) {
                numRoundsInner++;
                newTd = newTr.insertCell(newTr.cells.length);
                var log = game.getLog(player);
                if (!log.enemy) {
                }
                else if (typeof log.win == "undefined") {
                    newTd.appendChild(function () {
                        var div = document.createElement("div");
                        div.appendChild((function () {
                            var span = document.createElement("span");
                            span.className = "result";
                            span.appendChild(ToggleSetting(player.order, log.enemy.order));
                            return span;
                        })());
                        div.appendChild((function () {
                            var span = document.createElement("span");
                            span.className = "name";
                            span.textContent = log.enemy.abbrev;
                            return span;
                        })());
                        return div;
                    }());
                }
                else {
                    newTd.innerHTML = "<div><span class='result'>" + (typeof log.win === "undefined" ? "　" : GameTable.getWinMark(log.win)) + "</span>"
                        + "<span class='name'>" + log.enemy.abbrev + "</span></div>";
                }
            });
            numRounds = Math.max(numRoundsInner, numRounds);
        });
        for (var i = 1; i <= numRounds; i++) {
            var t = document.createTextNode(i + "回戦");
            var newTh = document.createElement("th");
            newTh.appendChild(t);
            newTr.appendChild(newTh);
        }
        div.appendChild(table);
        var table = document.getElementById("searchtable");
        this.searched.forEach(function (row) {
            _this.insertLineByObj(row, table);
        });
    };
    GameTable.prototype.insertLineByObj = function (tempPlayers, table) {
        var newTr = table.insertRow(table.rows.length);
        newTr.className = tempPlayers.games.map(function (game) { return "res" + game.win + "_" + game.lose; }).join(" ");
        tempPlayers.players.forEach(function (player) {
            var newTd = newTr.insertCell(newTr.cells.length);
            if (player.challenge)
                newTd.className = "challenge";
            else if (player.playoff)
                newTd.className = "playoff";
            else if (player.down)
                newTd.className = "down";
            newTd.innerHTML = player.win + "-" + player.lose
                + player.result.map(function (win) {
                    if (win === null)
                        return null;
                    return GameTable.getWinMark(win);
                }).filter(function (n) { return n; }).join("") + "(" + (player.rank + 1) + ")";
        });
    };
    GameTable.prototype.rankPlayers = function (games) {
        var players = this.playerTable.players.slice(0);
        players.forEach(function (player) {
            player.resetFlags();
        });
        players.sort(function (p1, p2) { return p1.win != p2.win ? p2.win - p1.win : p1.order - p2.order; });
        players.forEach(function (player, num) {
            player.rank = num;
        });
        if (this.setting.playoff) {
            // assume only 1 can challenge
            var flagPlayoff = false;
            for (var i = 1; i < players.length; i++) {
                if (players[0].win != players[i].win)
                    break;
                flagPlayoff = true;
                players[i].playoff = true;
                players[i].countPlayoff++;
            }
            if (flagPlayoff) {
                players[0].playoff = true;
                players[0].countPlayoff++;
            }
            else {
                players[0].challenge = true;
                players[0].countChallenge++;
            }
        }
        else {
            for (var i = 0; i < players.length && i < this.setting.up; i++) {
                players[i].challenge = true;
                players[i].countChallenge++;
            }
        }
        for (var i = 0; i < players.length && i < this.setting.down; i++) {
            players[players.length - 1 - i].down = true;
            players[players.length - 1 - i].countDown++;
        }
        var ret = { players: [], games: [] };
        for (var i = 0; i < this.playerTable.players.length; i++) {
            var player = this.playerTable.players[i];
            ret.players.push({
                win: player.win,
                lose: player.lose,
                playoff: player.playoff,
                challenge: player.challenge,
                down: player.down,
                rank: player.rank,
                result: this.map[player.name].map(function (game) {
                    var log = game.getLog(player);
                    if (!log.temp)
                        return null;
                    return log.win;
                }).filter(function (n) { return n !== null; })
            });
        }
        for (var i = 0; i < games.length; i++) {
            var game = games[i];
            ret.games.push({
                win: game.temp == game.players[0] ? game.players[0].order : game.players[1].order,
                lose: game.temp == game.players[0] ? game.players[1].order : game.players[0].order
            });
        }
        return ret;
    };
    GameTable.prototype.search = function () {
        this.searched = [];
        this.playerTable.players.forEach(function (player) {
            player.resetCounts();
        });
        var table = document.getElementById("searchtable");
        var newTr = table.insertRow(0);
        this.playerTable.players.forEach(function (player) {
            newTr.appendChild((function () {
                var th = document.createElement("th");
                th.textContent = player.abbrev;
                return th;
            })());
        });
        var remainingGames = this.games.filter(function (game) { return !game.result && !(game instanceof NullGame); });
        this.searchAndRank(remainingGames, 0);
        return Math.pow(2, remainingGames.length);
    };
    GameTable.prototype.searchAndRank = function (remainingGames, i) {
        if (remainingGames.length <= i) {
            var ranks = this.rankPlayers(remainingGames);
            this.searched.push(ranks);
            return;
        }
        var game = remainingGames[i];
        GameTable.tempWin(game);
        this.searchAndRank(remainingGames, i + 1);
        GameTable.tempWinBack(game);
        GameTable.tempLose(game);
        this.searchAndRank(remainingGames, i + 1);
        GameTable.tempLoseBack(game);
    };
    return GameTable;
})();
var gameTable;
function drawTable(names, doneGames, remainingGames, setting) {
    var players = names.map(function (n) {
        return new Player(n);
    });
    var playerTable = new PlayerTable(players);
    doneGames = toP(doneGames);
    remainingGames = toP(remainingGames);
    function toP(indices) {
        return indices.map(function (g) {
            return g.map(function (pn) {
                return players[pn];
            });
        });
    }
    gameTable = new GameTable(playerTable, setting);
    doneGames.map(function (arr) {
        if (arr.length == 1) {
            return new NullGame(arr);
        }
        else {
            return new Game(arr, true);
        }
    }).forEach(function (game) { return gameTable.add(game); });
    remainingGames.filter(function (arr) { return arr.length == 2; }).map(function (arr) { return new Game(arr, false); }).forEach(function (game) { return gameTable.add(game); });
    gameTable.printSearched();
}
var toggleState = {};
function ToggleSetting(win, lose) {
    var id = [win, lose].sort().join("_");
    var button = document.createElement("button");
    button.className = "button" + win + "_" + lose;
    button.textContent = "？";
    button.onclick = onClick;
    if (!toggleState[id]) {
        toggleState[id] = {};
    }
    var state = toggleState[id];
    state["button_" + win] = button;
    function onClick() {
        if (state.css) {
            removeCSSRule(state.css);
        }
        if (state.win == win) {
            state.win = null;
            state.css = null;
            state["button_" + win].textContent = "？";
            state["button_" + lose].textContent = "？";
        }
        else {
            state.css = addCSSRule(".res" + lose + "_" + win + "{display:none;}");
            state.win = win;
            state["button_" + win].textContent = "○";
            state["button_" + lose].textContent = "●";
        }
    }
    return button;
}
var style = document.createElement("style");
style.type = "text/css";
document.getElementsByTagName("head").item(0).appendChild(style);
var styleSheet = style.sheet;
function addCSSRule(cssText) {
    var index = styleSheet.insertRule(cssText, styleSheet.cssRules.length);
    return styleSheet.cssRules[index];
}
function removeCSSRule(item) {
    for (var i = 0; i < styleSheet.cssRules.length; i++) {
        if (styleSheet.cssRules[i] == item) {
            styleSheet.deleteRule(i);
            return;
        }
    }
    console.warn("couldn't remove rule");
}
//# sourceMappingURL=junisen.js.map