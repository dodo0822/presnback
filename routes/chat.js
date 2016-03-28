module.exports = function(io) {
	io.on('connection', function(socket) {
		var sockets = io.sockets.clients().sockets;
		var clients = [];
		for(var k in sockets) {
			if(k == socket.id) continue;
			clients.push(sockets[k].nickname);
		}
		var welcome = '';
		if(clients.length == 0) {
			welcome = '聊天室裡面原來沒有人。你是第一ㄍ喔OAO';
		} else {
			welcome = '聊天室原本有：';
			for(var i = 0; i < clients.length; ++i) {
				welcome += clients[i];
				if(i != clients.length-1) welcome += '、';
			}
		}
		socket.emit('broadcast', welcome);
		socket.on('nickname', function(n) {
			if(!n) return;
			socket.nickname = n;
			io.emit('broadcast', n + ' 加入了聊天室。');
		});
		socket.on('message', function(msg) {
			if(!msg) return;
			io.emit('message', { from: socket.nickname, message: msg });
		});
		socket.on('disconnect', function() {
			io.emit('broadcast', socket.nickname + ' 離開了聊天室。');
		});
	});
};