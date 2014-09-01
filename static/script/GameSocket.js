/**
 * Creates and initializes a websocket to get / send game info.
 */
function GameSocket() {

    var uri = "ws://" + top.location.host + "/socket";
    this.socket = new WebSocket(uri);

    this.socket.onopen = function() {
        console.log("Socket opened.");
    };


    // Set up function that will erase this element
    function closeElement($elem) {
        var c = $elem.attr("data-close");
        if (c) {
            function close() {
                $elem.html("");
                $(this).hide();
            }
            $("#" + c).show().mousedown(close);
        }
    }

    function initializeThings($elem) {
        var data_options = $elem.attr("data-options");
        if (!data_options) return;
        var options = data_options.split(" ");
        options.forEach(function(opt) {
            switch(opt) {
                case "draggable":

                    jsPlumb.draggable($elem, { 
                        distance: 2,
                        grid: [10,10],
                        scroll: false,
                        stop: function() { console.log("new position"); },
                        containment: "parent",
                        helper: "clone"
                    });

                    console.log("draggable");
                    break;
                default:
                    break;
            }
        })
    }

    function appendElement() {
        var $e = $(this);
        var $target = $("#" + $e.attr("data-target"));
        if ($target) {
            closeElement($target);
            $target.append($e);
            initializeThings($e);
        }
    }

    function replaceElement() {
        var $e = $(this);
        var $target = $("#" + $e.attr("data-target"));
        if ($target) {
            closeElement($target);
            $target.html($e);
            initializeThings($e);
        }
    }

    // A message may be a request to append to. or to replace, an existing element.
    // Simple enough .. right?
    // Sometimes, we want a specific callback function.
    this.socket.onmessage = function(e) {

        if (this.callback_fn) {
            this.callback_fn(e);
            this.callback_fn = null;
            return;
        }

        // Convert to DOM structure, and then use DOM manipulation.
        var $result = $("<div></div>").html(e.data);
        if ($result) {
            // Classname denotes whether we replace target element,
            // or append to it
            $result.find(".html-replace").each(replaceElement);
            $result.find(".html-append").each(appendElement);
        }
    };

    this.socket.onclose = function() {
        console.log("Socket closed.");
    };

    this.send = function(message, callback) {

        if (callback) this.callback_fn = callback;
        this.socket.send(message);
    }

    // Sets up a button to send a request through the socket.
    this.setupButtons = function(button) {
        var sock = this.socket;
        $(button).mousedown(function() {
            console.log("Sending message: " + $(this).data("cmd"));
            sock.send([uri, "/", $(this).data("cmd")].join(""));
        });
    }

    this.setupValues = function(button, container) {
        var sock = this.socket;
        $(button).mousedown(function() {
            console.log("Sending message: " + $(this).data("cmd"));
            sock.send([
                uri, "/", $(this).data("cmd"),
                "?", container.value
            ].join(""));
        });

    }

    return this;
}
