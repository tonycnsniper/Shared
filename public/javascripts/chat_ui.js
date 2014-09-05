var socket = io.connect();
var current = '';

$(document).ready(function() {
	var chatApp = new Chat(socket);

	socket.on('nameResult', function(result) {
		var message;
		if(result.success) {
			message = 'You are now known as ' + result.name + '.';
			current = result.name;
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed. '));
	});
	socket.on('message', function(messages) {
		var newElement = $('<div></div>').text(messages.text);
		$('#messages').append(newElement);
	});
	socket.on('rooms', function(rooms) {
		$('#room-list').empty();

		for(var room in rooms) {
			room = room.substring(1, room.length);
			if(room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}

		$('#room-list div').click(function() {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);

	$('#send-message').focus();

	$('#send-form').submit(function() {
		processuserInput(chatApp, socket);
		return false;
	})
})


function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processuserInput(chatApp, socket) {
	var message = $('#send-message').val().trim();
	var systemMessage;

	if(message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if(systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		if(message.indexOf(':') == -1) {
			message = current + ': ' + message;
		}
		chatApp.sendMessage($('#room').text(),message);
		$('#messages').append(divEscapedContentElement(message));
		//$('#messages').srollTop($('#messages').prop('scrollHeight'));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val('');
}