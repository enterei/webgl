function drawscene(gl,positionAttributeLocation){
 // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
 var size = 2;          // 2 components per iteration
 var type = gl.FLOAT;   // the data is 32bit floats
 var normalize = false; // don't normalize the data
 var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
 var offset = 0;        // start at the beginning of the buffer
 gl.vertexAttribPointer(
     positionAttributeLocation, size, type, normalize, stride, offset)

 // draw
 var primitiveType = gl.TRIANGLE_STRIP;
 var offset = 0;
 var count = 6;
 gl.drawArrays(primitiveType, offset, count);


    
}