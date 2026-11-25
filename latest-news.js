(() => {
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  const tr = lang === 'tr';
  document.getElementById('latest-heading').textContent = tr ? 'Son Gelişmeler' : 'Latest developments';
  document.getElementById('latest-intro').textContent = tr ? 'SICPA hakkında son taramalarda bulunan haberler ve belgeler.' : 'News and documents about SICPA found in recent scans.';
  const grid = document.getElementById('latest-grid');
  const scan = document.getElementById('latest-scan');
  fetch('/data/latest-news.json', {cache:'no-cache'}).then(r => {if (!r.ok) throw Error('unavailable'); return r.json();}).then(data => {
    const items = [...data.items].sort((a,b) => b.date.localeCompare(a.date));
    for (const item of items) {
      if (!/^https?:\/\//i.test(item.url)) continue;
      const article = document.createElement('article'); article.className = 'latest-item';
      const meta = document.createElement('div'); meta.className = 'latest-meta'; meta.textContent = `${item.date} · ${item.source}`;
      const h = document.createElement('h3'); const a = document.createElement('a'); a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = item.title[lang] || item.title.en || item.title.tr; h.append(a);
      const p = document.createElement('p'); p.className = 'latest-summary'; p.textContent = item.summary[lang] || item.summary.en || item.summary.tr;
      article.append(meta,h,p); grid.append(article);
    }
    if (!items.length) grid.textContent = tr ? 'Henüz yeni bir kayıt bulunmuyor.' : 'No new items yet.';
    scan.textContent = (tr ? 'Son başarılı tarama: ' : 'Last successful scan: ') + new Intl.DateTimeFormat(tr ? 'tr-TR' : 'en-GB', {dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(data.last_successful_scan)) + ' (İstanbul)';
  }).catch(() => {grid.textContent = tr ? 'Gelişmeler şu anda yüklenemiyor.' : 'Updates are temporarily unavailable.';});
})();
