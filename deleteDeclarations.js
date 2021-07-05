const fs=require("fs");
const path=require("path");
//
const pth=path.join(__dirname,"./server/build/declarations");
//const pth1=path.join(__dirname, "./build/TimerWorker");
//const pth2=path.join(__dirname, "./build/tsconfig.tsbuildinfo");
//console.log("deleting directory");
fs.rmdir(pth, { recursive: true, force: true }, (err)=>console.log(err?err:"done1"));
//fs.rmdir(pth1, { recursive: true, force: true }, (err)=>console.log(err?err:"done2"));
//fs.unlink(pth2,(err)=>console.log(err),console.log("done3"));