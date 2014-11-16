    var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }


    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    var pyramidVertexPositionBuffer;
    var pyramidVertexColorBuffer;
    var cubeVertexPositionBuffer;
    var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;

    function initBuffers() {
        pyramidVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        var vertices = [
            // Front face
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,

            // Right face
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,

            // Back face
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,

            // Left face
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,

            1.0, -1.0, 1.0, // square bottom, triangle 1
            1.0, -1.0,-1.0,
            -1.0, -1.0,-1.0,

            1.0, -1.0, 1.0, // square bottom, triangle 2
            -1.0, -1.0,-1.0,
            -1.0, -1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        pyramidVertexPositionBuffer.itemSize = 3;
        pyramidVertexPositionBuffer.numItems = 18;

        pyramidVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        var colors = [
            // Front face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Right face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Back face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            0.0, 0.0, 1.0, 1.0, // 2: blue
            0.0, 1.0, 0.0, 1.0, // 3: green
            0.0, 0.0, 1.0, 1.0, // 4: blue

            0.0, 0.0, 1.0, 1.0, // 2: blue
            0.0, 0.0, 1.0, 1.0, // 4: blue
            0.0, 1.0, 0.0, 1.0  // 1: green
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        pyramidVertexColorBuffer.itemSize = 4;
        pyramidVertexColorBuffer.numItems = 18;


        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        vertices = [
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0

        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        cubeVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
        ];
        var unpackedColors = [];
        for (var i in colors) {
            var color = colors[i];
            for (var j=0; j < 4; j++) {
                unpackedColors = unpackedColors.concat(color);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 4;
        cubeVertexColorBuffer.numItems = 24;

        cubeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;
    }

    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [-1.5, 0.0, -8.0]);

        for (var key in objects) {
          if (objects.hasOwnProperty(key)) {
            mvPushMatrix();

            mat4.translate(mvMatrix, [objects[key].xTrans,0.0,0.0]);
            mat4.translate(mvMatrix, [0.0,objects[key].yTrans,0.0]);
            mat4.translate(mvMatrix, [0.0,0.0,objects[key].zTrans]);
            
            mat4.rotate(mvMatrix, degToRad(objects[key].xRot), [1,0,0]);
            mat4.rotate(mvMatrix, degToRad(objects[key].yRot), [0,1,0]);
            mat4.rotate(mvMatrix, degToRad(objects[key].zRot), [0,0,1]);

            mat4.scale(mvMatrix, [objects[key].xScale,1,1]);
            mat4.scale(mvMatrix, [1,objects[key].yScale,1]);
            mat4.scale(mvMatrix, [1,1,objects[key].zScale]);

            if (objects[key].type=="pyramid")
                drawPyramid();
            if (objects[key].type=="cube")
                drawCube();

            mvPopMatrix();
          }
        }     
    }

    function drawPyramid(){
        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
    }

    function drawCube(){
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    function webGLStart() {
        var canvas = document.getElementById("canvas");
        initGL(canvas);
        initShaders()
        initBuffers();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        drawScene();
    }

    var objects = {};
    var currentObjectIndex=null;

    function addObject(type,timeStamp){
        if (type=="pyramidDrag"){
            objects[timeStamp]={xRot:0,yRot:0,zRot:0,xScale:1,yScale:1,zScale:1,xTrans:0,yTrans:0,zTrans:0,type:"pyramid"};
        }
        if (type=="cubeDrag"){
            objects[timeStamp]={xRot:0,yRot:0,zRot:0,xScale:1,yScale:1,zScale:1,xTrans:0,yTrans:0,zTrans:0,type:"cube"};
        }
        drawScene();
    }

    function rotate(r,rotationType){
        switch (rotationType) {
            case "rotateX":
                if (r>objects[currentObjectIndex].xRot){
                    objects[currentObjectIndex].xRot += r-objects[currentObjectIndex].xRot;
                    drawScene();
                }
                if (r<objects[currentObjectIndex].xRot){
                    objects[currentObjectIndex].xRot -= objects[currentObjectIndex].xRot-r;
                    drawScene();
                }               
                break;
            case "rotateY":
                if (r>objects[currentObjectIndex].yRot){
                    yRot=objects[currentObjectIndex].yRot += r-objects[currentObjectIndex].yRot;
                    drawScene();
                }
                if (r<objects[currentObjectIndex].yRot){
                    objects[currentObjectIndex].yRot -= objects[currentObjectIndex].yRot-r;
                    drawScene();
                }  
                break;
            case "rotateZ":
                if (r>objects[currentObjectIndex].zRot){
                    objects[currentObjectIndex].zRot += r-objects[currentObjectIndex].zRot;
                    drawScene();
                }
                if (r<objects[currentObjectIndex].zRot){
                    objects[currentObjectIndex].zRot -= objects[currentObjectIndex].zRot-r;
                    drawScene();
                }  
                break;
        }
        drawScene();
    }

    function scale(s,scaleType){
        switch (scaleType) {
            case "scaleX":
                objects[currentObjectIndex].xScale = 1+parseFloat(s);
                break;
            case "scaleY":
                objects[currentObjectIndex].yScale = 1+parseFloat(s);
                break;
            case "scaleZ":
                objects[currentObjectIndex].zScale = 1+parseFloat(s);
                break;
        }
        drawScene();        
    }

    function translate(translateType,direction){
        switch (translateType) {
            case "x":
                if (direction=="+")
                    objects[currentObjectIndex].xTrans += 0.05;
                else
                    objects[currentObjectIndex].xTrans -= 0.05;
                break;
            case "y":
                if (direction=="+")
                    objects[currentObjectIndex].yTrans += 0.05;
                else
                    objects[currentObjectIndex].yTrans -= 0.05;
                break;
            case "z":
                if (direction=="+")
                    objects[currentObjectIndex].zTrans += 0.05;
                else
                    objects[currentObjectIndex].zTrans -= 0.05;
                break;
        }
        drawScene();
    }
