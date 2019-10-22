#!/usr/bin/env node
let path = require("path");
let fs = require("fs");
let consign = "____";
let config={
  ssl:{
    listen:"443 ssl",
    ssl_certificate:"",
    ssl_certificate_key:"",
    ssl_session_timeout:"5m",
    ssl_ciphers:"ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4",
    ssl_protocols:"TLSv1 TLSv1.1 TLSv1.2",
    ssl_prefer_server_ciphers:"on",
    ssl_verify_client:"off"
  }
}

export interface LocationInfo{
  proxy_pass?:string;
  proxy_set_header?:string[];
  proxy_http_version?:string;
  proxy_connect_timeout?:string;
  proxy_send_timeout?:string;
  proxy_read_timeout?:string;
  proxy_buffer_size?:string;
  proxy_buffers?:string;
  proxy_busy_buffers_size?:string;
  proxy_temp_file_write_size?:string;
  proxy_redirect?:string
}

export interface SSLInfo{
  listen?:string,
  ssl_certificate:string;
  ssl_certificate_key:string;
  ssl_session_timeout?:string,
  ssl_ciphers?:string,
  ssl_protocols?:string,
  ssl_prefer_server_ciphers?:string,
  ssl_verify_client?:string
}

export interface StaticInfo{
  root:string;
  index?:string;
  try_files?:string;
}

export interface ServerInfo{
  listen?:string;
  server_name?:string;
}

export default class ConfParser{
    srcFile:string;
    private conf:any;
    private confJson:any;
    constructor(srcFile){
        this.srcFile = srcFile;
        this.conf = this.readFile();
        this.confJson = this.toJson();
    }

    readFile(){
        if(!fs.statSync(this.srcFile).isFile()) throw new Error("文件不存在");
        return fs.readFileSync(this.srcFile,"utf-8");
    }

    updateServer(info:ServerInfo){
      try {
        if(info.listen){
          let isSet = false;
          if(this.confJson.http.server.listen instanceof Array){
            for(let i=0;i<this.confJson.http.server.listen.length;++i){
              if(this.confJson.http.server.listen[i].indexOf("ssl") < 0){
                this.confJson.http.server.listen[i] = info.listen;
                isSet = true;
                break;
              }
            }
            if(!isSet){
              this.confJson.http.server.listen.push(info.listen)
            }
          }else{
            this.confJson.http.server.listen = info.listen;
          }
          
        if(info.server_name) this.confJson.http.server.server_name = info.server_name;
        }else{
          for(let idx in info){
            this.confJson.http.server[idx] = info[idx];
          }
        }
        
      } catch (error) {
        console.log(error)
      }
      
    }
    
