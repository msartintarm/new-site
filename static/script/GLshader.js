

function GLshader() {
    this.fragment = [];
    this.vertex = [];
    console.log("yo");

    var frameFn = function(frame_id, shader_id) {
        var f = document.getElementById(frame_id);
        if (f === null) console.error(frame_id + " is null!");
        f = f.contentWindow ?
            f.contentWindow.document:
            f.contentDocument;
        f = f.getElementById(shader_id);

        if (!f.onclick) f.onclick = (function() {
            f.height = "200";
            return function() { f.height = (f.height === "200")? "600": 200; };
        } ())
        return f.value;
    };

    this.f_decls = frameFn("shader_decls", "f_decls");
    this.v_decls = frameFn("shader_decls", "v_decls");

    this.fragment["color"] = frameFn("shader_color", "frag");
    this.fragment["canvas"] = frameFn("shader_canvas", "frag");
    this.fragment["player"] = frameFn("shader_player", "frag");

    this.fragment["default"] = frameFn("shader_default", "frag");
    this.vertex["default"] = frameFn("shader_default", "vert");
    this.fragment["frame"] = frameFn("shader_frame", "frag");

    this.vertex["color"] = frameFn("shader_color", "vert");
    this.vertex["player"] = frameFn("shader_player", "vert");

}

GLshader.setupViewer = function() {
    var shaders_open = false;    
    $("#shader_viewer").click(function() {
        shaders_open = !shaders_open;
        this.value = shaders_open? "Close Shaders": "View Shaders";
        ("#shader1").toggleClass("hidden");
    });
};

/*
 * http://dev.opera.com/articles/view/raw-webgl-part1-getting-started/
 */
GLshader.prototype.init = function(gl_, gl_shader, frag_name, vert_name) {

    var f_shader = gl_.createShader(gl_.FRAGMENT_SHADER);
    gl_.shaderSource(f_shader, "" + this.f_decls + this.fragment[frag_name]);
    gl_.compileShader(f_shader);

    var v_shader = gl_.createShader(gl_.VERTEX_SHADER);
    gl_.shaderSource(v_shader, "" + this.v_decls + this.vertex[vert_name]);
    gl_.compileShader(v_shader);

    gl_.attachShader(gl_shader, v_shader);
    gl_.attachShader(gl_shader, f_shader);

    // Firefox says macs behave poorly if
    // an unused attribute is bound to index 0
    // So we specify 'position' before the link.
    gl_.bindAttribLocation(gl_shader, 0, "vPosA");

    gl_.linkProgram(gl_shader);

    if (!gl_.getProgramParameter(gl_shader, gl_.LINK_STATUS)) {
	return -1;
    }

    return 0;
};

GLshader.prototype.cleanup = function() {
    this.fragment = null;
    this.vertex = null;

    this.f_decls = null;
    this.v_decls = null;
};
