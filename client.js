if(process.argv.length != 4){
  console.error('Usage:\n  ' + process.argv[0] + ' ' + process.argv[1] + ' ip port');
  return;
}

var strHost = process.argv[2];
var nPort = process.argv[3];
var strCurrentDirectory = '/';
var lines;

var fs = require('fs');
var net = require('net');

var cmd_cd = function(directory){
 switch(directory){
   case '..':
     if(strCurrentDirectory.length > 1){
      strCurrentDirectory = strCurrentDirectory.substring(0, strCurrentDirectory.length - 1);
      var nIndex = strCurrentDirectory.lastIndexOf('/');
      if(nIndex < 0)
        strCurrentDirectory = '/';
      else
        strCurrentDirectory = strCurrentDirectory.substring(0, nIndex + 1);
     }
     break;
   default:
     if(directory[0] != '/')
       strCurrentDirectory += directory;
     else
       strCurrentDirectory = directory;
     if(strCurrentDirectory[strCurrentDirectory.length - 1] != '/')
       strCurrentDirectory += '/';
 }
}

var cmd_ls = function(path){
  if(path == undefined)
    path = strCurrentDirectory;
  else{
    if(path[0] != '/')
      path = strCurrentDirectory + path;

    if(path[path.length - 1] != '/')
      path += '/';
  }

var client = net.createConnection(nPort, strHost, function() {
  //console.error("Listing " + path);
  var strReceived = '';


  this.on('data', function(data) {
    strReceived += data.toString();
//    rsStream.write(data);
//    console.error('data: ' + data.length);
    //console.error('data: ' + strReceived);
  });


  this.on('end', function() {
    lines = strReceived.split('\n');
    for(var i = 0, n = lines.length; i < n; ++i){
      var line = lines[i];
      if(line == '')
        break;
      console.error(i + ': ' + line);
    }
//    console.error('Disconnected');
  });
//  this.on('close', function() {
//    console.error('Disconnected');
//  });

  //console.error('Connected to ' + strHost + ':' + nPort);
  this.write(path);
//  this.pipe(process.stdout);
});

  client.on('error', function(err) {
    client.end();
    console.error('Error(Connection): ', err.message);
  });

  client.on('end', function() {
    this.end();
    //console.error('Disconnected');
  });
}//cmd_ls

var cmd_get = function(path){
  path = strCurrentDirectory + path;
  var nIndex = path.lastIndexOf('/');
  if(nIndex == -1){
    console.error('Invalid file path: "' + path + '"\n');
    return;
  }

  var strFileName = path.substring(nIndex + 1);
  if(strFileName == ''){
    console.error('Invalid file path: "' + path + '"\n');
    return;
  }

var client = net.createConnection(nPort, strHost, function() {
  console.error("Dowloading " + strFileName);

  rsStream = fs.createWriteStream('./download/' + strFileName);

  rsStream.on('error', function(err) {
    this.end();
    console.error('Error(File system): ', err.message);
  });

//  socket.on('data', function(data) {
//    rsStream.write(data);
//    console.error('data: ' + data.length);
//  });


//  this.on('close', function() {
//    console.error('Disconnected');
//  });

  //console.error('Connected to ' + strHost + ':' + nPort);
  this.write(path);
  this.pipe(rsStream);
});

  client.on('error', function(err) {
    client.end();
    console.error('Error(Connection): ', err.message);
  });

  client.on('end', function() {
    this.end();
    rsStream.close();
    console.error('Disconnected');
  });
//client.on('connect', function() {
//});
}//cmd_get

var cmd_getByIndex = function(index){
  if(lines == undefined){
    console.error('Error(List): No file list!');
    return;
  }

  if(index >= lines.length || lines[index] == ''){
    console.error('Error(Index): Out of range!');
    return;
  }
  var strName = lines[index];
  //console.error(strName);
//  if(strName != undefined && strName.length > 0)
  cmd_get(strName);
}

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', function (line){
  var cmd = line;
  var i = line.indexOf(' ');
  var argv0;
  if(i > 0){
    cmd = line.substring(0, i);
    argv0 = line.substring(i + 1);
  }
  switch(cmd){
    case 'q':{
      rl.close();
      return;
    }break;
    case 'cd':{
      cmd_cd(argv0);
    }break;
    case 'ls':{
      cmd_ls(argv0);
      }break;
    case 'get':{
      cmd_getByIndex(argv0);
      //cmd_get(argv0);
      }break;
//    default:
  }
  console.error(strCurrentDirectory + '>>');
});//rl.question

console.error(strCurrentDirectory + '>>');

