    let HERO_DATA = {}, ITEM_DATA = {}, ITEM_DATA_BY_ID = {};
    const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
    const constantsReady = Promise.all([
        fetch('https://api.opendota.com/api/constants/heroes').then(r => r.json()),
        fetch('https://api.opendota.com/api/constants/items').then(r => r.json())
    ]).then(([heroes, items]) => {
        HERO_DATA = heroes;
        ITEM_DATA = items;
        ITEM_DATA_BY_ID = {};
        Object.keys(items).forEach((key) => {
            const item = items[key];
            if (item && item.id != null) {
                ITEM_DATA_BY_ID[item.id] = item;
            }
        });
    });

    async function ensureConstants() { await constantsReady; }

    async function analyze() {
        await ensureConstants();
        const id = document.getElementById('mId').value;
        const res = await fetch(`/api/match/${id}`);
        const data = await res.json();
        if(data.error) return alert("Match not found");

        document.getElementById('adviceBox').style.display = 'block';
        document.getElementById('adviceContent').innerHTML = data.analysis.map(t => `• ${t}`).join('<br>');

        document.getElementById('leadersCard').style.display = 'block';
        document.getElementById('leadersContent').innerHTML = buildLeaders(data.players);
        switchLeadersTab('leaders-dmg');

        let html = `<h3>${data.radiant_win ? 'RADIANT' : 'DIRE'} VICTORY (${data.score.radiant}:${data.score.dire})</h3>`;
        html += renderTeam(data.players.filter(p => p.is_radiant), `Radiant Team • ${data.score.radiant} kills`, 'radiant');
        html += renderTeam(data.players.filter(p => !p.is_radiant), `Dire Team • ${data.score.dire} kills`, 'dire');
        document.getElementById('matchTableContent').innerHTML = html;
    }

    function switchLeadersTab(tab) {
        const card = document.getElementById('leadersCard');
        if (!card) return;
        card.querySelectorAll('[data-tab]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        card.querySelectorAll('[data-content]').forEach((content) => {
            content.style.display = content.dataset.content === tab ? 'block' : 'none';
        });
    }

    function buildLeaders(players) {
        const topDamage = [...players].sort((a, b) => (b.hero_damage || 0) - (a.hero_damage || 0)).slice(0, 5);
        const topSupports = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0)).slice(0, 5);
        const topHealing = [...players].sort((a, b) => (b.hero_healing || 0) - (a.hero_healing || 0)).slice(0, 5);

        return `
            <div class="leader-list" data-content="leaders-dmg">
                ${topDamage.map((p) => leaderRow(p, p.hero_damage, 'DMG')).join('') || '<div class="timeline-item">No data</div>'}
            </div>
            <div class="leader-list" data-content="leaders-sup" style="display:none">
                ${topSupports.map((p) => leaderRow(p, p.assists, 'AST')).join('') || '<div class="timeline-item">No data</div>'}
            </div>
            <div class="leader-list" data-content="leaders-heal" style="display:none">
                ${topHealing.map((p) => leaderRow(p, p.hero_healing, 'HEAL')).join('') || '<div class="timeline-item">No data</div>'}
            </div>
        `;
    }

    function leaderRow(p, value, suffix) {
        const hInfo = HERO_DATA[p.hero_id] || { name: "unknown" };
        const hName = hInfo.name ? hInfo.name.replace('npc_dota_hero_', '') : 'unknown';
        const playerName = p.personaname || 'Unknown';
        return `
            <div class="leader-item">
                <div class="leader-left">
                    <img class="leader-hero" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hName}.png" alt="">
                    <div class="leader-name">${playerName}</div>
                </div>
                <div class="leader-value">${value ?? 0} ${suffix}</div>
            </div>
        `;
    }

    function renderTeam(players, label, cls) {
        let teamHtml = `<div class="card"><table class="match-table"><tr class="team-header ${cls}"><td colspan="4">${label}</td></tr>`;
        teamHtml += players.map(p => {
            const hInfo = HERO_DATA[p.hero_id] || { name: "unknown" };
            const hName = hInfo.name.replace('npc_dota_hero_', '');
            const itemsHtml = p.items.map(id => {
                if(!id || id === 0 || !ITEM_DATA_BY_ID[id]) {
                    return `<div class="item-img" style="display:inline-block; opacity:0.1; background:#000;"></div>`;
                }
                const imgPath = ITEM_DATA_BY_ID[id].img;
                return `<img class="item-img" src="https://cdn.cloudflare.steamstatic.com${imgPath}" title="${ITEM_DATA_BY_ID[id].dname}">`;
            }).join('');
            const playerName = p.personaname || 'Unknown';
            const avatarUrl = (p.avatarfull || p.avatar || '').trim();
            const avatarHtml = avatarUrl
                ? `<img class="player-avatar" src="${avatarUrl}" onerror="this.onerror=null;this.style.display='none';" alt="">`
                : `<div class="player-avatar placeholder"></div>`;
            return `<tr>
                <td style="width:240px">
                    <div class="player-meta">
                        ${avatarHtml}
                        <div>
                            <div class="player-name">${playerName}</div>
                            <div><img class="hero-img" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hName}.png"> Lv.${p.level}</div>
                        </div>
                    </div>
                </td>
                <td style="width:100px; text-align:center;"><b>${p.kills}/${p.deaths}/${p.assists}</b></td>
                <td class="nw" style="width:80px">${(p.net_worth/1000).toFixed(1)}k</td>
                <td><div style="display:flex">${itemsHtml}</div></td>
            </tr>`;
        }).join('');
        return teamHtml + `</table></div>`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        hydrateSteamUser();
        const params = new URLSearchParams(window.location.search);
        const matchId = params.get('match_id');
        if (matchId) {
            const input = document.getElementById('mId');
            if (input) input.value = matchId;
            analyze();
        }
    });

    async function hydrateSteamUser() {
        const params = new URLSearchParams(window.location.search);
        const steamId = params.get('steam_id') || localStorage.getItem('steam_id');
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

    function getSteamId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('steam_id') || localStorage.getItem('steam_id');
    }

    function goView(view) {
        const steamId = getSteamId();
        const tail = steamId ? `&steam_id=${steamId}` : '';
        window.location.href = `/?view=${view}${tail}`;
    }

    function goHome() {
        const steamId = getSteamId();
        const tail = steamId ? `?steam_id=${steamId}` : '';
        window.location.href = `/${tail}`;
    }
