// ── Conversion profiles ──
const PROFILES = {
    'image/jpeg':  [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG',engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP',engine:'canvas'},{ext:'bmp',mime:'image/bmp',icon:'📷',name:'BMP',engine:'canvas'},{ext:'pdf',icon:'📄',name:'PDF',engine:'imagepdf'},{ext:'ico',icon:'🔲',name:'ICO (favicon)',engine:'imageico'}],
    'image/png':   [{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG',quality:true,engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP',quality:true,engine:'canvas'},{ext:'bmp',mime:'image/bmp',icon:'📷',name:'BMP',engine:'canvas'},{ext:'pdf',icon:'📄',name:'PDF',engine:'imagepdf'},{ext:'ico',icon:'🔲',name:'ICO (favicon)',engine:'imageico'}],
    'image/webp':  [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG',engine:'canvas'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG',quality:true,engine:'canvas'},{ext:'bmp',mime:'image/bmp',icon:'📷',name:'BMP',engine:'canvas'},{ext:'pdf',icon:'📄',name:'PDF',engine:'imagepdf'}],
    'image/svg+xml':[{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG 1024px',engine:'svgcanvas',width:1024},{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG 512px',engine:'svgcanvas',width:512},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG 1024px',quality:true,engine:'svgcanvas',width:1024},{ext:'pdf',icon:'📄',name:'PDF',engine:'imagepdf'}],
    'image/gif':   [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG (1st frame)',engine:'canvas'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG (1st frame)',quality:true,engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP (1st frame)',engine:'canvas'}],
    'image/avif':  [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG',engine:'canvas'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG',quality:true,engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP',engine:'canvas'}],
    'image/bmp':   [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG',engine:'canvas'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG',quality:true,engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP',engine:'canvas'}],
    'image/*':     [{ext:'png',mime:'image/png',icon:'🖼️',name:'PNG',engine:'canvas'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'JPG',quality:true,engine:'canvas'},{ext:'webp',mime:'image/webp',icon:'🌐',name:'WebP',engine:'canvas'},{ext:'pdf',icon:'📄',name:'PDF',engine:'imagepdf'}],
    'text/csv':    [{ext:'json',mime:'application/json',icon:'📋',name:'JSON',engine:'csvjson'}],
    'application/json':[{ext:'csv',mime:'text/csv',icon:'📊',name:'CSV',engine:'jsoncsv'},{ext:'json',icon:'🎛️',name:'Pretty JSON',engine:'jsonfmt'},{ext:'csv',mime:'text/csv',icon:'📊',name:'CSV (flattened)',engine:'jsoncsvflat'}],
    'text/plain':  [{ext:'html',mime:'text/html',icon:'🌐',name:'HTML wrapper',engine:'htmlpage'}],
    'text/markdown':[{ext:'html',mime:'text/html',icon:'📄',name:'HTML',engine:'mdhtml'}],
    'text/html':   [{ext:'txt',icon:'📃',name:'Plain text',engine:'htmltext'}],
    'application/xml':[{ext:'json',icon:'📋',name:'JSON',engine:'xmljson'}],
    'video/*':     [{ext:'webp',mime:'image/webp',icon:'🖼️',name:'Thumbnail (WebP)',engine:'videothumb'},{ext:'jpg',mime:'image/jpeg',icon:'🎨',name:'Thumbnail (JPG)',quality:true,engine:'videothumbjpg'},{ext:'png',mime:'image/png',icon:'🖼️',name:'Thumbnail (PNG)',engine:'videothumbpng'}],
};
const FILE_ICONS = {'image/jpeg':'🎨','image/png':'🖼️','image/webp':'🌐','image/svg+xml':'📐','image/gif':'🎞️','image/avif':'📦','image/bmp':'📷','application/json':'📋','text/csv':'📊','text/plain':'📝','text/markdown':'📝','text/html':'🌐','application/xml':'📄','application/pdf':'📄'};
const getExt = n => (n||'').split('.').pop().toLowerCase();
const EXT_ICONS = {mp3:'🎵',wav:'🎧',mp4:'🎬',mkv:'🎬',avi:'🎬',mov:'🎬',doc:'📝',docx:'📝',md:'📝'};
const fileIcon = (t,n) => {
    if(FILE_ICONS[t]) return FILE_ICONS[t];
    if(t.startsWith('image/')) return '🖼️';
    if(t.startsWith('video/')) return '🎬';
    if(t.startsWith('audio/')) return '🎵';
    return EXT_ICONS[getExt(n)] || '📄';
};
const fmtBytes = b => {if(!b)return'0 B';const u=['B','KB','MB','GB'];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/1024**i).toFixed(i?1:0)+' '+u[i];};
const esc = t => {const d=document.createElement('div');d.textContent=t;return d.innerHTML;};

// ── Conversion helpers ──
const loadImage = f => new Promise((ok, fail) => {
    const img = new Image(); const u = URL.createObjectURL(f);
    img.onload  = () => { URL.revokeObjectURL(u); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(u); fail(new Error('Cannot decode image')); };
    img.src = u;
});
const imgToCanvas = (img, w) => {
    const c = document.createElement('canvas');
    c.width  = w || img.naturalWidth;
    c.height = w ? Math.round(img.naturalHeight * w / img.naturalWidth) : img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
};
const canvasToBlob = (c, mime, q) => new Promise((ok, fail) => {
    c.toBlob(b => b ? ok(b) : fail(new Error('Browser cannot export '+(mime||'format'))), mime, q);
});

async function makeImagePDF(canvas) {
    const jpegB64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
    const jpeg = Uint8Array.from(atob(jpegB64), c => c.charCodeAt(0));
    const W = 595, H = 842;
    const iW = canvas.width, iH = canvas.height;
    const scale = Math.min((W-60)/iW, (H-100)/iH);
    const dw = Math.round(iW * scale), dh = Math.round(iH * scale);
    const sx = ((W-dw)/2).toFixed(3), sy = ((H-dh)/2).toFixed(3);
    const stream = 'q '+dw.toFixed(3)+' 0 0 '+dh.toFixed(3)+' '+sx+' '+sy+' cm /I1 Do Q';

    const enc = new TextEncoder();
    const off = {};
    const parts = [];
    function txt(s) { parts.push(enc.encode(s)); off._cur = (off._cur||0)+s.length; }
    function raw(buf) { parts.push(buf); off._cur = (off._cur||0)+buf.byteLength; }

    txt('%PDF-1.4\n');
    off[1] = (off._cur||0);
    txt('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    off[2] = off._cur; txt('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    off[3] = off._cur; txt('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Contents 4 0 R /Resources << /XObject << /I1 5 0 R >> >> >>\nendobj\n');
    off[4] = off._cur; txt('4 0 obj\n<< /Length '+stream.length+' >>\nstream\n');
    raw(enc.encode(stream)); txt('\nendstream\nendobj\n');
    off[5] = off._cur; txt('5 0 obj\n<< /Type /XObject /Subtype /Image /Width '+iW+' /Height '+iH+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>\nstream\n');
    const preLen = off._cur;
    raw(jpeg);
    txt('\nendstream\nendobj\n');

    const xrefStart = off._cur;
    txt('xref\n0 6\n0000000000 65535 f \n');
    for(let i=1;i<=5;i++) txt(String(off[i]).padStart(10,'0')+' 00000 n \n');
    txt('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xrefStart+'\n%%EOF\n');
    return new Blob(parts, {type:'application/pdf'});
}

async function canvasToICO(c) {
    return new Promise((ok, fail) => {
        const s = document.createElement('canvas'); s.width=s.height=32;
        s.getContext('2d').drawImage(c,0,0,32,32);
        s.toBlob(async pb => {
            if(!pb){fail(new Error('PNG export failed'));return;}
            const png = new Uint8Array(await pb.arrayBuffer());
            const len = png.length;
            ok(new Blob([new Uint8Array([0,0,1,0,1,0,32,32,0,0,1,0,32,0,len&0xff,(len>>8)&0xff,(len>>16)&0xff,(len>>24)&0xff,22,0,0,0]), png], {type:'image/x-icon'}));
        }, 'image/png');
    });
}

// Text converters
const csvToJ = txt => {
    const lines=txt.trim().split(/\r?\n/);
    if(lines.length<2) return '[]';
    const hdr=lines[0].split(',').map(h=>h.trim().replace(/^["']|["']$/g,''));
    return JSON.stringify(lines.slice(1).filter(l=>l.trim()).map(l=>{
        const v=l.split(',').map(x=>x.trim().replace(/^["']|["']$/g,''));
        const o={};hdr.forEach((h,j)=>o[h]=v[j]||'');return o;
    }),null,2);
};
const jToC = txt => {
    const d=JSON.parse(txt);
    if(!Array.isArray(d)||!d.length) throw Error('Must be a JSON array');
    const h=Object.keys(d[0]);
    return [h.join(','),...d.map(r=>h.map(k=>{const s=String(r[k]??'');return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;}).join(','))].join('\n');
};
const mdH = txt => txt.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/^[-] (.+)$/gm,'<li>$1</li>').replace(/\n\n/g,'<br><br>').replace(/([^\n])\n([^\n])/g,'$1<br>$2');
const hT = txt => {const d=document.createElement('div');d.innerHTML=txt;return d.textContent||d.innerText||'';};

// ── App ──
(() => {
    const $ = id => document.getElementById(id);
    const dropS    = $('dropState');
    const fileS    = $('fileState');
    const progS    = $('progressState');
    const resultS  = $('resultState');
    const errorS   = $('errorState');
    const body     = $('pageBody');
    const browseLnk= $('browseLink');
    const rmFile   = $('removeFile');
    const fileIconE= $('fileIcon');
    const fileNamE = $('fileName');
    const fileSizE = $('fileSize');
    const optGrid  = $('optionGrid');
    const qualRow  = $('qualityRow');
    const convBtn  = $('convertBtn');
    const progF    = $('progressFill');
    const optSec   = $('optionsSection');

    let file = null, fmt = null, blob = null, ext = 'bin', dragN = 0;

    // File input
    const finp = document.createElement('input');
    finp.type='file'; finp.accept='*/*';
    finp.addEventListener('change',()=>{if(finp.files[0]) pickFile(finp.files[0]);finp.value='';});

    // No-conversions indicator (built into DOM)
    const noMsg = document.createElement('div');
    noMsg.style.cssText = 'display:none;padding:16px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:10px;text-align:center;max-width:420px;width:100%';
    noMsg.innerHTML = '<p style="font-size:13px;color:var(--text-dim);margin-bottom:6px">No browser-side conversions for this file type</p>' +
        '<p style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Supported conversions:</p>' +
        '<p style="font-size:10px;color:var(--text-muted);line-height:1.6">' +
        'Images: JPG/PNG/WebP/BMP/GIF/AVIF/SVG &rarr; JPG/PNG/WebP/PDF/ICO<br>' +
        'CSV &harr; JSON &nbsp;|&nbsp; Markdown/Text &rarr; HTML &nbsp;|&nbsp; Video &rarr; thumbnails</p>';
    optSec.appendChild(noMsg);

    // Helpers
    const showS = el => [dropS,fileS,progS,resultS,errorS].forEach(s=>s.classList.add('hidden'))||el.classList.remove('hidden');
    const reset = () => {
        file=null; fmt=null; blob=null; ext='bin';
        noMsg.style.display='none';
        optGrid.innerHTML=''; qualRow.innerHTML='';
        convBtn.classList.add('hidden');
        optSec.classList.add('hidden');
        showS(dropS); progF.style.width='0%';
    };
    rmFile.addEventListener('click', reset);

    // Full-window drag — attach to all layers so no child swallows
    [body].concat(Array.from(document.querySelectorAll('#app,#mouseGlow,.bg-glow,section,.center-content,.drop-state,.drop-message,.brand,.badge-row'))).forEach(el => {
        el.addEventListener('dragenter', e => { e.preventDefault(); dragN++; body.style.cursor='copy'; });
        el.addEventListener('dragover', e => { e.preventDefault(); });
    });
    [body, $('app')].concat(Array.from(document.querySelectorAll('.drop-state, #mouseGlow, .bg-glow, .center-content, .drop-message, .brand, .badge-row, .file-state, .file-card'))).forEach(el => {
        el.addEventListener('dragleave', e => { e.preventDefault(); dragN--; if(dragN<=0){dragN=0;body.style.cursor='';} });
    });
    [body, $('app')].forEach(el => {
        el.addEventListener('drop', e => {
            e.preventDefault(); dragN=0; body.style.cursor='';
            console.log('Drop:', e.dataTransfer.files.length, 'files');
            if(e.dataTransfer.files.length) {
                console.log('File:', e.dataTransfer.files[0].name, e.dataTransfer.files[0].type);
                pickFile(e.dataTransfer.files[0]);
            }
        });
    });
    browseLnk.addEventListener('click', e => { e.preventDefault(); finp.click(); });

    function pickFile(f) {
        file=f; fmt=null; blob=null; ext='bin';
        fileIconE.textContent = fileIcon(f.type, f.name);
        fileNamE.textContent = f.name;
        fileSizE.textContent = fmtBytes(f.size);
        qualRow.innerHTML=''; optGrid.innerHTML=''; convBtn.classList.add('hidden');
        showS(fileS);
        noMsg.classList.add('hidden');
        optSec.classList.remove('hidden');
        showOpts(f);
    }

    function showOpts(f) {
        noMsg.style.display='none';
        const opts = PROFILES[f.type] || Object.entries(PROFILES).find(([k])=>f.type.startsWith(k.replace('/*','')))?.[1] || [];
        if(!opts.length) {
            optGrid.innerHTML=''; qualRow.innerHTML='';
            noMsg.style.display='block';
            return;
        }
        opts.forEach(o => {
            const b=document.createElement('button'); b.className='opt-chip';
            b.innerHTML = '<span>'+o.icon+'</span> '+o.name;
            b.addEventListener('click', ()=>pickOpt(o));
            optGrid.appendChild(b);
        });
    }

    function pickOpt(o) {
        fmt=o;
        optGrid.querySelectorAll('.opt-chip').forEach(c=>c.classList.toggle('sel',c.dataset.fmt===o.name+o.ext));
        qualRow.innerHTML='';
        if(o.quality){
            qualRow.innerHTML='<input type="range" id="qr" min="10" max="100" value="90" style="width:280px;accent-color:var(--accent)"><span id="qv" style="font-size:13px;color:var(--text-dim);margin-left:8px">90%</span>';
            qualRow.classList.add('quality-row');
            qualRow.querySelector('#qr').addEventListener('input',e=>{qualRow.querySelector('#qv').textContent=e.target.value+'%';});
        }
        convBtn.classList.remove('hidden');
    }

    // Convert button
    convBtn.addEventListener('click', async ()=>{
        convBtn.classList.add('hidden');
        optSec.classList.add('hidden');
        showS(progS); progF.style.width='0%';
        $('progressText').textContent='Converting…';
        try {
            switch(fmt.engine){
            case 'canvas': case 'svgcanvas': {
                $('progressText').textContent='Decoding…';
                const img=await loadImage(file);
                $('progressText').textContent='Encoding…';
                const c=imgToCanvas(img,fmt.width);
                blob=await canvasToBlob(c,fmt.mime||'image/png',fmt.quality?(qualRow.querySelector('#qr')?.value||90)/100:undefined);
                ext=fmt.ext; break;
            }
            case 'imagepdf': {
                $('progressText').textContent='Building PDF…';
                const img=await loadImage(file);
                blob=await makeImagePDF(imgToCanvas(img)); ext='pdf'; break;
            }
            case 'imageico': {
                $('progressText').textContent='Creating ICO…';
                const img=await loadImage(file);
                blob=await canvasToICO(imgToCanvas(img)); ext='ico'; break;
            }
            case 'videothumb': case 'videothumbjpg': case 'videothumbpng': {
                $('progressText').textContent='Loading video…';
                const v=document.createElement('video');v.muted=true;v.playsInline=true;
                v.src=URL.createObjectURL(file);
                await new Promise((ok,fail)=>{v.addEventListener('loadeddata',ok,{once:true});v.addEventListener('error',()=>fail(new Error('Cannot load video')),{once:true});v.addEventListener('loadedmetadata',()=>{v.currentTime=Math.min(2,v.duration/4);},{once:true});});
                v.pause();v.currentTime=0;
                $('progressText').textContent='Extracting frame…';
                const ms={videothumb:'image/webp',videothumbjpg:'image/jpeg',videothumbpng:'image/png'};
                blob=await canvasToBlob(imgToCanvas(v,1280),ms[fmt.engine],fmt.quality?(qualRow.querySelector('#qr')?.value||90)/100:undefined);
                ext=fmt.ext; break;
            }
            case 'csvjson': {
                $('progressText').textContent='Parsing CSV…';
                blob=new Blob([csvToJ(await file.text())],{type:'application/json'}); ext='json'; break;
            }
            case 'jsoncsv': {
                $('progressText').textContent='Converting…';
                blob=new Blob([jToC(await file.text())],{type:'text/csv'}); ext='csv'; break;
            }
            case 'jsoncsvflat': {
                $('progressText').textContent='Converting…';
                const d=JSON.parse(await file.text()).map(i=>{const o={};for(const[k,v]of Object.entries(i))o[k]=typeof v==='object'?JSON.stringify(v):v;return o;});
                blob=new Blob([jToC(JSON.parse(JSON.stringify(d)))],{type:'text/csv'}); ext='csv'; break;
            }
            case 'jsonfmt': {
                $('progressText').textContent='Formatting…';
                blob=new Blob([JSON.stringify(JSON.parse(await file.text()),null,2)],{type:'application/json'}); ext='json'; break;
            }
            case 'htmlpage': {
                $('progressText').textContent='Building HTML…';
                blob=new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre>${esc(await file.text())}</pre></body></html>`],{type:'text/html'}); ext='html'; break;
            }
            case 'mdhtml': {
                $('progressText').textContent='Rendering…';
                blob=new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:720px;margin:auto;padding:20px}</style></head><body>${mdH(await file.text())}</body></html>`],{type:'text/html'}); ext='html'; break;
            }
            case 'htmltext': {
                $('progressText').textContent='Extracting text…';
                blob=new Blob([hT(await file.text())],{type:'text/plain'}); ext='txt'; break;
            }
            case 'xmljson': {
                blob=new Blob(['{"info":"XML conversion needs a library"}'],{type:'application/json'}); ext='json'; break;
            }
            default: throw new Error('No converter for '+fmt.name);
            }
            progF.style.width='100%';
            setTimeout(()=>{progF.style.width='0%';showResult();},400);
        } catch(e) {
            $('errorTitle').textContent='Conversion failed';
            $('errorDetail').textContent=e.message;
            showS(errorS);
        }
    });

    function showResult() {
        if(!blob) return;
        const base=file.name.replace(/\.[^.]+$/,'');
        $('resultMeta').textContent=file.name+'  →  '+base+'.'+ext+'  ('+fmtBytes(blob.size)+')';
        showS(resultS);
    }

    $('downloadBtn').addEventListener('click',()=>{
        if(!blob) return;
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);
        a.download=file.name.replace(/\.[^.]+$/,'')+'.'+ext;
        document.body.appendChild(a);a.click();document.body.removeChild(a);
    });
    $('resetBtn').addEventListener('click',reset);
    $('errorResetBtn').addEventListener('click',reset);

    // ── Mouse-following glow ──
    const mg = document.getElementById('mouseGlow');
    let mx=-600,my=-600,tmx=-600,tmy=-600,anim;
    document.addEventListener('mousemove',e=>{
        tmx=e.clientX-300; tmy=e.clientY-300;
        document.body.classList.add('has-mouse');
        if(!anim) anim=requestAnimationFrame(step);
    });
    function step(){
        mx+=(tmx-mx)*.12; my+=(tmy-my)*.12;
        mg.style.transform='translate('+mx+'px,'+my+'px)';
        anim=requestAnimationFrame(step);
    }

    reset();
})();
