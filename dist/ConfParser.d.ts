#!/usr/bin/env node
export interface LocationInfo {
    proxy_pass?: string;
    proxy_set_header?: string[];
    proxy_http_version?: string;
    proxy_connect_timeout?: string;
    proxy_send_timeout?: string;
    proxy_read_timeout?: string;
    proxy_buffer_size?: string;
    proxy_buffers?: string;
    proxy_busy_buffers_size?: string;
    proxy_temp_file_write_size?: string;
    proxy_redirect?: string;
}
export interface SSLInfo {
    listen?: string;
    ssl_certificate: string;
    ssl_certificate_key: string;
    ssl_session_timeout?: string;
    ssl_ciphers?: string;
    ssl_protocols?: string;
    ssl_prefer_server_ciphers?: string;
    ssl_verify_client?: string;
}
export interface StaticInfo {
    root: string;
    index?: string;
    try_files?: string;
}
export interface ServerInfo {
    listen?: string;
    server_name?: string;
}
export default class ConfParser {
    srcFile: string;
    private conf;
    private confJson;
    private brStr;
    constructor(srcFile: string);
    initData(): void;
    readFile(): any;
    updateServer(info: ServerInfo): void;
    setSSL(info: SSLInfo): boolean;
    setStaticFolder(name: string, info: StaticInfo): boolean;
    addLocation(name: string, info: LocationInfo): boolean;
    removeLocation(name: string): boolean;
    modifyLocation(name: string, info: LocationInfo): boolean;
    listLocation(): false | any[];
    writeFile(filepath: string, data: any, needToConf?: boolean): boolean;
    getJson(): any;
    toConf(data: any): string;
    toJson(): {};
    private resolveSet;
    private appendValue;
    private resolve;
    private mkdirsSync;
    private getFileName;
}
