//Ip = Is.Kd.n.L + Ia.ka 

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' + //kd - màu đối tượng
  'attribute vec4 a_Normal;\n' + //vecto phap tuyen - n
  'attribute vec2 a_TexCoord;\n' + //Vi tri diem tuong ung tren hinh anh texture
  'uniform mat4 u_MvpMatrix;\n' + //Là ma trận hỗn hợp
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_LightDirection;\n' + //Hướng chiếu ánh sáng - l
  'uniform vec3 u_AmbientLight;\n' +  //Ánh sáng xung quanh
  'uniform vec3 u_LightColor;\n' +    // màu chiếu sáng - Is
  'varying vec4 v_Color;\n' +       //Biến thay đổi cho a_Color - biến amfu ngôi nhà mặc đinh
  'varying vec2 v_TexCoord;\n' + // Thêm biến varying cho texture coordinates
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' + 
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' + 
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' + //Is.Kd.n.L 
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' + // Ia.ka
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + //Is.Kd.n.L + Ia.ka
  '  v_TexCoord = a_TexCoord;\n' + // Gán giá trị texture coordinates
  '}\n';


  var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform sampler2D u_Sampler0;\n' + //roof
  'uniform sampler2D u_Sampler1;\n' + //front
  'uniform sampler2D u_Sampler2;\n' + //back
  'uniform sampler2D u_Sampler3;\n' + //side
  'uniform sampler2D u_Sampler4;\n' + //bottom
  'uniform int u_UseTexture;\n'+
  'void main() {\n' +
  '   vec4 texColor;\n'+
  '   if(u_UseTexture == 1) {\n'+
  '     texColor = texture2D(u_Sampler1, v_TexCoord);\n' + 
  '   }else if (u_UseTexture == 2){\n'+
  '     texColor = texture2D(u_Sampler2, v_TexCoord);\n' + 
  '   }else if (u_UseTexture == 3){\n'+
  '     texColor = texture2D(u_Sampler3, v_TexCoord);\n' + 
  '   }else if (u_UseTexture == 4){\n'+
  '     texColor = texture2D(u_Sampler4, v_TexCoord);\n' + 
  '   }else{\n'+
  '     texColor = texture2D(u_Sampler0, v_TexCoord);\n' +
  '   }\n'+
  '   gl_FragColor = v_Color * texColor;\n' + 
  '}\n';


  
var currentAngle = 0.0;
var ANGLE_STEP = 0.5; 
var useLight = false;
var eX = 0,eY= 0,eZ= 4,uX=0,uY=1,uZ=0,aX = 0,aY = 0,aZ = 1, r = 1, g =1,b=1;
//eX, ey,ez: vị trí mắt nhìn
// ax,ay,az: điểm nhìn
// uX,uy,uz: xác định hướng đi lên trong cảnh đang đc nhìn

