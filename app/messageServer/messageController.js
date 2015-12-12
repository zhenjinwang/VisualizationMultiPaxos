module.exports = function() {
    var exec = require('child_process').exec,
        paxos_driver = 'init',
        cmd = 'py -m da ../DistAlgoCompiler/distalgo/examples/vrpaxos/orig.da',
        fs = require('fs');

    var messagesQueue = [],
        servers = [{
            'type': 'acceptor',
            'ports': []
        }, {
            'type': 'leader',
            'ports': []
        }, {
            'type': 'replica',
            'ports': []
        }, {
            'type': 'client',
            'ports': []
        }],
        mapping = {
            'acceptor': 0,
            'leader': 1,
            'replica': 2,
            'client': 3
        },
        startTime,
        endTime,
        count_done = 0,
        replica = 3,
        acceptor = 3,
        leader = 1,
        client = 1,
        totalServers = 8,
        totalCPUTime = 0,
        totalElapseTime = 0,
        status = false;
    // start paxos driver to produce real time message log
    this.startPaxosDriver = function(acceptor_num, leader_num, replica_num, client_num) {
        // to avoid large number of paxos servers to cause crash
        acceptor = (acceptor_num>0&&acceptor_num<6)?acceptor_num:3;
        leader = (leader_num>0&&leader_num<6)?leader_num:1;
        replica = (replica_num>0&&replica_num<6)?replica_num:3;
        client = (client_num>0&&client_num<6)?client_num:1;
        console.log(acceptor + ' ' + leader + ' ' + replica + ' ' + client);
        totalServers = acceptor + leader + replica + client;
        count_done = 0;
        totalCPUTime = 0;
        totalElapseTime = 0;
        messagesQueue = [];
        servers = [{
            'type': 'acceptor',
            'ports': []
        }, {
            'type': 'leader',
            'ports': []
        }, {
            'type': 'replica',
            'ports': []
        }, {
            'type': 'client',
            'ports': []
        }];
        if (!status) // make sure at most one paxos is running
            this.execPaxosDriver(acceptor, leader, replica, client);
        status = true;
    }
    //reverse the status
    this.changeStatus = function() {
        status = !status;
    }
    //add message object to messagesQueue
    this.addMessage = function(message) {
        messagesQueue.push(message);
        if (message.action == 'done') {
            count_done++;
            totalCPUTime += message.message[1];
            totalElapseTime += message.message[2];
            console.log('count done' + count_done);
            if (count_done == totalServers) {
                this.saveMessageLog({
                    'data': messagesQueue,
                    'servers': servers,
                    'cpu_time': totalCPUTime / totalServers,
                    'elapse_time': totalElapseTime / totalServers
                });
            }
        } else {
            if (message.action == 'start') {
                servers[mapping[message.message[0]]].ports.push(message.from);
            }
        }
    }
    //return whether Master receives enough 'done' message from paxos driver
    this.messageLogReady = function() {
        return totalServers == count_done || (leader > 1 && totalServers / 2 < count_done);
    }
    // return a message log object
    this.messageLog = function() {
        console.log(totalServers + ' ' + count_done + ' ' + leader);
        status=false;
        this.killProcess();
        return {
            'data': messagesQueue,
            'servers': servers,
            'cpu_time': totalCPUTime / totalServers,
            'elapse_time': totalElapseTime / totalServers
        };
    }
    //return a empty message log object
    this.emptyMessageLog = function() {
        return {
            'data': [],
            'servers': {}
        };
    }
    //save message log object to local storage--a json file
    this.saveMessageLog = function(data) {
        fs.writeFile('app/Data/paxosData.json', JSON.stringify(data), function(err) {
            console.log(err);
        });
    }
    //read message log object from local storage
    this.readMessageLog = function() {
        try {
            var content = JSON.parse(fs.readFileSync("app/Data/paxosData.json"));
            return {
                'data': content.data,
                'servers': content.servers,
                'cpu_time': content.cpu_time,
                'elapse_time': content.elapse_time
            };
        } catch (e) {
            return this.emptyMessageLog();
        }
    }
    // kill the child process which runs paxos driver
    this.killProcess = function() {
        if (paxos_driver != 'init') {
            paxos_driver.kill('SIGTERM');
            console.log('kill child process');
        }
    }
    // execute the paxos driver 
    this.execPaxosDriver = function(acceptor, leader, replica, client) {
        this.killProcess(); // to make sure previous child process is killed
        paxos_driver = exec('py -m da app/DistAlgoCompiler/distalgo-master/examples/vrpaxos/orig.da ' +
            acceptor + ' ' + leader + ' ' + replica + ' ' + client,
            function(err, out, code) {
                console.log('finish');
                return 'init';
            });
    }
}
