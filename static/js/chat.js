/** Client-side of groupchat. */

const urlParts = document.URL.split('/');
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

const name = prompt('Username?');

/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
	console.log('open', evt);

	let data = { type: 'join', name: name };
	ws.send(JSON.stringify(data));
};

/** called when msg received from server; displays it. */

ws.onmessage = async function (evt) {
	console.log('message', evt);

	let msg = JSON.parse(evt.data);
	let item;

	// if (msg.text.slice(0, 5).toLowerCase() === '/joke') {
	// 	msg.type = 'cmdJoke';
	// } else if (msg.text.slice(0, 7).toLowerCase() === '/members') {
	// 	msg.type = 'cmdMembers';
	// } else if (msg.text[0] === '/') {
	// 	msg.type = 'cmdUnk';
	// }

	switch (msg.type) {
		case 'cmd':
			if (msg.text.toLowerCase() === '/joke') {
				let joke = await getJoke();
				item = $(`<li><b>Whisper: </b>${joke}</li>`);
				break;
			} else if (msg.text.slice(0, 8).toLowerCase() === '/members') {
				msg.text = msg.text.slice(8);
				item = $(`<li><b>Whisper: </b>${msg.text}</li>`);
				break;
			} else if (msg.text.slice(0, 5).toLowerCase() === '/priv') {
				msg.text = msg.text.slice(5);
				item = $(`<li><b>PM(${msg.from}  =>  ${msg.to}): </b>${msg.text}</li>`);
				break;
			} else {
				return console.error(`command not found: ${msg.text}`);
			}
		case 'note':
			item = $(`<li><i>${msg.text}</i></li>`);
			break;
		case 'chat':
			item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
			break;
		default:
			return console.error(`bad message: ${msg}`);
	}

	$('#messages').append(item);
};

/** called on error; logs it. */

ws.onerror = function (evt) {
	console.error(`err ${evt}`);
};

/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
	console.log('close', evt);
};

/** send message when button pushed. */

$('form').submit(function (evt) {
	evt.preventDefault();
	let text = $('#m').val();

	if (text[0] === '/') {
		let data = { type: 'cmd', text: text };
		ws.send(JSON.stringify(data));
	} else {
		let data = { type: 'chat', text: text };
		ws.send(JSON.stringify(data));
	}

	$('#m').val('');
});

/** get dad joke from api and return */

async function getJoke() {
	try {
		let response = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } });

		return response.data.joke;
	} catch (err) {
		return err;
	}
}