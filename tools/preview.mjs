// Optional development preview. The delivered HTML does not require this server.
import http from 'node:http';
import fs from 'node:fs';
const file=new URL('../dist/index.html',import.meta.url);
const server=http.createServer((req,res)=>{
  if(req.url!=='/'&&req.url!=='/index.html'){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
server.listen(8786,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8786'));
