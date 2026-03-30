/* ============================================
   EZConvert — Client-Side Conversion Engine
   ============================================ */

// Profiles keyed by MIME → array of target formats
const PROFILES = {
    'image/jpeg': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG', engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP', engine:'canvas' },
        { ext:'bmp', mime:'image/bmp', icon:'📷', name:'BMP', engine:'canvas' },
        { ext:'pdf', icon:'📄', name:'PDF', engine:'imagepdf' },
        { ext:'ico', icon:'🔲', name:'ICO (favicon)', engine:'imageico' },
    ],
    'image/png': [
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG', quality:true, engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP', quality:true, engine:'canvas' },
        { ext:'bmp', mime:'image/bmp', icon:'📷', name:'BMP', engine:'canvas' },
        { ext:'pdf', icon:'📄', name:'PDF', engine:'imagepdf' },
        { ext:'ico', icon:'🔲', name:'ICO (favicon)', engine:'imageico' },
    ],
    'image/webp': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG', engine:'canvas' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG', quality:true, engine:'canvas' },
        { ext:'bmp', mime:'image/bmp', icon:'📷', name:'BMP', engine:'canvas' },
        { ext:'pdf', icon:'📄', name:'PDF', engine:'imagepdf' },
    ],
    'image/svg+xml': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG 1024px', engine:'svgcanvas', width:1024 },
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG 512px', engine:'svgcanvas', width:512 },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG 1024px', quality:true, engine:'svgcanvas', width:1024 },
        { ext:'pdf', icon:'📄', name:'PDF', engine:'imagepdf' },
    ],
    'image/gif': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG (first frame)', engine:'canvas' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG (first frame)', quality:true, engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP (first frame)', engine:'canvas' },
    ],
    'image/avif': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG', engine:'canvas' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG', quality:true, engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP', engine:'canvas' },
    ],
    'image/bmp': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG', engine:'canvas' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG', quality:true, engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP', engine:'canvas' },
    ],
    'image/*': [
        { ext:'png', mime:'image/png', icon:'🖼️', name:'PNG', engine:'canvas' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'JPG', quality:true, engine:'canvas' },
        { ext:'webp', mime:'image/webp', icon:'🌐', name:'WebP', engine:'canvas' },
        { ext:'pdf', icon:'📄', name:'PDF', engine:'imagepdf' },
    ],
    'text/csv': [
        { ext:'json', mime:'application/json', icon:'📋', name:'JSON', engine:'csvjson' },
    ],
    'application/json': [
        { ext:'csv', mime:'text/csv', icon:'📊', name:'CSV', engine:'jsoncsv' },
        { ext:'json', icon:'🎛️', name:'Pretty JSON', engine:'jsonfmt' },
        { ext:'csv', mime:'text/csv', icon:'📊', name:'CSV (flattened)', engine:'jsoncsvflat' },
    ],
    'text/plain': [
        { ext:'html', mime:'text/html', icon:'🌐', name:'HTML wrapper', engine:'htmlpage' },
    ],
    'text/markdown': [
        { ext:'html', mime:'text/html', icon:'📄', name:'HTML (formatted)', engine:'mdhtml' },
    ],
    'text/html': [
        { ext:'txt', icon:'📃', name:'Plain text', engine:'htmltext' },
    ],
    'application/xml': [
        { ext:'json', icon:'📋', name:'JSON', engine:'xmljson' },
    ],
    'video/*': [
        { ext:'webp', mime:'image/webp', icon:'🖼️', name:'Thumbnail (WebP)', engine:'videothumb' },
        { ext:'jpg', mime:'image/jpeg', icon:'🎨', name:'Thumbnail (JPG)', quality:true, engine:'videothumbjpg' },
        { ext:'png', mime:'image/png', icon:'🖼️', name:'Thumbnail (PNG)', engine:'videothumbpng' },
    ],
};

