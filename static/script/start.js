/*
 All text on this page is property of Michael Sartin-Tarm. (c) 2014.
 License is MIT, and in addition, you must give me full notice.

  The purpose of this inline script is to monitor
    whether the JS and DOM have been loaded. 
*/
var jtarm_object = {};
(function(jTarm) {

	jTarm.html_ready = null;
	jTarm.javascript_ready = null;

	jTarm.update = function(){


	};


	var check_timeout = function() {

	};

	jTarm.initialize = function(){

		self.html_ready = false; // 'boolean'
		self.javascript_ready = false; // 'boolean'

		if (!self.html_ready) {}


	};

  jTarm.sock = new GameSocket();

	jTarm.enter_hover = function() {
		$(this).addClass("hovering-over");
	};

	jTarm.exit_hover = function() {
		$(this).removeClass("hovering-over");
	};

	jTarm.stop_click_on_parent = function(e){

		e.stopPropagation();

	};

	jTarm.toggle_shown_elements = function(name) {
		return function(){
			$(this).find(name).toggleClass("dont-show-me show-me");
		}
	};

	jTarm.add_element = function() {

		console.log("Replacing..");
		$("#" + $(this).attr("parent-id"))
			.append($(this).html())
			.each(function(){
				console.log("Replaced.");
			});


	};

	jTarm.replace_element = function() {

		$("#" + $(this).attr("parent-id")).html($(this).html());
	};

	jTarm.construct_element = function(e) {

        // Convert to DOM structure, and then use DOM manipulation.
        var $result = $("<div></div>").html(e.data);
        if ($result) {
            // Classname denotes whether we replace target element,
            // or append to it


            $result.find("tarm-replacement").each(jTarm.replace_element);
            $result.find("tarm-addition").each(jTarm.add_element);
    	}
    };

    jTarm.send_over_socket = function() {

        jTarm.sock.send($(this).attr("cmd"));
    };

$( document ).ready(function() {

		jTarm.sock.register_function("general", jTarm.construct_element);

	$(".toolbar-dropdown-container").addClass("dont-show-me")
		  // this might be moved to the view
		.mousedown( jTarm.stop_click_on_parent );

	$(".toolbar-dropdown")
		.mouseenter( jTarm.enter_hover )
		.mouseleave( jTarm.exit_hover )
		.mousedown( jTarm.stop_click_on_parent )
		.click( jTarm.send_over_socket );



	$(".toolbar-button")
		.mousedown( jTarm.toggle_shown_elements(".toolbar-dropdown-container"));
});

	// Search for command line args
//	var params = window.location.search;
//    if(params.length > 1) {

//      window.setTimeout(setStart, 50);

//      window.theCanvas.start($(this).val().toLowerCase());

  // Since body has here been loaded, call it.
//  setStart();

} (jtarm_object));
