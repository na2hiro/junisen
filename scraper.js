var names = collectNames();
var games = tableToGames(collectTable());
var doneGames = $.map(games.done, function (n) {
    return n;
});
var notyetGames = $.map(games.notyet, function (n) {
    return n;
});

console.log("var names =" + JSON.stringify(names) + ";\n"
    + "var doneGames =" + JSON.stringify(doneGames) + ";\n"
    + "var notyetGames =" + JSON.stringify(notyetGames) + ";\n");

function collectNames() {
    var names = $("table.league tbody tr td:nth-child(3)").map(function (n, tr) {
        return tr.textContent;
    });
    var ret = [];
    for (var i = 0; i < names.length; i++) {
        ret.push(names[i]);
    }
    return ret;
}
function getIndex(name) {
    for (var i = 0; i < names.length; i++) {
        if (names[i].indexOf(name) == 0)return i;
    }
    throw "no match: " + name;
}
function collectTable() {
    var matrix = $("table.league tbody tr").map(function (n, tr) {
        return $(tr.children).slice(5)
    });
    var ret = [];
    for (var i = 0; i < matrix.length; i++) {
        var row = [];
        for (var j = 0; j < matrix[i].length; j++) {
            row.push(formatCellInfo(getCellInfo(matrix[i][j]), i));
        }
        ret.push(row);
    }
    return ret;
}
function getCellInfo(td) {
    var tmp = td.textContent.split(/\n/).map(function (s) {
        return s.trim();
    });
    return {
        score: (tmp[0] == "○" ? 1 : (tmp[0] == "●" ? -1 : 0)),
        enemy: getIndex(tmp[1])
    };
}
function formatCellInfo(cellInfo, index) {
    if (cellInfo.score == 0) return [Infinity, index, cellInfo.enemy].sort();
    return cellInfo.score == 1 ? [index, cellInfo.enemy] : [cellInfo.enemy, index];
}
function tableToGames(table) {
    var ret = [];
    var notyet = [];
    for (var j = 0; j < table[0].length; j++) {
        var notyetround = false;
        var round = [];
        for (var i = 0; i < table.length; i++) {
            var game = table[i][j];
            if (game.length == 3) {
                notyetround = true;
                game = [game[0], game[1]];
            }
            if (round.every(function (g) {
                    return g[0] != game[0]
                })) round.push(game);
        }
        if (notyetround) {
            notyet.push(round);
        } else {
            ret.push(round);
        }
    }
    return {done: ret, notyet: notyet};
}
