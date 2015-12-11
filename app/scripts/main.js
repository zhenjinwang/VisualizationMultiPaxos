var messages = '',
    servers = '',
    cpu_time = 0,
    elapse_time = 0,
    delay_call = 500;

function initPaxos() {
    visualizer_data = {};
    messages = '';
    servers = '';
    if (resetUI()) return;
    startPaxos();
}

function resetUI() {
    if (paxosTimeLine) {
        /*paxosTimeLine.clear();
        var parent=document.getElementById('data');
        while(parent.hasChildNodes()){
           parent.removeChild(parent.firstChild);
        }*/
        location.reload();
        return true;
    }
}

function reloadPaxos() {
    console.log('reloadData');
    if (resetUI()) return;
    var get = $.ajax({
        url: 'http://' + location.hostname + ':5000/api/pre/data',
        method: "GET",
        success: function(data, textStatus, jqXHR) {
            messages = data.data;
            servers = data.servers;
            cpu_time = data.cpu_time;
            elapse_time = data.elapse_time;
            visualizer();
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        complete: function(jqXHR, status) {

        }
    });
}

function getData() {
    console.log('getData');
    var get = $.ajax({
        url: 'http://' + location.hostname + ':5000/api/data',
        method: "GET",
        success: function(data, textStatus, jqXHR) {
            messages = data.data;
            if (messages.length == 0) {
                setTimeout(getData, delay_call);
            } else {
                servers = data.servers;
                cpu_time = data.cpu_time;
                elapse_time = data.elapse_time;
                visualizer();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        complete: function(jqXHR, status) {

        }
    });
}

function startPaxos() {
    replicas_num = parseInt($('input[name=replica]').val());
    acceptors_num = parseInt($('input[name=acceptor]').val());
    leaders_num = parseInt($('input[name=leader]').val());
    clients_num = parseInt($('input[name=client]').val());
    var get = $.ajax({
        url: 'http://' + location.hostname + ':5000/api/start/' +
            acceptors_num + '/' + leaders_num +
            '/' + replicas_num + '/' + clients_num,
        method: "GET",
        success: function(data, textStatus, jqXHR) {
            setTimeout(getData, 5 * delay_call);
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        complete: function(jqXHR, status) {

        }
    });
}
