/**
 * Pusher related
 */

Pusher.logToConsole = true;

// a unique random key generator
function getUniqueId() {
    return 'private-' + Math.random().toString(36).substr(2, 9);
}

// function to get a query param's value
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var id = getUrlParameter('id');
// var id = 'private-abc123';
if (!id) {
    location.search = location.search
        ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
}

// var id_name = id.slice(8, 9).toUpperCase() + id.slice(9,id.length)

// alert('Hello ' + id_name + '!\nIf you are not ' + id_name + ', please close this browser tab and log in again.')

var pusher = new Pusher('f76a627d8d2490ada3c9', {
    cluster: 'us2'
});

var channel = pusher.subscribe(id);

channel.bind('client-check-sender-existence', function () {
    channel.trigger('client-sender-exists', {});
    console.log('client-sender-exists')
})

channel.bind('pusher:subscription_succeeded', function () {
    console.log(channel);
});

channel.bind('client-request-content', function (msg) {
    console.log(msg);
    channel.trigger('client-text-edit', {
        receiver_id: msg.receiver_id,
        file: document.getElementById('filename').innerHTML,
        connect: document.getElementById("connect").innerHTML,
        editor: editor.getValue(),
        cursor: {
            line: editor.getCursorPosition().row,
            ch: editor.getCursorPosition().column,
        },
        serial: serial.getValue().slice(end = -(9000 - editor.getValue().length)),
        // 10000 byte is the limit of a message
        command: command.getValue(),
    });
});