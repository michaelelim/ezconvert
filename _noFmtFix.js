    // ── "No conversions available" indicator ──
    const noMsg = document.createElement('div');
    noMsg.id = 'noConvMsg';
    noMsg.style.cssText = 'display:none; padding:16px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:10px; text-align:center; max-width:420px; width:100%';
    noMsg.innerHTML = '<p style="font-size:13px;color:var(--text-dim);margin-bottom:6px">No browser-side conversions for this file type</p>' +
        '<p style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Supported conversions:</p>' +
        '<p style="font-size:10px;color:var(--text-muted);line-height:1.6">Images: JPG/PNG/WebP/BMP/GIF/AVIF/SVG → JPG/PNG/WebP/PDF/ICO<br>CSV ↔ JSON &nbsp;|&nbsp; Markdown/Text → HTML &nbsp;|&nbsp; Video → thumbnails</p>';
    $('optionsSection').appendChild(noMsg);

    const showS = el => [dropS,fileS,progS,resultS,errorS].forEach(s=>s.classList.add('hidden'))||el.classList.remove('hidden');
    const reset = () => { file=null;fmt=null;blob=null;ext='bin'; noMsg.style.display='none'; optGrid.innerHTML=''; qualRow.innerHTML=''; convBtn.classList.add('hidden'); showS(dropS); progF.style.width='0%'; };
