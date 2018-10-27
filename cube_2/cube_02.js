var canvas;
var gl;

var NumVertices = 36;
var cubes = [];
var system_points = [];
var modelViewLoc; //location of modelviewmatrix
var vPositionLoc; //location of postionmatrix
var scalingMatrixLoc // location of scaling Matrix
var program;
var selected = 10;

//variables for translation
var trans = [0, 0, 0];
var xTrans = 0;
var yTrans = 1;
var zTrans = 2;
//rotation
var rotas = [0, 0, 0];
// scaling
var scale = [1, 1, 1];

//user interaction:

window.onkeydown = function (event) {

    var key = String.fromCharCode(event.keyCode);
    switch (key) {
        case '0': selected = 10;
            break;

        case '1':
            selected = 0;
            break;
        case '2':
            selected = 1;
            break;
        case '3':
            document.getElementById("p1").innerHTML=" 3 pressed";
            selected = 2;
            break;
        case '4':
            selected = 3;
            break;
        case '5':
            selected = 4;
            break;
        case '6':
            selected = 5;
            break;
        case '7':
            selected = 6;
            break;
        case '8':
            selected = 7;
            break;
        case '9':
            selected = 8;
            break;





    }
    var key = event.keyCode;
    switch (key) {


        case 37:
            trans[0] = -0.01;


            break;

        case 39:
            trans[0] = 0.01;
            break;

        case 38:
            trans[1] = 0.01;
            break;
        case 40:
            trans[1] = -0.01;
            break;
        case 190:
            trans[2] = 0.01;
            break;


        case 188: trans[2] = -0.01;
            break;
        case 83:
            rotas[0] = -2.0;
            break;

        case 87: rotas[0] = 2.0;
            break;
        case 81: rotas[1] = 2.0;
            break;
        case 69: rotas[1] = -2.0;
            break;
        case 65: rotas[2] = 2.0;

            break;
        case 68: rotas[2] = -2.0;
            break;
        case 88:
            scale[0] = 0.9;
            break;
        case 86:
            scale[0] = 1.1;
            break;
        case 89:
            scale[1] = 0.9;
            break;
        case 66:
            scale[1] = 1.1;
            break;
        case 90:
            scale[2] = 0.9;
            break;
        case 78:
            scale[2] = 1.1;
            break;

    }


}

// redo changes after key gets releases
window.onkeyup = function (event) {

    rotas[0] = 0.0;
    rotas[1] = 0.0;
    rotas[2] = 0.0;
    trans[0] = 0.0;
    trans[1] = 0.0;
    trans[2] = 0.0;
    scale[0] = 1.0;
    scale[1] = 1.0;
    scale[2] = 1.0;
}

// rotation/translation/scaling

function glrotation() {                      //rotate all cubes around global coordinate system
    if (rotas[0] != 0) {
        var angles = radians(rotas[0]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);

        return mat4(1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1);

    }
    if (rotas[1] != 0) {
        var angles = radians(rotas[1]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);
        return mat4(c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1);

    }
    if (rotas[2] != 0) {
        var angles = radians(rotas[2]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);
        return mat4(c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);


    }
    return mat4();


}


function rotation(center_cube) { // rotate a single cube about local coordinate system.
    var xf = center_cube[0]; //get distances to origin (0,0,0)
    var yf = center_cube[1];
    var zf = center_cube[2];
    if (rotas[0] != 0) {
        var angles = radians(rotas[0]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);

        return mat4(1, 0, 0, 0, 0, c, -s, yf - yf * c + zf * s, 0, s, c, zf - yf * s - zf * c, 0, 0, 0, 1); // = translationM to center of the cube * rotation matrix x axis * tranlation to origin of the cube

    }
    if (rotas[1] != 0) {
        var angles = radians(rotas[1]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);
        return mat4(c, 0, s, xf - xf * c - zf * s, 0, 1, 0, 0, -s, 0, c, zf + xf * s - zf * c, 0, 0, 0, 1);// = translationM to center of the cube * rotation matrix y axis * tranlation to origin of the cube

    }
    if (rotas[2] != 0) {
        var angles = radians(rotas[2]);
        var c = Math.cos(angles);
        var s = Math.sin(angles);

        return mat4(c, -s, 0, xf - xf * c + yf * s, s, c, 0, yf - xf * s - yf * c, 0, 0, 1, 0, 0, 0, 0, 1);// = translationM to center of the cube * rotation matrix z axis * tranlation to origin of the cube

    }

    return mat4();


}