// File icons by type
const FILE_ICONS = {
    'image/jpeg': '🎨', 'image/png': '🖼️', 'image/webp': '🌐',
    'image/svg+xml': '📐', 'image/gif': '🎞️', 'image/avif': '📦', 'image/bmp': '📷',
    'application/json': '📋', 'text/csv': '📊', 'text/plain': '📝',
    'text/markdown': '📝', 'text/html': '🌐', 'application/xml': '📄',
    'application/pdf': '📄',
};
function getExt(name){ return (name||'').split('.').pop().toLowerCase(); }
function getFileIcon(type, name) {
    if (FILE_ICONS[type]) return FILE_ICONS[type];
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    const em = { mp3:'🎵', wav:'🎧', mp4:'🎬', mkv:'🎬', avi:'🎬', mov:'🎬',
        doc:'📝', docx:'📝', xls:'📊', xlsx:'📊', md:'📝' };
    return em[getExt(name)] || '📄';
}

function fmtBytes(b) {
    if (!b) return '0 B';
    const u = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(i ? 2 : 0) + ' ' + u[i];
}

// ── Conversion helpers ──

function loadImage(file) {
    return new Promise((ok, fail) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload  = () => { URL.revokeObjectURL(url); ok(img); };
        img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('Could not decode as image')); };
        img.src = url;
    });
}
function imgToCanvas(img, w) {
    const c = document.createElement('canvas');
    c.width  = w || img.naturalWidth;
    c.height = w ? (img.naturalHeight * w / img.naturalWidth) : img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
}
function canvasToBlob(c, mime, q) {
    return new Promise((ok, fail) => {
        c.toBlob(b => b ? ok(b) : fail(new Error('Browser cannot export this format')), mime, q);
    });
}

