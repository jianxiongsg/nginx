#!/usr/bin/env node
Object.defineProperty(exports, "__esModule", { value: true });
let path = require("path");
let fs = require("fs");
let consign = "____";
let config = {
    ssl: {
        listen: "443 ssl",
        ssl_certificate: "",
        ssl_certificate_key: "",
        ssl_session_timeout: "5m",
        ssl_ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4",
        ssl_protocols: "TLSv1 TLSv1.1 TLSv1.2",
        ssl_prefer_server_ciphers: "on",
        ssl_verify_client: "off"
    }
};
class ConfParser {
    constructor(srcFile) {
        this.srcFile = srcFile;
        this.brStr = "\n";
        this.initData();
    }
    initData() {
        this.conf = this.readFile();
        this.confJson = this.toJson();
    }
    readFile() {
        if (!fs.statSync(this.srcFile).isFile())
            throw new Error("文件不存在");
        return fs.readFileSync(this.srcFile, "utf-8");
    }
    updateServer(info) {
        try {
            if (info.listen) {
                let isSet = false;
                if (this.confJson.http.server.listen instanceof Array) {
                    for (let i = 0; i < this.confJson.http.server.listen.length; ++i) {
                        if (this.confJson.http.server.listen[i].indexOf("ssl") < 0) {
                            this.confJson.http.server.listen[i] = info.listen;
                            isSet = true;
                            break;
                        }
                    }
                    if (!isSet) {
                        this.confJson.http.server.listen.push(info.listen);
                    }
                }
                else {
                    this.confJson.http.server.listen = info.listen;
                }
                if (info.server_name)
                    this.confJson.http.server.server_name = info.server_name;
            }
            else {
                if (info.listen)
                    this.confJson.http.server.listen = info.listen;
                if (info.server_name)
                    this.confJson.http.server.server_name = info.server_name;
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    setSSL(info) {
        let listen = "listen";
        try {
            if (info.listen) {
                let isSet = false;
                if (this.confJson.http.server.listen instanceof Array) {
                    for (let i = 0; i < this.confJson.http.server.listen.length; ++i) {
                        if (this.confJson.http.server.listen[i].indexOf("ssl") != -1) {
                            this.confJson.http.server.listen[i] = info.listen;
                            isSet = true;
                            break;
                        }
                    }
                    if (!isSet) {
                        this.confJson.http.server.listen.push(info.listen);
                    }
                }
                else {
                    this.confJson.http.server.listen = info.listen;
                }
            }
            else {
                this.confJson.http.server[listen] = config.ssl.listen;
            }
            this.confJson.http.server.ssl_certificate = info.ssl_certificate;
            this.confJson.http.server.ssl_certificate_key = info.ssl_certificate_key;
            this.confJson.http.server.ssl_session_timeout = info.ssl_session_timeout || config.ssl.ssl_session_timeout;
            this.confJson.http.server.ssl_ciphers = info.ssl_ciphers || config.ssl.ssl_ciphers;
            this.confJson.http.server.ssl_protocols = info.ssl_protocols || config.ssl.ssl_protocols;
            this.confJson.http.server.ssl_prefer_server_ciphers = info.ssl_prefer_server_ciphers || config.ssl.ssl_prefer_server_ciphers;
            this.confJson.http.server.ssl_verify_client = info.ssl_verify_client || config.ssl.ssl_verify_client;
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    setStaticFolder(name, info) {
        let locationName = "location " + name;
        try {
            if (this.confJson.http.server[locationName]) {
                throw new Error("路由存在");
            }
            this.confJson.http.server[locationName] = {};
            let rootPath = info.root;
            if (!rootPath.startsWith("./")) {
                this.confJson.http.server[locationName].root = path.resolve(__dirname, rootPath);
            }
            else {
                this.confJson.http.server[locationName].root = rootPath;
            }
            if (info.index)
                this.confJson.http.server[locationName].index = info.index;
            if (info.try_files)
                this.confJson.http.server[locationName].try_files = info.try_files;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    addLocation(name, info) {
        let data = info;
        try {
            let locationName = "location " + name;
            if (this.confJson.http.server[locationName]) {
                throw new Error("路由存在");
            }
            this.confJson.http.server[locationName] = {};
            for (let idx in info) {
                this.confJson.http.server[locationName][idx] = data[idx];
            }
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    removeLocation(name) {
        try {
            let locationName = "location " + name;
            if (this.confJson.http.server[locationName]) {
                delete this.confJson.http.server[locationName];
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    modifyLocation(name, info) {
        let data = info;
        try {
            let locationName = "location " + name;
            if (this.confJson.http.server[locationName]) {
                for (let idx in info) {
                    if (!data[idx] || data[idx].length === 0) {
                        delete this.confJson.http.server[locationName][idx];
                    }
                    else {
                        this.confJson.http.server[locationName][idx] = data[idx];
                    }
                }
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    listLocation() {
        try {
            let arr = [];
            for (let idx in this.confJson.http.server) {
                if (idx.startsWith("location ")) {
                    arr.push({
                        name: idx,
                        info: this.confJson.http.server[idx]
                    });
                }
            }
            return arr;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    writeFile(filepath, data, needToConf = true) {
        try {
            if (needToConf && typeof data === "object") {
                data = this.toConf(data);
            }
            this.mkdirsSync(filepath);
            let toPath = path.resolve(filepath, this.getFileName(this.srcFile));
            fs.writeFileSync(toPath, data);
            this.initData();
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    getJson() {
        return this.confJson;
    }
    toConf(data) {
        const recurse = (obj, depth) => {
            let retVal = '';
            let longestKeyLen = 1;
            const indent = ('    ').repeat(depth);
            for (let key in obj) {
                longestKeyLen = Math.max(longestKeyLen, key.length);
            }
            for (let key in obj) {
                const val = obj[key];
                const keyValSpacing = (longestKeyLen - key.length) + 4;
                const keyValIndent = (' ').repeat(keyValSpacing);
                if (Array.isArray(val)) {
                    val.forEach(subVal => {
                        retVal += indent + (key + keyValIndent + subVal).trim() + ';\n';
                    });
                }
                else if (typeof val === 'object') {
                    retVal += indent + key + ' {\n';
                    retVal += recurse(val, depth + 1);
                    retVal += indent + '}\n\n';
                }
                else {
                    retVal += indent + (key + keyValIndent + val).trim() + ';\n';
                }
            }
            return retVal;
        };
        return recurse(data, 0);
    }
    toJson() {
        const lines = this.conf.replace('\t', '').split('\n');
        let obj = {};
        let parent;
        let parm;
        let pkey;
        let pval;
        let mark;
        lines.forEach((line) => {
            line = line.trim();
            if (!line || line.startsWith('#'))
                return;
            line = line.split("#")[0].trim();
            if (line.endsWith('{')) {
                parm = line.slice(0, line.length - 1).trim();
                if (parent) {
                    parent += consign + parm;
                }
                else {
                    parent = parm;
                }
                this.resolveSet(obj, parent, {});
            }
            else if (line.endsWith(';')) {
                if (pkey) {
                    let val = line.slice(0, line.length - 1);
                    pval += this.brStr + val;
                    this.appendValue(obj, pkey, pval, parent);
                    pkey = null;
                    pval = null;
                }
                else {
                    line = line.split(' ');
                    let key = line.shift();
                    let val = line.join(' ').trim();
                    if (key.endsWith(';'))
                        key = key.slice(0, key.length - 1);
                    if (val.endsWith(';'))
                        val = val.slice(0, val.length - 1);
                    this.appendValue(obj, key, val, parent);
                }
            }
            else if (line.endsWith('}')) {
                parent = parent.split(consign + parm);
                parent.pop();
                parent = parent.join(consign);
                parm = "";
            }
            else {
                if (!pkey && !line.startsWith("'") && !line.startsWith('"') && (line.endsWith("'") || line.endsWith('"'))) {
                    mark = line.slice(line.length - 1, line.length);
                    let idx = line.indexOf(mark);
                    pkey = "";
                    pval = "";
                    if (line.length > 2) {
                        pval = line.slice(idx);
                        pkey = line.slice(0, idx).trim() + "";
                    }
                }
                else if (pkey) {
                    pval += this.brStr + line;
                }
            }
        });
        console.log("....obj", obj.server);
        return obj;
    }
    resolveSet(obj, parm, val) {
        let components = parm.split(consign);
        let max = 30;
        while (components.length > 0) {
            if (typeof (obj) !== 'object')
                break;
            if (components.length === 1) {
                obj[components[0]] = val;
                return true;
            }
            else {
                obj = obj[components.shift()];
            }
            max--;
            if (max <= 0) {
                throw new Error("数据错误");
            }
        }
        return false;
    }
    appendValue(obj, key, val, parent = undefined) {
        if (parent) {
            const existingVal = this.resolve(obj, parent + consign + key);
            if (existingVal) {
                if (Array.isArray(existingVal)) {
                    val = existingVal.concat(val);
                }
                else {
                    val = [val, existingVal];
                }
            }
            this.resolveSet(obj, parent + consign + key, val);
        }
        else {
            this.resolveSet(obj, key, val);
        }
    }
    resolve(obj, path) {
        return path.split(consign).reduce((prev, curr) => {
            return (typeof prev === 'object' && prev) ? prev[curr] : undefined;
        }, obj);
    }
    mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        }
        else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }
    getFileName(path) {
        var pos1 = path.lastIndexOf('/');
        var pos2 = path.lastIndexOf('\\');
        var pos = Math.max(pos1, pos2);
        if (pos < 0)
            return path;
        else
            return path.substring(pos + 1);
    }
}
exports.default = ConfParser;
