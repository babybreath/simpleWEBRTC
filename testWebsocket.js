var WebSocket = require('ws');
var ws = new WebSocket('ws://127.0.0.1:82');
ws.on('open', function(){
	console.log('websocket已连接');
});
ws.on('close', function(){
	console.log('websocket已关闭');
});
ws.on('error', function(e){
	console.log('websocket出错->' + JSON.stringify(e));
});
ws.on('message', function(data){
	console.log('收到->' + data);
	ws.send('测试消息')
});