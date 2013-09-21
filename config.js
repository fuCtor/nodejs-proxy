/*
** Peteris Krumins (peter@catonmat.net)
** http://www.catonmat.net  --  good coders code, great reuse
**
** A simple proxy server written in node.js.
**
*/

var fs = require('fs'),
    argv = require('optimist').argv;

var config = {
  add_proxy_header: true,//activate addition of X-Forwarded-For header for better logging on real server side
  allow_ip_list: '../0ban-server-scripts/allow_ip_list',
  black_list:    '../0ban-server-scripts/black_list',
  host_filters:   './config/hostfilters.js',
  allow_size:  1000000,
  denied_ext:  ['exe', 'rar', 'zip', '7z', 'mp3', 'avi', 'flv', 'mkv',  'mp4', 'dat', 'txt'],
  listen:[{ip:'0.0.0.0', port: argv.port || 8080},//all ipv4 interfaces
          {ip:'::', port: argv.port6 || 8081}],//all ipv6 interfaces
  listen_ssl:[/*{
              ip:'0.0.0.0',//all *secure* ipv4 interfaces
              port:8443,
              key:fs.readFileSync('/home/sv/ssl/server.key'),
              cert:fs.readFileSync('/home/sv/ssl/server.crt'),
              ca:[fs.readFileSync('/home/sv/ssl/server.pem')]
            },{ 
              ip:'::',//all *secure* ipv6 interfaces
              port:8443,
              key:fs.readFileSync('/home/sv/ssl/server.key'),
              cert:fs.readFileSync('/home/sv/ssl/server.crt'),
              ca:[fs.readFileSync('/home/sv/ssl/server.pem')]

            }  */
           ]
};

exports.config = config;

