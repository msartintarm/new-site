/*
 All text on this page is property of Michael Sartin-Tarm. (c) 2014.
 License is MIT, and in addition, you must give me full notice.

  The purpose of this inline script is to monitor
    whether the WebGL JS has been loaded. 
*/
(function() {

  var game_sock = new GameSocket();
  game_sock.setupButtons(".socket-button");

  var $login_container = $("#player-login");
  var login_name = $login_container.find("textarea")[0];
  var login_submit = $login_container.find("input")[0];
  game_sock.setupValues(login_submit, login_name);

  var i_count = 0;
  var new_color = parseInt("890abc", 16);
  var limit = parseInt("ffffff", 16);
  var weak_color = parseInt("666666", 16);
  var cool_color = 238 * 256 * 256 + 135 * 256 + 187;


  var $buttons = $(".begin_game");
  var $buttons_length = $buttons.length;

  // Asynchronous loading is supported.
  // State 0: JS files are not loaded.
  // State 1: Game has loaded but not started.
  // State 2: Game has started.
  function checkLoad() {

    if (!window.GLcanvas || !window.Game) return 0;
    if (!window.theCanvas) return 1;
    return 2;
  }

  function callColorChange() {

    var izz = $buttons[(++i_count) % $buttons_length];
    var new_thing = new_color.toString(16);
    // append leading 0's if needed
    for(var i=new_thing.length; i<6; ++i) new_thing = "0" + new_thing;
    izz.style.color = "#" + new_thing;

    // that should keep things interesting
    new_color = (1487 * (new_color % 557)) * 23 + Math.abs(new_color - cool_color) % limit;
    // color too bright, invert it
    if ((new_color % 256) + (new_color / 256 % 256) + (new_color / (256 * 256) % 256) > 240)
      new_color -= weak_color;

    if (checkLoad() !== 2) window.setTimeout(callColorChange, 150);

  };

  // We may have specified the game to begin as a command-line param
  function setAutoStart() {

    var params = window.location.search;
    if(params.length > 1) {
      window.theCanvas = new GLcanvas();
      theCanvas.start(params.substring(1));
      return true;
    } 
    return false;
  };

  // Set up buttons.
  // Checks status of whether JS classes are loaded first.
  function setStart() {

    if (checkLoad() === 0) {
      window.setTimeout(setStart, 50);
      return;
    }

    if (setAutoStart()) return;
    function startButton() {
      window.theCanvas = new GLcanvas();
      window.theCanvas.start($(this).val().toLowerCase());
    }
    $buttons.click(startButton);
    GLshader.setupViewer();

    callColorChange();
  }

  // Since body has here been loaded, call it.
  setStart();

} ());
