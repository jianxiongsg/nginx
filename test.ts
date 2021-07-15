import ConfParser from "./ConfParser";

let parser = new ConfParser("E:/gsfserver/nginxMgr/testfolder/nginx.conf");

let list = parser.listLocation();
console.log("list",list)

// parser.addLocation("/cc/",{
//     proxy_pass:"http://127.0.0.1:111111/",
//     proxy_set_header:["X-Real-IP","ttttttt"]
// })

// parser.modifyLocation("/gg/",{
//     proxy_pass:"http://127.0.0.1:222222/",
//     proxy_set_header:["testForwarded"]
// })

// parser.modifyLocation("/chat/",{
//     proxy_pass:"http://127.0.0.1:33333/",
//     proxy_set_header:[],
//     proxy_http_version:""
// })

// parser.removeLocation("/cc/");

// parser.setStaticFolder("/root/test",{
//     root:"./static/"
// })
// parser.updateServer({
//     listen:"00000",
// })
// parser.setSSL({
//     listen:"444 ssl",
//     ssl_certificate:"cert/lovigame.com.pem",
//     ssl_certificate_key:"cert/lovigame.com.key"
// })

let data = parser.toJson()
// console.log(data);

parser.writeFile("E:/gsfserver/nginxMgr/testfolder/new/",data);


// parser.writeFile('C:/Users/admin/Desktop/test1/',json)
// parser.writeFile('C:/Users/admin/Desktop/test1/',data)


// var ConfigParser = require('@webantic/nginx-config-parser')
// var parser = new ConfigParser()
 
// parse straight from file
// var config = parser.readConfigFile('D:/nginx-1.17.4/conf/nginx.conf')
 
// write direct to file (overwriting existing one)
// config.http.server.listen = 99999;
// parser.writeConfigFile('C:/Users/admin/Desktop/test1/nginx1.conf', config, true)
 
 
// var sampleConfig = {
//   "server": {
//     "server_name": "_",
//     "location /": {
//       "try_files": "*.html"
//     }
//   }
// }
 
// to multi-line config string
// var configString = parser.toConf(sampleConfig)
// and back again
// var configJson = parser.toJSON(config)
 
// shorthand (will change object --> string and string --> object)
// parser.parse(config);
// console.log("config",config)
// console.log("resultStr",configJson);
// console.log("result",parser.parse(config));