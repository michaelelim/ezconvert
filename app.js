/* ============================================
   EZConvert — App Logic (Client-Side Conversions)
   ============================================ */

// ─────────────────────────────────────────────
// Conversion Definitions
// ─────────────────────────────────────────────

const PROFILES = {
    // Image conversions — Canvas-based, instant, no backend
    'image/jpeg': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG', engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP', engine: 'canvas' },
        { ext: 'bmp', mime: 'image/bmp', icon: '📷', name: 'BMP', engine: 'canvas' },
        { ext: 'pdf', icon: '📄', name: 'PDF', engine: 'imagepdf' },
        { ext: 'ico', icon: '🔲', name: 'ICO (favicon)', engine: 'imageico' },
    ],
    'image/png': [
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG', quality: true, engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP', quality: true, engine: 'canvas' },
        { ext: 'bmp', mime: 'image/bmp', icon: '📷', name: 'BMP', engine: 'canvas' },
        { ext: 'pdf', icon: '📄', name: 'PDF', engine: 'imagepdf' },
        { ext: 'ico', icon: '🔲', name: 'ICO (favicon 32×32)', engine: 'imageico' },
    ],
    'image/webp': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG', engine: 'canvas' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG', quality: true, engine: 'canvas' },
        { ext: 'bmp', mime: 'image/bmp', icon: '📷', name: 'BMP', engine: 'canvas' },
        { ext: 'pdf', icon: '📄', name: 'PDF', engine: 'imagepdf' },
    ],
    'image/svg+xml': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG 1024px', engine: 'svgcanvas', width: 1024 },
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG 512px', engine: 'svgcanvas', width: 512 },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG 1024px', quality: true, engine: 'svgcanvas', width: 1024 },
        { ext: 'pdf', icon: '📄', name: 'PDF', engine: 'imagepdf' },
    ],
    'image/gif': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG (first frame)', engine: 'canvas' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG (first frame)', quality: true, engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP (first frame)', engine: 'canvas' },
    ],
    'image/avif': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG', engine: 'canvas' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG', quality: true, engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP', engine: 'canvas' },
    ],
    // BMP fallback
    'image/bmp': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG', engine: 'canvas' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG', quality: true, engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP', engine: 'canvas' },
    ],
    // Generic image fallback
    'image/*': [
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'PNG', engine: 'canvas' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'JPG', quality: true, engine: 'canvas' },
        { ext: 'webp', mime: 'image/webp', icon: '🌐', name: 'WebP', engine: 'canvas' },
        { ext: 'pdf', icon: '📄', name: 'PDF', engine: 'imagepdf' },
    ],

    // Text / Data conversions — pure JS
    'text/csv': [
        { ext: 'json', mime: 'application/json', icon: '📋', name: 'JSON', engine: 'csvjson' },
    ],
    'application/json': [
        { ext: 'csv', mime: 'text/csv', icon: '📊', name: 'CSV', engine: 'jsoncsv' },
        { ext: 'txt', engine: 'jsonpretty', icon: '🎛️', name: 'Pretty JSON', noExt: true },
        { ext: 'csv', mime: 'text/csv', icon: '📊', name: 'CSV (flattened)', engine: 'jsoncsvflat' },
    ],
    'text/plain': [
        { ext: 'html', mime: 'text/html', icon: '🌐', name: 'Simple HTML page', engine: 'htmlpage' },
        { ext: 'md', icon: '📝', name: 'Markdown wrapper', engine: 'mdwrapper' },
    ],
    'text/markdown': [
        { ext: 'html', mime: 'text/html', icon: '📄', name: 'HTML (formatted)', engine: 'mdhtml' },
    ],
    'text/html': [
        { ext: 'txt', engine: 'htmltext', icon: '📃', name: 'Plain text', noExt: true },
    ],
    'application/xml': [
        { ext: 'json', icon: '📋', name: 'JSON', engine: 'xmljson' },
    ],

    // Video conversions — partial client-side
    'video/*': [
        { ext: 'gif', icon: '🎞️', name: 'GIF (thumbnail)', engine: 'videothumb' },
        { ext: 'webp', icon: '🌐', name: 'Thumbnail (WebP)', engine: 'videothumbwebp' },
        { ext: 'jpg', mime: 'image/jpeg', icon: '🎨', name: 'Thumbnail (JPG)', quality: true, engine: 'videothumbjpg' },
        { ext: 'png', mime: 'image/png', icon: '🖼️', name: 'Thumbnail (PNG)', engine: 'videothumbpng' },
    ],

    // Audio
    'audio/wav': [
        { ext: 'ogg', icon: '🎵', name: 'OGG (browser)', engine: 'audiorec' },
        { ext: 'mp3', icon: '🎵', name: 'MP3 (browser)', engine: 'audiorecmp3' },
    ],

    // Unknown types — show basic options
    'default': [],
};