function main() {
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl');

  //Tọa độ - Màu - Vector pháp tuyến - Tọa độ ảnh
  
    var verticesRoof = new Float32Array([
        // Roof - Mặt sau 
        -1, 1, -1,   1.0, 1.0, 1.0,  0, 0, -1,  0, 0,
        0, 1.5, -1,  1.0, 1.0, 1.0,  0, 0, -1,  0.5, 1,
        1, 1, -1,    1.0, 1.0, 1.0,  0, 0, -1,  1, 0,
        // Roof - Mặt trước 
        -1, 1, 1,    1.0, 1.0, 1.0,  0, 0, 1,   0, 0,
        0, 1.5, 1,   1.0, 1.0, 1.0,  0, 0, 1,   0.5, 1,
        1, 1, 1,     1.0, 1.0, 1.0,  0, 0, 1,   1, 0,
        // Roof - Mặt trái 
        0, 1.5, -1,  1.0, 1.0, 1.0,  -1, 1, 0,   1, 1,
        0, 1.5, 1,   1.0, 1.0, 1.0,  -1, 1, 0,   0.0, 1,
        -1, 1, 1,    1.0, 1.0, 1.0,  -1, 1, 0,   0, 0,

        0, 1.5, -1,  1.0, 1.0, 1.0,  -1, 1, 0,   1, 1,
        -1, 1, 1,    1.0, 1.0, 1.0,  -1, 1, 0,   0, 0,
        -1, 1, -1,   1.0, 1.0, 1.0,  -1, 1, 0,   1, 0,
        // Roof - Mặt phải 
        1, 1, -1,    1.0, 1.0, 1.0,  1, 1, 0,   1, 0,
        0, 1.5, -1,  1.0, 1.0, 1.0,  1, 1, 0,   1, 1,
        1, 1, 1,     1.0, 1.0, 1.0,  1, 1, 0,   0, 0,

        1, 1, 1,     1.0, 1.0, 1.0,  1, 1, 0,   0, 0,
        0, 1.5, -1,  1.0, 1.0, 1.0,  1, 1, 0,   1, 1,
        0, 1.5, 1,   1.0, 1.0, 1.0,  1, 1, 0,   0.0, 1
    ]);
    
    var verticesFront = new Float32Array([
        // Cube - Mặt sau 
        -1, -1, 1,   1.0, 1.0, 1.0,  0, 0, 1,   0, 0,
        1, -1, 1,    1.0, 1.0, 1.0,  0, 0, 1,   1, 0,
        1, 1, 1,     1.0, 1.0, 1.0,  0, 0, 1,   1, 1,

        1, 1, 1,     1.0, 1.0, 1.0,  0, 0, 1,   1, 1,
        -1, 1, 1,    1.0, 1.0, 1.0,  0, 0, 1,   0, 1,
        -1, -1, 1,   1.0, 1.0, 1.0,  0, 0, 1,   0, 0
    ]);
        
    var verticesBack = new Float32Array([
        // Cube - Mặt sau 
        -1, -1, -1,  1.0, 1.0, 1.0,  0, 0, -1,  0, 0,
        1, -1, -1,   1.0, 1.0, 1.0,  0, 0, -1,  1, 0,
        1, 1, -1,    1.0, 1.0, 1.0,  0, 0, -1,  1, 1,
        1, 1, -1,    1.0, 1.0, 1.0,  0, 0, -1,  1, 1,
        -1, 1, -1,   1.0, 1.0, 1.0,  0, 0, -1,  0, 1,
        -1, -1, -1,  1.0, 1.0, 1.0,  0, 0, -1,  0, 0
    ]);
    var verticesSide = new Float32Array([
        // Cube - Mặt trái 
        -1, -1, -1,  1.0, 1.0, 1.0,  -1, 1, 0,   0, 0,
        -1, 1, -1,   1.0, 1.0, 1.0,  -1, 1, 0,   0, 1,
        -1, 1, 1,    1.0, 1.0, 1.0,  -1, 1, 0,   1, 1,
        -1, 1, 1,    1.0, 1.0, 1.0,  -1, 1, 0,   1, 1,
        -1, -1, 1,   1.0, 1.0, 1.0,  -1, 1, 0,   1, 0,
        -1, -1, -1,  1.0, 1.0, 1.0,  -1, 1, 0,   0, 0,
        // Cube - Mặt phải 
        1, -1, -1,   1.0, 1.0, 1.0,  1, 1, 0,   0, 0,
        1, 1, -1,    1.0, 1.0, 1.0,  1, 1, 0,   0, 1,
        1, 1, 1,     1.0, 1.0, 1.0,  1, 1, 0,   1, 1,
        1, 1, 1,     1.0, 1.0, 1.0,  1, 1, 0,   1, 1,
        1, -1, 1,    1.0, 1.0, 1.0,  1, 1, 0,   1, 0,
        1, -1, -1,   1.0, 1.0, 1.0,  1, 1, 0,   0, 0
    ]);
    var verticesBottom = new Float32Array ([
        // Cube - Mặt đáy 
        -1, -1, -1,  1.0, 1.0, 1.0,  0, -1, 0,   0, 0,
        -1, -1, 1,   1.0, 1.0, 1.0,  0, -1, 0,   0, 1,
        1, -1, 1,    1.0, 1.0, 1.0,  0, -1, 0,   1, 1,
        1, -1, 1,    1.0, 1.0, 1.0,  0, -1, 0,   1, 1,
        1, -1, -1,   1.0, 1.0, 1.0,  0, -1, 0,   1, 0,
        -1, -1, -1,  1.0, 1.0, 1.0,  0, -1, 0,   0, 0
    ]);
    
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');//roof
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');//front
    var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');//back
    var u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');//side
    var u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');//bottom

    var u_UseTexture = gl.getUniformLocation(gl.program, 'u_UseTexture');
    
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    var texture2 = gl.createTexture();
    var texture3 = gl.createTexture();
    var texture4 = gl.createTexture();

    var image0 = new Image();
    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();
    var image4 = new Image();

    image0.onload = function() { loadTexture(gl, texture0, u_Sampler0, image0, 0); };
    image1.onload = function() { loadTexture(gl, texture1, u_Sampler1, image1, 1); };
    image2.onload = function() { loadTexture(gl, texture2, u_Sampler2, image2, 2); };
    image3.onload = function() { loadTexture(gl, texture3, u_Sampler3, image3, 3); };
    image4.onload = function() { loadTexture(gl, texture4, u_Sampler4, image4, 4); };

    image0.src = 'roof.jpg';
    image1.src = 'front3.jpg';
    image2.src = 'back3.jpg';
    image3.src = 'side3.jpg';
    image4.src = 'bottom.jpg';


    var vertexBufferRoof = gl.createBuffer();
    var vertexBufferFront = gl.createBuffer();
    var vertexBufferBack = gl.createBuffer();
    var vertexBufferSide = gl.createBuffer();
    var vertexBufferBottom = gl.createBuffer();

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

    var FSIZE = verticesRoof.BYTES_PER_ELEMENT;

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');

    var vpMatrix = new Matrix4();
    var xformMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    

    var lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();
    function updateLighting() {
    if (useLight) {
      gl.uniform3f(u_LightColor, r, g, b); // Cập nhật màu chiếu sáng
      gl.uniform3f(u_AmbientLight, 0, 0, 0); // Bật ánh sáng xung quanh
    } else {
      gl.uniform3f(u_LightColor, 0.0, 0.0, 0.0); // Tắt ánh sáng chính
      gl.uniform3f(u_AmbientLight, 1, 1, 1); // Tắt ánh sáng xung quanh
    }
  }
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  gl.enableVertexAttribArray(a_Normal);
  gl.enableVertexAttribArray(a_TexCoord);


  var bt = document.getElementById('btt');
  var tick = function(){
    currentAngle = currentAngle + ANGLE_STEP;
    bt.onclick = function(ev){
        eX = myform.eX.value;
        eY = myform.eY.value;
        eZ = myform.eZ.value;
        aX = myform.aX.value;
        aY = myform.aY.value;
        aZ = myform.aZ.value;
        uX = myform.uX.value;
        uY = myform.uY.value;
        uZ = myform.uZ.value;    
      }
     
    // Xoay và scale đối tượng
    //vpMatrix - liên quan đến góc nhìn
    //xformMaatrix - liên quan đến xoay tiến co
    vpMatrix.setPerspective(60, 1, 1, 100);
    vpMatrix.lookAt(eX, eY, eZ, aX, aY, aZ, uX, uY, uZ);
    // xformMatrix.setScale(0.5, 0.5, 0.5);
    xformMatrix.setRotate(currentAngle, 0, 1.0, 0);

    // Cập nhật ma trận MVP
    mvpMatrix.set(vpMatrix).multiply(xformMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    
    // Cập nhật ma trận normal
    //Mỗi lần cập nhật thì ảnh hưởng đến vector pháp tuyến
    normalMatrix.setInverseOf(xformMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
    // Cập nhật ánh sáng
    updateLighting();

    //Khử chiều sâu
    gl.enable(gl.DEPTH_TEST);    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Bộ đệm đối tượng cho Mái nhà
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferRoof);
    gl.bufferData(gl.ARRAY_BUFFER, verticesRoof, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.uniform1i(u_UseTexture, 0);  // Dùng texture 0
    gl.drawArrays(gl.TRIANGLES, 0, 18); 

    //Bộ đệm đối tượng cho mặt trước mái nhà
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferFront);
    gl.bufferData(gl.ARRAY_BUFFER, verticesFront, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.uniform1i(u_UseTexture, 1);  // Dùng texture 0
    gl.drawArrays(gl.TRIANGLES, 0, 6); 

    //Bộ đệm đối tượng cho mặt sau mái nhà
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBack);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBack, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.uniform1i(u_UseTexture, 2);  // Dùng texture 0
    gl.drawArrays(gl.TRIANGLES, 0, 6); 

    //Hai ben ngoi nha
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSide);       
    gl.bufferData(gl.ARRAY_BUFFER, verticesSide, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.uniform1i(u_UseTexture, 3);  // Dùng texture 0
    gl.drawArrays(gl.TRIANGLES, 0, 12); 

    //Day ngoi nha
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBottom);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBottom, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 11, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 3);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 11, FSIZE * 6);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 11, FSIZE * 9);
    gl.uniform1i(u_UseTexture, 4);  // Dùng texture 0
    gl.drawArrays(gl.TRIANGLES, 0, 6); 


    requestAnimationFrame(tick);
  }
  tick();
  gl.clearColor(0.1,0.1,0.5,1.0);
}


function loadTexture(gl,texture, u_Sampler, image, texUnit){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
      } else if (texUnit == 1){
        gl.activeTexture(gl.TEXTURE1);
      } else if (texUnit == 2){
        gl.activeTexture(gl.TEXTURE2);
      }else if (texUnit == 3){
        gl.activeTexture(gl.TEXTURE3);
      }else if (texUnit == 4){
        gl.activeTexture(gl.TEXTURE4);
      }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(u_Sampler, texUnit);
}
function doimau(){
    r = myform.r.value;
    g = myform.g.value;
    b = myform.b.value;
}

function tat(){
  useLight = false;
}
function bat(){
  useLight = true;
}

function doi() {
  ANGLE_STEP = -ANGLE_STEP;
} 

var cr = 0; 

function dung(){
  if(cr==0){
      cr = ANGLE_STEP; 
  }
  ANGLE_STEP = 0;
}

function tiep() {
  if(cr!=0){
    ANGLE_STEP = cr;
    cr = 0;
  }
}
