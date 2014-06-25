var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8081});

var allRoom = {};
wss.on('connection', function(ws){
	ws.on('close', function(){
		console.log('websocket已关闭');
		for(var i in allRoom){
			if(ws == allRoom[i].offer){
				allRoom[i].offer = null;
				console.log('room '+ i +' delete offer.');
				break;
			}
			if(ws == allRoom[i].answer){
				allRoom[i].answer = null;
				console.log('room '+ i +' delete answer.');
				break;
			}
		}
	});
	ws.on('error', function(e){
		console.log('websocket出错->' + JSON.stringify(e));
	});
	ws.on('message', function(data){
		var data = JSON.parse(data);
		console.log('收到->' + data.type);
		switch(data.type){
			case 'regist':
			var room = data.room;
			if(!allRoom[room]){
				allRoom[room] = {};
			}
			if(allRoom[room].offer == ws || allRoom[room].answer == ws){
				break;
			}
			if(!allRoom[room].offer){
				allRoom[room].offer = ws;
				ws.type = 'offer';
				ws.room = allRoom[room];
				console.log('room '+ room +' offer added.');
			}else if(!allRoom[room].answer){
				allRoom[room].answer = ws;
				ws.type = 'answer';
				ws.room = allRoom[room];
				console.log('room '+ room +' answer added.');
				// 开始通信
				ws.room.offer.send(JSON.stringify({type: 'connect_req'}));
			}else{
				ws.send(JSON.stringify({type: 'room is full.'}))
			}
			break;
			case 'offerSDP':
				ws.room.answer.send(JSON.stringify(data));
			break;
			case 'answerSDP':
				ws.room.offer.send(JSON.stringify(data));
			break;
			case 'ICE':
				if(ws.type == 'offer'){
					ws.room.answer.send(JSON.stringify(data));
				}
				if(ws.type == 'answer'){
					ws.room.offer.send(JSON.stringify(data));
				}
			break;
		}
		
	});
	ws.send(JSON.stringify({type: 'connected.'}));
});
wss.broadcast = function(data){
	for(var i in this.clients){
		this.clients[i].send(data);
	}
};

var fs = require('fs')
var http = require('http');
var indexData = fs.readFileSync('./index.html');
http.createServer(function (req, res) {
	res.end( indexData );
}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');