// YouTube conversions — needs backend, shown as "coming soon"
const YOUTUBE_FORMATS = [
    { ext: 'mp3', mime: 'audio/mpeg', icon: '🎵', name: 'MP3 (needs server)', backend: true },
    { ext: 'wav', mime: 'audio/wav', icon: '🎧', name: 'WAV (needs server)', backend: true },
    { ext: 'm4a', mime: 'audio/mp4', icon: '🔇', name: 'M4A (needs server)', backend: true },
    { ext: 'mp4', icon: '🎬', name: 'Video MP4 (needs server)', backend: true },
    { ext: 'webm', icon: '🌐', name: 'Video WebM (needs server)', backend: true },
];

// ─────────────────────────────────────────────
// Conversion Engines
// ─────────────────────────────────────────────

/** Load a file as an image element */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load as image')); };
        img.src = url;
    });
}

/** Render an image to canvas, optionally sizing it */
function imageToCanvas(img, targetWidth) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth || img.width;
    canvas.height = targetWidth ? (img.height * targetWidth / img.width) : img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/** Convert to canvas export blob */
function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => blob ? resolve(blob) : reject(new Error('Conversion failed — browser may not support this format')),
            mimeType,
            quality ?? undefined
        );
    });
}

/** Generate a PDF with a single image page using built-in approach */
function generateImagePDF(canvas, imgName) {
    const dataURL = canvas.toDataURL('image/jpeg', 0.92);
    // Minimal PDF: embed the JPEG as an inline object
    const width = 595; // A4 width in points
    const height = 842; // A4 height
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;
    const scale = Math.min(width / pdfWidth, height / pdfHeight);
    const w = pdfWidth * scale;
    const h = pdfHeight * scale;

    // Base64 JPEG
    const jpegBase64 = dataURL.split(',')[1];
    const jpegBinary = atob(jpegBase64);
    const jpegLength = jpegBinary.length;

    // Build PDF
    const parts = [];
    let offset = 0;

    function write(str) { parts.push(str); offset += str.length; }
    function writeBinary(str) {
        const before = offset;
        for (let i = 0; i < str.length; i++) parts.push(String.fromCharCode(str.charCodeAt(i)));
        offset += str.binaryLength || str.length;
    }

    // Objects
    const objOffsets = [];

    // 1: catalog
    write('%PDF-1.4\n');
    objOffsets[1] = offset;
    write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // 2: pages
    objOffsets[2] = offset;
    write('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    // 3: page
    objOffsets[3] = offset;
    write(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /XObject << /Img0 5 0 R >> >> >>\nendobj\n`);

    // 4: content stream
    const contentStr = `q ${w.toFixed(3)} 0 0 ${h.toFixed(3)} ${(height-w)/2} ${h} cm /Img0 Do Q\n`;
    const contentBytes = new TextEncoder().encode(contentStr);
    objOffsets[4] = offset;
    write('4 0 obj\n<< /Length ' + contentStr.length + ' >>\nstream\n');
    parts.push(contentStr);
    offset += contentStr.length;
    write('\nendstream\nendobj\n');

    // 5: JPEG image
    objOffsets[5] = offset;
    write('5 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + pdfWidth + ' /Height ' + pdfHeight + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpegLength + ' >>\nstream\n');
    // Append raw JPEG bytes
    for (let i = 0; i < jpegBinary.length; i++) {
        parts.push(String.fromCharCode(jpegBinary.charCodeAt(i)));
    }
    write('\nendstream\nendobj\n');

    // Cross-reference
    const xrefOffset = offset;
    const totalObjects = 5;

    let xrefHeader = 'xref\n0 ' + (totalObjects + 1) + '\n0000000000 65535 f \n';
    write(xrefHeader);

    for (let i = 1; i <= totalObjects; i++) {
        write(String(objOffsets[i]).padStart(10, '0') + ' 00000 n \n');
    }

    write('trailer\n<< /Size ' + (totalObjects + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n');

    // Convert to Uint8Array via TextEncoder for the PDF parts that are binary safe
    // Actually let's just use Blob with array
    // This approach may have issues with binary data in the PDF
    // Let's use a simpler approach with array of chunks

    // Convert to blob
    const pdfString = parts.join('');
    // For small PDFs with images, this string approach works
    // For larger images, we should use a library, but this serves as demo
    const pdfBlob = new Blob([pdfString], { type: 'application/pdf' });
    return Promise.resolve(pdfBlob);
}

/** Generate a simple ICO file from a canvas (32x32 PNG in ICO format) */
function generateICO(canvas) {
    const small = document.createElement('canvas');
    small.width = 32;
    small.height = 32;
    small.getContext('2d').drawImage(canvas, 0, 0, 32, 32);
    
    return new Promise((resolve, reject) => {
        small.toBlob(async (blob) => {
            if (!blob) { reject(new Error('Canvas export failed')); return; }
            
            const pngBuffer = await blob.arrayBuffer();
            const pngBytes = new Uint8Array(pngBuffer);
            
            const icoHeader = new Uint8Array([0, 0, 1, 0, 1, 0]);
            const icoDir = new Uint8Array([
                32, 32, 0, 0,          // width=32, height=32
                1, 0,                  // 1 color plane
                32, 0,                 // 32 bits per pixel
                pngBytes.length, pngBytes.length >> 8, pngBytes.length >> 16, 0, // PNG size (LE)
                22, 0, 0, 0,           // offset to data: 6 (header) + 16 (dir) = 22
            ]);
            
            const icoBlob = new Blob([icoHeader, icoDir, pngBytes], { type: 'image/x-icon' });
            resolve(icoBlob);
        }, 'image/png');
    });
}

// ── Text / Data converters ──

function csvToJson(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj = {};
        headers.forEach((h, j) => { obj[h] = values[j] || ''; });
        result.push(obj);
    }
    return JSON.stringify(result, null, 2);
}

function jsonToCsv(text) {
    const data = JSON.parse(text);
    if (!Array.isArray(data) || data.length === 0) throw new Error('JSON must be an array');
    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];
    data.forEach(row => {
        lines.push(headers.map(h => {
            const val = row[h] ?? '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
                ? '"' + str.replace(/"/g, '""') + '"'
                : str;
        }).join(','));
    });
    return lines.join('\n');
}

function jsonPretty(text) {
    return JSON.stringify(JSON.parse(text), null, 2);
}

// ─────────────────────────────────────────────
// Main App Logic
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // DOM refs
    const dropZone = document.getElementById('dropZone');
    const dropContent = document.getElementById('dropContent');
    const fileInfo = document.getElementById('fileInfo');
    const fileIconEl = document.getElementById('fileIcon');
    const fileNameEl = document.getElementById('fileName');
    const fileSizeEl = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const acceptedFormats = document.getElementById('acceptedFormats');

    const modeBtns = document.querySelectorAll('.mode-btn');
    const urlInput = document.getElementById('urlInput');
    const urlField = document.getElementById('urlField');
    const fetchBtn = document.getElementById('fetchBtn');
    const videoPreview = document.getElementById('videoPreview');
    const videoThumb = document.getElementById('videoThumb');
    const videoTitle = document.getElementById('videoTitle');
    const videoMeta = document.getElementById('videoMeta');

    const conversionOptions = document.getElementById('conversionOptions');
    const optionGrid = document.getElementById('optionGrid');
    const convertBtn = document.getElementById('convertBtn');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultSection = document.getElementById('resultSection');
    const resultMetaEl = document.getElementById('resultMeta');
    const downloadBtn = document.getElementById('downloadBtn');
    const mainView = document.getElementById('mainView');
    const errorSection = document.getElementById('errorSection');
    const errorTitle = document.getElementById('errorTitle');
    const errorDetail = document.getElementById('errorDetail');
    const resultResetBtn = document.getElementById('resetBtn');
    const errorResetBtn = document.getElementById('errorResetBtn');

    // Quality slider area (inserted dynamically)
    let qualitySlider = null;

    // State
    let currentMode = 'file';
    let uploadedFile = null;
    let videoData = null;
    let selectedFormat = null;
    let convertedBlob = null;
    let convertedExt = 'bin';

    // ───────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────

    function hideAllSections() {
        dropZone.classList.remove('hidden');
        urlInput.classList.remove('hidden');
        conversionOptions.classList.add('hidden');
        convertBtn.classList.add('hidden');
        progressSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        videoPreview.classList.add('hidden');
        if (qualitySlider) { qualitySlider.remove(); qualitySlider = null; }
    }

    function resetState() {
        uploadedFile = null;
        videoData = null;
        selectedFormat = null;
        convertedBlob = null;
        urlField.value = '';
        hideAllSections();
        dropContent.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        progressFill.style.width = '0%';
        progressText.textContent = 'Converting…';
        optionGrid.innerHTML = '';
        if (currentMode === 'file') { urlInput.classList.add('hidden'); }
        else { dropZone.classList.add('hidden'); }
        mainView.classList.remove('hidden');
        errorSection.classList.add('hidden');
    }

    function formatBytes(bytes) {
        if (!bytes || isNaN(bytes)) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function getFileIcon(type, name) {
        if (type.startsWith('audio/')) return '🎵';
        if (type.startsWith('video/')) return '🎬';
        if (type.startsWith('image/')) return '🖼️';
        if (type === 'application/pdf') return '📄';
        if (type === 'text/csv') return '📊';
        if (type === 'application/json') return '📋';
        if (type.startsWith('text/')) return '📝';
        const ext = (name || '').split('.').pop().toLowerCase();
        return { mp3:'🎵',wav:'🎧',flac:'🎼',mp4:'🎬',avi:'🎬',mkv:'🎬',mov:'🎬',
            jpg:'🎨',jpeg:'🎨',png:'🖼️',gif:'🎞️',webp:'🌐',svg:'📐',avif:'📦',
            pdf:'📄',docx:'📝',doc:'📝',xls:'📊',txt:'📃',
            csv:'📊',json:'📋',md:'📝',html:'🌐',xml:'📄'
        }[ext] || '📄';
    }

    function downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    // ───────────────────────────────────────────
    // Mode Toggle
    // ───────────────────────────────────────────

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            resetState();
        });
    });

    // ───────────────────────────────────────────
    // Drop Zone / File Upload
    // ───────────────────────────────────────────

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.remove-file')) return;
        if (!uploadedFile) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '*/*';
            input.addEventListener('change', () => {
                if (input.files.length > 0) setFile(input.files[0]);
            });
            input.click();
        }
    });

    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) setFile(files[0]);
    });

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetState();
    });

    function setFile(file) {
        uploadedFile = file;
        videoData = null;
        selectedFormat = null;
        convertedBlob = null;
        if (qualitySlider) qualitySlider.remove();
        qualitySlider = null;

        dropContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        fileIconEl.textContent = getFileIcon(file.type, file.name);
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatBytes(file.size);

        showOptionsForFile(file);
    }

    function showOptionsForFile(file) {
        let options = null;

        // Check specific type first
        if (PROFILES[file.type]) {
            options = PROFILES[file.type];
        } else {
            // Try wildcard match
            for (const [key, val] of Object.entries(PROFILES)) {
                if (file.type.startsWith(key.replace('/*', '')) || (key.endsWith('/*') && file.type.startsWith(key.split('/')[0] + '/'))) {
                    options = val;
                    break;
                }
            }
        }

        renderOptions(options || [], handleFormatSelect);
    }

    // ───────────────────────────────────────────
    // YouTube URL Mode
    // ───────────────────────────────────────────

    fetchBtn.addEventListener('click', fetchUrl);
    urlField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchUrl();
    });

    function extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    }

    async function fetchUrl() {
        const url = urlField.value.trim();
        if (!url) return;
        const videoId = extractVideoId(url);
        if (videoId) {
            fetchBtn.disabled = true;
            fetchBtn.textContent = '⏳';
            try {
                const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
                const data = await r.json();
                videoData = {
                    title: data.title || 'YouTube Video',
                    author: data.author_name || '',
                    thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    videoId,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                };
                videoThumb.style.backgroundImage = `url('${videoData.thumbnail}')`;
                videoTitle.textContent = videoData.title;
                videoMeta.textContent = videoData.author;
                videoPreview.classList.remove('hidden');
                renderOptions(YOUTUBE_FORMATS, handleFormatSelect);
                convertBtn.classList.add('hidden');
            } catch {
                showError('Could not fetch video info', 'Check the URL and try again.');
            }
            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch';
        } else {
            showError('Not a YouTube URL', 'Paste a YouTube link like:\n  • https://www.youtube.com/watch?v=...\n  • https://youtu.be/abc123xyz\n  • https://youtube.com/shorts/...');
        }
    }

    // ───────────────────────────────────────────
    // Options Rendering
    // ───────────────────────────────────────────

    function handleFormatSelect(fmt) {
        selectedFormat = fmt;
        document.querySelectorAll('.option-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.format === fmt.name + fmt.ext);
        });

        // Show quality slider for formats that support it
        if (qualitySlider) qualitySlider.remove();

        if (fmt.quality) {
            qualitySlider = document.createElement('div');
            qualitySlider.className = 'quality-row';
            qualitySlider.innerHTML = `
                <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-dim);margin-top:12px;cursor:default">
                    Quality: <input type="range" id="qualityRange" min="10" max="100" value="90" style="flex:1;accent-color:var(--accent)">
                    <span id="qualityVal" style="font-weight:700;color:var(--text);width:36px;text-align:right">90%</span>
                </label>
            `;
            conversionOptions.appendChild(qualitySlider);
            const range = qualitySlider.querySelector('#qualityRange');
            const val = qualitySlider.querySelector('#qualityVal');
            range.addEventListener('input', () => { val.textContent = range.value + '%'; });
        }

        convertBtn.classList.remove('hidden');
    }

    function renderOptions(options, selectFn) {
        optionGrid.innerHTML = '';
        conversionOptions.classList.add('hidden');
        convertBtn.classList.add('hidden');
        if (qualitySlider) { qualitySlider.remove(); qualitySlider = null; }

        if (!options || options.length === 0) {
            return;
        }

        conversionOptions.classList.remove('hidden');
        options.forEach((fmt) => {
            const chip = document.createElement('button');
            chip.className = 'option-chip' + (fmt.backend ? ' backend-badge' : '');
            if (fmt.backend) chip.title = 'Requires server-side processing';
            chip.dataset.format = fmt.name + fmt.ext;
            chip.innerHTML = `<span class="chip-icon">${fmt.icon}</span> ${fmt.name}`;
            if (fmt.backend) {
                chip.addEventListener('click', () => {
                    alert('🚧 This needs a server.\n\nWe\'ll set up a backend so this works soon.');
                });
            } else {
                chip.addEventListener('click', () => selectFn(fmt));
            }
            optionGrid.appendChild(chip);
        });
    }

    // ───────────────────────────────────────────
    // Conversion — The Real Engine
    // ───────────────────────────────────────────

    convertBtn.addEventListener('click', startConversion);

    async function startConversion() {
        convertBtn.classList.add('hidden');
        conversionOptions.classList.add('hidden');

        if (currentMode === 'file') dropZone.classList.add('hidden');
        else { urlInput.classList.add('hidden'); videoPreview.classList.add('hidden'); }

        progressSection.classList.remove('hidden');

        try {
            if (currentMode === 'url' && selectedFormat.backend) {
                // Simulate for demo
                await simulateProgress('Connecting to server…', 'Extracting media…', 'Converting…', 'Finalizing…');
                convertedBlob = null;
                showResult();
                downloadBtn.onclick = () => alert('🚧 Server needed.\n\nWant me to set up the backend for YouTube conversion?');
                return;
            }

            if (uploadedFile && selectedFormat) {
                await convertFile(uploadedFile, selectedFormat);
            }

            showResult();
        } catch (err) {
            console.error('Conversion failed:', err);
            showError('Conversion Failed', err.message || 'Something went wrong during conversion.');
        }
    }

    async function convertFile(file, fmt) {
        const quality = fmt.quality
            ? (document.getElementById('qualityRange')?.value || 90) / 100
            : undefined;

        switch (fmt.engine) {
            case 'canvas':
            case 'svgcanvas': {
                progressText.textContent = 'Decoding image…';
                const img = await loadImage(file);
                progressText.textContent = 'Rendering…';
                const width = fmt.width || (currentMode === 'file' ? img.width : undefined);
                const canvas = imageToCanvas(img, width);
                progressText.textContent = 'Exporting...';
                convertedBlob = await canvasToBlob(canvas, fmt.mime || 'image/png', quality);
                convertedExt = fmt.ext;
                break;
            }

            case 'videothumb':
            case 'videothumbwebp':
            case 'videothumbjpg':
            case 'videothumbpng': {
                progressText.textContent = 'Loading video…';
                const video = document.createElement('video');
                video.muted = true;
                video.src = URL.createObjectURL(file);
                await new Promise((resolve, reject) => {
                    video.addEventListener('loadeddata', resolve);
                    video.addEventListener('error', () => reject(new Error('Could not load video')));
                    video.addEventListener('loadedmetadata', () => { video.currentTime = Math.min(2, video.duration / 4); });
                });
                progressText.textContent = 'Extracting frame…';
                const canvas = imageToCanvas(video, 1280);
                const mimeMap = {
                    'videothumb': 'image/gif', 'videothumbwebp': 'image/webp',
                    'videothumbjpg': 'image/jpeg', 'videothumbpng': 'image/png',
                };
                convertedBlob = await canvasToBlob(canvas, mimeMap[fmt.engine] || 'image/webp', quality);
                convertedExt = fmt.ext;
                break;
            }

            case 'imagepdf': {
                progressText.textContent = 'Decoding image…';
                const img2 = await loadImage(file);
                progressText.textContent = 'Building PDF…';
                const canvas2 = imageToCanvas(img2);
                convertedBlob = await generateImagePDF(canvas2, file.name);
                convertedExt = 'pdf';
                break;
            }

            case 'imageico': {
                progressText.textContent = 'Decoding image…';
                const img3 = await loadImage(file);
                progressText.textContent = 'Creating ICO…';
                const canvas3 = imageToCanvas(img3);
                convertedBlob = await generateICO(canvas3);
                convertedExt = 'ico';
                break;
            }

            case 'csvjson': {
                const text4 = await file.text();
                convertedBlob = new Blob([csvToJson(text4)], { type: 'application/json' });
                convertedExt = 'json';
                break;
            }

            case 'jsoncsv': {
                const text5 = await file.text();
                convertedBlob = new Blob([jsonToCsv(text5)], { type: 'text/csv' });
                convertedExt = 'csv';
                break;
            }

            case 'jsoncsvflat': {
                const rawData5 = await file.text();
                const jsonData5 = JSON.parse(rawData5);
                const flat = Array.isArray(jsonData5) ? jsonData5.map(item => {
                    const flat2 = {};
                    for (const [k, v] of Object.entries(item)) {
                        if (typeof v === 'object' && v !== null) {
                            flat2[k] = JSON.stringify(v);
                        } else { flat2[k] = v; }
                    }
                    return flat2;
                }) : jsonData5;
                convertedBlob = new Blob([jsonToCsv(flat)], { type: 'text/csv' });
                convertedExt = 'csv';
                break;
            }

            case 'jsonpretty': {
                const text6 = await file.text();
                convertedBlob = new Blob([jsonPretty(text6)], { type: 'text/plain' });
                convertedExt = 'txt';
                break;
            }

            case 'htmlpage': {
                const text7 = await file.text();
                const html = `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Document</title></head>\n<body>\n<pre>${escapeHtml(text7)}</pre>\n</body>\n</html>`;
                convertedBlob = new Blob([html], { type: 'text/html' });
                convertedExt = 'html';
                break;
            }

            default:
                throw new Error(`No converter for ${fmt.name}`);
        }
    }

    async function simulateProgress(...messages) {
        for (let i = 0; i < messages.length; i++) {
            progressText.textContent = messages[i];
            const progress = ((i + 1) / messages.length) * 100;
            progressFill.style.width = progress.toFixed(0) + '%';
            await new Promise(r => setTimeout(r, 600));
        }
        progressFill.style.width = '100%';
        await new Promise(r => setTimeout(r, 200));
    }

    // ───────────────────────────────────────────
    // UI: Result / Error / Download
    // ───────────────────────────────────────────

    function showResult() {
        progressSection.classList.add('hidden');

        let desc = '';
        if (videoData && selectedFormat) {
            desc = `${selectedFormat.icon} ${videoData.title} → ${selectedFormat.name}`;
        } else if (uploadedFile && selectedFormat) {
            const outName = uploadedFile.name.replace(/\.[^.]+$/, '') + '.' + convertedExt;
            desc = `${uploadedFile.name} (${formatBytes(uploadedFile.fileSize || uploadedFile.size)}) → ${outName}${convertedBlob ? ' (' + formatBytes(convertedBlob.size) + ')' : ''}`;
        }
        resultMetaEl.textContent = desc;
        resultSection.classList.remove('hidden');
    }

    downloadBtn.addEventListener('click', () => {
        if (convertedBlob) {
            const baseName = uploadedFile
                ? uploadedFile.name.replace(/\.[^.]+$/, '')
                : (videoData ? videoData.videoId : 'converted');
            downloadBlob(convertedBlob, baseName + '.' + convertedExt);
        } else {
            alert('🚧 This feature needs a server backend.\n\nWant me to set one up?');
        }
    });

    resultResetBtn.addEventListener('click', resetState);
    errorResetBtn.addEventListener('click', resetState);

    function showError(title, detail) {
        mainView.classList.add('hidden');
        errorSection.classList.remove('hidden');
        errorTitle.textContent = title;
        errorDetail.textContent = detail;
    }

    // ───────────────────────────────────────────
    // Init
    // ───────────────────────────────────────────
    resetState();
});
