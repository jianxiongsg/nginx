let ConfParser = require("./ConfParser");

let parser = new ConfParser("D:/nginx-1.17.4/conf/nginx.conf");

let data = parser.toJson();

// parser.writeFile('C:/Users/admin/Desktop/test1/',json)
parser.writeFile('C:/Users/admin/Desktop/test1/',data)


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