(() => {
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  const tr = lang === 'tr';
  const byId = id => document.getElementById(id);
  const grid = byId('latest-grid'), scan = byId('latest-scan'), more = byId('latest-more');
  byId('latest-heading').textContent = tr ? 'Son Gelişmeler' : 'Latest developments';
  byId('latest-kicker').textContent = tr ? 'SICPA CENTURY · ARŞİV' : 'SICPA CENTURY · ARCHIVE';
  byId('latest-intro').textContent = tr ? 'Haberler ve belgeler, yeniden eskiye.' : 'News and documents, newest first.';
  more.textContent = tr ? 'Daha fazla göster' : 'Show more';
  const archive = JSON.parse(byId('archive-data').textContent).articles;
  const translations = JSON.parse(byId('i18n-data').textContent).articles;
  const canonical = url => { try { const u = new URL(url); return (u.hostname.replace(/^www\./,'') + u.pathname.replace(/\/$/, '')).toLowerCase(); } catch {return '';} };
  const existing = new Set();
  const entries = archive.map(a => {
    [a.url, ...Object.values(a.alternate_urls || {})].forEach(url => existing.add(canonical(url)));
    return {id:a.id,date:a.date || '',url:(a.alternate_urls || {})[lang] || a.url,source:a.publisher || '',title:a.title,summary:lang === 'tr' ? a.summary_tr : ((translations[a.id] || {})[lang] || (translations[a.id] || {}).en || a.summary_tr)};
  });
  let visible = 0;
  function render() {
    for (const item of entries.slice(visible, visible + 20)) {
      if (!/^https?:\/\//i.test(item.url || '')) continue;
      const article = document.createElement('article'); article.className = 'latest-item';
      const meta = document.createElement('div'); meta.className = 'latest-meta';
      const time = document.createElement('time'); time.textContent = item.date || (tr ? 'Tarih bilinmiyor' : 'Date unknown'); if(item.date) time.dateTime = item.date;
      const source = document.createElement('span'); source.textContent = item.source ? '· ' + item.source : '';
      meta.append(time,source);
      const h = document.createElement('h3'), a = document.createElement('a'); a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = item.title; h.append(a);
      const p = document.createElement('p'); p.className = 'latest-summary'; p.textContent = item.summary || '';
      article.append(meta,h,p); grid.append(article);
    }
    visible = Math.min(visible + 20, entries.length);
    more.hidden = visible >= entries.length;
    byId('latest-total').textContent = tr ? `${entries.length} kayıt` : `${entries.length} records`;
  }
  more.addEventListener('click', render);
  fetch('/data/latest-news.json', {cache:'no-cache'}).then(r => {if (!r.ok) throw Error('unavailable'); return r.json();}).then(data => {
    for (const item of data.items || []) {
      const key = canonical(item.url); if (!key || existing.has(key)) continue; existing.add(key);
      entries.push({id:item.id,date:item.date || '',url:item.url,source:item.source,title:item.title[lang] || item.title.en || item.title.tr,summary:item.summary[lang] || item.summary.en || item.summary.tr});
    }
    scan.textContent = (tr ? 'Son başarılı tarama: ' : 'Last successful scan: ') + new Intl.DateTimeFormat(tr ? 'tr-TR' : 'en-GB', {dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(data.last_successful_scan)) + ' (İstanbul)';
  }).catch(() => {scan.textContent = tr ? 'Yeni gelişmeler şu anda yüklenemiyor; arşiv gösteriliyor.' : 'New updates are unavailable; the archive is shown.';}).finally(() => {
    entries.sort((a,b) => (b.date || '').localeCompare(a.date || '') || (a.id || '').localeCompare(b.id || ''));
    render();
  });
})();