    setSSL(info:SSLInfo){
      // let max = 30;
      // let splace = " ";
      let listen = "listen";
      
      try {
        if(info.listen){
          let isSet = false;
          if(this.confJson.http.server.listen instanceof Array){
            
            for(let i=0;i<this.confJson.http.server.listen.length;++i){
              if(this.confJson.http.server.listen[i].indexOf("ssl") != -1){
                this.confJson.http.server.listen[i] = info.listen;
                isSet = true;
                break;
              }
            }
          }
          if(!isSet){
            this.confJson.http.server.push(info.listen)
          }
            
          
        }else{
          this.confJson.http.server[listen] = config.ssl.listen;
        }
        
        // while(this.confJson.http.server[listen]){
        //   splace += " "
        //   listen = "listen" + splace;
        //   max--;
        //   if(max <=0){
        //     throw new Error("数据异常")
        //   }
        // }
        // this.confJson.http.server[listen] = info.listen || config.ssl.listen;
        this.confJson.http.server.ssl_certificate = info.ssl_certificate;
        this.confJson.http.server.ssl_certificate_key = info.ssl_certificate_key;
        this.confJson.http.server.ssl_session_timeout = info.ssl_session_timeout || config.ssl.ssl_session_timeout;
        this.confJson.http.server.ssl_ciphers = info.ssl_ciphers || config.ssl.ssl_ciphers;
        this.confJson.http.server.ssl_protocols = info.ssl_protocols || config.ssl.ssl_protocols;
        this.confJson.http.server.ssl_prefer_server_ciphers = info.ssl_prefer_server_ciphers || config.ssl.ssl_prefer_server_ciphers;
        this.confJson.http.server.ssl_verify_client = info.ssl_verify_client || config.ssl.ssl_verify_client;
        
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
      
    }

    setStaticFolder(name:string,info:StaticInfo){
      let locationName = "location "+name;
      try {
        if(this.confJson.http.server[locationName]){
          throw new Error("路由存在");
        }
        this.confJson.http.server[locationName] = {};
        for(let idx in info){
          this.confJson.http.server[locationName][idx] = info[idx];
        }
        let rootPath = this.confJson.http.server[locationName].root;
        if(!rootPath.startsWith("./")){
          this.confJson.http.server[locationName].root = path.resolve(__dirname,rootPath)
        }
      } catch (error) {
        console.log(error)
        return false;
      }
    }

    addLocation(name:string,info:LocationInfo){
      try {
        let locationName = "location "+name;
        if(this.confJson.http.server[locationName]){
          throw new Error("路由存在");
        }
        this.confJson.http.server[locationName] = {};
        for(let idx in info){
          this.confJson.http.server[locationName][idx] = info[idx];
        }
        return true;
      } catch (error) {
        console.log(error)
        return false;
      }
      
    }

    removeLocation(name:string){
      try {
        let locationName = "location "+name;
        if(this.confJson.http.server[locationName]){
          delete this.confJson.http.server[locationName];
          return true;
        }
        return false;
      } catch (error) {
        console.log(error)
        return false;
      }
      
    }

    modifyLocation(name:string,info:LocationInfo){
      try {
        let locationName = "location "+name;
        if(this.confJson.http.server[locationName]){
          for(let idx in info){
            if(!info[idx] || info[idx].length === 0){
              delete this.confJson.http.server[locationName][idx];
            }else{
              this.confJson.http.server[locationName][idx] = info[idx];
            }
            
          }
          return true;
        }
        return false;
      } catch (error) {
        console.log(error)
        return false;
      }
      
    }

    listLocation(){
      try {
        let arr = [];
        for(let idx in this.confJson.http.server){
          if(idx.startsWith("location ")){
            arr.push({
              name:idx,
              info:this.confJson.http.server[idx]
            });
          }
        }
        return arr;
      } catch (error) {
        console.log(error)
        return false;
      }
      
    }

    writeFile (filepath, data,needToConf= true) {
      try{
        if(needToConf && typeof data === "object"){
          data = this.toConf(data)
        }
        this.mkdirsSync(filepath);
        let toPath = path.resolve(filepath,this.getFileName(this.srcFile))
        
        return fs.writeFileSync(toPath, data)
      }
      catch(error){
        console.log(error)
        return false;
      }
        
      
    }

    

    getJson(){
      return this.confJson;
    }

    toConf(data){
      const recurse = (obj, depth) => {
        let retVal = ''
        let longestKeyLen = 1
        const indent = ('    ').repeat(depth)
  
        for (let key in obj) {
          longestKeyLen = Math.max(longestKeyLen, key.length)
        }
  
        for (let key in obj) {
          const val = obj[ key ]
          const keyValSpacing = (longestKeyLen - key.length) + 4
          const keyValIndent = (' ').repeat(keyValSpacing)
  
          if (Array.isArray(val)) {
            val.forEach(subVal => {
              retVal += indent + (key + keyValIndent + subVal).trim() + ';\n'
            })
          } else if (typeof val === 'object') {
            retVal += indent + key + ' {\n'
            retVal += recurse(val, depth + 1)
            retVal += indent + '}\n\n'
          } else {
            retVal += indent + (key + keyValIndent + val).trim() + ';\n'
          }
        }
  
        return retVal
      }
  
      return recurse(data, 0)
    }

    private toJson(){
        const lines = this.conf.replace('\t', '').split('\n');
        let obj = {} // holds constructed json
        let parent:any;
        let parm:any;
        lines.forEach(line => {
            line = line.trim() // prep for `startsWith` and `endsWith`
            // If line is blank line or is comment, do not process it
            if (!line || line.startsWith('#')) return;
            line = line.split("#")[0].trim();
            /*
              1. Object opening line
              Append key name to `parent` and create the sub-object in `json`
              e.g. for the line "location /api {", `json` is extended with
              the following key/value:
              { "location /api": {} }
            */
            if (line.endsWith('{')) {
              parm = line.slice(0, line.length - 1).trim();
              // let parmArr = parm.split(' ');
              // if(parmArr.length > 1){
              //   parm = parmArr.join('.');
              // }
              // If we are already a level deep (or more), add a dot before the key
              if (parent){
                // this.confFormat[parent]?this.confFormat[parent][parm] = {}:this.confFormat[parm] = {};
                parent += consign + parm
              }else{
                parent = parm;
              }
              
              // this.connet(obj,parent);
              // store in constructed `json`
              this.resolveSet(obj, parent, {})
      
              /*
                2. Standard inlcude line
                Load external file config and merge it into current json structure
              */
            }else if (line.endsWith(';')) {
              line = line.split(' ')
      
              // Put the property name into `key`
              let key = line.shift()
              // Put the property value into `val`
              let val = line.join(' ').trim()
      
              // If key ends with a semi-colon, remove that semi-colon
              if (key.endsWith(';')) key = key.slice(0, key.length - 1)
              // Remove trailing semi-colon from `val` (we established its
              // presence already)
              if(val.endsWith(';')) val = val.slice(0, val.length - 1)
              this.appendValue(obj, key, val, parent)
              /*
                3. Object closing line
                Removes current deepest `key` from `parent`
                e.g. "server.location /api" becomes "server"
              */
            } else if (line.endsWith('}')) {
              // Pop the parent to go lower
              parent = parent.split(consign+parm)
              parent.pop()
              parent = parent.join(consign);
              parm = null;
            }
          })
          return obj;
    }



    private resolveSet (obj, parm, val) {
      let components = parm.split(consign)
      let max = 30;
      while (components.length > 0) {
        if (typeof (obj) !== 'object') 
        break;
  
        if (components.length === 1) {
          obj[ components[ 0 ] ] = val
          return true
        } else {
          obj = obj[ components.shift() ]
        }
        max--;
        if(max<=0){
          throw new Error("数据错误");
        }
      }
      return false
    }

    private appendValue (obj, key, val, parent = undefined) {
      if (parent) {
        const existingVal = this.resolve(obj, parent + consign + key)
        if (existingVal) {
          // If we already have a property in the constructed `json` by
          // the same name as `key`, convert the stored value from a
          // String, to an Array of Strings & push the new value in
          if (Array.isArray(existingVal)) {
            val = existingVal.concat(val)
          } else {
            val = [val, existingVal]
          }
        }
        this.resolveSet(obj, parent + consign + key, val)
      } else {
        // Top level key/val, just create property in constructed
        // `json` and store val
        this.resolveSet(obj, key, val)
      }
    }

    private resolve (obj, path) {
      return path.split(consign).reduce((prev, curr) => {
        return (typeof prev === 'object' && prev) ? prev[ curr ] : undefined
      }, obj)
    }

    private connet(obj,v){
      v = v.split(consign);
      for(let i=0;i<v.length;++i){
        let val = v[i];
        if(!obj[val]){
          obj[val] = {};
        }
        obj = obj[val];
      }
    }

    

    private mkdirsSync(dirname){
      if(fs.existsSync(dirname)){
        return true;
      }else{
        if(this.mkdirsSync(path.dirname(dirname))){
          fs.mkdirSync(dirname);
          return true;
        }
      }
    }

    private getFileName(path){
      var pos1 = path.lastIndexOf('/');
      var pos2 = path.lastIndexOf('\\');
      var pos  = Math.max(pos1, pos2)
      if( pos<0 )
      return path;
      else
      return path.substring(pos+1);
  }
  
}