function scalemyshit(center_cube){
    var xf = center_cube[0]; //get distances to origin (0,0,0)
    var yf = center_cube[1];
    var zf = center_cube[2];
    sc = scalem(scale);
    sc[0][3]= -xf*scale[0]+xf;
    sc[1][3]= -yf*scale[1]+yf;
    sc[2][3]= -zf*scale[2]+zf;


   /* sc[1][1]=scale[1];
    sc[2][2]=scale[2];*/
  return sc;
  

}


//main function
function init() {
    //------setup-------
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    //init cubes
    let cube1 = new Cube(vertices);
    let cube2 = new Cube(vertices);
    let cube3 = new Cube(vertices);
    let cube4 = new Cube(vertices);
    let cube5 = new Cube(vertices);
    let cube6 = new Cube(vertices);
    let cube7 = new Cube(vertices);
    let cube8 = new Cube(vertices);
    let cube9 = new Cube(vertices);

    cube1.fillpoints();
    cube2.fillpoints();
    cube3.fillpoints();
    cube4.fillpoints();
    cube5.fillpoints();
    cube6.fillpoints();
    cube7.fillpoints();
    cube8.fillpoints();
    cube9.fillpoints();

    // becouse all cubes are the same i have to move them first
    cube1.init_tran(0.4, 0, 0.2);
    cube2.init_tran(0.0, 0.2, 0);
    cube3.init_tran(0.2, 0.3, 0.0);
    cube4.init_tran(-0.3, 0.4, 0);
    cube5.init_tran(-0.4, 0, 0.2);
    cube6.init_tran(0.8, -0.2, 0);
    cube7.init_tran(0.8, -0.9, 0.2);
    cube8.init_tran(0.5, 0.2, 0);
    cube9.init_tran(-0.5, -0.3, 0.2);

    //add to array
    cubes.push(cube1);
    cubes.push(cube2);
    cubes.push(cube3);
    cubes.push(cube4);
    cubes.push(cube5);
    cubes.push(cube6);
    cubes.push(cube7);
    cubes.push(cube8);
    cubes.push(cube9);



    fill_system_points();
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //get locs of shader vars
    modelViewLoc = gl.getUniformLocation(program, "modelViewMatrix");
    vPosition = gl.getAttribLocation(program, "vPosition");
    scalingMatrixLoc = gl.getUniformLocation(program, "scalingMatrix");




    render();



}


//draw one cube
function draw(cube) {

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube.colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vColor);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube.points), gl.STATIC_DRAW);



    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(cube.ctm));
    gl.uniformMatrix4fv(scalingMatrixLoc,false,flatten(cube.scalingMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);

}

function draw_system(ctm) {
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(system_colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vColor);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(system_points), gl.STATIC_DRAW);



    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(ctm));

    gl.drawArrays(gl.LINES, 0, 6);



}




