var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Player = (function () {
    function Player(name) {
        this.name = name;
        this.win = 0;
        this.lose = 0;
        this.countChallenge = 0;
        this.countPlayoff = 0;
        this.countDown = 0;
        this.countUp = 0;
    }
    Player.prototype.resetCounts = function () {
        this.countDown = this.countUp = this.countChallenge = this.countPlayoff = 0;
    };
    Player.prototype.resetFlags = function () {
        this.down = this.up = this.challenge = this.playoff = false;
    };
    return Player;
})();
var NullPlayer = (function (_super) {
    __extends(NullPlayer, _super);
    function NullPlayer() {
        _super.call(this, "");
    }
    return NullPlayer;
})(Player);
var PlayerTable = (function () {
    function PlayerTable(players) {
        this.players = players;
    }
    return PlayerTable;
})();
var Game = (function () {
    function Game(players, result) {
        if (result === void 0) { result = false; }
        this.players = players;
        this.result = result;
    }
    Game.create = function (players, result) {
        if (result === void 0) { result = false; }
        return players.length == 1 ? new NullGame(players, result) : new Game(players, result);
    };
    Game.prototype.getLog = function (player) {
        var enemy = this.players[0] == player ? this.players[1] : this.players[0];
        if (this.result) {
            return { enemy: enemy, win: this.players[0] == player };
        }
        else if (this.temp != null) {
            return { enemy: enemy, win: this.players[this.temp] == player, temp: true };
        }
        else {
            return { enemy: enemy };
        }
    };
    Game.prototype.win = function (playerNum) {
        this.players[playerNum].win++;
        this.players[1 - playerNum].lose++;
    };
    Game.prototype.winBack = function (playerNum) {
        this.players[playerNum].win--;
        this.players[1 - playerNum].lose--;
    };
    Game.prototype.tempWin = function (playerNum) {
        this.win(playerNum);
        this.temp = playerNum;
    };
    Game.prototype.tempWinBack = function () {
        this.winBack(this.temp);
        this.temp = null;
    };
    Game.prototype.iteratePlayerNum = function (func) {
        for (var i = 0; i < this.players.length; i++) {
            func(i);
        }
    };
    return Game;
})();
var NullGame = (function (_super) {
    __extends(NullGame, _super);
    function NullGame(players, result) {
        if (result === void 0) { result = false; }
        _super.call(this, players, result);
        this.players = players;
        this.result = result;
    }
    NullGame.prototype.win = function (playerNum) {
    };
    NullGame.prototype.getLog = function (player) {
        return { enemy: new NullPlayer() };
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
        var players = playerTable.players;
        players.forEach(function (player) {
            _this.map[player.name] = [];
        });
    }
    GameTable.prototype.getWinMark = function (win) {
        return win ? "○" : "●";
    };
    GameTable.prototype.add = function (game) {
        var _this = this;
        this.games.push(game);
        game.iteratePlayerNum(function (playerNum) {
            _this.map[game.players[playerNum].name].push(game);
        });
        if (game.result) {
            game.win(0);
        }
    };
    GameTable.prototype.addDoneGames = function (doneGames) {
        var _this = this;
        doneGames.map(function (arr) { return Game.create(arr, true); }).forEach(function (game) { return _this.add(game); });
    };
    GameTable.prototype.addRemainingGames = function (remainingGames) {
        var _this = this;
        remainingGames.map(function (arr) { return Game.create(arr, false); }).forEach(function (game) { return _this.add(game); });
    };
    GameTable.prototype.printSearched = function () {
        var _this = this;
        var max = this.search();
        var div = document.getElementById("table");
        var table = document.createElement("table");
        var newtr = table.insertRow(table.rows.length);
        var texts = ["棋士", "勝敗", "順", "確", "挑", "プ", "降"];
        if (!this.setting.playoff)
            texts.splice(4, 2, "昇");
        texts.forEach(function (text) {
            var t = document.createTextNode(text);
            var newth = document.createElement("th");
            newth.appendChild(t);
            newtr.appendChild(newth);
        });
        //		newtr.innerHTML="<th>棋士</th><th>勝敗</th><th>順</th><th>確</th><th>挑</th><th>プ</th><th>降</th>";
        this.playerTable.players.forEach(function (player) {
            var newtr = table.insertRow(table.rows.length);
            var mark = "";
            if (player.countChallenge == max) {
                newtr.className = "challenge";
                mark = "挑";
            }
            else if (player.countPlayoff == max) {
                newtr.className = "playoff";
                mark = "プ";
            }
            else if (player.countDown == max) {
                newtr.className = "down";
                mark = "降";
            }
            else if (player.countUp == max) {
                newtr.className = "up";
                mark = "昇";
            }
            var newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.name));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.win + "-" + player.lose));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode((player.rank + 1).toString()));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(mark));
            if (_this.setting.playoff) {
                newtd = newtr.insertCell(newtr.cells.length);
                newtd.className = "count";
                newtd.appendChild(document.createTextNode(player.countChallenge.toString()));
                newtd = newtr.insertCell(newtr.cells.length);
                newtd.className = "count";
                newtd.appendChild(document.createTextNode(player.countPlayoff.toString()));
            }
            else {
                newtd = newtr.insertCell(newtr.cells.length);
                newtd.className = "count";
                newtd.appendChild(document.createTextNode(player.countUp.toString()));
            }
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.className = "count";
            newtd.appendChild(document.createTextNode(player.countDown.toString()));
            _this.map[player.name].forEach(function (game) {
                newtd = newtr.insertCell(newtr.cells.length);
                var log = game.getLog(player);
                if (typeof log.win === "undefined") {
                    newtd.appendChild((function () {
                        var div = document.createElement("div");
                        div.appendChild((function () {
                            var span = document.createElement("span");
                            span.className = "result";
                            span.appendChild(ToggleSetting(player.name, log.enemy.name));
                            return span;
                        })());
                        div.appendChild((function () {
                            var span = document.createElement("span");
                            span.className = "name";
                            span.textContent = log.enemy.name;
                            return span;
                        })());
                        return div;
                    })());
                }
                else {
                    newtd.innerHTML = "<div><span class='result'>" + _this.getWinMark(log.win) + "</span>" + "<span class='name'>" + log.enemy.name + "</span></div>";
                }
            });
        });
        div.appendChild(table);
    };
    GameTable.prototype.print = function (tempGames) {
        var _this = this;
        var div = document.getElementById("search");
        var table = document.createElement("table");
        tempGames.forEach(function (game) { return table.className += " res" + (game.temp == 0 ? game.players : [game.players[1], game.players[0]]).map(function (player) { return player.name; }).join("_"); });
        this.playerTable.players.forEach(function (player) {
            var newtr = table.insertRow(table.rows.length);
            if (player.challenge)
                newtr.className = "challenge";
            else if (player.playoff)
                newtr.className = "playoff";
            else if (player.down)
                newtr.className = "down";
            else if (player.up)
                newtr.className = "up";
            var newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.name));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.win + "-" + player.lose));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode((player.rank + 1).toString()));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.challenge ? "挑" : (player.playoff ? "プ" : (player.down ? "降" : (player.up ? "昇" : "")))));
            _this.map[player.name].forEach(function (game) {
                var log = game.getLog(player);
                if (!log.temp)
                    return;
                newtd = newtr.insertCell(newtr.cells.length);
                newtd.innerHTML = "<div class='result'>" + (typeof log.win === "undefined" ? "-" : _this.getWinMark(log.win)) + "<span class='name'>" + (log.temp ? log.enemy.name.slice(0, 1) : "") + "</span></div>";
            });
        });
        table.style.display = "inline-block";
        div.appendChild(table);
    };
    GameTable.prototype.printLine = function (tempGames) {
        var _this = this;
        var table = document.getElementById("searchtable");
        var newtr = table.insertRow(table.rows.length);
        tempGames.forEach(function (game) { return newtr.className += " res" + (game.temp == 0 ? game.players : [game.players[1], game.players[0]]).map(function (player) { return player.name; }).join("_"); });
        this.playerTable.players.forEach(function (player) {
            var newtd = newtr.insertCell(newtr.cells.length);
            if (player.challenge)
                newtd.className = "challenge";
            else if (player.playoff)
                newtd.className = "playoff";
            else if (player.down)
                newtd.className = "down";
            else if (player.up)
                newtd.className = "up";
            newtd.innerHTML = player.win + "-" + player.lose;
            _this.map[player.name].forEach(function (game) {
                var log = game.getLog(player);
                if (!log.temp)
                    return;
                newtd.innerHTML += "<span class='result'>" + (typeof log.win === "undefined" ? "-" : _this.getWinMark(log.win)) + "</span>";
            });
            newtd.innerHTML += "(" + (player.rank + 1) + ")";
        });
        //table.appendChild(newtr);
    };
    GameTable.prototype.rankPlayers = function () {
        var players = this.playerTable.players.slice(0);
        players.forEach(function (player, num) {
            player.resetFlags();
            player.order = num;
        });
        players.sort(function (p1, p2) { return p1.win != p2.win ? p2.win - p1.win : p1.order - p2.order; });
        //		console.log(players.map((p)=>p.name+" "+p.win+" "+p.order).join())
        players.forEach(function (player, num) {
            player.rank = num;
        });
        var flagPlayoff = false;
        if (this.setting.playoff) {
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
                players[i].up = true;
                players[i].countUp++;
            }
        }
        for (var i = 0; i < players.length && i < this.setting.down; i++) {
            players[players.length - 1 - i].down = true;
            players[players.length - 1 - i].countDown++;
        }
    };
    GameTable.prototype.search = function () {
        this.playerTable.players.forEach(function (player) {
            player.resetCounts();
        });
        var table = document.getElementById("searchtable");
        var newtr = table.insertRow(0);
        this.playerTable.players.forEach(function (player) {
            newtr.appendChild((function () {
                var th = document.createElement("th");
                th.innerHTML = player.name;
                return th;
            })());
        });
        var remainingGames = this.games.filter(function (game) { return !game.result && !(game instanceof NullGame); });
        this.searchAndRank(remainingGames, 0);
        return Math.pow(2, remainingGames.length);
    };
    GameTable.prototype.searchAndRank = function (remainingGames, i) {
        var _this = this;
        if (remainingGames.length <= i) {
            this.rankPlayers();
            this.printLine(remainingGames);
            return;
        }
        var game = remainingGames[i];
        game.iteratePlayerNum(function (playerNum) {
            game.tempWin(playerNum);
            _this.searchAndRank(remainingGames, i + 1);
            game.tempWinBack();
        });
    };
    return GameTable;
})();
function ToggleSetting(win, lose) {
    var button = document.createElement("button");
    button.className = "button" + win + "_" + lose;
    button.textContent = "？";
    var start = true;
    button.onclick = onClick;
    function offClick() {
        removeCSSRules(".res" + win + "_" + lose);
        removeCSSRules(".res" + lose + "_" + win);
        document.getElementsByClassName("button" + win + "_" + lose)[0].textContent = "？";
        document.getElementsByClassName("button" + lose + "_" + win)[0].textContent = "？";
        button.onclick = onClick;
    }
    function onClick() {
        addCSSRules(".res" + lose + "_" + win + "{display:none;}");
        removeCSSRules(".res" + win + "_" + lose);
        document.getElementsByClassName("button" + win + "_" + lose)[0].textContent = "○";
        document.getElementsByClassName("button" + lose + "_" + win)[0].textContent = "●";
        button.onclick = offClick;
    }
    return button;
}
function drawTable(playerTable, doneGames, remainingGames, setting) {
    var gameTable = new GameTable(playerTable, setting);
    doneGames.map(function (arr) { return new Game(arr, true); }).forEach(function (game) { return gameTable.add(game); });
    remainingGames.map(function (arr) { return new Game(arr, false); }).forEach(function (game) { return gameTable.add(game); });
    gameTable.printSearched();
    //gameTable.printTable();
}
function addCSSRules(cssTexts) {
    if (!(cssTexts instanceof Array))
        cssTexts = [cssTexts];
    cssTexts.forEach(function (cssText) {
        document.styleSheets.item(0).insertRule(cssText, 0);
    });
}
function removeCSSRules(cssSelectors) {
    if (!(cssSelectors instanceof Array))
        cssSelectors = [cssSelectors];
    var css = document.styleSheets.item(0);
    for (var i = css.cssRules.length - 1; i >= 0; i--) {
        var rule = css.cssRules[i];
        if (cssSelectors.indexOf(rule.selectorText) >= 0) {
            css.deleteRule(i);
        }
    }
}
