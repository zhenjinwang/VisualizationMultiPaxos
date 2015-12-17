// convert message queue to MSCGEn style text to show message sequence chart
var SequenceChart=function(){
      this.firstServer='0 [arclinecolor="transparent", arctextcolor="transparent", linecolor="transparent", textcolor="transparent"]';
      this.servers='';
      this.messages='';
      this.initialSetting='hscale="0.6", arcgradient="18", wordwraparcs="false";';
      this.mapping={};
      this.id=1;
      this.colors=['#ff0000','#000033','#0000ff','#7f00ff','#ff00ff','#ff0000',
              '#000000','#8c0000'];
      this.serverColorId=0;
      this.messageColorId=0;
};
// initialize variables
SequenceChart.prototype.init=function(){
      this.servers='';
      this.messages='';
      this.mapping=[];
      this.serverColorId=0;
      this.messageColorId=0;
      this.id=1;
}
// return MSCGEN style text
SequenceChart.prototype.getContent=function(){
    return 'msc{\n'+this.initialSetting+'\n\n'+this.firstServer+''+this.servers+';\n'+this.messages+'\n}';
}

//add server message
SequenceChart.prototype.addServer=function(type,port){
      var index=0;
      if(this.mapping[type]){
        index=this.mapping[type];
      }else{
        index=this.serverColorId;
        this.mapping[type]=this.serverColorId;
        this.serverColorId+=1;
      }
      this.mapping[port]=this.id;
      this.servers+=',\n'+this.id+' '+this.setting(type+' '+port,this.colors[index]);
      this.id+=1;
}
// add content message
SequenceChart.prototype.addMessages=function(from,toList,labelList,type){
    var index=0;
    if(this.mapping[type]){
      index=this.mapping[type];
    }else{
      index=this.messageColorId;
      this.mapping[type]=this.messageColorId;
      this.messageColorId+=1;
    }
    var values='0--1 '+this.typeSetting(type,this.colors[index])+',\n';
    for(var i=0;i<toList.length-1;i++){
        values+=this.mapping[from]+' => '+this.mapping[toList[i]]+' '+this.setting(labelList[i],this.colors[index])+',\n';
    }
    values+=this.mapping[from]+' => '+this.mapping[toList[toList.length-1]]+' '+
            this.setting(labelList[labelList.length-1],this.colors[index])+';\n';
    this.messages+=values;
}
// return a setting for all kinds of messages
SequenceChart.prototype.setting=function(label,color){
      return '[label="'+label+'", linecolor="'+color+'" , textcolor="'+color+'" ]';
}
// return a setting for the first 0 server which to state the type of message
SequenceChart.prototype.typeSetting=function(label,color){
      return '[label="'+label+'", linecolor="transparent" , textcolor="'+color+'" ]';
}
// creating a new window to show the history sequence chart 
SequenceChart.prototype.openNewHistoryWindow=function(){
   //window.open("", "", "width=200, height=100");
   var historyWindow=window.open('');
   historyWindow.document.write(
     '<!doctype html>'+
     '<html>'+
       '<head>'+
         '<title>VR Multi Paxos</title>'+
         '<link rel="apple-touch-icon" href="apple-touch-icon.png">'+
         '<script src="https://sverweij.github.io/mscgen_js/mscgen-inpage.js"></script>'+
         '<style>body {background-color:lightgrey;}</style>'+
       '</head>'+
       '<body class="vrpaxos">'+
         '<div id="sequenceChart" style="float:center">'+
          '<pre id="data" class="code mscgen mscgen_js" data-language="mscgen">'+
            this.getContent()+
            '</pre>'+
          '</div>'+
       '</body>'+
     '</html>'
   );
}
