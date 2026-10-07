const MEDIA_ORIGIN = self.location.origin;
const MEDIA = {"/茶社广告-4K宣传片.mp4": {"size": 142406055, "hash": "2fdb2cd2246f1a29f8ce2ec046527a56d3312902ec20560127422f2c76ebf0b1", "chunkSize": 16777216, "parts": ["/media/2fdb2cd2246f1a29f8ce/000.bin", "/media/2fdb2cd2246f1a29f8ce/001.bin", "/media/2fdb2cd2246f1a29f8ce/002.bin", "/media/2fdb2cd2246f1a29f8ce/003.bin", "/media/2fdb2cd2246f1a29f8ce/004.bin", "/media/2fdb2cd2246f1a29f8ce/005.bin", "/media/2fdb2cd2246f1a29f8ce/006.bin", "/media/2fdb2cd2246f1a29f8ce/007.bin", "/media/2fdb2cd2246f1a29f8ce/008.bin"]}, "/下雨.mp4": {"size": 37503751, "hash": "b9bf0dd02c0d6ea6528acb0644ed4aed949f83bff9979e50010a1ea322d43616", "chunkSize": 16777216, "parts": ["/media/b9bf0dd02c0d6ea6528a/000.bin", "/media/b9bf0dd02c0d6ea6528a/001.bin", "/media/b9bf0dd02c0d6ea6528a/002.bin"]}, "/assets/films/home-1.mp4": {"size": 73424501, "hash": "da9c4c63bb499e9efc1b54adab2093961f2a5cf882999cb7f21db924725aa74e", "chunkSize": 16777216, "parts": ["/media/da9c4c63bb499e9efc1b/000.bin", "/media/da9c4c63bb499e9efc1b/001.bin", "/media/da9c4c63bb499e9efc1b/002.bin", "/media/da9c4c63bb499e9efc1b/003.bin", "/media/da9c4c63bb499e9efc1b/004.bin"]}};
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return; }
  const scopePath = decodeURIComponent(new URL(self.registration.scope).pathname);
  const item = path.startsWith(scopePath) ? MEDIA["/"+path.slice(scopePath.length)] : null;
  if (item && ['GET', 'HEAD'].includes(event.request.method)) event.respondWith(serve(event.request,item));
});
async function serve(request,item) {
  const headers = new Headers({'Content-Type':'video/mp4','Accept-Ranges':'bytes','ETag':'"'+item.hash+'"','Cache-Control':'no-cache'});
  let start=0,end=item.size-1,status=200;
  const range=request.headers.get('Range');
  if(range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match || (!match[1]&&!match[2])) return invalid();
    if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
    else{const suffix=Number(match[2]);if(!suffix)return invalid();start=Math.max(0,item.size-suffix);}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=item.size)return invalid();
    status=206;headers.set('Content-Range',`bytes ${start}-${end}/${item.size}`);
  }
  headers.set('Content-Length',String(end-start+1));
  if(request.method==='HEAD')return new Response(null,{status,headers});
  const abort=new AbortController();
  let reader=null,index=Math.floor(start/item.chunkSize),cursor=0,remaining=end-start+1,skip=0;
  const stream=new ReadableStream({
    async pull(controller){
      try{
        while(remaining>0){
          if(!reader){
            const chunkStart=index*item.chunkSize,localStart=Math.max(0,start-chunkStart),localEnd=Math.min(item.chunkSize-1,end-chunkStart,item.size-1-chunkStart);
            const response=await fetch(new URL(item.parts[index].slice(1), self.registration.scope),{headers:{Range:`bytes=${localStart}-${localEnd}`},signal:abort.signal});
            if(!response.ok||!response.body)throw new Error('Video segment unavailable');
            skip=response.status===206?0:localStart;
            cursor=localEnd-localStart+1;
            reader=response.body.getReader();index++;
          }
          const {done,value}=await reader.read();
          if(done){reader=null;if(cursor>0)throw new Error('Incomplete video segment');continue;}
          if(skip>=value.length){skip-=value.length;continue;}
          const data=value.subarray(skip,Math.min(value.length,skip+cursor,skip+remaining));skip=0;
          cursor-=data.length;remaining-=data.length;
          if(cursor===0){const finished=reader;reader=null;finished.cancel().catch(()=>{});}
          if(data.length){controller.enqueue(data);if(remaining===0)controller.close();return;}
        }
        controller.close();
      }catch(error){controller.error(error);abort.abort();if(reader)await reader.cancel().catch(()=>{});}
    },
    async cancel(){abort.abort();if(reader)await reader.cancel().catch(()=>{});}
  });
  return new Response(stream,{status,headers});
  function invalid(){headers.set('Content-Range','bytes */'+item.size);return new Response(null,{status:416,headers});}
}
