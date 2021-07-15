var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfParser_1 = __importDefault(require("./ConfParser"));
let parser = new ConfParser_1.default("E:/gsfserver/nginxMgr/testfolder/nginx.conf");
let list = parser.listLocation();
console.log("list", list);
let data = parser.toJson();
parser.writeFile("E:/gsfserver/nginxMgr/testfolder/new/", data);
