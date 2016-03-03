class Player{
	win=0;
	lose=0;
	order: number;
	rank: number;
	challenge: Boolean;
	playoff: Boolean;
	down: Boolean;
	countChallenge=0;
	countPlayoff=0;
	countDown=0;
	constructor(public name: string){}
	resetCounts(){
		this.countDown=this.countChallenge=this.countPlayoff=0;
	}
	resetFlags(){
		this.down=this.challenge=this.playoff=false;
	}
}
class PlayerTable{
	constructor(public players: Player[]){}
	writeOrder(){
		this.players.forEach((player, num)=>{
			player.order=num;
		});
	}
}

interface Log{
	enemy: Player;
	win?: Boolean;
	temp?: Boolean;
}

class Game{
	constructor(public players: Player[], public result = false){
	}
	getLog(player: Player): Log{
		var enemy = this.players[0]==player ? this.players[1] : this.players[0];
		if(this.result){
			return {enemy: enemy, win: this.players[0]==player};
		}else if(this.temp!=null){
			return {enemy: enemy, win: this.temp==player, temp: true};
		}else{
			return {enemy: enemy};
		}
	}
	temp: Player;
	tempWin(player: Player){
		this.temp=player;
	}
	tempWinBack(){
		this.temp=null;
	}
}
interface LeagueSetting{
	down: number;
}
class GameTable{
	getWinMark(win: Boolean){return win ? "○" : "●" }
	map: {[name: string]: Game[];} = {};
	games: Game[] = [];
	constructor(private playerTable: PlayerTable, private setting: LeagueSetting){
		playerTable.writeOrder();
		var players = playerTable.players;
		players.forEach((player)=>{
			this.map[player.name] = [];
		});
	}
	add(game: Game){
		this.games.push(game);
		this.map[game.players[0].name].push(game);
		this.map[game.players[1].name].push(game);
		if(game.result){
			game.players[0].win++;
			game.players[1].lose++;
		}
	}
	tempWin(game: Game){
		game.players[0].win++;
		game.players[1].lose++;
		game.tempWin(game.players[0]);
	}
	tempWinBack(game: Game){
		game.players[0].win--;
		game.players[1].lose--;
		game.tempWinBack();
	}
	tempLose(game: Game){
		game.players[0].lose++;
		game.players[1].win++;
		game.tempWin(game.players[1]);
	}
	tempLoseBack(game: Game){
		game.players[0].lose--;
		game.players[1].win--;
		game.tempWinBack();
	}
	printSearched(){
		var max = this.search();
		var div = document.getElementById("table");
		var table = <HTMLTableElement>document.createElement("table");
		var newtr = <HTMLTableRowElement>table.insertRow(table.rows.length);
		var texts = ["棋士","勝敗","順","確","挑","プ","降"];
		texts.forEach((text)=>{
			var t = document.createTextNode(text)
			var newth = document.createElement("th");
			newth.appendChild(t);
			newtr.appendChild(newth);
		});
		this.playerTable.players.forEach((player)=>{
			var newtr = <HTMLTableRowElement>table.insertRow(table.rows.length);
			var mark="";
			if(player.countChallenge==max){
				newtr.className="challenge";
				mark="挑"
			}else if(player.countPlayoff==max){
				newtr.className="playoff";
				mark="プ"
			}else if(player.countDown==max){
				newtr.className="down";
				mark="降"
			}
			var newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(player.name));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(player.win+"-"+player.lose));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode((player.rank+1).toString()));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(mark));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.className="count";
			newtd.appendChild(document.createTextNode(player.countChallenge.toString()));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.className="count";
			newtd.appendChild(document.createTextNode(player.countPlayoff.toString()));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.className="count";
			newtd.appendChild(document.createTextNode(player.countDown.toString()));
			
			this.map[player.name].forEach((game)=>{
				newtd = newtr.insertCell(newtr.cells.length);
				var log = game.getLog(player);
				if(typeof log.win=="undefined"){
					newtd.appendChild(function(){
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
							span.textContent = log.enemy.name;
							return span;
						})());
						return div;
					}())
				}else{
					newtd.innerHTML = "<div><span class='result'>"+(typeof log.win === "undefined"? "　" : this.getWinMark(log.win))+"</span>"
						+"<span class='name'>"+log.enemy.name+"</span></div>";
				}
			});
		});
		div.appendChild(table);

		var table = <HTMLTableElement>document.getElementById("searchtable");
		this.searched.forEach((row, n)=>{
			this.insertLineByObj(row, n, table);
		})
	}
	insertLineByObj(tempPlayers: {players: any[], games: any[]}, n, table){
		var newtr = <HTMLTableRowElement>table.insertRow(table.rows.length);
		newtr.className = tempPlayers.games.map((game)=>"res"+game.win+"_"+game.lose).join(" ");
		tempPlayers.players.forEach((player)=>{
			var newtd = newtr.insertCell(newtr.cells.length);

			if(player.challenge) newtd.className="challenge";
			else if(player.playoff) newtd.className="playoff";
			else if(player.down) newtd.className="down";
			newtd.innerHTML=player.win+"-"+player.lose
				+player.result.map((win)=>{
					if(win===null)return null;
					return this.getWinMark(win);
				}).filter(n=>n).join("")+"("+(player.rank+1)+")";
		});
	}
	rankPlayers(games: Game[]){
		var players=this.playerTable.players.slice(0);
		players.forEach((player, num)=>{
			player.resetFlags();
		});
		players.sort((p1, p2)=>p1.win!=p2.win ? p2.win-p1.win : p1.order-p2.order);
		//console.log(players.map((p)=>p.name+" "+p.win+" "+p.order).join())
		players.forEach((player, num)=>{
			player.rank=num;
		});
		var flagPlayoff=false;
		for(var i=1; i<players.length; i++){
			if(players[0].win!=players[i].win) break;
			flagPlayoff=true;
			players[i].playoff=true;
			players[i].countPlayoff++;
		}
		if(flagPlayoff){
			players[0].playoff=true;
			players[0].countPlayoff++;
		}else{
			players[0].challenge=true;
			players[0].countChallenge++;
		}

		for(var i=0; i<players.length && i<this.setting.down; i++){
			players[players.length-1-i].down=true;
			players[players.length-1-i].countDown++;
		}

		var ret = {players: [], games: []};
		for(var i=0; i<this.playerTable.players.length; i++){
			var player = this.playerTable.players[i];
			ret.players.push({
				win: player.win,
                lose: player.lose,
				playoff: player.playoff,
				challenge: player.challenge,
				down: player.down,
				rank: player.rank,
				result: this.map[player.name].map((game)=>{
					var log = game.getLog(player);
					if(!log.temp)return null;
					return log.win;
				}).filter(n=>n!==null),
			})
		}
		for(var i=0; i<games.length; i++){
			var game = games[i];
			ret.games.push({
				win: game.temp==game.players[0] ? game.players[0].order : game.players[1].order,
				lose: game.temp==game.players[0] ? game.players[1].order : game.players[0].order,
			})
		}
		return ret;
	}
	searched: {players: any[]; games: any[]}[];
	search(){
		this.searched = [];
		this.playerTable.players.forEach((player)=>{
			player.resetCounts();
		});

		var table = <HTMLTableElement>document.getElementById("searchtable");
		var newtr = table.insertRow(0);
		this.playerTable.players.forEach((player)=>{
			newtr.appendChild((()=>{
				var th = document.createElement("th");
				th.textContent=player.name;
				return th;
			})());
		});
		var remainingGames = this.games.filter((game)=>!game.result);
		this.searchAndRank(remainingGames, 0);
		return Math.pow(2, remainingGames.length);
	}
	searchAndRank(remainingGames: Game[], i: number){
		if(remainingGames.length<=i){
			var ranks = this.rankPlayers(remainingGames);
			this.searched.push(ranks);
			return;
		}
		var game = remainingGames[i];
		this.tempWin(game);
		this.searchAndRank(remainingGames, i+1);
		this.tempWinBack(game);
		this.tempLose(game);
		this.searchAndRank(remainingGames, i+1);
		this.tempLoseBack(game);
	}
}
var gameTable
function drawTable(playerTable, doneGames, remainingGames, setting){
	gameTable = new GameTable(playerTable, setting);
	doneGames.map((arr)=>new Game(arr, true)).forEach((game)=>gameTable.add(game));
	remainingGames.map((arr)=>new Game(arr, false)).forEach((game)=>gameTable.add(game));

	gameTable.printSearched();
	//gameTable.printTable();
	
}
var toggleState: {[key: string]: any} = {};
function ToggleSetting(win, lose) {
	var id = [win, lose].sort().join("_");
	var button = document.createElement("button");
	button.className = "button" + win + "_" + lose;
	button.textContent = "？";
	var start = true;
	button.onclick = onClick;
	if(!toggleState[id]){
		toggleState[id] = {};
	}
	var state = toggleState[id];
	state["button_"+win] = button;
	function onClick() {
		if(state.css){
			removeCSSRule(state.css);
		}
		if(state.win==win){
			state.win = null;
			state.css = null;
			state["button_"+win].textContent = "？";
			state["button_"+lose].textContent = "？";
		}else{
			state.css = addCSSRule(".res" + lose + "_" + win + "{display:none;}");
			state.win = win;
			state["button_"+win].textContent = "○";
			state["button_"+lose].textContent = "●";
		}
	}
	return button;
}
var styleSheet = <CSSStyleSheet>document.styleSheets.item(0);
function addCSSRule(cssText){
	console.log("add", cssText)
	var index = styleSheet.insertRule(cssText, styleSheet.cssRules.length);
	return styleSheet.cssRules[index];
}
function removeCSSRule(item){
	console.log("remove", item.cssText)
	for(var i=0; i<styleSheet.cssRules.length; i++){
		if(styleSheet.cssRules[i]==item){
			styleSheet.deleteRule(i);
			return;
		}
	}
	console.warn("couldnt remove rule")
}
