/* ============================================
   EZConvert — App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // DOM refs
    const dropZone = document.getElementById('dropZone');
    const dropContent = document.getElementById('dropContent');
    const fileInfo = document.getElementById('fileInfo');
    const fileIcon = document.getElementById('fileIcon');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
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
    const resultMeta = document.getElementById('resultMeta');
    const downloadBtn = document.getElementById('downloadBtn');
    const mainView = document.getElementById('mainView');
    const errorSection = document.getElementById('errorSection');
    const errorTitle = document.getElementById('errorTitle');
    const errorDetail = document.getElementById('errorDetail');
    const resultResetBtn = document.getElementById('resetBtn');
    const errorResetBtn = document.getElementById('errorResetBtn');

    // State
    let currentMode = 'file'; // 'file' | 'url'
    let uploadedFile = null;
    let videoData = null;
    let selectedFormat = null;

    // ============================================
    // Conversion profiles — what each MIME can convert to
    // ============================================
    const CONVERTERS = {
        // Audio
        'audio/*': [
            { ext: 'mp3', mime: 'audio/mpeg', icon: '🎵', name: 'MP3' },
            { ext: 'wav', mime: 'audio/wav', icon: '🎧', name: 'WAV' },
            { ext: 'flac', mime: 'audio/flac', icon: '🎼', name: 'FLAC' },
            { ext: 'aac', mime: 'audio/aac', icon: '🔊', name: 'AAC' },
        ],
        // Video
        'video/*': [
            { ext: 'mp4', icon: '🎬', name: 'MP4' },
            { ext: 'webm', icon: '🌐', name: 'WebM' },
            { ext: 'mp3', mime: 'audio/mpeg', icon: '🎵', name: 'Extract MP3' },
            { ext: 'wav', mime: 'audio/wav', icon: '🎧', name: 'Extract WAV' },
            { ext: 'gif', icon: '🎞️', name: 'Animated GIF' },
        ],
        // Images
        'image/*': [
            { ext: 'jpg', mime: 'image/jpeg', icon: '🖼️', name: 'JPG' },
            { ext: 'png', icon: '🗻', name: 'PNG' },
            { ext: 'webp', icon: '🌐', name: 'WebP' },
            { ext: 'gif', icon: '🎞️', name: 'GIF' },
            { ext: 'avif', icon: '📦', name: 'AVIF' },
            { ext: 'pdf', icon: '📄', name: 'PDF' },
        ],
        // Documents
        'application/pdf': [
            { ext: 'docx', icon: '📝', name: 'Word (.docx)' },
            { ext: 'txt', icon: '📃', name: 'Plain Text' },
        ],
        // Default for unknown
        'default': [],
    };

    // ============================================
    // YouTube URL conversions (special profile)
    // ============================================
    const YOUTUBE_FORMATS = [
        { ext: 'mp3', mime: 'audio/mpeg', icon: '🎵', name: 'MP3 (256kbps)' },
        { ext: 'mp3', icon: '🎵', name: 'MP3 (128kbps)' },
        { ext: 'wav', mime: 'audio/wav', icon: '🎧', name: 'WAV' },
        { ext: 'm4a', mime: 'audio/mp4', icon: '🔇', name: 'M4A' },
        { ext: 'mp4', icon: '🎬', name: 'Video (MP4 1080p)' },
        { ext: 'webm', icon: '🌐', name: 'Video (WebM 720p)' },
    ];

    // ============================================
    // Helpers
    // ============================================
    function hideAllSections() {
        dropZone.classList.remove('hidden');
        urlInput.classList.remove('hidden');
        conversionOptions.classList.add('hidden');
        convertBtn.classList.add('hidden');
        progressSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        videoPreview.classList.add('hidden');
    }

    function resetState() {
        uploadedFile = null;
        videoData = null;
        selectedFormat = null;
        urlField.value = '';
        hideAllSections();
        dropContent.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        progressFill.style.width = '0%';
        progressText.textContent = 'Converting…';
        optionGrid.innerHTML = '';

        // Show the right input mode
        if (currentMode === 'file') {
            urlInput.classList.add('hidden');
        } else {
            dropZone.classList.add('hidden');
        }

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
        const ext = (name || '').split('.').pop().toLowerCase();
        if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return '🎵';
        if (['mp4', 'mkv', 'avi', 'webm', 'mov'].includes(ext)) return '🎬';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(ext)) return '🖼️';
        if (ext === 'pdf') return '📄';
        if (['docx', 'doc'].includes(ext)) return '📝';
        if (['txt'].includes(ext)) return '📃';
        if (['xlsx', 'xls'].includes(ext)) return '📊';
        return '📄';
    }

    // ============================================
    // YouTube Helpers
    // ============================================
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

    function youtubeTitle(videoId) {
        return new Promise((resolve) => {
            // We use a public oEmbed endpoint to get video info
            const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            fetch(url)
                .then(r => r.json())
                .then(data => {
                    resolve({
                        title: data.title || 'YouTube Video',
                        author: data.author_name || '',
                        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                        videoId: videoId,
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                    });
                })
                .catch(() => {
                    resolve({
                        title: 'YouTube Video',
                        author: '',
                        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                        videoId: videoId,
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                    });
                });
        });
    }

    // ============================================
    // Mode Toggle
    // ============================================
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            resetState();
        });
    });

    // ============================================
    // Drag & Drop / File Upload
    // ============================================
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.remove-file')) return; // Don't trigger file picker when clicking remove
        if (!uploadedFile) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '*/*';
            input.addEventListener('change', () => {
                if (input.files.length > 0) {
                    setFile(input.files[0]);
                }
            });
            input.click();
        }
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setFile(files[0]);
        }
    });

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetState();
    });

    function setFile(file) {
        uploadedFile = file;
        videoData = null;
        selectedFormat = null;

        // Update drop zone UI
        dropContent.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        fileIcon.textContent = getFileIcon(file.type, file.name);
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);

        // Show conversion options
        showFileOptions(file.type);
    }

    function showFileOptions(type) {
        let options = null;
        for (const [key, val] of Object.entries(CONVERTERS)) {
            if (type.startsWith(key.replace('/*', '')) || type === key || (key.endsWith('/*') && type.startsWith(key.split('/')[0]))) {
                options = val;
                break;
            }
        }
        if (!options || options.length === 0) {
            options = CONVERTERS['default'];
        }

        renderOptions(options, handleFormatSelect);
    }

    function handleFormatSelect(format) {
        selectedFormat = format;
        document.querySelectorAll('.option-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.format === format.name + format.ext);
        });
        convertBtn.classList.toggle('hidden', !selectedFormat);
    }

    function renderOptions(options, selectCallback) {
        optionGrid.innerHTML = '';
        conversionOptions.classList.add('hidden');
        convertBtn.classList.add('hidden');

        if (!options || options.length === 0) {
            return;
        }

        conversionOptions.classList.remove('hidden');
        options.forEach(fmt => {
            const chip = document.createElement('button');
            chip.className = 'option-chip';
            chip.dataset.format = fmt.name + fmt.ext;
            chip.innerHTML = `<span class="chip-icon">${fmt.icon}</span> ${fmt.name}`;
            chip.addEventListener('click', () => selectCallback(fmt));
            optionGrid.appendChild(chip);
        });
    }

    // ============================================
    // URL Mode
    // ============================================
    fetchBtn.addEventListener('click', fetchUrl);
    urlField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchUrl();
    });

    async function fetchUrl() {
        const url = urlField.value.trim();
        if (!url) return;

        const videoId = extractVideoId(url);
        if (videoId) {
            fetchBtn.disabled = true;
            fetchBtn.textContent = '…';

            const info = await youtubeTitle(videoId);
            videoData = info;

            // Show preview
            videoThumb.style.backgroundImage = `url('${info.thumbnail}')`;
            videoTitle.textContent = info.title;
            videoMeta.textContent = info.author;
            videoPreview.classList.remove('hidden');

            // Show YouTube-specific options
            showYouTubeOptions();

            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch';
        } else {
            showError('Invalid URL', 'Please paste a YouTube video link.\n\nSupported formats:\n  • https://www.youtube.com/watch?v=...\n  • https://youtu.be/...\n  • https://youtube.com/shorts/...');
        }
    }

    function showYouTubeOptions() {
        renderOptions(YOUTUBE_FORMATS, (fmt) => {
            selectedFormat = fmt;
            document.querySelectorAll('.option-chip').forEach(chip => {
                chip.classList.toggle('selected', chip.dataset.format === fmt.name + fmt.ext);
            });
            convertBtn.classList.remove('hidden');
        });
    }

    // ============================================
    // Conversion Flow
    // ============================================
    convertBtn.addEventListener('click', startConversion);

    async function startConversion() {
        convertBtn.classList.add('hidden');
        conversionOptions.classList.add('hidden');

        // Hide the input area so progress takes focus
        if (currentMode === 'file') {
            dropZone.classList.add('hidden');
        } else {
            urlInput.classList.add('hidden');
            videoPreview.classList.add('hidden');
        }

        progressSection.classList.remove('hidden');

        // Simulate progress (real conversion needs a backend)
        simulateConversion();
    }

    function simulateConversion() {
        let progress = 0;
        const duration = 4000;
        const interval = 100;
        const increment = (interval / duration) * 100;

        const timer = setInterval(() => {
            progress = Math.min(progress + increment + (Math.random() * 2), 100);
            progressFill.style.width = progress.toFixed(0) + '%';

            if (progress >= 30 && progress < 60) {
                progressText.textContent = 'Extracting media…';
            } else if (progress >= 60 && progress < 90) {
                progressText.textContent = 'Encoding…';
            } else if (progress >= 90) {
                progressText.textContent = 'Finalizing…';
            }

            if (progress >= 100) {
                clearInterval(timer);
                completeConversion();
            }
        }, interval);
    }

    function completeConversion() {
        progressSection.classList.add('hidden');

        if (videoData) {
            // YouTube mode — show result with info that backend is needed
            resultMeta.textContent = `${selectedFormat.icon} ${videoData.title} → ${selectedFormat.name}`;
        } else if (uploadedFile) {
            const outputName = uploadedFile.name.replace(/\.[^.]+$/, '') + '.' + (selectedFormat.ext === 'Extract MP3' ? 'mp3' : selectedFormat.ext);
            resultMeta.textContent = `${uploadedFile.name} → ${outputName}`;
        }

        resultSection.classList.remove('hidden');
    }

    downloadBtn.addEventListener('click', () => {
        // For now: show a toast explaining backend is needed
        // Once backend is set up, this will download the converted file
        alert('Backend coming soon! 🚧\n\nTo enable real conversions, we\'ll need a server (Vercel function or VPS) running yt-dlp for YouTube or ffmpeg for files.\n\nWant me to set that up?');
    });

    // ============================================
    // Reset
    // ============================================
    resultResetBtn.addEventListener('click', resetState);
    errorResetBtn.addEventListener('click', resetState);

    function showError(title, detail) {
        mainView.classList.add('hidden');
        errorSection.classList.remove('hidden');
        errorTitle.textContent = title;
        errorDetail.textContent = detail;
    }

    // ============================================
    // Init
    // ============================================
    resetState();
});
