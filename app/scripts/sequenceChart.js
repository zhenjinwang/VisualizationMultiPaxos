// convert message queue to MSCGEN style text to show message sequence chart
var SequenceChart=function(){
      this.firstServer='0 [arclinecolor="transparent", arctextcolor="transparent", linecolor="transparent", textcolor="transparent"]';
      this.servers='';
      this.messages='';
      this.initialSetting='hscale="0.6", arcgradient="18", wordwraparcs="false";';
      this.mapping={};
      this.id=1;
      this.colors=['#ff0000','#00FFFF','#000033','#0000ff','#8A2BE2','#800080',
                  '#F4A460','#7f00ff','#ff00ff','#000000','#8c0000'];
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
//generate message sequence chart
// messages: a list of message object
SequenceChart.prototype.generateSequenceChart=function(servers,messages){
  for (var obj of servers) {
      for (var port of obj.ports) {
          this.addServer(obj.type,port);// add to history sequence chart
      }
  }

  for (var i = 0; i < messages.length;) {
      if (messages[i].action == 'send') {
          var j = i + 1;
          for (var j = i + 1; j < messages.length;) {
              if (messages[j].action == 'send' && messages[j].type == messages[i].type &&
                  messages[j].from == messages[i].from) {
                  j++;
              } else {
                  break;
              }
          }
          var toList=[],
              labelList=[];
          for (var k = i; k < j; k++) {
              toList.push(messages[k].to);
              labelList.push(messages[k].type + messageToString(messages[k].message));
          }
          this.addMessages(messages[i].from,toList,labelList,messages[i].type);
          i = j;
      } else {
          i++;
      }
  }
}
// return MSCGEN style text
SequenceChart.prototype.getContent=function(){
    return 'msc{\n'+this.initialSetting+'\n\n'+this.firstServer+''+this.servers+';\n'+this.messages+'\n}';
}

//add server message
SequenceChart.prototype.addServer=function(type,port){
      var index=0;
      if(this.mapping[type]>=0){
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
    if(this.mapping[type]>=0){// 0 is false
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
// save history to localStorage
SequenceChart.prototype.saveToLocalStorage=function(){
   localStorage.setItem('messageHistory',this.getContent());
}
