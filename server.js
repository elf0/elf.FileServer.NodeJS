if(process.argv.length != 4 && process.argv.length != 3){
  console.error('Usage:\n  ' + process.argv[0] + ' ' + process.argv[1] + ' port [root]');
  return;
}

var nPort = process.argv[2];
var strRoot = "";
if(process.argv.length == 4){
  strRoot = process.argv[3];
  if(strRoot[strRoot.length - 1] == '/'){
    console.error('Error: root can not end with "/"\n');
    return;
  }
}

var CheckPath = function(strPath){
//  fs.exists(strPath, function(bExists){
//    if(!bExists)
//      onInvalid(strPath);
//  });
  
  if(strPath[0] != '/'){
//    socket.write('Error: Path must start with "/"\n');
//    socket.end();
   // onInvalid(strPath);
    return false;
  }

  if(strPath.indexOf('/..') != -1){
//    socket.write('Error: Path can not contains ".."\n');
//    socket.end();
    //onInvalid(strPath);
    return false;
  }
//  onValid(strPath);
    return true;
}
//if(strRoot.isExits()){
//  console.error('Error: Path not exists: "' + strRoot + '"\n');
//  return;
//}

var fs = require('fs');
var net = require('net');

var server = net.createServer(function (socket) {
  console.error('Connection: ' + socket.remoteAddress + ':' + socket.remotePort);

  //socket.setTimeout(6000, function() {
  //   socket.end();
  //});

  socket.on('error', function(err) {
    socket.end();
    console.error('Error(Server): ', err.message);
  });

  socket.on('end', function() {
    socket.end();
    //console.error('Disconnected');
  });//onEnd

  socket.on('data', function(data) {
    //var type = data.readUInt8(0);
    //console.error('type: ' + type);
//    receivedSize += data.length;
//    socket.write(data);
//    var strPath = data.toString().trim();
    var strPath = data.toString();
    if(CheckPath(strPath)){
      if(strPath[strPath.length - 1] == '/'){
        fs.readdir(strRoot + strPath, function(err, files){
          if(err){
           socket.write('Error: Directory can not be accessed!\n');
           socket.end();
           return;
          }
          var n = files.length;
          for(var i = 0; i < n; ++i){
            socket.write(files[i] + '\n');
          }
          socket.end();
        });//readdir
        }//dir
        else{
          var rs = fs.createReadStream(strRoot + strPath);
          rs.on('error', function(err) {
           socket.write('Error: File can not be accessed!\n');
           socket.end();
          });//onError
          rs.pipe(socket);
        }//file
      }
      else{
         socket.write('Error: Invalid path!\n');
         socket.end();
      }//CheckPath

   
//      console.error('Error(File system): ', err.message);
  });//onData

//  socket.write('Echo server\r\n');

//  socket.pipe(socket);
});//createServer

server.listen(nPort, '0.0.0.0');
