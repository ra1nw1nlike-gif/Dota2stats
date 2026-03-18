    let HERO_DATA = {}, ITEM_DATA = {}, ITEM_DATA_BY_ID = {};
    const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

    // Р В РІР‚вЂќР В Р’В°Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р РЋРІР‚С™Р В Р’В°Р В Р’В¶Р В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋР РЏ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р РЋРІР‚С™
    let HERO_DATA_BY_ID = {};
    const constantsReady = Promise.all([
        fetch('https://api.opendota.com/api/constants/heroes').then(r => r.json()),
        fetch('https://api.opendota.com/api/constants/items').then(r => r.json())
    ]).then(([heroes, items]) => {
        HERO_DATA = heroes;
        HERO_DATA_BY_ID = {};
        Object.keys(heroes).forEach((key) => {
            const hero = heroes[key];
            if (hero && hero.id != null) {
                HERO_DATA_BY_ID[hero.id] = hero;
            }
        });
        ITEM_DATA = items;
        ITEM_DATA_BY_ID = {};
        Object.keys(items).forEach((key) => {
            const item = items[key];
            if (item && item.id != null) {
                ITEM_DATA_BY_ID[item.id] = item;
            }
        });
    });

    async function ensureConstants() {
        try {
            await constantsReady;
        } catch (e) {
            // ignore
        }
    }

    const LANGS = {
        uk: { label: 'Українська', flag: '🇺🇦' },
        en: { label: 'English', flag: '🇬🇧' },
        de: { label: 'Deutsch', flag: '🇩🇪' }
    };

    const I18N = {
        uk: {
            nav_home: 'Головна',
            nav_winrate: 'Топ Winrate',
            nav_tournaments: 'Турніри',
            nav_news: 'Новини',
            nav_profile: 'Профіль',
            nav_login: 'Увійти',
            btn_analyze: 'Аналіз',
            hero_hint: 'Преміум аналітика матчів • Миттєві інсайти • Профі-статистика',
            search_placeholder: 'Match ID або Steam-посилання (https://steamcommunity.com/...)',
            home_title: 'Головна',
            home_subtitle: 'Топ гравці та твої останні матчі',
            top_players_title: 'Топ гравці за MMR',
            top_players_subtitle: 'Глобальна таблиця',
            about_title: 'Про D2 Analyzer',
            about_subtitle: 'Аналіз матчів, мети та про-трендів',
            about_body: 'D2 Analyzer допомагає розбирати матчі, досліджувати мету та відстежувати про-тренди швидко й чисто.',
            recent_title: 'Твої останні матчі',
            recent_subtitle: 'Потрібен Steam акаунт',
            winrate_title: 'Найуспішніші герої за роллю',
            patch_loading: 'Патч: завантаження...',
            patch_label: 'Патч:',
            top5_role_title: 'Топ 5 за роллю',
            top5_role_subtitle: 'Останні 8 днів • Winrate понад 50% за достатньої кількості матчів',
            trending_title: 'Найбільш трендові герої',
            trending_subtitle: 'Останні 8 днів • Топ 5 за кількістю матчів',
            news_title: 'Новини Dota 2',
            news_subtitle: 'Офіційні новини Steam',
            tournaments_title: 'Живі та нещодавні турніри',
            tournaments_subtitle: 'На основі про-матчів',
            items_title: 'Популярні предмети',
            items_subtitle: 'Найчастіше використовують',
            login_title: 'Увійти через Steam',
            login_subtitle: 'Безпечний OpenID',
            login_body: 'Натисни, щоб розпочати Steam-автентифікацію. Після входу ти повернешся назад.',
            login_cta: 'Продовжити зі Steam',
            pro_stats: 'Про-статистика',
            activity_title: 'Активність',
            activity_subtitle: 'Останні 3 місяці',
            trend_title: 'Тренд перемог/поразок',
            stats_title: 'Повна статистика',
            stats_subtitle: 'За весь час',
            top_heroes_title: 'Топ 5 героїв',
            top_heroes_subtitle: 'Найпопулярніші',
            recent_matches_title: 'Останні матчі',
            recent_matches_subtitle: 'Нещодавні',
            loading_top_players: 'Завантаження топ гравців...',
            no_data: 'Немає даних.',
            retry: 'Спробувати ще',
            loading_matches: 'Завантаження матчів...',
            login_to_see: 'Увійди, щоб побачити свої матчі.',
            no_recent_matches: 'Немає останніх матчів.',
            failed_load_matches: 'Не вдалося завантажити матчі.',
            match_not_found: 'Матч не знайдено',
            opening_profile: 'Відкриваю профіль...',
            analyzing: 'Аналізую...',
            analyze: 'Аналіз',
            resolve_failed: 'Не вдалося знайти профіль Steam за цим посиланням.',
            profile_loading: 'Завантаження...',
            steam_user: 'Користувач Steam',
            logout: 'Вийти з акаунту'
            ,report_title: 'Звіт'
            ,stats_recorded: 'Статистика записано'
            ,lobby_type: 'Тип лобі'
            ,game_mode: 'Режим гри'
            ,side: 'Сторона'
            ,region: 'Регіон'
            ,lobby_normal: 'Звичайний'
            ,lobby_ranked: 'Рейтинговий'
            ,lobby_team: 'Командний'
            ,mode_all_pick: 'All Pick'
            ,mode_all_draft: 'All Draft'
            ,mode_turbo: 'Turbo'
            ,mode_captains: 'Captains Mode'
            ,side_radiant: 'Світла'
            ,side_dire: 'Темна'
            ,region_us_east: 'US East'
            ,region_us_west: 'US West'
            ,region_eu_west: 'Europe West'
            ,region_eu_east: 'Europe East'
            ,region_russia: 'Russia'
            ,region_sea: 'SE Asia'
            ,games_label: 'Games'
            ,winrate_label: 'Winrate'
            ,wins_label: 'Wins'
            ,losses_label: 'Losses'
            ,win_label: 'Win'
            ,loss_label: 'Loss'
            ,na_label: 'N/A'
            ,id_label: 'ID'
            ,min_label: 'min'
            ,no_data_label: 'No data'
            ,activity_none: 'No activity'
            ,form_label: 'Form'
            ,leaders_title: 'ЛІДЕРБОРДИ'
            ,leaders_top_damage: 'Топ урону'
            ,leaders_top_supports: 'Топ ассистів'
            ,leaders_top_healing: 'Топ лікування'
            ,victory_radiant: 'ПЕРЕМОГА RADIANT'
            ,victory_dire: 'ПЕРЕМОГА DIRE'
            ,radiant_team: 'Команда Radiant'
            ,dire_team: 'Команда Dire'
            ,kills_label: 'кілів'
            ,stats_btn: 'Статистика'
            ,tab_eco: 'Економіка'
            ,tab_dmg: 'Шкода'
            ,tab_other: 'Інше'
            ,gpm: 'GPM'
            ,xpm: 'XPM'
            ,net_worth: 'Net Worth'
            ,last_hits: 'Last Hits'
            ,denies: 'Denies'
            ,hero_damage: 'Hero Damage'
            ,tower_damage: 'Tower Damage'
            ,hero_healing: 'Hero Healing'
            ,level: 'Рівень'
            ,kills: 'Вбивства'
            ,deaths: 'Смерті'
            ,assists: 'Асисти'
            ,loading_heroes: 'Завантаження героїв...'
            ,failed_load_heroes: 'Не вдалося завантажити героїв.'
            ,no_roles: 'Немає ролей'
            ,meta_build: 'Meta-білд та таланти'
            ,popular_items: 'Популярні предмети'
            ,loading: 'Завантаження...'
            ,talents: 'Таланти'
            ,no_talent_data: 'Немає даних про таланти'
            ,no_item_data: 'Немає даних про предмети'
            ,failed_load_items: 'Не вдалося завантажити предмети'
            ,loading_news: 'Завантаження новин...'
            ,failed_load_news: 'Не вдалося завантажити новини.'
            ,loading_tournaments: 'Завантаження турнірів...'
            ,no_tournaments: 'Турнірів не знайдено.'
            ,recent_matches_label: 'Останні матчі'
            ,last_match_label: 'Останній матч'
            ,failed_load_tournaments: 'Не вдалося завантажити турніри.'
            ,failed_load_top_players: 'Не вдалося завантажити топ гравців.'
            ,ad_insights: 'ІНСАЙТИ'
        },
        en: {
            nav_home: 'Home',
            nav_winrate: 'Top Winrate',
            nav_tournaments: 'Tournaments',
            nav_news: 'News',
            nav_profile: 'Profile',
            nav_login: 'Login',
            btn_analyze: 'Analyze',
            hero_hint: 'Premium match analytics • Instant insights • Pro-grade stats',
            search_placeholder: 'Match ID or Steam link (https://steamcommunity.com/...)',
            home_title: 'Home',
            home_subtitle: 'Top players and your recent matches',
            top_players_title: 'Top Players by MMR',
            top_players_subtitle: 'Global leaderboard',
            about_title: 'About D2 Analyzer',
            about_subtitle: 'Analyze matches, meta, and pro trends',
            about_body: 'D2 Analyzer helps you break down matches, explore meta picks, and follow pro trends with clean, fast insights.',
            recent_title: 'Your Recent Matches',
            recent_subtitle: 'Steam account required',
            winrate_title: 'Most Successful Heroes by Role',
            patch_loading: 'Patch: loading...',
            patch_label: 'Patch:',
            top5_role_title: 'Top 5 by Role',
            top5_role_subtitle: 'Last 8 days • Winrate over 50% with enough matches',
            trending_title: 'Most Trending Heroes',
            trending_subtitle: 'Last 8 days • Top 5 by match count',
            news_title: 'Dota 2 News',
            news_subtitle: 'Official Steam news',
            tournaments_title: 'Live & Recent Tournaments',
            tournaments_subtitle: 'Based on pro matches',
            items_title: 'Popular items',
            items_subtitle: 'Most used',
            login_title: 'Login with Steam',
            login_subtitle: 'Secure OpenID',
            login_body: 'Click to start Steam authentication. After login, you will be redirected back.',
            login_cta: 'Continue with Steam',
            pro_stats: 'Pro Stats',
            activity_title: 'Activity',
            activity_subtitle: 'Last 3 months',
            trend_title: 'Win/Loss Trend',
            stats_title: 'Full stats',
            stats_subtitle: 'All time',
            top_heroes_title: 'Top 5 Heroes',
            top_heroes_subtitle: 'Most played',
            recent_matches_title: 'Recent Matches',
            recent_matches_subtitle: 'Recent',
            loading_top_players: 'Loading top players...',
            no_data: 'No data.',
            retry: 'Retry',
            loading_matches: 'Loading matches...',
            login_to_see: 'Login to see your matches.',
            no_recent_matches: 'No recent matches.',
            failed_load_matches: 'Failed to load matches.',
            match_not_found: 'Match not found',
            opening_profile: 'Opening profile...',
            analyzing: 'Analyzing...',
            analyze: 'Analyze',
            resolve_failed: 'Could not find a Steam profile for this link.',
            profile_loading: 'Loading...',
            steam_user: 'Steam User',
            logout: 'Log out'
            ,report_title: 'Report'
            ,stats_recorded: 'Stats recorded'
            ,lobby_type: 'Lobby type'
            ,game_mode: 'Game mode'
            ,side: 'Side'
            ,region: 'Region'
            ,lobby_normal: 'Normal'
            ,lobby_ranked: 'Ranked'
            ,lobby_team: 'Team'
            ,mode_all_pick: 'All Pick'
            ,mode_all_draft: 'All Draft'
            ,mode_turbo: 'Turbo'
            ,mode_captains: 'Captains Mode'
            ,side_radiant: 'Radiant'
            ,side_dire: 'Dire'
            ,region_us_east: 'US East'
            ,region_us_west: 'US West'
            ,region_eu_west: 'Europe West'
            ,region_eu_east: 'Europe East'
            ,region_russia: 'Russia'
            ,region_sea: 'SE Asia'
            ,games_label: 'Games'
            ,winrate_label: 'Winrate'
            ,wins_label: 'Wins'
            ,losses_label: 'Losses'
            ,win_label: 'Win'
            ,loss_label: 'Loss'
            ,na_label: 'N/A'
            ,id_label: 'ID'
            ,min_label: 'min'
            ,no_data_label: 'No data'
            ,activity_none: 'No activity'
            ,form_label: 'Form'
            ,leaders_title: 'LEADERBOARDS'
            ,leaders_top_damage: 'Top Damage'
            ,leaders_top_supports: 'Top Supports'
            ,leaders_top_healing: 'Top Healing'
            ,victory_radiant: 'RADIANT VICTORY'
            ,victory_dire: 'DIRE VICTORY'
            ,radiant_team: 'Radiant Team'
            ,dire_team: 'Dire Team'
            ,kills_label: 'kills'
            ,stats_btn: 'Stats'
            ,tab_eco: 'Economy'
            ,tab_dmg: 'Damage'
            ,tab_other: 'Other'
            ,gpm: 'GPM'
            ,xpm: 'XPM'
            ,net_worth: 'Net Worth'
            ,last_hits: 'Last Hits'
            ,denies: 'Denies'
            ,hero_damage: 'Hero Damage'
            ,tower_damage: 'Tower Damage'
            ,hero_healing: 'Hero Healing'
            ,level: 'Level'
            ,kills: 'Kills'
            ,deaths: 'Deaths'
            ,assists: 'Assists'
            ,loading_heroes: 'Loading heroes...'
            ,failed_load_heroes: 'Failed to load heroes.'
            ,no_roles: 'No roles'
            ,meta_build: 'Meta Build & Talents'
            ,popular_items: 'Popular items'
            ,loading: 'Loading...'
            ,talents: 'Talents'
            ,no_talent_data: 'No talent data'
            ,no_item_data: 'No item data'
            ,failed_load_items: 'Failed to load items'
            ,loading_news: 'Loading news...'
            ,failed_load_news: 'Failed to load news.'
            ,loading_tournaments: 'Loading tournaments...'
            ,no_tournaments: 'No tournaments found.'
            ,recent_matches_label: 'Recent matches'
            ,last_match_label: 'Last match'
            ,failed_load_tournaments: 'Failed to load tournaments.'
            ,failed_load_top_players: 'Failed to load top players.'
            ,ad_insights: 'INSIGHTS'
        },
        de: {
            nav_home: 'Start',
            nav_winrate: 'Top Winrate',
            nav_tournaments: 'Turniere',
            nav_news: 'News',
            nav_profile: 'Profil',
            nav_login: 'Login',
            btn_analyze: 'Analysieren',
            hero_hint: 'Premium Match-Analyse • Sofortige Insights • Pro-Stats',
            search_placeholder: 'Match-ID oder Steam-Link (https://steamcommunity.com/...)',
            home_title: 'Start',
            home_subtitle: 'Top-Spieler und deine letzten Matches',
            top_players_title: 'Top-Spieler nach MMR',
            top_players_subtitle: 'Globales Leaderboard',
            about_title: 'Über D2 Analyzer',
            about_subtitle: 'Matches, Meta und Pro-Trends analysieren',
            about_body: 'D2 Analyzer hilft dir, Matches zu analysieren, Meta-Picks zu entdecken und Pro-Trends schnell zu verfolgen.',
            recent_title: 'Deine letzten Matches',
            recent_subtitle: 'Steam-Account erforderlich',
            winrate_title: 'Erfolgreichste Helden nach Rolle',
            patch_loading: 'Patch: lädt...',
            patch_label: 'Patch:',
            top5_role_title: 'Top 5 nach Rolle',
            top5_role_subtitle: 'Letzte 8 Tage • Winrate über 50% mit genug Matches',
            trending_title: 'Trendende Helden',
            trending_subtitle: 'Letzte 8 Tage • Top 5 nach Matchanzahl',
            news_title: 'Dota 2 News',
            news_subtitle: 'Offizielle Steam-News',
            tournaments_title: 'Live & Aktuelle Turniere',
            tournaments_subtitle: 'Basierend auf Pro-Matches',
            items_title: 'Beliebte Items',
            items_subtitle: 'Am häufigsten genutzt',
            login_title: 'Mit Steam anmelden',
            login_subtitle: 'Sicheres OpenID',
            login_body: 'Klicke zum Start der Steam-Authentifizierung. Danach wirst du zurückgeleitet.',
            login_cta: 'Weiter mit Steam',
            pro_stats: 'Pro-Stats',
            activity_title: 'Aktivität',
            activity_subtitle: 'Letzte 3 Monate',
            trend_title: 'Win/Loss Trend',
            stats_title: 'Gesamtstatistik',
            stats_subtitle: 'Gesamte Zeit',
            top_heroes_title: 'Top 5 Helden',
            top_heroes_subtitle: 'Am beliebtesten',
            recent_matches_title: 'Letzte Matches',
            recent_matches_subtitle: 'Neu',
            loading_top_players: 'Top-Spieler laden...',
            no_data: 'Keine Daten.',
            retry: 'Erneut versuchen',
            loading_matches: 'Matches laden...',
            login_to_see: 'Zum Anzeigen einloggen.',
            no_recent_matches: 'Keine aktuellen Matches.',
            failed_load_matches: 'Matches konnten nicht geladen werden.',
            match_not_found: 'Match nicht gefunden',
            opening_profile: 'Profil wird geöffnet...',
            analyzing: 'Analysiere...',
            analyze: 'Analysieren',
            resolve_failed: 'Steam-Profil für diesen Link nicht gefunden.',
            profile_loading: 'Lädt...',
            steam_user: 'Steam User',
            logout: 'Abmelden'
            ,report_title: 'Bericht'
            ,stats_recorded: 'Erfasste Statistik'
            ,lobby_type: 'Lobby-Typ'
            ,game_mode: 'Spielmodus'
            ,side: 'Seite'
            ,region: 'Region'
            ,lobby_normal: 'Normal'
            ,lobby_ranked: 'Rangliste'
            ,lobby_team: 'Team'
            ,mode_all_pick: 'All Pick'
            ,mode_all_draft: 'All Draft'
            ,mode_turbo: 'Turbo'
            ,mode_captains: 'Captains Mode'
            ,side_radiant: 'Radiant'
            ,side_dire: 'Dire'
            ,region_us_east: 'US East'
            ,region_us_west: 'US West'
            ,region_eu_west: 'Europe West'
            ,region_eu_east: 'Europe East'
            ,region_russia: 'Russland'
            ,region_sea: 'Südostasien'
            ,games_label: 'Spiele'
            ,winrate_label: 'Winrate'
            ,wins_label: 'Siege'
            ,losses_label: 'Niederlagen'
            ,win_label: 'Sieg'
            ,loss_label: 'Niederlage'
            ,na_label: 'N/A'
            ,id_label: 'ID'
            ,min_label: 'Min'
            ,no_data_label: 'Keine Daten'
            ,activity_none: 'Keine Aktivität'
            ,form_label: 'Form'
            ,leaders_title: 'LEADERBOARDS'
            ,leaders_top_damage: 'Top Schaden'
            ,leaders_top_supports: 'Top Assists'
            ,leaders_top_healing: 'Top Heilung'
            ,victory_radiant: 'RADIANT SIEG'
            ,victory_dire: 'DIRE SIEG'
            ,radiant_team: 'Radiant Team'
            ,dire_team: 'Dire Team'
            ,kills_label: 'Kills'
            ,stats_btn: 'Stats'
            ,tab_eco: 'Ökonomie'
            ,tab_dmg: 'Schaden'
            ,tab_other: 'Sonstiges'
            ,gpm: 'GPM'
            ,xpm: 'XPM'
            ,net_worth: 'Nettovermögen'
            ,last_hits: 'Last Hits'
            ,denies: 'Denies'
            ,hero_damage: 'Helden-Schaden'
            ,tower_damage: 'Turm-Schaden'
            ,hero_healing: 'Helden-Heilung'
            ,level: 'Level'
            ,kills: 'Kills'
            ,deaths: 'Tode'
            ,assists: 'Assists'
            ,loading_heroes: 'Helden werden geladen...'
            ,failed_load_heroes: 'Helden konnten nicht geladen werden.'
            ,no_roles: 'Keine Rollen'
            ,meta_build: 'Meta-Build & Talente'
            ,popular_items: 'Beliebte Items'
            ,loading: 'Lädt...'
            ,talents: 'Talente'
            ,no_talent_data: 'Keine Talentdaten'
            ,no_item_data: 'Keine Itemdaten'
            ,failed_load_items: 'Items konnten nicht geladen werden'
            ,loading_news: 'News werden geladen...'
            ,failed_load_news: 'News konnten nicht geladen werden.'
            ,loading_tournaments: 'Turniere werden geladen...'
            ,no_tournaments: 'Keine Turniere gefunden.'
            ,recent_matches_label: 'Letzte Matches'
            ,last_match_label: 'Letztes Match'
            ,failed_load_tournaments: 'Turniere konnten nicht geladen werden.'
            ,failed_load_top_players: 'Top-Spieler konnten nicht geladen werden.'
            ,ad_insights: 'EINBLICKE'
        }
    };

    let currentLang = localStorage.getItem('lang') || 'uk';

    function t(key) {
        return (I18N[currentLang] && I18N[currentLang][key]) || I18N.uk[key] || key;
    }

    function applyI18n() {
        document.documentElement.lang = currentLang;
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });
        updateLanguageUI();
    }

    function buildLangSwitch() {
        const options = Object.keys(LANGS).map((code) => {
            const item = LANGS[code];
            const active = code === currentLang ? 'active' : '';
            return `
                <button class="lang-option ${active}" onclick="setLanguage('${code}'); closeLangMenu();">
                    <span>${item.flag}</span>
                    <span>${item.label}</span>
                    <span class="lang-check">✓</span>
                </button>
            `;
        }).join('');
        return `
            <div class="lang-switch">
                <button class="lang-btn" onclick="toggleLangMenu(event)" aria-label="Language">
                    <span class="lang-flag" id="langFlag">${LANGS[currentLang]?.flag || '🌐'}</span>
                </button>
                <div class="lang-dropdown" id="langMenu">
                    ${options}
                </div>
            </div>
        `;
    }

    function updateLanguageUI() {
        const flag = document.getElementById('langFlag');
        if (flag) flag.textContent = LANGS[currentLang]?.flag || '🌐';
        document.querySelectorAll('.lang-option').forEach((btn) => {
            const code = (btn.getAttribute('onclick') || '').match(/setLanguage\('(\w+)'\)/);
            const active = code && code[1] === currentLang;
            btn.classList.toggle('active', !!active);
        });
    }

    function toggleLangMenu(event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById('langMenu');
        if (!menu) return;
        menu.classList.toggle('active');
    }

    function closeLangMenu() {
        const menu = document.getElementById('langMenu');
        if (!menu) return;
        menu.classList.remove('active');
    }

    function setLanguage(lang) {
        if (!LANGS[lang]) return;
        currentLang = lang;
        localStorage.setItem('lang', lang);
        applyI18n();
        const authId = getAuthSteamId();
        if (authId) {
            hydrateSteamUser();
        } else {
            renderNavAuth({ loggedIn: false });
        }
        loadTopPlayers(true);
        loadRecentMatches();
        if (document.getElementById('view-profile')?.classList.contains('active')) {
            loadProfile();
        }
    }

    function initReveal() {
        refreshReveal();
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        }
    }

    function refreshReveal() {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    }

    function looksLikeSteamProfile(input) {
        const val = (input || '').toLowerCase();
        return val.includes('steamcommunity.com') || val.includes('/id/') || val.includes('/profiles/');
    }

    function isLikelySteam64(input) {
        return /^\d{16,20}$/.test(input || '');
    }

    async function resolveSteamInput(raw) {
        const value = (raw || '').trim();
        if (!value) return { steamId: null, attempted: false };
        if (isLikelySteam64(value)) return { steamId: value, attempted: true };
        if (!looksLikeSteamProfile(value)) return { steamId: null, attempted: false };
        try {
            const res = await fetch(`/api/resolve-steam?q=${encodeURIComponent(value)}`);
            if (!res.ok) return { steamId: null, attempted: true };
            const data = await res.json();
            return { steamId: data && data.steam_id ? data.steam_id : null, attempted: true };
        } catch (e) {
            return { steamId: null, attempted: true };
        }
    }

    async function openProfileFromSearch(steamId) {
        if (!steamId) return;
        setViewSteamId(steamId);
        showView('profile');
        await loadProfile();
    }

    async function analyze() {
        const input = document.getElementById('mId').value.trim();
        if (!input) return;
        const btn = document.querySelector('.analyze-btn');
        if (btn) {
            btn.classList.add('pulsing');
            btn.disabled = true;
        }
        const resolved = await resolveSteamInput(input);
        if (resolved.steamId) {
            if (btn) btn.textContent = t('opening_profile');
            await openProfileFromSearch(resolved.steamId);
            if (btn) {
                btn.classList.remove('pulsing');
                btn.disabled = false;
                btn.textContent = t('analyze');
            }
            return;
        }
        if (resolved.attempted) {
            if (btn) {
                btn.classList.remove('pulsing');
                btn.disabled = false;
                btn.textContent = t('analyze');
            }
            return alert(t('resolve_failed'));
        }

        showView('analyzer');
        if (btn) btn.textContent = t('analyzing');
        await ensureConstants();
        const container = document.getElementById('analyzerContainer');
        if (container) {
            container.classList.remove('single');
            container.classList.add('analyzer-active');
        }
        const id = input;
        const matchTarget = document.getElementById('matchTableContent');
        if (matchTarget) {
            matchTarget.innerHTML = '<div class="card loading-card"><div class="loading-line"></div><div class="loading-line short"></div><div class="loading-line"></div></div>';
        }
        const res = await fetch(`/api/match/${id}`);
        const data = await res.json();
        if (data.error) {
            if (btn) {
                btn.classList.remove('pulsing');
                btn.disabled = false;
                btn.textContent = t('analyze');
            }
            return alert(t('match_not_found'));
        }

        const topDamageHeroes = [...data.players]
            .filter((p) => Number.isFinite(p.hero_damage))
            .sort((a, b) => b.hero_damage - a.hero_damage)
            .slice(0, 6)
            .map((p) => {
                const hInfo = HERO_DATA[p.hero_id];
                return hInfo && hInfo.name ? hInfo.name.replace('npc_dota_hero_', '') : null;
            })
            .filter(Boolean);
        document.documentElement.style.setProperty('--hero-glow', buildHeroGlow(topDamageHeroes));

        document.getElementById('adviceBox').style.display = 'block';
        document.getElementById('adviceContent').innerHTML = data.analysis.map(t => `Р Р†Р вЂљРЎС› ${t}`).join('<br>');

        document.getElementById('leadersCard').style.display = 'block';
        document.getElementById('leadersContent').innerHTML = buildLeaders(data.players);
        switchLeadersTab('leaders-dmg');

        let html = `<h3>${data.radiant_win ? t('victory_radiant') : t('victory_dire')} (${data.score.radiant}:${data.score.dire})</h3>`;
        html += renderTeam(
            data.players.filter(p => p.is_radiant),
            `${t('radiant_team')} РІР‚Сћ ${data.score.radiant} ${t('kills_label')}`,
            'radiant'
        );
        html += renderTeam(
            data.players.filter(p => !p.is_radiant),
            `${t('dire_team')} РІР‚Сћ ${data.score.dire} ${t('kills_label')}`,
            'dire'
        );
        document.getElementById('matchTableContent').innerHTML = html;
        if (btn) {
            btn.classList.remove('pulsing');
            btn.disabled = false;
            btn.textContent = t('analyze');
        }
    }

    function buildHeroGlow(heroNames) {
        if (!heroNames.length) return 'none';
        const picks = heroNames.slice(0, 6);
        const stops = picks.map((name, idx) => {
            const x = 15 + idx * 12;
            const y = 18 + (idx % 2) * 18;
            const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${name}.png`;
            return `radial-gradient(120px 80px at ${x}% ${y}%, rgba(255,255,255,0.08), transparent 70%), url(${url}) ${x}% ${y}% / 140px 80px no-repeat`;
        });
        return stops.join(', ');
    }

    function showView(viewId) {
        document.querySelectorAll('.view').forEach((el) => el.classList.remove('active'));
        const view = document.getElementById(`view-${viewId}`);
        if (view) view.classList.add('active');
        if (viewId === 'analyzer') {
            const container = document.getElementById('analyzerContainer');
            if (container && !container.classList.contains('analyzer-active')) {
                container.classList.add('single');
            }
        }
    }

    const AUTH_STEAM_KEY = 'steam_id_auth';
    const VIEW_STEAM_KEY = 'steam_id_view';

    function getSteamIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('steam_id');
    }

    function getAuthSteamIdFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('auth_steam_id');
    }

    function getAuthSteamId() {
        return localStorage.getItem(AUTH_STEAM_KEY);
    }

    function getSteamId() {
        return getSteamIdFromQuery() || localStorage.getItem(VIEW_STEAM_KEY) || getAuthSteamId();
    }

    function initAuthFromQuery() {
        const authId = getAuthSteamIdFromQuery();
        if (!authId) return;
        localStorage.setItem(AUTH_STEAM_KEY, authId);
        const url = new URL(window.location.href);
        url.searchParams.delete('auth_steam_id');
        history.replaceState({}, '', url.pathname + url.search);
    }

    function migrateLegacySteamId() {
        const legacy = localStorage.getItem('steam_id');
        if (!legacy) return;
        if (!localStorage.getItem(VIEW_STEAM_KEY)) {
            localStorage.setItem(VIEW_STEAM_KEY, legacy);
        }
        localStorage.removeItem('steam_id');
    }

    function setViewSteamId(steamId) {
        if (!steamId) return;
        localStorage.setItem(VIEW_STEAM_KEY, steamId);
        const url = new URL(window.location.href);
        url.searchParams.set('steam_id', steamId);
        history.replaceState({}, '', url.pathname + url.search);
    }

    async function hydrateSteamUser() {
        const steamId = getAuthSteamId();
        if (!steamId) {
            setNavLoggedOut();
            return;
        }
        try {
            let res = await fetch(`/auth/steam/profile/${steamId}`);
            let data = null;
            if (res.ok) {
                data = await res.json();
            } else {
                const steam64 = Number(steamId);
                const accountId = Number.isFinite(steam64) ? (steam64 - 76561197960265728) : null;
                const targetId = accountId && accountId > 0 ? accountId : steamId;
                res = await fetch(`https://api.opendota.com/api/players/${targetId}`);
                if (res.ok) {
                    const raw = await res.json();
                    data = raw && raw.profile ? {
                        personaname: raw.profile.personaname,
                        avatarfull: raw.profile.avatarfull,
                        avatar: raw.profile.avatarmedium || raw.profile.avatar
                    } : null;
                }
            }
            if (!data) return;
            const name = data.personaname || t('steam_user');
            const avatar = data.avatarfull || data.avatar || '';
            renderNavAuth({
                loggedIn: true,
                name,
                avatar
            });
            loadRecentMatches();
        } catch (e) {
            // ignore
        }
    }

    function setNavLoggedOut() {
        renderNavAuth({ loggedIn: false });
    }

    function renderNavAuth({ loggedIn, name, avatar } = {}) {
        const nav = document.getElementById('navAuth');
        if (!nav) return;
        if (loggedIn === undefined) {
            loggedIn = !!getAuthSteamId();
        }
        if (loggedIn) {
            nav.innerHTML = `
                ${buildLangSwitch()}
                <button class="nav-btn" onclick="openProfile()">${t('nav_profile')}</button>
                <div class="nav-user">
                    <div class="player-meta" style="gap:6px;">
                        ${avatar ? `<img class="player-avatar" src="${avatar}" alt="">` : `<div class="player-avatar placeholder"></div>`}
                        <span class="player-name" style="max-width:180px;">${name || t('steam_user')}</span>
                    </div>
                    <button class="gear-btn" onclick="toggleUserMenu(event)" aria-label="Account settings">
                        <svg class="gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="3.2"></circle>
                            <path d="M19.4 15a7.8 7.8 0 0 0 .2-1 7.8 7.8 0 0 0-.2-1l2-1.2-2-3.5-2.3.8a7.8 7.8 0 0 0-1.7-1l-.3-2.4H10l-.3 2.4a7.8 7.8 0 0 0-1.7 1l-2.3-.8-2 3.5 2 1.2a7.8 7.8 0 0 0-.2 1 7.8 7.8 0 0 0 .2 1l-2 1.2 2 3.5 2.3-.8a7.8 7.8 0 0 0 1.7 1l.3 2.4h4.1l.3-2.4a7.8 7.8 0 0 0 1.7-1l2.3.8 2-3.5-2-1.2z"></path>
                        </svg>
                    </button>
                    <div class="nav-dropdown" id="userMenu">
                        <button class="nav-dropdown-btn" onclick="logout()">${t('logout')}</button>
                    </div>
                </div>
            `;
        } else {
            nav.innerHTML = `
                ${buildLangSwitch()}
                <button class="nav-btn" onclick="openProfile()">${t('nav_profile')}</button>
                <button class="nav-btn primary" onclick="openLogin()">${t('nav_login')}</button>
            `;
        }
        updateLanguageUI();
    }

    function toggleUserMenu(event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById('userMenu');
        if (!menu) return;
        menu.classList.toggle('active');
    }

    function closeUserMenu() {
        const menu = document.getElementById('userMenu');
        if (!menu) return;
        menu.classList.remove('active');
    }

    function logout() {
        localStorage.removeItem(AUTH_STEAM_KEY);
        localStorage.removeItem(VIEW_STEAM_KEY);
        localStorage.removeItem('steam_id');
        const url = new URL(window.location.href);
        url.searchParams.delete('steam_id');
        url.searchParams.delete('auth_steam_id');
        history.replaceState({}, '', url.pathname + url.search);
        closeUserMenu();
        setNavLoggedOut();
        showView('login');
    }

    function goHome() {
        const steamId = getSteamId();
        const tail = steamId ? `?steam_id=${steamId}` : '';
        window.location.href = `/${tail}`;
    }

    async function openTopWinrate() {
        showView('winrate');
        await loadWinrate();
    }

    async function openNews() {
        showView('news');
        await loadNews();
    }

    async function openTournaments() {
        showView('tournaments');
        await loadTournaments();
    }

    function openLogin() {
        showView('login');
    }

    function openProfile() {
        const authId = getAuthSteamId();
        if (authId) {
            setViewSteamId(authId);
        }
        const steamId = getSteamId();
        if (!steamId) {
            showView('login');
            return;
        }
        showView('profile');
        loadProfile();
    }

    function startSteamLogin() {
        const returnTo = `${window.location.origin}/auth/steam/return`;
        const realm = window.location.origin;
        const openIdUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnTo)}&openid.realm=${encodeURIComponent(realm)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
        window.location.href = openIdUrl;
    }

    async function loadWinrate() {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid || roleGrid.dataset.loaded) return;
        roleGrid.innerHTML = `<div class="muted">${t('loading_heroes')}</div>`;
        try {
            await ensureConstants();
            const [metaRes, patchRes] = await Promise.all([
                fetch('/api/meta/heroes?days=8'),
                fetch('https://api.opendota.com/api/constants/patch')
            ]);
            let heroStats = [];
            if (metaRes.ok) {
                const metaData = await metaRes.json();
                const rows = (metaData && metaData.rows) ? metaData.rows : [];
                heroStats = rows.map((r) => {
                    const heroConst = HERO_DATA_BY_ID[r.hero_id];
                    return {
                        id: r.hero_id,
                        pro_pick: r.matches || 0,
                        pro_win: r.wins || 0,
                        name: heroConst ? heroConst.name : "npc_dota_hero_unknown",
                        localized_name: heroConst ? heroConst.localized_name : "Unknown",
                        roles: heroConst ? heroConst.roles : [],
                        primary_attr: heroConst ? heroConst.primary_attr : "all",
                        attack_type: heroConst ? heroConst.attack_type : "Unknown"
                    };
                });
            }
            if (!heroStats.length) {
                const fallbackRes = await fetch('https://api.opendota.com/api/heroStats');
                const fallback = await fallbackRes.json();
                heroStats = fallback || [];
            }
            let patchLabel = 'Unknown';
            if (patchRes.ok) {
                const patchData = await patchRes.json();
                patchLabel = getLatestPatchName(patchData) || patchLabel;
            }
            const patchInfo = document.getElementById('patchInfo');
            if (patchInfo) patchInfo.textContent = `${t('patch_label')} ${patchLabel}`;

            window.__HERO_STATS__ = heroStats;
            renderRoleColumns(heroStats);
            renderMetaTop5(heroStats);
            roleGrid.dataset.loaded = '1';
        } catch (e) {
            roleGrid.innerHTML = `<div class="muted">${t('failed_load_heroes')}</div>`;
        }
    }

    function getRoleTop(stats, role) {
        const roleScore = (h) => {
            const roles = h.roles || [];
            const isSupport = roles.includes("Support");
            const isCarry = roles.includes("Carry");
            const isNuker = roles.includes("Nuker");
            const isDurable = roles.includes("Durable");
            const isInitiator = roles.includes("Initiator");
            const isDisabler = roles.includes("Disabler");
            const isJungler = roles.includes("Jungler");
            const isEscape = roles.includes("Escape");
            const isPusher = roles.includes("Pusher");

            if (role === "Carry") {
                return (isCarry ? 2 : 0) + (isNuker ? 1 : 0) + (isSupport ? -2 : 0) + (isJungler ? -1 : 0);
            }
            if (role === "Mid") {
                return (isNuker ? 2 : 0) + (isCarry ? 1 : 0) + (isSupport ? -2 : 0) + (isJungler ? -1 : 0);
            }
            if (role === "Offlane") {
                return (isDurable ? 2 : 0) + (isInitiator ? 2 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -2 : 0);
            }
            if (role === "Support") {
                return (isSupport ? 2 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -2 : 0);
            }
            if (role === "Hard Support") {
                return (isSupport ? 2 : 0) + (isDisabler ? 2 : 0) + (isCarry ? -2 : 0);
            }
            return 0;
        };

        const pickTop = (minMatches, minScore) => stats
            .filter((h) => h.pro_pick >= minMatches)
            .filter((h) => {
                const wr = h.pro_pick ? (h.pro_win / h.pro_pick) * 100 : 0;
                return wr >= 50;
            })
            .map((h) => ({ ...h, __score: roleScore(h) }))
            .filter((h) => h.__score >= minScore)
            .sort((a, b) => {
                const wrA = a.pro_win / a.pro_pick;
                const wrB = b.pro_win / b.pro_pick;
                if (wrB !== wrA) return wrB - wrA;
                if (b.__score !== a.__score) return b.__score - a.__score;
                return b.pro_pick - a.pro_pick;
            })
            .slice(0, 5);

        let list = pickTop(100, 2);
        if (list.length < 5) list = pickTop(100, 1);
        if (list.length < 5) list = pickTop(50, 1);
        if (list.length < 5) list = pickTop(30, 1);
        if (list.length < 5) list = pickTop(30, 0);
        return list.map(({ __score, ...rest }) => rest);
    }

    function renderRoleColumns(stats) {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid) return;
        const roles = ["Carry", "Mid", "Offlane", "Support", "Hard Support"];
        const html = roles.map((role) => {
            const list = getRoleTop(stats, role);
            const rows = list.map((h) => {
                const wr = h.pro_pick ? ((h.pro_win / h.pro_pick) * 100).toFixed(1) : "0.0";
                return `
                    <div class="role-hero">
                        <div class="role-hero-left">
                            <img class="leader-hero" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${h.name.replace('npc_dota_hero_', '')}.png" alt="">
                            <div>
                                <div class="role-hero-name">${h.localized_name}</div>
                                <div class="role-hero-meta">${h.pro_pick} РјР°С‚С‡С–РІ</div>
                            </div>
                        </div>
                        <div class="role-hero-wr">${wr}%</div>
                    </div>
                `;
            }).join('') || `<div class="muted">${t('no_data_label')}</div>`;
            return `
                <div class="role-card">
                    <div class="role-title">${role}</div>
                    <div class="role-list">${rows}</div>
                </div>
            `;
        }).join('');
        roleGrid.innerHTML = html;
    }

    function renderMetaTop5(stats) {
        const minMatches = 100;
        const minWinrate = 50;
        const meta = (stats || [])
            .filter((h) => h.pro_pick >= minMatches)
            .filter((h) => ((h.pro_win / h.pro_pick) * 100) >= minWinrate)
            .sort((a, b) => b.pro_pick - a.pro_pick)
            .slice(0, 5);
        const target = document.getElementById('metaTop5');
        if (!target) return;
        target.innerHTML = meta.map((hero) => renderHeroCard(hero, 'meta')).join('') || '<div class="muted">No meta data.</div>';
    }

    function renderHeroCard(hero, contextId) {
        const ctx = contextId || 'default';
        const winrate = hero.pro_pick ? ((hero.pro_win / hero.pro_pick) * 100).toFixed(1) : '0.0';
        const roles = (hero.roles || []).slice(0, 3).map((r) => `<span class="pill">${r}</span>`).join('');
        const heroConst = HERO_DATA_BY_ID[hero.id] || HERO_DATA[hero.name];
        const talents = heroConst && heroConst.talents
            ? heroConst.talents.slice(0, 4).map((t) => `<span class="pill">${t.name || t}</span>`).join('')
            : '';
        return `
            <div class="hero-card" data-hero-id="${hero.id}" data-context="${ctx}">
                <div class="hero-card-header">
                    <div class="hero-card-left">
                        <img class="hero-portrait" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name.replace('npc_dota_hero_', '')}.png" alt="">
                        <div>
                            <div class="hero-name">${hero.localized_name}</div>
                            <div class="hero-roles">${hero.primary_attr.toUpperCase()} вЂў ${hero.attack_type}</div>
                        </div>
                    </div>
                    <div class="hero-winrate">${winrate}%</div>
                </div>
                <div class="pill-row">${roles || `<span class="pill">${t('no_roles')}</span>`}</div>
                <button class="hero-expand" onclick="toggleHeroExtra(${hero.id}, '${ctx}')">${t('meta_build')}</button>
                <div class="hero-extra" id="hero-extra-${ctx}-${hero.id}">
                    <div class="muted" style="margin-bottom:6px">${t('popular_items')}</div>
                    <div class="item-row" id="hero-items-${ctx}-${hero.id}"><span class="muted">${t('loading')}</span></div>
                    <div class="muted" style="margin:8px 0 6px">${t('talents')}</div>
                    <div class="pill-row">${talents || `<span class="pill">${t('no_talent_data')}</span>`}</div>
                </div>
            </div>
        `;
    }

    async function toggleHeroExtra(heroId, contextId) {
        const ctx = contextId || 'default';
        const extra = document.getElementById(`hero-extra-${ctx}-${heroId}`);
        if (!extra) return;
        extra.classList.toggle('active');
        if (extra.dataset.loaded) return;
        try {
            await ensureConstants();
            const res = await fetch(`https://api.opendota.com/api/heroes/${heroId}/itemPopularity`);
            if (!res.ok) throw new Error('itemPopularity failed');
            const data = await res.json();

            let top = [];
            if (Array.isArray(data)) {
                top = data
                    .filter((i) => i && i.item)
                    .sort((a, b) => (b.count || 0) - (a.count || 0))
                    .slice(0, 6)
                    .map((i) => i.item);
            } else if (data && typeof data === 'object') {
                const late = data.late_game_items || {};
                top = Object.keys(late)
                    .sort((a, b) => (late[b] || 0) - (late[a] || 0))
                    .slice(0, 6);
            }

            const imgHtml = top.map((key) => {
                const item = ITEM_DATA[key] || ITEM_DATA_BY_ID[Number(key)];
                if (!item) return '';
                const imgPath = item.img;
                return `<img class="item-img" src="https://cdn.cloudflare.steamstatic.com${imgPath}" title="${item.dname}">`;
            }).join('');
            const target = document.getElementById(`hero-items-${ctx}-${heroId}`);
            if (target) target.innerHTML = imgHtml || `<span class="muted">${t('no_item_data')}</span>`;
            extra.dataset.loaded = '1';
        } catch (e) {
            const target = document.getElementById(`hero-items-${ctx}-${heroId}`);
            if (target) target.innerHTML = `<span class="muted">${t('failed_load_items')}</span>`;
        }
    }

    function getLatestPatchName(patchData) {
        if (!patchData) return '';
        if (Array.isArray(patchData) && patchData.length) {
            const last = patchData[patchData.length - 1];
            return last.name || last;
        }
        if (typeof patchData === 'object') {
            const keys = Object.keys(patchData);
            if (!keys.length) return '';
            const latestKey = keys.sort((a, b) => Number(a) - Number(b))[keys.length - 1];
            return patchData[latestKey];
        }
        return '';
    }

    async function loadNews() {
        const list = document.getElementById('newsList');
        if (!list || list.dataset.loaded) return;
        list.innerHTML = `<div class="muted">${t('loading_news')}</div>`;
        try {
            const res = await fetch('/api/news?count=8&maxlength=500');
            const data = await res.json();
            let items = (data.appnews && data.appnews.newsitems) ? data.appnews.newsitems : [];
            const allowLabels = [
                'dota 2 update',
                'patch notes',
                'gameplay update',
                'client update',
                'community announcements',
                'tournament',
                'tournaments',
                'esports',
                'ti',
                'the international',
                'compendium',
                'battle pass',
                'treasure',
                'case',
                'event'
            ];
            items = items.filter((n) => {
                const label = (n.feedlabel || '').toString().toLowerCase();
                const title = (n.title || '').toString().toLowerCase();
                const tagStr = Array.isArray(n.tags) ? n.tags.join(' ').toLowerCase() : (n.tags || '').toString().toLowerCase();
                return allowLabels.some((kw) =>
                    label.includes(kw) || title.includes(kw) || tagStr.includes(kw)
                );
            });
            const stripSteamTags = (input) => {
                if (!input) return '';
                return input
                    .replace(/\{STEAM_CLAN_IMAGE\}\/\S+/gi, ' ')
                    .replace(/\{STEAM_CLAN_IMAGE\}/gi, ' ')
                    .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, ' ')
                    .replace(/\[url=.*?\]([\s\S]*?)\[\/url\]/gi, '$1')
                    .replace(/\[\/?b\]/gi, '')
                    .replace(/\[\/?i\]/gi, '')
                    .replace(/\[\/?u\]/gi, '')
                    .replace(/\[\/?h\d\]/gi, '')
                    .replace(/\[\/?quote\]/gi, '')
                    .replace(/\[\/?list\]/gi, '')
                    .replace(/\[\*\]/g, ' ')
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            };
            const DEFAULT_NEWS_IMAGE = 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_hero.jpg';
            const extractImage = (raw, clanId) => {
                if (!raw) return '';
                const clan = clanId || '';
                let normalized = raw.replace(
                    /\{STEAM_CLAN_IMAGE\}\//g,
                    'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/'
                );
                normalized = normalized.replace(
                    /\{STEAM_CLAN_IMAGE\}/g,
                    clan ? `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/${clan}` : ''
                );
                normalized = normalized.replace(/(^|\s)\/\/+/g, ' https://');
                const htmlMatch = normalized.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (htmlMatch) return htmlMatch[1];
                const bbMatch = normalized.match(/\[img\]([\s\S]*?)\[\/img\]/i);
                if (bbMatch) return bbMatch[1].trim();
                const urlMatch = normalized.match(/https?:\/\/[^\s"'\\\]]+\.(?:jpg|jpeg|png|gif|webp)(\?[^\s"'\\\]]*)?/i);
                if (urlMatch) return urlMatch[0];
                return '';
            };
            list.innerHTML = items.map((n, idx) => {
                const date = new Date(n.date * 1000).toLocaleDateString();
                const raw = (n.contents || '').replace(/\r?\n/g, ' ');
                let imageUrl = extractImage(raw, n.clanid || n.clan_id || n.clanid);
                if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
                if (!imageUrl) imageUrl = DEFAULT_NEWS_IMAGE;
                const text = stripSteamTags(raw);
                const tag = n.feedlabel
                    || (Array.isArray(n.tags) && n.tags.length ? n.tags[0] : '')
                    || (typeof n.tags === 'string' ? n.tags.split(',')[0] : '');
                const fullText = text;
                const preview = fullText.slice(0, 240);
                const gid = n.gid || n.id || n.newsitem_id || '';
                return `
                    <div class="news-item">
                        ${imageUrl
                            ? `<div class="news-media"><img src="${imageUrl}" alt=""></div>`
                            : `<div class="news-media placeholder"><span>DOTA 2</span></div>`
                        }
                        <div class="news-content">
                            <div class="news-title-row">
                                <div class="news-title">${n.title}</div>
                                ${tag ? `<span class="news-tag">${tag}</span>` : ''}
                            </div>
                            <div class="news-meta">${date} вЂў ${n.author || 'Valve'}</div>
                            <div class="news-body">
                                <span class="news-preview">${preview}${fullText.length > 240 ? '...' : ''}</span>
                                ${fullText.length > 240 ? `<span class="news-full">${fullText}</span>` : ''}
                            </div>
                            ${gid ? `<a class="news-readmore" data-news-gid="${gid}" href="/news?gid=${encodeURIComponent(gid)}">Read more</a>` : ''}
                        </div>
                    </div>
                `;
            }).join('') || '<div class="muted">No news found.</div>';
            list.dataset.loaded = '1';
            const storeNewsItem = (target) => {
                const link = target.closest('[data-news-gid]');
                if (!link) return;
                const gid = link.getAttribute('data-news-gid');
                if (!gid) return;
                const item = items.find((n) => String(n.gid || n.id || n.newsitem_id || '') === String(gid));
                if (!item) return;
                try {
                    const payload = JSON.stringify(item);
                    sessionStorage.setItem(`news_item_${gid}`, payload);
                    localStorage.setItem(`news_item_${gid}`, payload);
                } catch (err) {
                    // ignore
                }
            };
            list.addEventListener('pointerdown', (e) => storeNewsItem(e.target));
            list.addEventListener('click', (e) => storeNewsItem(e.target));
        } catch (e) {
        list.innerHTML = `<div class="muted">${t('failed_load_news')}</div>`;
        }
    }

    async function loadTournaments() {
        const list = document.getElementById('tournamentList');
        if (!list || list.dataset.loaded) return;
        list.innerHTML = `<div class="muted">${t('loading_tournaments')}</div>`;
        try {
            const res = await fetch('https://api.opendota.com/api/proMatches');
            const data = await res.json();
            const recent = (data || []).slice(0, 30);
            const grouped = {};
            recent.forEach((m) => {
                if (!m.leagueid) return;
                if (!grouped[m.leagueid]) grouped[m.leagueid] = { name: m.league_name, last: m.start_time, count: 0 };
                grouped[m.leagueid].count += 1;
                grouped[m.leagueid].last = Math.max(grouped[m.leagueid].last, m.start_time);
            });
            const rows = Object.values(grouped)
                .sort((a, b) => b.last - a.last)
                .slice(0, 10);
            list.innerHTML = rows.map((t) => {
                const date = new Date(t.last * 1000).toLocaleDateString();
                return `
                    <div class="tournament-item">
                        <div class="news-title">${t.name}</div>
                        <div class="news-meta">${t('recent_matches_label')}: ${t.count} вЂў ${t('last_match_label')}: ${date}</div>
                    </div>
                `;
            }).join('') || `<div class="muted">${t('no_tournaments')}</div>`;
            list.dataset.loaded = '1';
        } catch (e) {
            list.innerHTML = `<div class="muted">${t('failed_load_tournaments')}</div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('js');
        migrateLegacySteamId();
        initAuthFromQuery();
        applyI18n();
        hydrateSteamUser();
        loadTopPlayers();
        loadRecentMatches();
        initReveal();
        document.addEventListener('click', () => {
            closeUserMenu();
            closeLangMenu();
        });
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view) {
            showView(view);
            if (view === 'winrate') loadWinrate();
            if (view === 'news') loadNews();
            if (view === 'tournaments') loadTournaments();
            if (view === 'login') openLogin();
            if (view === 'profile') openProfile();
        }
    });

    async function loadTopPlayers(force = false) {
        const list = document.getElementById('topPlayersList');
        if (!list) return;
        if (force) delete list.dataset.loaded;
        if (list.dataset.loaded) return;
        list.innerHTML = `<div class="muted">${t('loading_top_players')}</div>`;
        try {
            let data = [];
            const res = await fetch('/api/top-players?limit=10&region=europe&debug=1');
            if (res.ok) data = await res.json();
            if (data && data.error) {
                list.innerHTML = `
                    <div class="muted">${t('no_data')} <a href="#" onclick="loadTopPlayers(true); return false;">${t('retry')}</a></div>
                    <div class="muted" style="margin-top:6px; font-size:11px;">${JSON.stringify(data.debug || {})}</div>
                `;
                return;
            }
            const rows = (Array.isArray(data) ? data : []).slice(0, 10);
            list.innerHTML = rows.map((p, idx) => {
                const name = p.personaname || `Player ${idx + 1}`;
                const mmr = p.score || (p.mmr_estimate && p.mmr_estimate.estimate) || null;
                const rank = p.leaderboard_rank ? `#${p.leaderboard_rank}` : '';
                const display = mmr ? `${Math.round(mmr)} MMR` : (rank || 'Pro');
                const badge = p.badge || (rank ? 'Pro' : 'Pro');
                return `
                    <div class="home-item reveal visible">
                        <div class="home-name">${name} <span class="pill" style="margin-left:6px;">${badge}</span></div>
                        <div class="home-value">${display}</div>
                    </div>
                `;
            }).join('') || `<div class="muted">${t('no_data')} <a href="#" onclick="loadTopPlayers(true); return false;">${t('retry')}</a></div>`;
            if (rows.length) {
                list.dataset.loaded = '1';
            } else {
                list.innerHTML = `<div class="muted">${t('no_data')} <a href="#" onclick="loadTopPlayers(true); return false;">${t('retry')}</a></div>`;
            }
            refreshReveal();
        } catch (e) {
            list.innerHTML = `<div class="muted">${t('failed_load_top_players')} <a href="#" onclick="loadTopPlayers(true); return false;">${t('retry')}</a></div>`;
        }
    }

    async function loadRecentMatches() {
        const list = document.getElementById('recentMatchesList');
        if (!list) return;
        const steamId = getAuthSteamId();
        if (!steamId) {
            list.innerHTML = `<div class="muted">${t('login_to_see')}</div>`;
            return;
        }
        list.innerHTML = `<div class="muted">${t('loading_matches')}</div>`;
        try {
            const res = await fetch(`/api/player/${steamId}`);
            const matches = await res.json();
            if (!Array.isArray(matches) || !matches.length) {
                list.innerHTML = `<div class="muted">${t('no_recent_matches')}</div>`;
                return;
            }
            list.innerHTML = matches.slice(0, 6).map((m) => {
                const heroConst = HERO_DATA_BY_ID[m.hero_id] || HERO_DATA[m.hero_id];
                const heroName = heroConst && heroConst.name ? heroConst.name.replace('npc_dota_hero_', '') : 'unknown';
                const kda = `${m.kills}/${m.deaths}/${m.assists}`;
                const statusClass = m.win ? 'win' : 'loss';
                return `
                    <div class=\"match-item ${statusClass} reveal visible\">
                        <img class=\"leader-hero\" src=\"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png\" alt=\"\">
                        <div>
                            <div class=\"home-name\">${heroConst ? heroConst.localized_name : 'Unknown'}</div>
                            <div class=\"match-meta\">${t('id_label')}: <a href=\"#\" onclick=\"goToMatch(${m.match_id}); return false;\">${m.match_id}</a> вЂў ${Math.round(m.duration / 60)} ${t('min_label')} вЂў ${m.win ? t('win_label') : t('loss_label')}</div>
                        </div>
                        <div class=\"match-kda\">${kda}</div>
                    </div>
                `;
            }).join('');
            refreshReveal();
        } catch (e) {
            list.innerHTML = `<div class="muted">${t('failed_load_matches')}</div>`;
        }
    }


    async function loadProfile() {
        const steamId = getSteamId();
        if (!steamId) return;
        await ensureConstants();
        const avatarEl = document.getElementById('profileAvatar');
        const nameEl = document.getElementById('profileName');
        const idEl = document.getElementById('profileId');
        const statsEl = document.getElementById('profileStats');
        const heroesEl = document.getElementById('profileTopHeroes');
        const matchesEl = document.getElementById('profileRecentMatches');
        const activityEl = document.getElementById('activityGrid');
        const itemsEl = document.getElementById('profileTopItems');
        const trendEl = document.getElementById('profileTrend');
        if (nameEl) nameEl.textContent = t('profile_loading');
        try {
            const tzOffset = -new Date().getTimezoneOffset();
            const res = await fetch(`/api/profile/${steamId}?tz_offset=${tzOffset}&ts=${Date.now()}`);
            const data = await res.json();
            const profile = data.profile || {};
            if (avatarEl) avatarEl.src = profile.avatar || '';
            if (nameEl) nameEl.textContent = profile.personaname || t('steam_user');
            if (idEl) idEl.textContent = `${t('id_label')}: ${profile.steamid || profile.account_id || steamId}`;

            renderProfileStats(statsEl, data);
            renderProfileHeroes(heroesEl, data.top_heroes || []);
            renderProfileMatches(matchesEl, data.recent_matches || []);
            renderActivity(activityEl, data.activity || null);
            renderProfileItems(itemsEl, data.top_items || []);
            renderProfileTrend(trendEl, data.trend || []);
            refreshReveal();
        } catch (e) {
            if (nameEl) nameEl.textContent = t('steam_user');
        }
    }
    function renderProfileStats(el, data) {
        if (!el) return;
        const wl = data.wl || {};
        const total = (wl.win || 0) + (wl.lose || 0);
        const overall = total ? ((wl.win / total) * 100).toFixed(2) : '0.00';
        const sections = [];
        sections.push({
            title: t('report_title'),
            rows: [
                { label: t('stats_recorded'), games: total, winrate: overall },
            ]
        });
        const counts = data.counts || {};
        sections.push(buildCountSection(t('lobby_type'), counts.lobby_type || counts.lobbyType, lobbyTypeLabel));
        sections.push(buildCountSection(t('game_mode'), counts.game_mode || counts.gameMode, gameModeLabel));
        sections.push(buildCountSection(t('side'), counts.is_radiant || counts.isRadiant, sideLabel));
        sections.push(buildCountSection(t('region'), counts.region, regionLabel));
        el.innerHTML = sections.map((s) => {
            if (!s || !s.rows || !s.rows.length) return '';
            return `
                <div class="stat-section">
                    <div class="stat-title">${s.title}</div>
                    ${s.rows.map((r) => `
                        <div class="stat-row">
                            <div class="stat-label">${r.label}</div>
                            <div class="stat-bar"><span style="width:${r.winrate}%"></span></div>
                            <div class="stat-value">${r.games}</div>
                            <div class="stat-value">${r.winrate}%</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('') || `<div class="muted">${t('no_data_label')}</div>`;
    }

    function renderProfileHeroes(el, heroes) {
        if (!el) return;
        if (!heroes.length) {
            el.innerHTML = `<div class="muted">${t('no_data_label')}</div>`;
            return;
        }
        el.innerHTML = heroes.map((h) => {
            const heroConst = HERO_DATA_BY_ID[h.hero_id] || HERO_DATA[h.hero_id];
            const heroName = heroConst && heroConst.name ? heroConst.name.replace('npc_dota_hero_', '') : 'unknown';
            const title = heroConst ? heroConst.localized_name : 'Unknown';
            return `
                <div class="match-item reveal visible">
                    <img class="leader-hero" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png" alt="">
                    <div>
                        <div class="home-name">${title}</div>
                        <div class="match-meta">${t('games_label')}: ${h.games} • ${t('winrate_label')}: ${h.winrate}%</div>
                    </div>
                    <div class="match-kda">${h.win}W</div>
                </div>
            `;
        }).join('');
    }

    function renderProfileMatches(el, matches) {
        if (!el) return;
        if (!matches.length) {
            el.innerHTML = `<div class="muted">${t('no_data_label')}</div>`;
            return;
        }
        el.innerHTML = matches.slice(0, 8).map((m) => {
            const heroConst = HERO_DATA_BY_ID[m.hero_id] || HERO_DATA[m.hero_id];
            const heroName = heroConst && heroConst.name ? heroConst.name.replace('npc_dota_hero_', '') : 'unknown';
            const kda = `${m.kills}/${m.deaths}/${m.assists}`;
            let win = m.win === true ? true : (m.win === false ? false : null);
            if (win === null && (m.win === 1 || m.win === 0)) win = m.win === 1;
            if (win === null && m.player_slot != null && m.radiant_win != null) {
                const isRadiant = m.player_slot < 128;
                win = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
            }
            const statusClass = win === true ? 'win' : (win === false ? 'loss' : '');
            const matchId = m.match_id || m.matchId || '';
            return `
                <div class="match-item ${statusClass} reveal visible" ${matchId ? `onclick="goToMatch(${matchId})"` : ''} style="cursor:${matchId ? 'pointer' : 'default'}">
                    <img class="leader-hero" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png" alt="">
                    <div>
                        <div class="home-name">${heroConst ? heroConst.localized_name : 'Unknown'}</div>
                        <div class="match-meta">${matchId ? `${t('id_label')}: ${matchId} • ` : ''}${Math.round(m.duration / 60)} ${t('min_label')} • ${win === true ? t('win_label') : win === false ? t('loss_label') : t('na_label')}</div>
                    </div>
                    <div class="match-kda">${kda}</div>
                </div>
            `;
        }).join('');
    }
    function buildCountSection(title, obj, labelFn) {
        if (!obj || typeof obj !== 'object') return { title, rows: [] };
        const rows = Object.keys(obj).map((k) => {
            const item = obj[k] || {};
            const games = item.games || item.game || item.n || 0;
            const win = item.win || 0;
            const winrate = games ? ((win / games) * 100).toFixed(2) : '0.00';
            return { label: labelFn(k), games, winrate };
        }).sort((a, b) => b.games - a.games).slice(0, 6);
        return { title, rows };
    }

    function lobbyTypeLabel(k) {
        const map = { '0': t('lobby_normal'), '7': t('lobby_ranked'), '5': t('lobby_team') };
        return map[k] || `Lobby ${k}`;
    }
    function gameModeLabel(k) {
        const map = { '1': t('mode_all_pick'), '22': t('mode_all_draft'), '23': t('mode_turbo'), '2': t('mode_captains') };
        return map[k] || `Mode ${k}`;
    }
    function sideLabel(k) {
        return k === '1' ? t('side_radiant') : (k === '0' ? t('side_dire') : `Side ${k}`);
    }
    function regionLabel(k) {
        const map = { '1': t('region_us_east'), '2': t('region_us_west'), '3': t('region_eu_west'), '4': t('region_eu_east'), '5': t('region_russia'), '6': t('region_sea') };
        return map[k] || `Region ${k}`;
    }
    function renderProfileItems(el, items) {
        if (!el) return;
        if (!items.length) {
            el.innerHTML = `<div class="muted">${t('no_data_label')}</div>`;
            return;
        }
        el.innerHTML = items.map((it) => {
            const itemConst = ITEM_DATA_BY_ID[it.item_id];
            const name = itemConst ? itemConst.dname : `Item ${it.item_id}`;
            const img = itemConst && itemConst.img ? `https://cdn.cloudflare.steamstatic.com${itemConst.img}` : '';
            return `
                <div class="item-chip">
                    ${img ? `<img src="${img}" alt="">` : `<div class="item-placeholder"></div>`}
                    <div>
                        <div class="item-name">${name}</div>
                        <div class="item-meta">${it.count} games</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderProfileTrend(el, trend) {
        if (!el) return;
        if (!trend || !trend.length) {
            el.innerHTML = `<div class="muted">${t('no_data_label')}</div>`;
            return;
        }
        const width = 520;
        const height = 140;
        const min = Math.min(...trend);
        const max = Math.max(...trend);
        const range = (max - min) || 1;
        const points = trend.map((v, i) => {
            const x = (i / (trend.length - 1)) * (width - 20) + 10;
            const y = height - 10 - ((v - min) / range) * (height - 20);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        const pointList = points.map((p) => p.split(',').map(Number));
        const labels = pointList.map(([x, y], i) => {
            const v = trend[i] || 0;
            const sign = v >= 0 ? '+' : '';
            const labelY = Math.max(10, y - 10);
            return `<text class="trend-label" x="${x}" y="${labelY}" text-anchor="middle">${sign}${v}</text>`;
        }).join('');
        const dots = pointList.map(([x, y], i) => {
            const v = trend[i] || 0;
            const cls = v >= 0 ? 'trend-point up' : 'trend-point down';
            return `<circle class="${cls}" cx="${x}" cy="${y}" r="3.2"></circle>`;
        }).join('');
        const nodes = pointList.map(([x, y], i) => {
            const v = trend[i] || 0;
            const sign = v >= 0 ? '+' : '';
            const labelY = Math.max(10, y - 10);
            const cls = v >= 0 ? 'trend-point up' : 'trend-point down';
            return `
                <g class="trend-node">
                    <circle class="${cls}" cx="${x}" cy="${y}" r="3.2"></circle>
                    <text class="trend-label" x="${x}" y="${labelY}" text-anchor="middle">${sign}${v}</text>
                </g>
            `;
        }).join('');
        const polyline = pointList.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
        const last = trend[trend.length - 1] || 0;
        el.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="trend-svg">
                <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#ff4b4b"/>
                        <stop offset="50%" stop-color="#7fd3ff"/>
                        <stop offset="100%" stop-color="#52e566"/>
                    </linearGradient>
                </defs>
                <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" class="trend-mid" />
                <polyline points="${polyline}" class="trend-line" />
                ${nodes}
            </svg>
            <div class="trend-meta">${t('form_label')}: <span class="${last >= 0 ? 'trend-up' : 'trend-down'}">${last >= 0 ? '+' : ''}${last}</span></div>
        `;
    }

    function renderActivity(el, activity) {
        if (!el) return;
        const weeks = activity && activity.weeks ? activity.weeks : [];
        if (!weeks.length) {
            el.innerHTML = `<div class="muted">${t('activity_none')}</div>`;
            return;
        }
        const max = activity.max || 1;
        const dots = [];
        weeks.forEach((week) => {
            week.forEach((day) => {
                const level = day.count === 0 ? 0 : day.count / max;
                const cls = level > 0.75 ? 'lvl-4' : level > 0.5 ? 'lvl-3' : level > 0.25 ? 'lvl-2' : 'lvl-1';
                let wlClass = 'wl-even';
                if ((day.wins || 0) > (day.losses || 0)) wlClass = 'wl-win';
                if ((day.wins || 0) < (day.losses || 0)) wlClass = 'wl-loss';
                dots.push(
                    `<div class="activity-dot ${cls} ${wlClass}" data-date="${day.date}" data-wins="${day.wins || 0}" data-losses="${day.losses || 0}"></div>`
                );
            });
        });
        el.innerHTML = dots.join('');

        const card = el.closest('.card');
        if (!card) return;
        let tooltip = card.querySelector('.activity-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'activity-tooltip';
            card.appendChild(tooltip);
        }

        const showTip = (dot) => {
            const date = dot.dataset.date || '';
            const wins = Number(dot.dataset.wins || 0);
            const losses = Number(dot.dataset.losses || 0);
            tooltip.innerHTML = `
                <div class="activity-tip-date">${date}</div>
                <div class="activity-tip-row"><span class="win">${t('wins_label')}</span><span>${wins}</span></div>
                <div class="activity-tip-row"><span class="loss">${t('losses_label')}</span><span>${losses}</span></div>
            `;
            tooltip.style.opacity = '1';
        };

        const moveTip = (dot) => {
            const rect = card.getBoundingClientRect();
            const drect = dot.getBoundingClientRect();
            const x = drect.left - rect.left + drect.width / 2;
            const y = drect.top - rect.top - 8;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.style.transform = 'translate(-50%, -100%)';
        };

        el.querySelectorAll('.activity-dot').forEach((dot) => {
            dot.addEventListener('mouseenter', () => {
                showTip(dot);
                moveTip(dot);
            });
            dot.addEventListener('mousemove', () => moveTip(dot));
            dot.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }
function goToMatch(matchId) {
        const steamId = getSteamId();
        const tail = steamId ? `&steam_id=${steamId}` : '';
        window.location.href = `/match?match_id=${matchId}${tail}`;
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
                ${topDamage.map((p) => leaderRow(p, p.hero_damage, 'DMG')).join('') || `<div class="timeline-item">${t('no_data_label')}</div>`}
            </div>
            <div class="leader-list" data-content="leaders-sup" style="display:none">
                ${topSupports.map((p) => leaderRow(p, p.assists, 'AST')).join('') || `<div class="timeline-item">${t('no_data_label')}</div>`}
            </div>
            <div class="leader-list" data-content="leaders-heal" style="display:none">
                ${topHealing.map((p) => leaderRow(p, p.hero_healing, 'HEAL')).join('') || `<div class="timeline-item">${t('no_data_label')}</div>`}
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

    function toggleDetails(id) {
        const row = document.getElementById(`details-${id}`);
        if (!row) return;
        row.style.display = row.style.display === 'table-row' ? 'none' : 'table-row';
    }

    function switchTab(id, tab) {
        const panel = document.getElementById(`panel-${id}`);
        if (!panel) return;
        panel.querySelectorAll('[data-tab]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        panel.querySelectorAll('[data-content]').forEach((content) => {
            content.style.display = content.dataset.content === tab ? 'grid' : 'none';
        });
    }

    function renderTeam(players, label, cls) {
        let teamHtml = `<div class="card"><table class="match-table"><tr class="team-header ${cls}"><td colspan="4">${label}</td></tr>`;
        
        teamHtml += players.map((p, idx) => {
            const hInfo = HERO_DATA[p.hero_id] || { name: "unknown" };
            const hName = hInfo.name.replace('npc_dota_hero_', '');
            const rowId = `${cls}-${idx}`;
            
            const itemsHtml = p.items.map(id => {
                if(!id || id === 0 || !ITEM_DATA_BY_ID[id]) {
                    return `<div class="item-img" style="display:inline-block; opacity:0.1; background:#000;"></div>`;
                }
                
                // Р В РЎвЂєР РЋРІР‚С™Р РЋР вЂљР В РЎвЂР В РЎВР РЋРЎвЂњР РЋРІР‚СњР В РЎВР В РЎвЂў Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р вЂ Р РЋРЎвЂњ Р В Р’В°Р В РІвЂћвЂ“Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’В° Р В Р’В±Р В Р’ВµР В Р’В· Р В Р’В·Р В Р’В°Р В РІвЂћвЂ“Р В Р вЂ Р В РЎвЂР РЋРІР‚В¦ Р РЋРІвЂљВ¬Р В Р’В»Р РЋР РЏР РЋРІР‚В¦Р РЋРІР‚вЂњР В Р вЂ  (Р В Р вЂ¦Р В Р’В°Р В РЎвЂ”Р РЋР вЂљ. blink)
                const imgPath = ITEM_DATA_BY_ID[id].img; // /apps/dota2/images/items/blink_lg.png?
                return `<img class="item-img" src="https://cdn.cloudflare.steamstatic.com${imgPath}" title="${ITEM_DATA_BY_ID[id].dname}">`;
            }).join('');

            const playerName = p.personaname || 'Unknown';
            const avatarUrl = (p.avatarfull || p.avatar || '').trim();

            const neutralId = p.item_neutral;
            let neutralHtml = '';
            if (neutralId && ITEM_DATA_BY_ID[neutralId]) {
                const nImgPath = ITEM_DATA_BY_ID[neutralId].img;
                neutralHtml = `<img class="item-img neutral-img" src="https://cdn.cloudflare.steamstatic.com${nImgPath}" title="${ITEM_DATA_BY_ID[neutralId].dname}">`;
            }

            const avatarHtml = avatarUrl
                ? `<img class="player-avatar" src="${avatarUrl}" onerror="this.onerror=null;this.style.display='none';" alt="">`
                : `<div class="player-avatar placeholder"></div>`;

            return `<tr>
                <td style="width:240px">
                    <div class="player-meta">
                        ${avatarHtml}
                        <div>
                            <div class="player-name">${playerName}</div>
                            <div><img class="hero-img highlight" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hName}.png"> Lv.${p.level}</div>
                            <button class="stats-btn" onclick="toggleDetails('${rowId}')">${t('stats_btn')}</button>
                        </div>
                    </div>
                </td>
                <td style="width:100px; text-align:center;"><b>${p.kills}/${p.deaths}/${p.assists}</b></td>
                <td class="nw" style="width:80px">${(p.net_worth/1000).toFixed(1)}k</td>
                <td><div style="display:flex">${itemsHtml}${neutralHtml}</div></td>
            </tr>
            <tr class="details-row" id="details-${rowId}" style="display:none">
                <td colspan="4">
                    <div class="details-panel" id="panel-${rowId}">
                        <div class="tabs">
                            <button class="tab active" data-tab="eco" onclick="switchTab('${rowId}','eco')">${t('tab_eco')}</button>
                            <button class="tab" data-tab="dmg" onclick="switchTab('${rowId}','dmg')">${t('tab_dmg')}</button>
                            <button class="tab" data-tab="misc" onclick="switchTab('${rowId}','misc')">${t('tab_other')}</button>
                        </div>
                        <div class="stats-grid" data-content="eco" style="display:grid">
                            <div class="stat"><div class="stat-label">${t('gpm')}</div><div class="stat-value">${p.gpm ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('xpm')}</div><div class="stat-value">${p.xpm ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('net_worth')}</div><div class="stat-value">${p.net_worth ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('last_hits')}</div><div class="stat-value">${p.last_hits ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('denies')}</div><div class="stat-value">${p.denies ?? '-'}</div></div>
                        </div>
                        <div class="stats-grid" data-content="dmg" style="display:none">
                            <div class="stat"><div class="stat-label">${t('hero_damage')}</div><div class="stat-value">${p.hero_damage ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('tower_damage')}</div><div class="stat-value">${p.tower_damage ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('hero_healing')}</div><div class="stat-value">${p.hero_healing ?? '-'}</div></div>
                        </div>
                        <div class="stats-grid" data-content="misc" style="display:none">
                            <div class="stat"><div class="stat-label">${t('level')}</div><div class="stat-value">${p.level ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('kills')}</div><div class="stat-value">${p.kills ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('deaths')}</div><div class="stat-value">${p.deaths ?? '-'}</div></div>
                            <div class="stat"><div class="stat-label">${t('assists')}</div><div class="stat-value">${p.assists ?? '-'}</div></div>
                        </div>
                    </div>
                </td>
            </tr>`;
        }).join('');

        return teamHtml + `</table></div>`;
    }




























