class Player {
    win = 0;
    lose = 0;
    order:number;
    rank:number;
    challenge:Boolean;
    playoff:Boolean;
    down:Boolean;
    countChallenge = 0;
    countPlayoff = 0;
    countDown = 0;
    abbrev:string;

    constructor(public name:string) {
    }

    resetCounts() {
        this.countDown = this.countChallenge = this.countPlayoff = 0;
    }

    resetFlags() {
        this.down = this.challenge = this.playoff = false;
    }
}
class PlayerTable {
    constructor(public players:Player[]) {
        players.map(function (player) {
            for (var l = 2; l <= player.name.length; l++) {
                var abbrev = player.name.slice(0, l);
                if (players.every(function (p) {
                        return player.name == p.name || p.name.indexOf(abbrev) != 0
                    })) {
                    player.abbrev = abbrev;
                    return;
                }
            }
        });
    }

    writeOrder() {
        this.players.forEach((player, num)=> {
            player.order = num;
        });
    }
}

interface Log {
    enemy: Player;
    win?: Boolean;
    temp?: Boolean;
}

class Game {
    constructor(public players:Player[], public result = false) {
    }

    getLog(player:Player):Log {
        var enemy = this.players[0] == player ? this.players[1] : this.players[0];
        if (this.result) {
            return {enemy: enemy, win: this.players[0] == player};
        } else if (this.temp != null) {
            return {enemy: enemy, win: this.temp == player, temp: true};
        } else {
            return {enemy: enemy};
        }
    }

    temp:Player;

    tempWin(player:Player) {
        this.temp = player;
    }

    tempWinBack() {
        this.temp = null;
    }
}
class NullGame extends Game {
    getLog(player:Player):Log {
        return {enemy: null};
    }
}
interface LeagueSetting {
    playoff: boolean;
    up: number;
    down: number;
    ten?: boolean;
}
class GameTable {
    static getWinMark(win:Boolean) {
        return win ? "○" : "●";
    }

    map:{[name: string]: Game[];} = {};
    games:Game[] = [];

    constructor(private playerTable:PlayerTable, private setting:LeagueSetting) {
        playerTable.writeOrder();
        playerTable.players.forEach((player)=> {
            this.map[player.name] = [];
        });
    }

    add(game:Game) {
        this.games.push(game);
        for (var i = 0; i < game.players.length; i++) {
            this.map[game.players[i].name].push(game);
        }
        if (game.result) {
            game.players[0].win++;
            game.players[1].lose++;
        }
    }

    static settingToString(setting: LeagueSetting){
        return (setting.playoff ? "挑戦1名(プレーオフあり)":"昇級"+setting.up+"名")+" 降級"+(setting.ten ? "点" : "")+setting.down+"名";
    }

    static tempWin(game:Game) {
        game.players[0].win++;
        game.players[1].lose++;
        game.tempWin(game.players[0]);
    }

    static tempWinBack(game:Game) {
        game.players[0].win--;
        game.players[1].lose--;
        game.tempWinBack();
    }

    static tempLose(game:Game) {
        game.players[0].lose++;
        game.players[1].win++;
        game.tempWin(game.players[1]);
    }

    static tempLoseBack(game:Game) {
        game.players[0].lose--;
        game.players[1].win--;
        game.tempWinBack();
    }

