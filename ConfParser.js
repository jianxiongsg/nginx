#!/usr/bin/env node
let path = require("path");
let fs = require("fs");
let consign = "____";
module.exports = class ConfParser{
    constructor(srcFile){
        this.srcFile = srcFile;
        this.conf = this.readFile();
    }

    readFile(){
        if(!fs.statSync(this.srcFile).isFile()) throw new Error("文件不存在");
        return fs.readFileSync(this.srcFile,"utf-8");
    }

    toJson(){
        const lines = this.conf.replace('\t', '').split('\n');
        let obj = {} // holds constructed json
        let parent = "";
        let parm = "";
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



    resolveSet (obj, parm, val) {
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

    appendValue (obj, key, val, parent = undefined) {
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

    resolve (obj, path) {
      return path.split(consign).reduce((prev, curr) => {
        return (typeof prev === 'object' && prev) ? prev[ curr ] : undefined
      }, obj)
    }

    connet(obj,v){
      v = v.split(consign);
      for(let i=0;i<v.length;++i){
        let val = v[i];
        if(!obj[val]){
          obj[val] = {};
        }
        obj = obj[val];
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
      catch(err){
        throw new Error(err)
      }
        
      
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

    mkdirsSync(dirname){
      if(fs.existsSync(dirname)){
        return true;
      }else{
        if(this.mkdirsSync(path.dirname(dirname))){
          fs.mkdirSync(dirname);
          return true;
        }
      }
    }

    getFileName(path){
      var pos1 = path.lastIndexOf('/');
      var pos2 = path.lastIndexOf('\\');
      var pos  = Math.max(pos1, pos2)
      if( pos<0 )
      return path;
      else
      return path.substring(pos+1);
  }
  
}