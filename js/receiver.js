/**
 * Extra Ace setup
 */

editor.setOptions({
    // https://stackoverflow.com/a/13579233/7037749
    maxLines: Infinity
});
editor.setReadOnly(true);
command.setReadOnly(true);

/**
 * id
 */

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

var receiver_id = getUrlParameter('id');
// var id = 'private-abc123';
if (!receiver_id) {
    location.search = location.search
        ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
}

/**
 * Pusher related
 */

Pusher.logToConsole = true;

var pusher = new Pusher('f76a627d8d2490ada3c9', {
    cluster: 'us2'
});

var channel_list = {};

var serial_value_text;
function add_channel(name) {
    var id = 'private-' + name;
    var channel = pusher.subscribe(id);

    channel.bind('pusher:subscription_succeeded', function () {
        console.log(channel);
    });

    setTimeout(function () {
        channel.trigger('client-check-sender-existence', {});
    }, 100); // wait for the subscription to finish

    var unsubscribe_timer = setTimeout(function () {
        pusher.unsubscribe(id);
        document.getElementsByClassName('head')[0].innerHTML += name + ', ';
        console.log(id, 'unsubscribed');
    }, 2000); // if time exceed, unsubcribe the channel

    channel.bind('client-sender-exists', function () {
        console.log('client-sender-exists');
        clearTimeout(unsubscribe_timer); // if the channel exist, stop the timer

        // if channel exist, add it to the channel list, and bind the text-edit event
        channel_list[name] = channel;

        channel.bind('client-text-edit', function (content) {
            if (receiver_id != content.receiver_id) {
                return;
            }
            clearTimeout(lostconnection_timer);
            if (content.file) {
                document.getElementById("filename").innerHTML = content.file.split(': ').join('');
            } else {
                document.getElementById("filename").innerHTML = "no file";
            }
            if (content.connect.trim() == "Connect") {
                document.getElementById("connect").innerHTML = "not connected";
            } else {
                document.getElementById("connect").innerHTML = content.connect;
            }
            editor.setValue(content.editor, -1);
            editor.gotoLine(content.cursor.row + 1, content.cursor.column)
            serial.setValue(content.serial, -1);
            serial_value_text = content.serial;
            command.setValue(content.command, -1);
        });
    });
}

function alear_info(text) {
    editor.setValue(text, -1)
    command.setValue(text, -1)
    serial.setValue(text, -1)
    serial_value_text = ''
}

var lostconnection_timer;
function onetime_receiving() {
    try {
        channel_list[current_name].trigger('client-request-content', {
            receiver_id: receiver_id,
        });
        lostconnection_timer = setTimeout(function () {
            alear_info(current_name + " lost connection.")
        }, 2000); // if time exceed, unsubcribe the channel
    } catch {
        alear_info(current_name + " is not connected.")
    }
}

var receiving_timer;

function loop_receiving() {
    var rand = Math.round(Math.random() * 100) + 900;
    receiving_timer = setTimeout(function () {
        if (document.getElementById('loop').checked) {
            onetime_receiving(current_name);
            loop_receiving();
        }
    }, rand);
}

/**
 * Student Tabs
 */

var current_name;

function change_student(name) {
    current_name = name;
    document.title = 'watching: ' + current_name;
    onetime_receiving();
}

function clear_buttons() {
    document.getElementsByClassName('head')[0].innerHTML = 'student list:';
}

function add_button(name) {
    document.getElementsByClassName('head')[0].innerHTML += '\n<input type="button" value="' + name + '" onclick="change_student(this.value)">';
}

var names_text = '';

function refresh_buttons() {
    for (const [name, channel] of Object.entries(channel_list)) {
        var id = 'private-' + name;
        pusher.unsubscribe(id);
    }
    clear_buttons();
    channel_list = {};
    var names_list = names_text.split(',')
    for (var i = 0; i < names_list.length; i++) {
        var name = names_list[i].trim();
        if (name) {
            add_button(name);
            add_channel(name);
        }
    }
    document.getElementsByClassName('head')[0].innerHTML += '<br> Not connected students: '
}

function add_buttons_batch() {
    names_text = prompt("Please enter names, saperated by ','", names_text).toLowerCase();
    refresh_buttons();
}