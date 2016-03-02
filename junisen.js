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
    }
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
    GameTable.prototype.getWinMark = function (win) { return win ? "○" : "●"; };
    GameTable.prototype.add = function (game) {
        this.games.push(game);
        this.map[game.players[0].name].push(game);
        this.map[game.players[1].name].push(game);
        if (game.result) {
            game.players[0].win++;
            game.players[1].lose++;
        }
    };
    GameTable.prototype.tempWin = function (game) {
        game.players[0].win++;
        game.players[1].lose++;
        game.tempWin(game.players[0]);
    };
    GameTable.prototype.tempWinBack = function (game) {
        game.players[0].win--;
        game.players[1].lose--;
        game.tempWinBack();
    };
    GameTable.prototype.tempLose = function (game) {
        game.players[0].lose++;
        game.players[1].win++;
        game.tempWin(game.players[1]);
    };
    GameTable.prototype.tempLoseBack = function (game) {
        game.players[0].lose--;
        game.players[1].win--;
        game.tempWinBack();
    };
    GameTable.prototype.printSearched = function () {
        var _this = this;
        var max = this.search();
        var div = document.getElementById("table");
        var table = document.createElement("table");
        var newtr = table.insertRow(table.rows.length);
        var texts = ["棋士", "勝敗", "順", "確", "挑", "プ", "降"];
        texts.forEach(function (text) {
            var t = document.createTextNode(text);
            var newth = document.createElement("th");
            newth.appendChild(t);
            newtr.appendChild(newth);
        });
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
            var newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.name));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(player.win + "-" + player.lose));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode((player.rank + 1).toString()));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.appendChild(document.createTextNode(mark));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.className = "count";
            newtd.appendChild(document.createTextNode(player.countChallenge.toString()));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.className = "count";
            newtd.appendChild(document.createTextNode(player.countPlayoff.toString()));
            newtd = newtr.insertCell(newtr.cells.length);
            newtd.className = "count";
            newtd.appendChild(document.createTextNode(player.countDown.toString()));
            _this.map[player.name].forEach(function (game) {
                newtd = newtr.insertCell(newtr.cells.length);
                var log = game.getLog(player);
                if (typeof log.win == "undefined") {
                    newtd.appendChild(function () {
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
                    }());
                }
                else {
                    newtd.innerHTML = "<div><span class='result'>" + (typeof log.win === "undefined" ? "　" : _this.getWinMark(log.win)) + "</span>"
                        + "<span class='name'>" + log.enemy.name + "</span></div>";
                }
            });
        });
        div.appendChild(table);
        var table = document.getElementById("searchtable");
        this.searched.forEach(function (row, n) {
            _this.insertLineByObj(row, n, table);
        });
    };
    GameTable.prototype.insertLineByObj = function (tempPlayers, n, table) {
        var _this = this;
        var newtr = table.insertRow(table.rows.length);
        //		newtr.className = tempGames.map((game)=>"res"+game.players[0].name+"_"+game.players[1].name).join(" ");
        tempPlayers.forEach(function (player) {
            var newtd = newtr.insertCell(newtr.cells.length);
            if (player.challenge)
                newtd.className = "challenge";
            else if (player.playoff)
                newtd.className = "playoff";
            else if (player.down)
                newtd.className = "down";
            newtd.innerHTML = player.win + "-" + player.lose
                + player.result.map(function (win) {
                    if (win === null)
                        return null;
                    return _this.getWinMark(win);
                }).filter(function (n) { return n; }).join("") + "(" + (player.rank + 1) + ")";
        });
        //table.appendChild(newtr);
        var newtd = newtr.insertCell(newtr.cells.length);
        newtd.textContent = ("0000000000" + n.toString(2)).substr(-10);
    };
    GameTable.prototype.rankPlayers = function () {
        var players = this.playerTable.players.slice(0);
        players.forEach(function (player, num) {
            player.resetFlags();
            player.order = num;
        });
        players.sort(function (p1, p2) { return p1.win != p2.win ? p2.win - p1.win : p1.order - p2.order; });
        //console.log(players.map((p)=>p.name+" "+p.win+" "+p.order).join())
        players.forEach(function (player, num) {
            player.rank = num;
        });
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
        for (var i = 0; i < players.length && i < this.setting.down; i++) {
            players[players.length - 1 - i].down = true;
            players[players.length - 1 - i].countDown++;
        }
        var ret = [];
        for (var i = 0; i < this.playerTable.players.length; i++) {
            var player = this.playerTable.players[i];
            ret.push({
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
        return ret;
    };
    GameTable.prototype.search = function () {
        this.searched = [];
        this.playerTable.players.forEach(function (player) {
            player.resetCounts();
        });
        var table = document.getElementById("searchtable");
        var newtr = table.insertRow(0);
        this.playerTable.players.forEach(function (player) {
            newtr.appendChild((function () {
                var th = document.createElement("th");
                th.textContent = player.name;
                return th;
            })());
        });
        var remainingGames = this.games.filter(function (game) { return !game.result; });
        this.searchAndRank(remainingGames, 0);
        return Math.pow(2, remainingGames.length);
    };
    GameTable.prototype.searchAndRank = function (remainingGames, i) {
        if (remainingGames.length <= i) {
            var ranks = this.rankPlayers();
            this.searched.push(ranks);
            return;
        }
        var game = remainingGames[i];
        this.tempWin(game);
        this.searchAndRank(remainingGames, i + 1);
        this.tempWinBack(game);
        this.tempLose(game);
        this.searchAndRank(remainingGames, i + 1);
        this.tempLoseBack(game);
    };
    return GameTable;
})();
var gameTable;
function drawTable(playerTable, doneGames, remainingGames, setting) {
    gameTable = new GameTable(playerTable, setting);
    doneGames.map(function (arr) { return new Game(arr, true); }).forEach(function (game) { return gameTable.add(game); });
    remainingGames.map(function (arr) { return new Game(arr, false); }).forEach(function (game) { return gameTable.add(game); });
    gameTable.printSearched();
    //gameTable.printTable();
}
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
        if (cssSelectors.indexOf(rule.cssText) >= 0) {
            css.deleteRule(i);
        }
    }
}
//# sourceMappingURL=junisen.js.map