    printSearched() {
        var max = this.search();
        var div = document.getElementById("table");
        var text = document.createTextNode(GameTable.settingToString(this.setting));
        div.appendChild(text);
        var table = <HTMLTableElement>document.createElement("table");
        var newTr = <HTMLTableRowElement>table.insertRow(table.rows.length);
        var texts = ["棋士", "勝敗", "順", "確"];
        if (this.setting.playoff) {
            texts.push("挑");
            texts.push("プ");
        } else {
            texts.push("昇");
        }
        texts.push("降");
        texts.forEach((text)=> {
            var t = document.createTextNode(text);
            var newTh = document.createElement("th");
            newTh.appendChild(t);
            newTr.appendChild(newTh);
        });
        var numRounds = 0;
        this.playerTable.players.forEach((player)=> {
            var newTr = <HTMLTableRowElement>table.insertRow(table.rows.length);
            var mark = "";
            if (player.countChallenge == max) {
                newTr.className = "challenge";
                mark = this.setting.playoff ? "挑" : "昇";
            } else if (player.countPlayoff == max) {
                newTr.className = "playoff";
                mark = "プ";
            } else if (player.countDown == max) {
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
            if (this.setting.playoff) {
                newTd = newTr.insertCell(newTr.cells.length);
                newTd.className = "count";
                newTd.appendChild(document.createTextNode(player.countPlayoff.toString()));
            }
            newTd = newTr.insertCell(newTr.cells.length);
            newTd.className = "count";
            newTd.appendChild(document.createTextNode(player.countDown.toString()));

            var numRoundsInner = 0;
            this.map[player.name].forEach((game)=> {
                numRoundsInner++;
                newTd = newTr.insertCell(newTr.cells.length);
                var log = game.getLog(player);
                if (!log.enemy) {
                } else if (typeof log.win == "undefined") {
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
                } else {
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

        var table = <HTMLTableElement>document.getElementById("searchtable");
        this.searched.forEach((row)=> {
            this.insertLineByObj(row, table);
        })
    }

    insertLineByObj(tempPlayers:{players: any[], games: any[]}, table:HTMLTableElement) {
        var newTr = <HTMLTableRowElement>table.insertRow(table.rows.length);
        newTr.className = tempPlayers.games.map((game)=>"res" + game.win + "_" + game.lose).join(" ");
        tempPlayers.players.forEach((player)=> {
            var newTd = newTr.insertCell(newTr.cells.length);

            if (player.challenge) newTd.className = "challenge";
            else if (player.playoff) newTd.className = "playoff";
            else if (player.down) newTd.className = "down";
            newTd.innerHTML = player.win + "-" + player.lose
                + player.result.map((win)=> {
                    if (win === null)return null;
                    return GameTable.getWinMark(win);
                }).filter(n=>n).join("") + "(" + (player.rank + 1) + ")";
        });
    }

    rankPlayers(games:Game[]) {
        var players = this.playerTable.players.slice(0);
        players.forEach((player)=> {
            player.resetFlags();
        });
        players.sort((p1, p2)=>p1.win != p2.win ? p2.win - p1.win : p1.order - p2.order);
        players.forEach((player, num)=> {
            player.rank = num;
        });
        if (this.setting.playoff) {
            // assume only 1 can challenge
            var flagPlayoff = false;
            for (var i = 1; i < players.length; i++) {
                if (players[0].win != players[i].win) break;
                flagPlayoff = true;
                players[i].playoff = true;
                players[i].countPlayoff++;
            }
            if (flagPlayoff) {
                players[0].playoff = true;
                players[0].countPlayoff++;
            } else {
                players[0].challenge = true;
                players[0].countChallenge++;
            }
        } else {
            for (var i = 0; i < players.length && i < this.setting.up; i++) {
                players[i].challenge = true;
                players[i].countChallenge++;
            }
        }

        for (var i = 0; i < players.length && i < this.setting.down; i++) {
            players[players.length - 1 - i].down = true;
            players[players.length - 1 - i].countDown++;
        }

        var ret = {players: [], games: []};
        for (var i = 0; i < this.playerTable.players.length; i++) {
            var player = this.playerTable.players[i];
            ret.players.push({
                win: player.win,
                lose: player.lose,
                playoff: player.playoff,
                challenge: player.challenge,
                down: player.down,
                rank: player.rank,
                result: this.map[player.name].map((game)=> {
                    var log = game.getLog(player);
                    if (!log.temp)return null;
                    return log.win;
                }).filter(n=>n !== null),
            })
        }
        for (var i = 0; i < games.length; i++) {
            var game = games[i];
            ret.games.push({
                win: game.temp == game.players[0] ? game.players[0].order : game.players[1].order,
                lose: game.temp == game.players[0] ? game.players[1].order : game.players[0].order,
            })
        }
        return ret;
    }

    searched:{players: any[]; games: any[]}[];

    search() {
        this.searched = [];
        this.playerTable.players.forEach((player)=> {
            player.resetCounts();
        });

        var table = <HTMLTableElement>document.getElementById("searchtable");
        var newTr = table.insertRow(0);
        this.playerTable.players.forEach((player)=> {
            newTr.appendChild((()=> {
                var th = document.createElement("th");
                th.textContent = player.abbrev;
                return th;
            })());
        });
        var remainingGames = this.games.filter((game)=>!game.result && !(game instanceof NullGame));
        this.searchAndRank(remainingGames, 0);
        return Math.pow(2, remainingGames.length);
    }

    searchAndRank(remainingGames:Game[], i:number) {
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
    }
}
var gameTable;
function drawTable(names, doneGames, remainingGames, setting) {
    var players = names.map(function (n) {
        return new Player(n)
    });
    var playerTable = new PlayerTable(players);
    doneGames = toP(doneGames);
    remainingGames = toP(remainingGames);

    function toP(indices) {
        return indices.map(function (g) {
            return g.map(function (pn) {
                return players[pn]
            })
        });
    }

    gameTable = new GameTable(playerTable, setting);
    doneGames.map((arr)=> {
        if (arr.length == 1) {
            return new NullGame(arr);
        } else {
            return new Game(arr, true);
        }
    }).forEach((game)=>gameTable.add(game));
    remainingGames.filter(arr=>arr.length == 2).map((arr)=>new Game(arr, false)).forEach((game)=>gameTable.add(game));
    gameTable.printSearched();

}
var toggleState:{[key: string]: any} = {};
function ToggleSetting(win:number, lose:number) {
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
        } else {
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
var styleSheet = <CSSStyleSheet>style.sheet;
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
