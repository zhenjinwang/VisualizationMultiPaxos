module.exports=function(){
     var exec = require('child_process').exec;
     var path='cd ../DistAlgoCompiler/distalgo/examples';
     var cmd = 'py -m da ../DistAlgoCompiler/distalgo/examples/vrpaxos/orig.da';
     var fs = require('fs');
     var busy=false;
     this.getServers
     this.saveData=function(data){
       fs.writeFile('app/Data/paxosData.json',JSON.stringify(data),function(err){
             console.log(err);
        });
     }
     this.readData=function(){
          return JSON.parse( fs.readFileSync("app/Data/paxosData.json"));
     }
     this.execPaxosDriver=function(acceptor,leader,replica,client){
       if(busy) return;
       busy=true;
       exec('py -m da app/DistAlgoCompiler/distalgo-master/examples/vrpaxos/orig.da '+
                    acceptor+' '+leader+' '+replica+' '+client,function(err,out,code){
                console.log('finish');
                busy=false;
        });
     }
}