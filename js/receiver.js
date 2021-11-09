/**
 * info ****************************************************************
 */

document.title = 'Class Assitant'

/**
* Code mirrow Related ***************************************************************************
*/

var editor_info = 'Students code will show up here'


var editor = CodeMirror(document.querySelector('#my-div'), {
    lineNumbers: true,
    value: editor_info,
    mode: 'python',
    theme: 'monokai',
    styleActiveLine: true,
    readOnly: true,
    lineWrapping: true,
});
editor.setSize(width = '100%', height = '100%')

var serial_info = "Students console out will show up here"

var serial = CodeMirror(document.querySelector('#serial_R'), {
    lineNumbers: false,
    value: serial_info,
    theme: 'monokai',
    mode: 'text',
    readOnly: true,
    lineWrapping: true,
});
serial.setSize(width = '100%', height = '100%')

var command_info = "Students command will show up here"
var command = CodeMirror(document.querySelector('#serial_T'), {
    lineNumbers: false,
    value: command_info,
    mode: 'python',
    readOnly: true,
    lineWrapping: true,
});
command.setSize(width = '100%', height = '100%')

/**
 * UI
 */

// auto scroll 
new ResizeObserver(function () {
    out_frame.parentNode.scrollTop = out_frame.parentNode.scrollHeight;
}).observe(out_frame)

/**
 * Pusher related
 */

Pusher.logToConsole = true;

var pusher = new Pusher('f76a627d8d2490ada3c9', {
    cluster: 'us2'
});

var channel_list = {};

var marker;
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
            editor.setValue(content.editor);
            editor.setCursor(content.cursor);
            serial.setValue(content.serial);
            command.setValue(content.command);
            // https://dev.to/yoheiseki/how-to-display-the-position-of-the-cursor-caret-of-another-client-with-codemirror-6p8
            // Generate DOM node (marker / design you want to display)
            const cursorCoords = editor.cursorCoords(content['cursor']);
            const cursorElement = document.createElement('span');
            cursorElement.style.borderLeftStyle = 'solid';
            cursorElement.style.borderLeftWidth = '2px';
            cursorElement.style.borderLeftColor = '#ff0000';
            cursorElement.style.height = `${(cursorCoords.bottom - cursorCoords.top)}px`;
            cursorElement.style.padding = 0;
            cursorElement.style.zIndex = 0;
            // Set the generated DOM node at the position of the cursor sent from another client
            // setBookmark first argument: The position of the cursor sent from another client
            // Second argument widget: Generated DOM node
            try {
                marker.clear();
            } catch { }
            marker = editor.setBookmark(content.cursor, { widget: cursorElement });
        });
    });
}

function alear_info(text) {
    editor.setValue(text)
    command.setValue(text)
    serial.setValue(text)
}

var lostconnection_timer;
function onetime_receiving() {
    try {
        channel_list[current_name].trigger('client-request-content', {});
        lostconnection_timer = setTimeout(function () {
            alear_info(current_name + " lost connection.")
        }, 2000); // if time exceed, unsubcribe the channel
    } catch {
        alear_info(current_name + " is not connected.")
    }
}

var receiving_timer;

function loop_receiving() {
    function loop() {
        var rand = Math.round(Math.random() * 100) + 900;
        receiving_timer = setTimeout(function () {
            onetime_receiving(current_name);
            loop();
        }, rand);
    }
    loop();
}

function stop_receiving() {
    clearTimeout(receiving_timer);
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
    names_text = prompt("Please enter names, saperated by ','", names_text);
    refresh_buttons();
}

function change_auto_refreshing(box) {
    if (box.checked) {
        loop_receiving();
    } else {
        stop_receiving();
    }
}