// default value for each type of server
var replicas_num = 3,
    acceptors_num = 3,
    leaders_num = 1,
    clients_num = 1,
    paxosTimeLine='init',
    historySequenceChart=new SequenceChart();
// visualizer
function visualizer() {
    var bodyElement = $('#data'); //

    //clean UI if needing
    if (paxosTimeLine!='init') {
        paxosTimeLine.clear();
        paxosTimeLine='init';
        bodyElement.empty();
    }
    CSSPlugin.defaultTransformPerspective = 100;

    // a map which stores the final position of each server
    // key: port         value: {'left':int,'top':int}
    // using to locate the start and final positions of each message based on the port number
    var serversPos = {};

    // initial value for UI layout
    var className = 111,
        left_offset = 50,
        left_inc = 400,
        top_offset_init = 50,
        top_offset = 50,
        top_inc = 250,
        top_offset_adjust = -200,
        message_offset = 100;
    // the buttons and lines of control bar
    var playBtn = $("#playBtn"),
        pauseBtn = $("#pauseBtn"),
        resumeBtn = $("#resumeBtn"),
        time = $("#time"),
        progress = $("#progress"),
        timeScale = $("#timeScale"),
        cpuTime = $("#cpu_time"),
        elapseTime = $("#elapse_time"),
        buttons = [playBtn, pauseBtn, resumeBtn];
    //create paxos timeline
    paxosTimeLine = new TimelineLite({
        onUpdate: updateSlider,
        onComplete: updateTime,
        delay: 0.3
    });
    TweenLite.set("#demo", {
        visibility: "visible"
    });
    historySequenceChart.init() ;

    // initialize paxos servers
    // use to adjust the top position of servers except the first column servers
    var firstColumn = true;
    for (var obj of servers) {
        for (var port of obj.ports) {
            var ele = createShape(obj.type + ':' + port, className, obj.type),
                relativedPosition = getRelativedPosition(className);
            paxosTimeLine.to(ele, 0, {
                left: left_offset,
                top: (top_offset - relativedPosition.top + (firstColumn ? 0 : top_offset_adjust)),
                opacity: 1
            }, 0);
            serversPos[port] = {
                'left': left_offset,
                'top': top_offset + (firstColumn ? 0 : top_offset_adjust) + message_offset
            };
            top_offset += top_inc;
            className++;
            historySequenceChart.addServer(obj.type,port);// add to history sequence chart
        }
        firstColumn = false;
        top_offset = top_inc;
        left_offset += left_inc;
    }

    //initialize paxos messages
    var currentTime = 1.5, // the time to start to animate messages
        time_inc=0.5;// the duration between two different consecutive sets of messages

    for (var i = 0; i < messages.length;) {
        if (messages[i].action == 'send') {
            var j = i + 1;
            for (var j = i + 1; j < messages.length;) {
                if (messages[j].action == 'send' && messages[j].type == messages[i].type && messages[j].from == messages[i].from) {
                    j++;
                } else {
                    break;
                }
            }
            var toList=[],
                labelList=[];

            for (var k = i; k < j; k++) {
                var ele = createShape(messages[k].type + messageToString(messages[k].message), className, 'message');
                var relativedPosition = getRelativedPosition(className);
                var fromPos = serversPos[parseInt(messages[k].from)],
                    toPos = serversPos[parseInt(messages[k].to)];
                paxosTimeLine.to(ele, 0, {
                        x: fromPos.left,
                        y: -relativedPosition.top + fromPos.top,
                        opacity: 1
                    }, currentTime)
                    .to(ele, 1, {
                        x: toPos.left,
                        y: toPos.top - relativedPosition.top,
                        opacity: 1
                    }, currentTime);
                className++;
                toList.push(messages[k].to);
                labelList.push(messages[k].type + messageToString(messages[k].message));
            }
            historySequenceChart.addMessages(messages[i].from,toList,labelList,messages[i].type);
            currentTime += time_inc;
            i = j;
        } else {
            i++;
        }
    }
    //save the history sequence chart text to local storage
    historySequenceChart.saveToLocalStorage();

    $("#progressSlider").slider({
        range: false,
        min: 0,
        max: 1,
        step: 0.001,
        slide: function(event, ui) {
            paxosTimeLine.progress(ui.value).pause();
        }
    });

    function updateSlider() {
        $("#progressSlider").slider("value", paxosTimeLine.progress());
        time.html(paxosTimeLine.time().toFixed(2));
        progress.html(paxosTimeLine.progress().toFixed(2))
    }

    function updateTime() {
        cpuTime.html('CPU Time: ' + cpu_time);
        elapseTime.html('Elapse Time: ' + elapse_time);
    }
    $("#playBtn").on("click", function() {
        paxosTimeLine.play();
    });

    $("#pauseBtn").on("click", function() {
        paxosTimeLine.pause();
    });

    $("#resumeBtn").on("click", function() {
        paxosTimeLine.resume();
    });

    $("#reverseBtn").on("click", function() {
        paxosTimeLine.reverse();
    });

    $("#restartBtn").on("click", function() {
        paxosTimeLine.restart();
    });

    $("#timeScaleSlider").slider({
        value: 3,
        range: false,
        min: 0.1,
        max: 3,
        step: 0.05,
        slide: function(event, ui) {
            paxosTimeLine.timeScale(ui.value);
            timeScale.html(ui.value)
        },
        change: function() {
            // paused => wake up
            if (paxosTimeLine.paused()) {
                paxosTimeLine.resume();
            }
            // end => restart
            if (paxosTimeLine.progress() == 1) {
                paxosTimeLine.restart();
            }
            // beginning (only reverse method can reach the beginning)=> restart
            if (paxosTimeLine.reversed() && paxosTimeLine.progress() === 0) {
                paxosTimeLine.restart();
            }
        }

    });

    // append dom element (message or server ) to div
    function createShape(message, className, classId) {
        element = '<div class="' + className + '"  id="' + classId +
            '" style="left=100;top=100">' + message + '</div>';
        bodyElement.append(element);
        return '.' + className;
    }
    // convert message array to string
    function messageToString(message) {
        if (message.length == 0) return "";
        var str = '( ';
        for (var i = 0; i < message.length; i++) {
            if (Array.isArray(message[i])) {
                str += messageToString(message[i]);
            } else {
                str += message[i] + ',';
            }
        }
        str += ' )';
        return str;
    }
    // get the relatived position of the first dom element by class name
    function getRelativedPosition(className) {
        var element = document.getElementsByClassName(className)[0];
        return {
            'left': element.offsetLeft,
            'top': element.offsetTop
        };
    }

}
