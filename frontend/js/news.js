const DEFAULT_NEWS_IMAGE = 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_hero.jpg';

function goHome() {
    const steamId = getSteamId();
    const tail = steamId ? `?steam_id=${steamId}` : '';
    window.location.href = `/${tail}`;
}

function goView(view) {
    const steamId = getSteamId();
    const tail = steamId ? `&steam_id=${steamId}` : '';
    window.location.href = `/?view=${view}${tail}`;
}

function getSteamId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('steam_id') || localStorage.getItem('steam_id');
}

async function hydrateSteamUser() {
    const steamId = getSteamId();
    if (!steamId) return;
    localStorage.setItem('steam_id', steamId);
    try {
        const res = await fetch(`/auth/steam/profile/${steamId}`);
        if (!res.ok) return;
        const data = await res.json();
        const name = data.personaname || 'Steam User';
        const avatar = data.avatarfull || data.avatar || '';
        const nav = document.getElementById('navAuth');
        if (!nav) return;
        nav.innerHTML = `
            <button class="nav-btn" onclick="goView('profile')">Профіль</button>
            <div class="player-meta" style="gap:6px;">
                ${avatar ? `<img class="player-avatar" src="${avatar}" alt="">` : `<div class="player-avatar placeholder"></div>`}
                <span class="player-name" style="max-width:180px;">${name}</span>
            </div>
        `;
    } catch (e) {
        // ignore
    }
}

function normalizeClanImages(raw, clanId) {
    if (!raw) return '';
    const clan = clanId || '';
    let out = raw.replace(
        /\{STEAM_CLAN_IMAGE\}\//g,
        'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/'
    );
    out = out.replace(
        /\{STEAM_CLAN_IMAGE\}/g,
        clan ? `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/${clan}` : ''
    );
    return out;
}

function extractImage(raw, clanId) {
    if (!raw) return '';
    let normalized = normalizeClanImages(raw, clanId);
    normalized = normalized.replace(/(^|\s)\/\/+/g, ' https://');
    const htmlMatch = normalized.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlMatch) return htmlMatch[1];
    const bbMatch = normalized.match(/\[img\]([\s\S]*?)\[\/img\]/i);
    if (bbMatch) return bbMatch[1].trim();
    const urlMatch = normalized.match(/https?:\/\/[^\s"'\\\]]+\.(?:jpg|jpeg|png|gif|webp)(\?[^\s"'\\\]]*)?/i);
    if (urlMatch) return urlMatch[0];
    return '';
}

function stripDangerousHtml(html) {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

function toNewsHtml(raw, clanId) {
    if (!raw) return '';
    let out = normalizeClanImages(raw, clanId);
    out = stripDangerousHtml(out);
    // Insert line breaks for patch-note style sentences.
    out = out.replace(/([a-z0-9\.\)])(Fixed|Added|Updated|Removed|Changed|Improved|Reduced|Increased|Reworked|Added:|Removed:|Updated:|Fixed:)/g, '$1\n$2');
    out = out.replace(/•\s*/g, '\n• ');
    out = out.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="">');
    out = out.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener">$2</a>');
    out = out.replace(/\[\/?b\]/gi, '');
    out = out.replace(/\[\/?i\]/gi, '');
    out = out.replace(/\[\/?u\]/gi, '');
    out = out.replace(/\[\/?h\d\]/gi, '');
    out = out.replace(/\[\/?quote\]/gi, '');
    out = out.replace(/\[\/?list\]/gi, '');
    out = out.replace(/\[\*\]/g, '• ');
    // Convert plain image URLs into inline images.
    out = out.replace(
        /(^|[\s>])(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|png|gif|webp)(\?[^\s"'<>]*)?)/gi,
        '$1<img src="$2" alt="">'
    );
    // Convert blocks to paragraphs and lists.
    const blocks = out.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    const htmlBlocks = blocks.map((block) => {
        const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);
        const isList = lines.length > 1 && lines.every((l) => l.startsWith('•'));
        if (isList) {
            const items = lines.map((l) => l.replace(/^•\s*/, '').trim()).filter(Boolean);
            return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
        }
        const joined = lines.join(' ');
        const sentences = joined.split(/(?<=[.!?])\s+(?=[A-ZА-Я])/);
        if (sentences.length <= 2) {
            return `<p>${joined}</p>`;
        }
        const paras = [];
        for (let i = 0; i < sentences.length; i += 2) {
            paras.push(sentences.slice(i, i + 2).join(' '));
        }
        return paras.map((p) => `<p>${p}</p>`).join('');
    });
    return htmlBlocks.join('');
}

function renderNews(item) {
    const root = document.getElementById('newsArticle');
    if (!root) return;
    if (!item) {
        root.innerHTML = '<div class="muted">News not found.</div>';
        return;
    }
    const raw = item.contents || '';
    let imageUrl = extractImage(raw, item.clanid || item.clan_id || item.clanid);
    if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
    if (!imageUrl) imageUrl = DEFAULT_NEWS_IMAGE;
    const date = new Date((item.date || 0) * 1000).toLocaleDateString();
    const tag = item.feedlabel
        || (Array.isArray(item.tags) && item.tags.length ? item.tags[0] : '')
        || (typeof item.tags === 'string' ? item.tags.split(',')[0] : '');
    const bodyHtml = toNewsHtml(raw, item.clanid || item.clan_id || item.clanid);
    const showHero = imageUrl && imageUrl !== DEFAULT_NEWS_IMAGE;
    root.innerHTML = `
        <div class="news-article-card">
            ${showHero ? `<div class="news-hero small"><img src="${imageUrl}" alt=""></div>` : ''}
            <div class="news-article-meta">
                <span>${date}</span>
                <span>•</span>
                <span>${item.author || 'Valve'}</span>
                ${tag ? `<span class="news-tag">${tag}</span>` : ''}
            </div>
            <div class="news-article-title">${item.title || 'Dota 2 News'}</div>
            <div class="news-article-body">${bodyHtml || '<div class="muted">No content.</div>'}</div>
        </div>
    `;
}

async function loadNewsDetail() {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get('gid');
    if (!gid) {
        renderNews(null);
        return;
    }
    try {
        const cached = sessionStorage.getItem(`news_item_${gid}`);
        if (cached) {
            const item = JSON.parse(cached);
            renderNews(item);
            if (item && item.contents && item.contents.length >= 800) return;
        }
        const cachedLocal = localStorage.getItem(`news_item_${gid}`);
        if (cachedLocal) {
            const item = JSON.parse(cachedLocal);
            renderNews(item);
            if (item && item.contents && item.contents.length >= 800) return;
        }
    } catch (e) {
        // ignore
    }
    try {
        const res = await fetch('/api/news?count=50&maxlength=10000');
        const data = await res.json();
        const items = (data.appnews && data.appnews.newsitems) ? data.appnews.newsitems : [];
        const item = items.find((n) => String(n.gid || n.id || n.newsitem_id || '') === String(gid));
        renderNews(item);
    } catch (e) {
        renderNews(null);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js');
    hydrateSteamUser();
    loadNewsDetail();
});