function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //transform all cubes
    if (selected == 10) {
        for (var i = 0; i < cubes.length; i++) {
            cubes[i].scalingMatrix = mult(cubes[i].scalingMatrix, scalemyshit(cubes[i].center));
            cubes[i].ctm = mult(cubes[i].ctm, glrotation());

            cubes[i].ctm = mult(cubes[i].ctm, translate(trans));

           /* document.getElementById("p1").innerHTML= cubes[0].scalingMatrix[0][0]+" "+cubes[0].scalingMatrix[0][1]+" "+cubes[0].scalingMatrix[0][2];
            document.getElementById("p2").innerHTML= cubes[0].scalingMatrix[1][0]+" "+cubes[0].scalingMatrix[1][1]+" "+cubes[0].scalingMatrix[1][2];
            document.getElementById("p3").innerHTML= cubes[0].scalingMatrix[2][0]+" "+cubes[0].scalingMatrix[2][1]+" "+cubes[0].scalingMatrix[2][2];*/

        }

    }
    //transform selected cube
    else {
        cubes[selected].scalingMatrix = mult(cubes[selected].scalingMatrix, scalemyshit(cubes[selected].center));

        cubes[selected].ctm = mult(cubes[selected].ctm, rotation(cubes[selected].center));
        cubes[selected].ctm = mult(cubes[selected].ctm, translate(trans));
        draw_system(cubes[selected].ctm);


    }

    //draw all cubes
    for (var i = 0; i < cubes.length; i++) {
        draw(cubes[i]);
    }
    //loop
    requestAnimationFrame(render);


}






//cube class

class Cube {

    constructor(vertices_from_cube) {
        this.vertices = vertices_from_cube;
        this.colors = vertexColors;
        this.indices = cube_indices;
        this.ctm = mat4();
        this.scalingMatrix=mat4();
        this.center = cubecenter(this.vertices);
        this.points = new Array();


    }
    //set up 
    fillpoints() {
        for (var i = 0; i < this.indices.length; ++i) {
            this.points.push(this.vertices[this.indices[i]]);


            //this.colors.push(this.colors[i]);
        }
    }
    //all cubes start on same location so i have to move them initially ( is that a word?)
    init_tran(x, y, z) {
        this.ctm = mult(this.ctm, translate(x, y, z));


    }




}






//get the cube center to perform  rotation
function cubecenter(verticess) {
    var firstdings = vec4();
    var seconddings = vec4();

    firstdings = subtract(verticess[5], verticess[1]);
    firstdings[0] = firstdings[0] * 0.5;
    firstdings[1] = firstdings[1] * 0.5;
    firstdings[2] = firstdings[2] * 0.5;
    firstdings = add(verticess[1], firstdings);
    seconddings = subtract(verticess[0], verticess[1]);
    seconddings[0] = seconddings[0] * 0.5;
    seconddings[1] = seconddings[1] * 0.5;
    seconddings[2] = seconddings[2] * 0.5;
    firstdings = add(firstdings, seconddings);

    seconddings = subtract(verticess[2], verticess[1]);
    seconddings[0] = seconddings[0] * 0.5;
    seconddings[1] = seconddings[1] * 0.5;
    seconddings[2] = seconddings[2] * 0.5;

    firstdings = add(firstdings, seconddings);

    return firstdings;



}


//-------cube vars wich are for all cubes the same



//cube colors, for all cubes the same
var vertexColors = [
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],

    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0]

];





//cube vertices, fo all cubes the same
var vertices = [
    vec4(0.1, 0.1, 0.3, 1.0),
    vec4(0.1, 0.3, 0.3, 1.0),
    vec4(0.3, 0.3, 0.3, 1.0),
    vec4(0.3, 0.1, 0.3, 1.0),
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(0.1, 0.3, 0.1, 1.0),
    vec4(0.3, 0.3, 0.1, 1.0),
    vec4(0.3, 0.1, 0.1, 1.0)
];

var system_vertices = [
    vec4(0.2, 0.2, 0.2, 1.0),
    vec4(0.5, 0.2, 0.2, 1.0),
    vec4(0.2, 0.5, 0.2, 1.0),
    vec4(0.2, 0.2, 0.5, 1.0)

];

//cube indices, fo all cubes the same
var cube_indices = [

    0, 1, 2, 0, 2, 3,
    3, 2, 6, 3, 6, 7,
    7, 6, 5, 7, 4, 5,
    5, 6, 2, 5, 1, 2,
    1, 0, 4, 1, 5, 4,
    4, 7, 3, 4, 0, 3,

];

var system_colors = [
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],

];

var system_indices = [
    0, 1,
    0, 2,
    0, 3
];

function fill_system_points() {
    for (var i = 0; i < system_indices.length; ++i) {
        system_points.push(system_vertices[system_indices[i]]);
    }



}










