'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse. 
let gui;
let figureArgs = {
    uStep: 0.1,
    vStep: 0.1,
    vRange: 1,
    a: 1,
    b: 2,
    n: 2,
    m: 0.5,
    scaler: 0.5
}
let stoneT, normalT, specularT;
let translator = [0, 0]
/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    let projection = m4.perspective(Math.PI / 8, 1, 8, 12);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    const inversion = m4.inverse(modelViewProjection);
    const transposion = m4.transpose(inversion);
    gl.uniformMatrix4fv(shProgram.iNormalMatrix, false, transposion);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);
    const t = Date.now() * 0.001
    gl.uniform3fv(shProgram.iLightPosition, [3 * sin(t), 3 * cos(t), 0]);
    gl.uniform3fv(shProgram.iRelative, RuledRotorCylindroid(
        translator[0] * 2 * PI,
        translator[1] * figureArgs.vRange,
        figureArgs.uStep,
        figureArgs.vStep,
        figureArgs.a,
        figureArgs.b,
        figureArgs.n,
        figureArgs.m,
    ));
    gl.uniform2fv(shProgram.iTranslator, translator);
    gl.uniform1f(shProgram.iScaler, figureArgs.scaler);

    surface.BufferData(...CreateSurfaceData(figureArgs));

    surface.Draw();
}

function animate() {
    draw()
    window.requestAnimationFrame(animate)
}

/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTexture = gl.getAttribLocation(prog, "texture");
    shProgram.iAttribTangent = gl.getAttribLocation(prog, "tangent");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iNormalMatrix = gl.getUniformLocation(prog, "NormalMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");
    shProgram.iLightPosition = gl.getUniformLocation(prog, "lightPosition");
    shProgram.iStone = gl.getUniformLocation(prog, "stoneT");
    shProgram.iNormal = gl.getUniformLocation(prog, "normalT");
    shProgram.iSpecular = gl.getUniformLocation(prog, "specularT");
    shProgram.iScaler = gl.getUniformLocation(prog, "scaler");
    shProgram.iTranslator = gl.getUniformLocation(prog, "translator");
    shProgram.iRelative = gl.getUniformLocation(prog, "relative");

    surface = new Model('Surface');
    surface.BufferData(...CreateSurfaceData(figureArgs));

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    gui = new GUI();
    gui.add(figureArgs, 'uStep', 0.03, 0.5).step(0.01).name('U Step');
    gui.add(figureArgs, 'vStep', 0.05, 0.5).step(0.01).name('V Step');
    gui.add(figureArgs, 'vRange', 0.5, 3).step(0.01).name('V Range');
    gui.add(figureArgs, 'a', -2, 2).step(0.01).name('A');
    gui.add(figureArgs, 'b', -2, 2).step(0.01).name('B');
    gui.add(figureArgs, 'n', -3, 3).step(0.1).name('N');
    gui.add(figureArgs, 'm', 0.1, 1).step(0.01).name('M');
    gui.add(figureArgs, 'scaler', 0.1, 1).step(0.01).name('Scale Factor');
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);
    gl.activeTexture(gl.TEXTURE0);
    stoneT = getTexute(stone, shProgram.iStone, 0)
    gl.activeTexture(gl.TEXTURE1);
    normalT = getTexute(NormalMap, shProgram.iNormal, 1)
    gl.activeTexture(gl.TEXTURE2);
    specularT = getTexute(SpecularMap, shProgram.iSpecular, 2)
    animate();
}
function getTexute(src, l, i) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const image = new Image();
    image.crossOrigin = 'anonymus';
    image.src = src
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        console.log("imageLoaded")
        draw()
    }
    gl.uniform1i(l, i);
}

window.onkeydown = (e) => {
    if (e.keyCode == 87) {
        translator[0] = Math.min(translator[0] + 0.01, 1);
    }
    else if (e.keyCode == 83) {
        translator[0] = Math.max(translator[0] - 0.01, 0);
    }
    else if (e.keyCode == 65) {
        translator[1] = Math.max(translator[1] - 0.1, 0);
    }
    else if (e.keyCode == 68) {
        translator[1] = Math.min(translator[1] + 0.1, 1);
    }
}