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
    var more_callbacks = {};

    // DOM manipulation functions (move / create object)
    this.register_function = function(name, func) {
        callback_functions[name] = func;
    }

    // Post-DOM manipulation functions (after object has been moved)
    this.add_final_function = function(name, func) {
        more_functions[name] = func;
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

        // Convert to DOM structure, and then use DOM manipulation.
        var jResult = $("<div></div>").html(e.data);
        if (jResult) {
            // Classname denotes whether we replace target element,
            // or append to it

            // Search for callback functions in the element.
            // Scales quadratically with # of callback functions
            // An alternative could be defining a well-known parent 
            // element which can be iterated over  
            // Which would scale linearly with # of elements
            $.each(callback_functions, function(name, func) {
                jResult.find(name).each(func);
            });

        }

    };

    socket.onclose = function() {
        console.log("Socket closed.");
    };

    this.setupValues = function(button, container) {

    }

    return this;
}
