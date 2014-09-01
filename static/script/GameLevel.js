/**
 * Three intended purposes:
 * 1. Given a config for a level, load it into control panel
 * 2. Given a control-panel config, init game with it
 */
function GameLevel(gl_, config_container) {

    var config = $.parseJSON($(config_container).val());

    this.pieces = {};

    // Either op doesn't exist (val, is a '-' (= dec old), or is  a '+' (= inc old)
    var newCoordVal = function(old, op, val) {
        return (!op)? parseInt(val):
            (op === "-")? old - parseInt(val):
            (op === "+")? old + parseInt(val): -1;
    };

    this.getGrid = function() { return this.grid; };
    this.getStartPos = function() { 
        var vecz = [];
        config["start-position"].forEach(function(x, i) {
            vecz[i] = parseInt(x);
        });
        return vecz;
    };

    this.getTriggerFunctions = function() {

    }

    this.initGrid = function() { this.grid = config["grid-size"]; };
    this.initTextures = function(gl_) {
        config["textures"].forEach (function(texture) { 
            GLtexture.create(gl_, texture);
        });
    };

    this.initAudio = function() {

        var gl_audio = new GLaudio();

        var addAudio = function(sound) {
            var web_node =
                (sound[1] === "audio-low-pass")? gl_audio.low_pass:
                (sound[1] === "audio-output")? gl_audio.web_audio.destination:
                (sound[1] === "audio-delay")? gl_audio.delay: null;

            if (!sound[2] || sound[2] === "")
                gl_audio.createAudio(sound[0],  // URL (relative)
                                     web_node,  // Web Audio node (filter) type
                                     false);    // Loop?
            else if (sound[2] === "loop")
                gl_audio.createAudio(sound[0], web_node, true,
                                     parseInt(sound[3]),  // Loop start beat
                                     parseInt(sound[4])); // Loop  repeat factor
        };

        var triggerAudio

        config["audio"].forEach(addAudio);
        return gl_audio;
    };

    this.initPiece = function(p) {

        var piece = [];

        var w = this.grid * parseInt(p[2]); // actually, width / 2
        var h = this.grid * parseInt(p[3]);

        var create = function(x,y) {

    	    var x2 = x * w * 2;
    	    var y2 = y * h;
                var l = -1;
    	    piece.push(new Quad(
                [x2-w,y2+h,l],
		        [x2-w,  y2,l],
                [x2+w,y2+h,l],
                [x2+w,  y2,l])
            .setTexture(p[1]).add2DCoords());
        };

        var coords = p[4];

        var x = 0;
        var y = 0;
        for(var i = 0; i < coords.length; ++i) {

            var termA = /(?:([0-9]+)\*\()?([-+])*([0-9]+)\,([-+])*([0-9]+)\)?/;
            var zzap = termA.exec(coords[i]);
            // Index 1: loop count (opt); 2, 4: inc sign (opt); 3, 5: value (non-opt)
            var loop = (zzap[1])? zzap[1]: 1;

            for(var j = 0; j < loop; ++j) {
                // Either char doesn't exist, is a '-' (decrement), or is  a '+' (increment)
                x = newCoordVal(x, zzap[2], zzap[3]);
                y = newCoordVal(y, zzap[4], zzap[5]);
                create(x,y);
            }

        }
        this.pieces[p[0]] = piece;
    };

    this.initPieces = function() {
        config["pieces"].forEach(function(piece) {
            this.initPiece(piece);
        }, this);
    };

    this.getPiece = function(name) { return this.pieces[name]; };
}
