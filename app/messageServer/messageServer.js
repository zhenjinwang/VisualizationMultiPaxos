'use strict';
// initial value of paxos driver and messages
var collect=[];
var messagesQueue=[],
    servers=[{'type':'acceptor','ports':[]},
              {'type':'leader','ports':[]},
              {'type':'replica','ports':[]},
              {'type':'client','ports':[]}],
    mapping={'acceptor':0,'leader':1,'replica':2,'client':3},
    initialSetting,
    startTime,
    endTime,
    count_done=0,
    replica=3,
    acceptor=3,
    leader=1,
    client=1,
    totalServers=8,
    totalCPUTime=0,
    totalElapseTime=0,
    status=false;

// Net Socket to collect messages(buffer stream) from Paxos Driver
var net = require('net');
var server = net.createServer();
var controller=require('../messageServer/messageController'),
    messageController=new controller();

server.on('connection',function(socket){
  socket.on('data', function(data){
    data=JSON.parse(data.toString('ascii'));
    messagesQueue.push(data)
    if(data.action=='done'){
       count_done++;
       totalCPUTime+=data.message[1],
       totalElapseTime+=data.message[2];
       if(count_done==totalServers){
         messageController.saveData({'data':messagesQueue,'servers':servers,'cpu_time':totalCPUTime/totalServers,'elapse_time':totalElapseTime/totalServers});
       }
       console.log('count done'+count_done);
    }else{
      if(data.action=='start'){
            servers[mapping[data.message[0]]].ports.push(data.from);
      }
    }
  });
  socket.on('error', function(data){
    console.log(data);
  });
});

server.listen(6000, function() { //'listening' listener
  console.log('server bound');
});

//Http server communicates with front end
var express = require('express'),
    cors = require('cors'),
    app = express(),
    http = require('http').Server(app);


var corsOptions=function(req,callback){
  var corsoptions={origin:true,credentials:true};
  callback(null,corsoptions);
};
app.use(cors(corsOptions)); // support cors domain request

app.get('/api/data', function(req, res) {
    if(totalServers==count_done||(leader>1&&totalServers/2<count_done)){
      console.log(totalServers+' '+count_done+' '+leader);
      status=false;
      messageController.killProcess();
      res.json({'data':messagesQueue,'servers':servers,'cpu_time':totalCPUTime/totalServers,'elapse_time':totalElapseTime/totalServers});     
    }else{
      res.json({'data':[],'servers':{}});
    }
});
app.get('/api/pre/data', function(req, res) {
      var content =messageController.readData();
      res.json({'data':content.data,'servers':content.servers,'cpu_time':content.cpu_time,'elapse_time':content.elapse_time});
});
app.get('/api/start/:acceptor/:leader/:replica/:client', function(req, res) {
    
    acceptor=parseInt(req.params.acceptor),
    leader=parseInt(req.params.leader),
    replica=parseInt(req.params.replica),
    client=parseInt(req.params.client);
    totalServers=acceptor+leader+replica+client;
    count_done=0;
    totalCPUTime=0,
    totalElapseTime=0;
    messagesQueue=[];
    servers=[{'type':'acceptor','ports':[]},
              {'type':'leader','ports':[]},
              {'type':'replica','ports':[]},
              {'type':'client','ports':[]}];
    console.log(acceptor+' '+leader+' '+replica+' '+client);
    console.log(count_done+' '+messagesQueue);
    if(!status)// make sure at most one paxos is running
        messageController.execPaxosDriver(acceptor,leader,replica,client);
    status=true;
    res.json({'ready':true});
});

http.listen(5000);
console.log('start server 5000')
