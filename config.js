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
  add_proxy_header: false,//activate addition of X-Forwarded-For header for better logging on real server side
  allow_ip_list: '../0ban-server-scripts/allow_ip_list',
  black_list:    '../0ban-server-scripts/black_list',
  host_filters:   './config/hostfilters.js',
  allow_size:  1000000,
  denied_ext:  ['exe', 'rar', 'zip', '7z', 'mp3', 'avi', 'flv', 'mkv',  'mp4', 'dat', 'txt'],
  listen:[{ip:'0.0.0.0', port: argv.port || 8080}],
  listen_ssl:[{
              ip:'0.0.0.0',
              port: (argv.port || 8080) + 400 ,
              key:fs.readFileSync('/home/sv/ssl/server.key'),
              cert:fs.readFileSync('/home/sv/ssl/proxy_0ban_org.crt'),
              ca:[fs.readFileSync('/home/sv/ssl/proxy_0ban_org.pem')]
	      }
           ]
};

exports.config = config;

