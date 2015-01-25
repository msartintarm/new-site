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

	jTarm.enter_hover = function(name) {
		return function() {
			$(this).addClass(name);
		};
	};

	jTarm.exit_hover = function(name) {
		return function() {
			$(this).removeClass(name);
		};
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

	// Awesome function that controls arrow over a music element
	jTarm.musical_arrow = function() {

		var the_arrow = $(this).find(".musical-arrow");
		var states = $(this).find(".tarm-state");

		var old_element = states[0];

		var move_arrow = function(){

			var the_offset = $(this).offset();

			the_arrow.offset({
				top: the_offset.top,
				left: the_offset.left - 40
				});

			$(old_element).removeClass("tarm-state-selected");
			$(this).addClass("tarm-state-selected");
			old_element = this;
		};

		$(states[0]).each(move_arrow);
		$(states).mouseenter( move_arrow);

	}


    jTarm.send_over_socket = function() {

        jTarm.sock.send($(this).attr("cmd"));
    };


    var elaboration_functions = {
    	toolbar_dropdown_container: function(){
    		$(this).addClass("dont-show-me").mousedown(jTarm.stop_click_on_parent);
    	}
    };

$( document ).ready(function() {

	// Elaboration code

    jTarm.sock.register_function("tarm-replacement", jTarm.replace_element);
    jTarm.sock.register_function("tarm-addition", jTarm.add_element);

	$(".toolbar-dropdown-container").addClass("dont-show-me")
		  // this might be moved to the view
		.mousedown( jTarm.stop_click_on_parent );

	$(".toolbar-dropdown")
		.mouseenter( jTarm.enter_hover("hovering-over") )
		.mouseleave( jTarm.exit_hover("hovering-over") )
		.mousedown( jTarm.stop_click_on_parent )
		.click( jTarm.send_over_socket );

	$("textarea")
		.mouseenter( jTarm.enter_hover("hovering-over-text") )
		.mouseleave( jTarm.exit_hover("hovering-over-text") )
		.mousedown( jTarm.stop_click_on_parent )
		.click( jTarm.send_over_socket );


	$(".toolbar-button")
		.mousedown( jTarm.toggle_shown_elements(".toolbar-dropdown-container"));

	$("tarm-story").each(jTarm.musical_arrow);


	jsPlumb.draggable($("tarm-story"),
		{containment: "parent"});

});

	// Search for command line args
//	var params = window.location.search;
//    if(params.length > 1) {

//      window.setTimeout(setStart, 50);

//      window.theCanvas.start($(this).val().toLowerCase());

  // Since body has here been loaded, call it.
//  setStart();

} (jtarm_object));
