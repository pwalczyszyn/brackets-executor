/* jshint node:true */
var childProcess = require('child_process'),
    cmdProcess,
    logs;

function executeCommand(cmd, args) {
    console.log('executing:', cmd, 'with args', args);

    logs = [];
    cmdProcess = childProcess.spawn(cmd, args);

    cmdProcess.stdout.on('data', function (data) {
        logs.push('stdout: ' + data);
    });

    cmdProcess.stderr.on('data', function (data) {
        logs.push('stderr: ' + data);
    });

    cmdProcess.on('close', function (code) {
        logs.push('close: ' + code);
    });

    //    exec(cmd, function (error, stdout, stderr) {
    //        console.log('stdout: ' + stdout);
    //        console.log('stderr: ' + stderr);
    //        if (error !== null) {
    //            console.log('exec error: ' + error);
    //        }
    //    });

    //    callback();
}

function popLogs() {
    return logs ? logs.splice(0, logs.length) : false;
}

exports.init = function (DomainManager) {
    if (!DomainManager.hasDomain('executor')) {
        DomainManager.registerDomain('executor', {
            major: 0,
            minor: 1
        });
    }
    DomainManager.registerCommand(
        'executor',
        'executeCommand',
        executeCommand,
        false);
    DomainManager.registerCommand(
        'executor',
        'popLogs',
        popLogs,
        false);
};
