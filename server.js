const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.join(__dirname, 'public');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'forma.sqlite');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, image TEXT NOT NULL, label TEXT NOT NULL DEFAULT "", color TEXT NOT NULL DEFAULT "#EEE"); CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, items_json TEXT NOT NULL, total REAL NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);');
if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
  const seed = [
    [1,'Arc Table Lamp','Lighting',128,'lamp.svg','Bestseller','#E8C9AB'],
    [2,'Soft Form Vase','Decor',48,'vase.svg','New','#DCD3C5'],
    [3,'The Everyday Chair','Furniture',240,'chair.svg','Popular','#D5D7C6'],
    [4,'Terra Ceramic Set','Decor',72,'ceramics.svg','Handcrafted','#EDD9C4'],
    [5,'Cloud Pendant','Lighting',169,'pendant.svg','New','#E1E4DB'],
    [6,'Sunday Side Table','Furniture',195,'table.svg','Limited','#D6C7B6']
  ];
  const ins = db.prepare('INSERT INTO products (id,name,category,price,image,label,color) VALUES (?,?,?,?,?,?,?)');
  for (const row of seed) ins.run(...row);
}
const json = (res,status,obj) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(obj)); };
function readBody(req) { return new Promise((resolve,reject)=> {let raw='';req.on('data',b=>{raw+=b;if(raw.length>64_000){reject(new Error('Request is too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{reject(new Error('Invalid JSON'));}});req.on('error',reject);}); }
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
function serve(req,res,url){ const candidate=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)); if(candidate!==ROOT && !candidate.startsWith(ROOT+path.sep)) return json(res,403,{error:'Forbidden'}); fs.readFile(candidate,(e,b)=>{if(e){json(res,404,{error:'Not found'});return;}res.writeHead(200,{'Content-Type':mime[path.extname(candidate)]||'application/octet-stream'});res.end(b);}); }
http.createServer(async(req,res)=>{ let u;try{u=new URL(req.url,`http://${req.headers.host||'localhost'}`);}catch{return json(res,400,{error:'Bad URL'});} try {
 if(u.pathname==='/api/products' && req.method==='GET') {let rows=db.prepare('SELECT * FROM products').all();const category=u.searchParams.get('category'), search=u.searchParams.get('q');if(category&&category!=='All')rows=rows.filter(r=>r.category===category);if(search)rows=rows.filter(r=>r.name.toLowerCase().includes(search.toLowerCase()));return json(res,200,rows);}
 if(u.pathname==='/api/orders' && req.method==='POST') { const body=await readBody(req); if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30) return json(res,400,{error:'Provide 1–30 items.'}); const items=[],get=db.prepare('SELECT * FROM products WHERE id=?');let total=0;for(const item of body.items){const id=Number(item.id),quantity=Number(item.quantity),product=get.get(id);if(!product||!Number.isInteger(quantity)||quantity<1||quantity>20) return json(res,400,{error:'Invalid cart item.'});items.push({id,name:product.name,quantity,price:product.price});total+=quantity*product.price;}total=Math.round(total*100)/100;const result=db.prepare('INSERT INTO orders (items_json,total) VALUES (?,?)').run(JSON.stringify(items),total);return json(res,201,{orderId:Number(result.lastInsertRowid),total,message:'Demo order saved. No payment was taken.'}); }
 if(u.pathname.startsWith('/api/'))return json(res,404,{error:'API route not found'});
 if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
 return serve(req,res,u);
} catch(err){return json(res,err.message==='Invalid JSON'?400:500,{error:err.message==='Invalid JSON'?'Invalid JSON':'Server error'});} }).listen(PORT,HOST,()=>console.log(`FORMA → http://localhost:${PORT}`));
