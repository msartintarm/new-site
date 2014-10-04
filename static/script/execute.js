/*
 All text on this page is property of Michael Sartin-Tarm. (c) 2014.
 License is MIT, and in addition, you must give me full notice.

  The purpose of this inline script is to monitor
    whether the WebGL JS has been loaded. 
*/
(function() {

  var game_sock = new GameSocket();

$( document ).ready(function() {

    $(".tarm-text").draggable({
	containment:true
    });

});
//  game_sock.setupButtons(".socket-button");

  // We may have specified the game to begin as a command-line param
// Search for command line args
//    var params = window.location.search;
//    if(params.length > 1) {

//      window.setTimeout(setStart, 50);

//      window.theCanvas.start($(this).val().toLowerCase());

  // Since body has here been loaded, call it.
//  setStart();

} ());
