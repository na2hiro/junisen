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
//		newtr.innerHTML="<th>棋士</th><th>勝敗</th><th>順</th><th>確</th><th>挑</th><th>プ</th><th>降</th>";
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
				newtd.innerHTML = "<div><span class='result'>"+(typeof log.win === "undefined" ? "　" : this.getWinMark(log.win))+"</span>"
						+"<span class='name'>"+log.enemy.name+"</span></div>";
			});
		});
		div.appendChild(table);
	}
	print(tempGames: Game[]){
		var div = document.getElementById("search");
		var table = <HTMLTableElement>document.createElement("table");
		tempGames.forEach((game)=>table.className+=" res"+game.players[0].name+"_"+game.players[1].name);
		this.playerTable.players.forEach((player)=>{
			var newtr = <HTMLTableRowElement>table.insertRow(table.rows.length);
			if(player.challenge) newtr.className="challenge";
			else if(player.playoff) newtr.className="playoff";
			else if(player.down) newtr.className="down";
			var newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(player.name));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(player.win+"-"+player.lose));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode((player.rank+1).toString()));
			newtd = newtr.insertCell(newtr.cells.length);
			newtd.appendChild(document.createTextNode(player.challenge ? "挑" : (player.playoff ? "プ" : (player.down ? "降" : ""))));
			
			this.map[player.name].forEach((game)=>{
				var log = game.getLog(player);
				if(!log.temp)return;
				newtd = newtr.insertCell(newtr.cells.length);
				newtd.innerHTML = "<div class='result'>"+(typeof log.win === "undefined" ? "-" : this.getWinMark(log.win))+"<span class='name'>"+(log.temp?log.enemy.name.slice(0,1):"")+"</span></div>";
			});
		});
		table.style.display="inline-block"
		div.appendChild(table);
	}
	printLine(tempGames: Game[]){
		var table = <HTMLTableElement>document.getElementById("searchtable");
		var newtr = <HTMLTableRowElement>table.insertRow(table.rows.length);
		tempGames.forEach((game)=>newtr.className+=" res"+game.players[0].name+"_"+game.players[1].name);
		this.playerTable.players.forEach((player)=>{
			var newtd = newtr.insertCell(newtr.cells.length);

			if(player.challenge) newtd.className="challenge";
			else if(player.playoff) newtd.className="playoff";
			else if(player.down) newtd.className="down";
			newtd.innerHTML=player.win+"-"+player.lose;
			
			this.map[player.name].forEach((game)=>{
				var log = game.getLog(player);
				if(!log.temp)return;
				newtd.innerHTML+= "<span class='result'>"+(typeof log.win === "undefined" ? "-" : this.getWinMark(log.win))+"</span>";
			});
			newtd.innerHTML+="("+(player.rank+1)+")";
		});
		//table.appendChild(newtr);
	}
	rankPlayers(){
		var players=this.playerTable.players.slice(0);
		players.forEach((player, num)=>{
			player.resetFlags();
			player.order=num;
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
	}
	search(){
		this.playerTable.players.forEach((player)=>{
			player.resetCounts();
		});
		var table = <HTMLTableElement>document.getElementById("searchtable");
		var newtr = table.insertRow(0);
		this.playerTable.players.forEach((player)=>{
			newtr.appendChild((()=>{
				var th = document.createElement("th");
				th.innerHTML=player.name;
				return th;
			})());
		});
		var remainingGames = this.games.filter((game)=>!game.result);
		this.searchAndRank(remainingGames, 0);
		return Math.pow(2, remainingGames.length);
	}
	searchAndRank(remainingGames: Game[], i: number){
		if(remainingGames.length<=i){
			this.rankPlayers();
			this.printLine(remainingGames);
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

function drawTable(playerTable, doneGames, remainingGames, setting){
	var gameTable = new GameTable(playerTable, setting);
	doneGames.map((arr)=>new Game(arr, true)).forEach((game)=>gameTable.add(game));
	remainingGames.map((arr)=>new Game(arr, false)).forEach((game)=>gameTable.add(game));

	gameTable.printSearched();
	//gameTable.printTable();
	
}






/*
function addCSSRules(cssTexts){
	if(!(cssTexts instanceof Array)) cssTexts=[cssTexts];
	cssTexts.forEach(function(cssText){
		(<CSSStyleSheet>document.styleSheets.item(0)).insertRule(cssText,0);
	});
}
function removeCSSRules(cssSelectors){
	if(!(cssSelectors instanceof Array)) cssSelectors=[cssSelectors];
	var css=<CSSStyleSheet>document.styleSheets.item(0);
	for(var i=css.cssRules.length-1; i>=0; i--){
		var rule = css.cssRules[i];
		if(cssSelectors.indexOf(rule.selectorText)>=0){
			css.deleteRule(i);
		}
	}
}*/