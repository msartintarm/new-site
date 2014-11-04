/**
 * (c) 2014 Michael Sartin-Tarm. All rights reserved.
 *
 * GameSocket
 * Creates and initializes a websocket to get / send game info.
 * Also handles receiving / sending of HTML elements.
 */
function GameSocket() {

    var uri = "ws://" + top.location.host + "/socket";
    var socket = new WebSocket(uri);
    var callback_functions = {};

    this.register_function = function(name, func) {
        callback_functions[name] = func;
    }

    // Structure of callback function is:
    // function(event, html_object_sent)
    this.send = function(message) {
        console.log("Sending message: " + message);
        socket.send([uri, "/", message].join(""));
    }

    socket.onopen = function() {
        console.log("Socket opened.");
    };


    // A message may be a request to append to. or to replace, an existing element.
    // Simple enough .. right?
    // Sometimes, we want a specific callback function.
    socket.onmessage = function(e) {

        if (callback_functions["general"]) {
            (callback_functions["general"])(e);
            return;
        }

    };

    socket.onclose = function() {
        console.log("Socket closed.");
    };

    this.setupValues = function(button, container) {

    }

    return this;
}
