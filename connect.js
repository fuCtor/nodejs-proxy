
var server = function () {
    var net = require('net'),

        tunnel = require('./tunnel').open,
        trans = require('./transparent').open,

        HEADERS = "Proxy-agent: protonet-proxy/0.0.1\r\n";

    var new_server = net.createServer(function (socket) {

        var buffer = '',
            http_version = 'HTTP/1.0';

        send_response = function (numeric, text, close) {
            console.log('Sending HTTP ' + numeric +  ' ' + text + ' response');

            try {
                socket.write(http_version + ' ' + numeric + ' ' + text + "\r\n");
                socket.write(HEADERS +  "\r\n");

                if (close) {
                    console.log('Disconnecting client');
                    socket.end();
                }
            } catch (ex) {
                console.log('Error occurred while sending HTTP response');
            }
        }

        // define it here so it can be unassigned
        var handler = function (data) {
            buffer += data.toString();

            if (buffer.indexOf("\r\n\r\n") > 0) {
                socket.removeListener('data', handler);

                var captures = buffer.match(/^CONNECT ([^:]+):([0-9]+) (HTTP\/1\.[01])/);

                if (!captures || captures.length < 2) {
                    console.log('Received invalid HTTP request');
                    return send_response(400, 'Bad Request', true);
                }

                var tmp = captures[1].split('~');
                var target = tmp[0];
                var port = captures[2];
                var old_style = tmp.length > 1;
                console.log('Client requested a tunnel to ' + target + ' port ' + port);
                if (old_style) console.log('Using the old HTTP CONNECT method');

                http_version = captures[3];

                {
                    console.log('Remote port is ' + port);

                    if (!port) {
                        return send_response(401, 'Unknown Proxy Target', true);
                    }

                    var method = old_style ? tunnel : trans;
                    var remote = method(target, port, target + ':' + port, function (data) {
                        if (data == null) {
                            return send_response(500, 'Remote node refused tunnel or does not respond', true);
                        }

                        console.log('Connected to upstream service, initiating tunnel pumping');

                        var closeBoth = function () {
                            console.log('Disconnecting tunnel');
                            try {
                                socket.end();
                            } catch (ex) {}
                            try {
                                remote.end();
                            } catch (ex) {}
                        }

                        var tunnel = function (other) {
                            return function (data) {
                                try {
                                    other.write(data);
                                } catch (ex) {
                                    console.log('Error during socket write');
                                    closeBoth();
                                }
                            }
                        };
                        
                        if ( !(exports.host_allowed(target) || exports.ip_allowed(remote.remoteAddress)) )
                        {
                          closeBoth();
                          return send_response(403, 'Denied', true);
                        }
                        
                        socket.addListener('data', tunnel(remote));
                        remote.addListener('data', tunnel(socket));

                        socket.addListener('close', closeBoth);
                        remote.addListener('close', closeBoth);

                        socket.addListener('error', closeBoth);
                        socket.addListener('error', closeBoth);

                        send_response(200, 'Connection Established');

                        if (data.length > 0) {
                            try {
                                socket.write(data);
                            } catch (ex) {}
                        }
                    });
                }
            }
        }

        socket.addListener('data', handler);
    });
    return new_server;
}();

exports.host_allowed = function() { return true; };
exports.ip_allowed = function() { return true; };

exports.listen = function (port, ip) {
    server.listen(port, ip);
    console.log('Proxy server running at ' + ip + ':' + port);
};