// Minimal PDF wrapper (injects JPEG into A4)
function makeImagePDF(src) {
    return fetch(src)
        .then(r => r.arrayBuffer())
        .then(buf => {
            const bytes = new Uint8Array(buf);
            // Build PDF with JPEG
            const objs = [];
            let o = 0;
            function off(){ return o; }
            function cat(s){ o += s.length; objs.push(s); }
            function catBin(arr){ for(let i=0;i<arr.length;i++){objs.push(String.fromCharCode(arr[i]));o++;} }

            cat('%PDF-1.4\n');
            const off1 = o; cat('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
            const off2 = o; cat('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
            // 595x842 A4, image centered
            const pdfW=595, pdfH=842;
            const off3 = o; cat('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+pdfW+' '+pdfH+'] /Contents 4 0 R /Resources << /XObject << /I1 5 0 R >> >> >>\nendobj\n');
            // Image dims
            const imgW = 800, imgH = 600;
            const scale = Math.min((pdfW-50)/imgW, (pdfH-80)/imgH);
            const dw = imgW*scale, dh = imgH*scale;
            const sx = (pdfW-dw)/2, sy = pdfH - (pdfH-dh)/2;
            const stream = 'q '+dw.toFixed(2)+' 0 0 '+dh.toFixed(2)+' '+sx.toFixed(2)+' '+sy.toFixed(2)+' cm /I1 Do Q\n';
            const off4 = o;
            cat('4 0 obj\n<< /Length '+stream.length+' >>\nstream\n'); cat(stream); cat('endstream\nendobj\n');
            const off5 = o;
            cat('5 0 obj\n<< /Type /XObject /Subtype /Image /Width '+imgW+' /Height '+imgH+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bytes.length+' >>\nstream\n');
            for(let i=0;i<bytes.length;i++) cat(String.fromCharCode(bytes[i]));
            cat('\nendstream\nendobj\n');

            const xrefOff = o;
            cat('xref\n0 6\n0000000000 65535 f \n');
            [off1,off2,off3,off4,off5].forEach(v => {
                cat(String(v).padStart(10,'0')+' 00000 n \n');
            });
            cat('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xrefOff+'\n%%EOF\n');
            return new Blob([objs.join('')], {type:'application/pdf'});
        });
}

// ICO from canvas (32×32 PNG wrapped in ICO container)
async function makeICO(src) {
    const img = await loadImage(src); // actually we pass canvas data URL or file; simpler: use canvas toBlob then ICO
    // We will call this after we already have a canvas
}
// Better: makeICO from canvas
function canvasToICO(c) {
    return new Promise((ok, fail) => {
        const s = document.createElement('canvas'); s.width=s.height=32;
        s.getContext('2d').drawImage(c, 0, 0, 32, 32);
        s.toBlob(async pb => {
            if (!pb){ fail(new Error('PNG export failed')); return; }
            const png = new Uint8Array(await pb.arrayBuffer());
            const hdr = new Uint8Array([0,0,1,0,1,0,32,32,0,0,1,0,32,0]);
            const len = png.length;
            const dir = new Uint8Array([
                len&0xff, (len>>8)&0xff, (len>>16)&0xff, (len>>24)&0xff,
                22,0,0,0
            ]);
            ok(new Blob([hdr, dir, png], {type:'image/x-icon'}));
        }, 'image/png');
    });
}

// Text converters
const csvToJson = txt => {
    const lines = txt.trim().split(/\r?\n/);
    if (lines.length<2) return '[]';
    const hdr = lines[0].split(',').map(h=>h.trim().replace(/^["']|["']$/g,''));
    return JSON.stringify(lines.slice(1).filter(l=>l.trim()).map(l=>{
        const v=l.split(',').map(x=>x.trim().replace(/^["']|["']$/g,''));
        const o={}; hdr.forEach((h,j)=>o[h]=v[j]||''); return o;
    }), null, 2);
};
const jsonToCsv = txt => {
    const d = JSON.parse(txt);
    if (!Array.isArray(d)||!d.length) throw Error('Must be a JSON array');
    const h = Object.keys(d[0]);
    return [h.join(','), ...d.map(r=>h.map(k=>{const s=String(r[k]??'');return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;}).join(','))].join('\n');
};
const mdToHtml = txt => {
    return txt
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^\- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/(^|[^\-])\n([^\-<])/g, '$1<br>$2');
};
const htmlToText = txt => {
    const d = document.createElement('div');
    d.innerHTML = txt;
    return d.textContent || d.innerText || '';
};
/* eslint-disable-next-line no-unused-vars */
const escapeHtml = t => { const d=document.createElement('div'); d.textContent=t; return d.innerHTML; };

// ────────────────────────────────────────────
// App
// ────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // DOM
    const dropZone     = document.getElementById('dropZone');
    const dropContent  = document.getElementById('dropContent');
    const fileInfo     = document.getElementById('fileInfo');
    const fileIconEl   = document.getElementById('fileIcon');
    const fileNameEl   = document.getElementById('fileName');
    const fileSizeEl   = document.getElementById('fileSize');
    const removeFile   = document.getElementById('removeFile');
    const convOpts     = document.getElementById('conversionOptions');
    const optionGrid   = document.getElementById('optionGrid');
    const convertBtn   = document.getElementById('convertBtn');
    const progSection  = document.getElementById('progressSection');
    const progFill     = document.getElementById('progressFill');
    const progText     = document.getElementById('progressText');
    const resultSec    = document.getElementById('resultSection');
    const resultMeta   = document.getElementById('resultMeta');
    const dlBtn        = document.getElementById('downloadBtn');
    const resetBtn     = document.getElementById('resetBtn');
    const errSection   = document.getElementById('errorSection');
    const errTitle     = document.getElementById('errorTitle');
    const errDetail    = document.getElementById('errorDetail');
    const errReset     = document.getElementById('errorResetBtn');
    const mainView     = document.getElementById('mainView');
    const dragOverlay  = document.getElementById('dragOverlay');

    // State
    let file = null, fmt = null, blob = null, ext = 'bin';

    function hideAll() {
        convOpts.classList.add('hidden');
        convertBtn.classList.add('hidden');
        progSection.classList.add('hidden');
        resultSec.classList.add('hidden');
        errSection.classList.add('hidden');
        dropZone.classList.remove('hidden');
        // Remove quality slider if present
        const qs = convOpts.querySelector('.quality-row');
        if (qs) qs.remove();
    }
    function reset() {
        file = null; fmt = null; blob = null; ext = 'bin';
        hideAll();
        dropContent.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        progFill.style.width = '0%';
        progText.textContent = 'Converting…';
        optionGrid.innerHTML = '';
        mainView.classList.remove('hidden');
        errSection.classList.add('hidden');
    }

    // ═══ Drag & Drop (full window) ═══
    const bodyDZ = document.body;
    let dragCounter = 0;

    bodyDZ.addEventListener('dragenter', e => {
        e.preventDefault();
        if (e.dataTransfer.types.includes('Files')) {
            dragCounter++;
            dragOverlay.classList.add('visible');
        }
    });
    bodyDZ.addEventListener('dragover', e => { e.preventDefault(); });
    bodyDZ.addEventListener('dragleave', e => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) { dragCounter = 0; dragOverlay.classList.remove('visible'); }
    });
    dragOverlay.addEventListener('dragleave', e => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) { dragCounter = 0; dragOverlay.classList.remove('visible'); }
    });
    bodyDZ.addEventListener('drop', e => {
        e.preventDefault();
        dragCounter = 0;
        dragOverlay.classList.remove('visible');
        if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
    });

    // ═══ Click to browse ═══
    dropZone.addEventListener('click', e => {
        if (e.target.closest('.remove-file')) return;
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file'; fileInput.accept = '*/*';
            fileInput.addEventListener('change', () => {
                if (fileInput.files[0]) { setFile(fileInput.files[0]); }
                fileInput.value = '';
            });
        }
        fileInput.click();
    });
    var fileInput = null;

    removeFile.addEventListener('click', e => { e.stopPropagation(); reset(); });

    function setFile(f) {
        file = f; fmt = null; blob = null; ext = 'bin';
        hideAll();
        dropContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        fileIconEl.textContent = getFileIcon(f.type, f.name);
        fileNameEl.textContent = f.name;
        fileSizeEl.textContent = fmtBytes(f.size);
        showOptions(f);
    }

    // ═══ Options ═══
    function showOptions(f) {
        let opts = PROFILES[f.type] || null;
        if (!opts) {
            for (const [k, v] of Object.entries(PROFILES)) {
                if (f.type.startsWith(k.replace('/*',''))) { opts = v; break; }
            }
        }
        renderOptions(opts || []);
    }

    function pickFmt(f) {
        fmt = f;
        // remove old quality
        const old = convOpts.querySelector('.quality-row'); if (old) old.remove();
        // selected style
        optionGrid.querySelectorAll('.option-chip').forEach(c => {
            c.classList.toggle('selected', c.dataset.fmt === f.name + f.ext);
        });
        if (f.quality) {
            const qs = document.createElement('div');
            qs.className = 'quality-row';
            qs.innerHTML = '<label>' +
                '<span style="font-size:13px;color:var(--text-dim)">Quality</span> ' +
                '<input type="range" id="qRange" min="10" max="100" value="90" style="vertical-align:middle;width:160px;accent-color:var(--accent)"> ' +
                '<span id="qVal" style="font-size:13px;font-weight:700;color:var(--text);width:40px;display:inline-block;text-align:right">90%</span></label>';
            convOpts.appendChild(qs);
            qs.querySelector('#qRange').addEventListener('input', e => {
                qs.querySelector('#qVal').textContent = e.target.value + '%';
            });
        }
        convertBtn.classList.remove('hidden');
    }

    function renderOptions(arr) {
        optionGrid.innerHTML = '';
        if (!arr.length) return;
        convOpts.classList.remove('hidden');
        arr.forEach(f => {
            const b = document.createElement('button');
            b.className = 'option-chip';
            b.dataset.fmt = f.name + f.ext;
            b.innerHTML = '<span class="chip-icon">'+f.icon+'</span> '+f.name;
            b.addEventListener('click', () => pickFmt(f));
            optionGrid.appendChild(b);
        });
    }

    // ═══ Conversion engine ═══
    convertBtn.addEventListener('click', start);

    async function start() {
        convertBtn.classList.add('hidden');
        convOpts.classList.add('hidden');
        dropZone.classList.add('hidden');
        progSection.classList.remove('hidden');
        try {
            switch (fmt.engine) {
                case 'canvas': case 'svgcanvas': {
                    progText.textContent = 'Decoding image…';
                    const img = await loadImage(file);
                    progText.textContent = 'Encoding…';
                    const c = imgToCanvas(img, fmt.width);
                    blob = await canvasToBlob(c, fmt.mime || 'image/png', fmt.quality ? (document.getElementById('qRange')?.value||90)/100 : undefined);
                    ext = fmt.ext;
                    break;
                }
                case 'imagepdf': {
                    progText.textContent = 'Building PDF…';
                    const img = await loadImage(file);
                    const c = imgToCanvas(img);
                    const src = c.toDataURL('image/jpeg', 0.92);
                    blob = await makeImagePDF(src);
                    ext = 'pdf';
                    break;
                }
                case 'imageico': {
                    progText.textContent = 'Creating ICO…';
                    const img = await loadImage(file);
                    const c = imgToCanvas(img);
                    blob = await canvasToICO(c);
                    ext = 'ico';
                    break;
                }
                case 'csvjson': {
                    progText.textContent = 'Parsing CSV…';
                    blob = new Blob([csvToJson(await file.text())], {type:'application/json'});
                    ext = 'json';
                    break;
                }
                case 'jsoncsv': case 'jsoncsvflat': {
                    progText.textContent = 'Converting JSON…';
                    const t = await file.text();
                    if (fmt.engine === 'jsoncsvflat') {
                        const d = JSON.parse(t).map(i => {
                            const o = {};
                            for (const [k,v] of Object.entries(i)) o[k] = typeof v === 'object' ? JSON.stringify(v) : v;
                            return o;
                        });
                        blob = new Blob([jsonToCsv(JSON.stringify(d))], {type:'text/csv'});
                    } else {
                        blob = new Blob([jsonToCsv(t)], {type:'text/csv'});
                    }
                    ext = 'csv';
                    break;
                }
                case 'jsonfmt': {
                    progText.textContent = 'Formatting…';
                    blob = new Blob([JSON.stringify(JSON.parse(await file.text()), null, 2)], {type:'application/json'});
                    ext = 'json';
                    break;
                }
                case 'htmlpage': {
                    progText.textContent = 'Building HTML…';
                    blob = new Blob([`<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Page</title></head>\n<body>\n<pre>${escapeHtml(await file.text())}</pre>\n</body></html>`], {type:'text/html'});
                    ext = 'html';
                    break;
                }
                case 'mdhtml': {
                    progText.textContent = 'Rendering Markdown…';
                    blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:720px;margin:auto;padding:20px}</style></head><body>${mdToHtml(await file.text())}</body></html>`], {type:'text/html'});
                    ext = 'html';
                    break;
                }
                case 'htmltext': {
                    progText.textContent = 'Extracting text…';
                    blob = new Blob([htmlToText(await file.text())], {type:'text/plain'});
                    ext = 'txt';
                    break;
                }
                case 'xmljson': {
                    progText.textContent = 'Converting XML…';
                    blob = new Blob([`{"xml":"This converter needs an XML library — use a browser extension or online tool"}`], {type:'application/json'});
                    ext = 'json';
                    break;
                }
                case 'videothumb': case 'videothumbjpg': case 'videothumbpng': {
                    progText.textContent = 'Loading video…';
                    const v = document.createElement('video');
                    v.muted = true; v.playsInline = true;
                    v.src = URL.createObjectURL(file);
                    await new Promise((ok, fail) => {
                        v.addEventListener('loadeddata', ok, { once: true });
                        v.addEventListener('error', () => fail(new Error('Cannot load video in this browser')), { once: true });
                        v.addEventListener('loadedmetadata', () => { v.currentTime = Math.min(2, v.duration/4); }, { once: true });
                    });
                    v.pause(); v.currentTime = 0;
                    progText.textContent = 'Extracting frame…';
                    const mimes = {videothumb:'image/webp', videothumbjpg:'image/jpeg', videothumbpng:'image/png'};
                    blob = await canvasToBlob(imgToCanvas(v, 1280), mimes[fmt.engine], fmt.quality ? (document.getElementById('qRange')?.value||90)/100 : undefined);
                    ext = fmt.ext;
                    break;
                }
                default: throw new Error('Converter not implemented for ' + fmt.name);
            }
            done();
        } catch (e) {
            hideAll();
            progSection.classList.add('hidden');
            errTitle.textContent = 'Conversion failed';
            errDetail.textContent = e.message;
            errSection.classList.remove('hidden');
        }
    }

    function done() {
        progSection.classList.add('hidden');
        const base = file.name.replace(/\.[^.]+$/, '');
        resultMeta.textContent = file.name + ' → ' + base + '.' + ext  + '  (' + fmtBytes(blob.size) + ')';
        resultSec.classList.remove('hidden');
    }

    dlBtn.addEventListener('click', () => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (file ? file.name.replace(/\.[^.]+$/,'') : 'converted') + '.' + ext;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    resetBtn.addEventListener('click', reset);
    errReset.addEventListener('click', reset);
    reset();
});
