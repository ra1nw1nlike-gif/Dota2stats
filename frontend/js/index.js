    let HERO_DATA = {}, ITEM_DATA = {}, ITEM_DATA_BY_ID = {};
    let TOURNAMENT_STATE = {
        rows: [],
        byId: new Map(),
        selectedLeagueId: null
    };
    let TEAM_DATA_BY_ID = {};
    const KNOWN_TOURNAMENT_RULES = [
        { match: /the international|ti\s?\d+/i, label: 'The International' },
        { match: /riyadh masters|esports world cup|ewc/i, label: 'Riyadh Masters / EWC' },
        { match: /dreamleague/i, label: 'DreamLeague' },
        { match: /esl one/i, label: 'ESL One' },
        { match: /blast slam|blast/i, label: 'BLAST Slam' },
        { match: /pgl wallachia|wallachia/i, label: 'PGL Wallachia' },
        { match: /betboom dacha|bb dacha/i, label: 'BetBoom Dacha' },
        { match: /fissure/i, label: 'FISSURE' },
        { match: /elite league|elite league/i, label: 'Elite League' },
        { match: /bali major|lima major|berlin major|major/i, label: 'Major' },
        { match: /dacha/i, label: 'Dacha' }
    ];
    const TOURNAMENT_METADATA_OVERRIDES = [
        { match: /the international 2024/i, prize: 2600000 },
        { match: /riyadh masters 2024|esports world cup 2024/i, prize: 5000000 },
        { match: /dreamleague season 26/i, prize: 1000000 },
        { match: /dreamleague season 25/i, prize: 1000000 },
        { match: /blast slam/i, prize: 1000000 },
        { match: /pgl wallachia/i, prize: 1000000 },
        { match: /betboom dacha/i, prize: 1000000 },
        { match: /esl one bangkok 2024/i, prize: 1000000 },
        { match: /esl one birmingham 2024/i, prize: 1000000 }
    ];
    const TOURNAMENT_CUTOFF_TS = new Date('2026-02-19T00:00:00Z').getTime();
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
            tournaments_title: 'Турніри',
            tournaments_subtitle: 'Найближчі турніри у вигляді таблиці',
            tournaments_col_icon: 'Іконка',
            tournaments_col_name: 'Назва',
            tournaments_col_prize: 'Призові',
            tournaments_col_date: 'Дата',
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
            ,tournament_prize_unknown: 'Призові не вказані'
            ,tournament_date_unknown: 'Дата невідома'
            ,tournament_matches_count: 'Матчів'
            ,tournament_details_title: 'Опис турніру'
            ,tournament_bracket_title: 'Сітка турніру'
            ,tournament_teams_title: 'Команди-учасники'
            ,tournament_close: 'Закрити'
            ,tournament_loading_details: 'Завантаження деталей турніру...'
            ,tournament_no_bracket: 'Недостатньо матчів для побудови сітки.'
            ,tournament_no_teams: 'Команди не знайдені.'
            ,tournament_generated_description: 'Турнір {name} зараз відображається на основі доступних професійних матчів. Тут зібрані дата, призовий фонд, список команд і актуальна сітка з останніх матчів ліги.'
            ,tournament_round_one: 'Перший раунд'
            ,tournament_round_two: 'Півфінали'
            ,tournament_round_three: 'Фінал'
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
            tournaments_title: 'Tournaments',
            tournaments_subtitle: 'Upcoming tournaments in table view',
            tournaments_col_icon: 'Icon',
            tournaments_col_name: 'Name',
            tournaments_col_prize: 'Prize Pool',
            tournaments_col_date: 'Date',
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
            ,tournament_prize_unknown: 'Prize pool not listed'
            ,tournament_date_unknown: 'Date unknown'
            ,tournament_matches_count: 'Matches'
            ,tournament_details_title: 'Tournament Overview'
            ,tournament_bracket_title: 'Tournament Bracket'
            ,tournament_teams_title: 'Participating Teams'
            ,tournament_close: 'Close'
            ,tournament_loading_details: 'Loading tournament details...'
            ,tournament_no_bracket: 'Not enough matches to build a bracket.'
            ,tournament_no_teams: 'No teams found.'
            ,tournament_generated_description: 'Tournament {name} is shown from available pro match data. This view combines date, prize pool, participants, and a bracket built from the latest league matches.'
            ,tournament_round_one: 'Round One'
            ,tournament_round_two: 'Semifinals'
            ,tournament_round_three: 'Grand Final'
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
            tournaments_title: 'Turniere',
            tournaments_subtitle: 'Kommende Turniere in Tabellenansicht',
            tournaments_col_icon: 'Icon',
            tournaments_col_name: 'Name',
            tournaments_col_prize: 'Preisgeld',
            tournaments_col_date: 'Datum',
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
            ,tournament_prize_unknown: 'Preisgeld nicht angegeben'
            ,tournament_date_unknown: 'Datum unbekannt'
            ,tournament_matches_count: 'Matches'
            ,tournament_details_title: 'Turnierbeschreibung'
            ,tournament_bracket_title: 'Turnierbaum'
            ,tournament_teams_title: 'Teilnehmende Teams'
            ,tournament_close: 'Schließen'
            ,tournament_loading_details: 'Turnierdetails werden geladen...'
            ,tournament_no_bracket: 'Nicht genug Matches für einen Turnierbaum.'
            ,tournament_no_teams: 'Keine Teams gefunden.'
            ,tournament_generated_description: 'Das Turnier {name} wird aus verfügbaren Pro-Match-Daten dargestellt. Diese Ansicht kombiniert Datum, Preisgeld, Teilnehmer und einen Turnierbaum aus den neuesten Ligaspielen.'
            ,tournament_round_one: 'Erste Runde'
            ,tournament_round_two: 'Halbfinale'
            ,tournament_round_three: 'Finale'
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

    function mapRowToPosition(row) {
        const lane = Number(row.lane_role);
        const roaming = row.is_roaming === true || row.is_roaming === 1 || row.is_roaming === '1';
        const gpm = Number(row.gpm || row.gold_per_min || 0);
        if (lane === 2) return 2; // Mid
        if (lane === 1) {
            if (roaming) return 4;
            return gpm >= 420 ? 1 : 5;
        }
        if (lane === 3) {
            if (roaming) return 4;
            return gpm >= 380 ? 3 : 4;
        }
        if (lane === 4) {
            return gpm >= 420 ? 1 : 4;
        }
        return null;
    }

    function buildRoleTopFromRows(rows, minMatchesBase = 50) {
        const perHeroPos = new Map();
        (rows || []).forEach((r) => {
            const pos = mapRowToPosition(r);
            if (!pos) return;
            const heroId = Number(r.hero_id);
            if (!heroId) return;
            const matches = Number(r.matches || 0);
            const wins = Number(r.wins || 0);
            if (!matches) return;
            if (!perHeroPos.has(heroId)) perHeroPos.set(heroId, {});
            const bucket = perHeroPos.get(heroId);
            if (!bucket[pos]) bucket[pos] = { matches: 0, wins: 0 };
            bucket[pos].matches += matches;
            bucket[pos].wins += wins;
        });

        const primary = [];
        perHeroPos.forEach((bucket, heroId) => {
            let bestPos = null;
            let bestMatches = -1;
            let bestWinrate = -1;
            Object.keys(bucket).forEach((posKey) => {
                const pos = Number(posKey);
                const data = bucket[pos];
                const matches = data.matches || 0;
                const winrate = matches ? (data.wins / matches) * 100 : 0;
                if (matches > bestMatches || (matches === bestMatches && winrate > bestWinrate)) {
                    bestPos = pos;
                    bestMatches = matches;
                    bestWinrate = winrate;
                }
            });
            if (!bestPos) return;
            primary.push({
                hero_id: heroId,
                pos: bestPos,
                matches: bestMatches,
                wins: bucket[bestPos].wins,
                winrate: bestWinrate
            });
        });

        const roleMap = {
            1: "Carry",
            2: "Mid",
            3: "Offlane",
            4: "Support",
            5: "Hard Support"
        };
        const result = {
            Carry: [],
            Mid: [],
            Offlane: [],
            Support: [],
            "Hard Support": []
        };

        primary.forEach((h) => {
            const role = roleMap[h.pos];
            if (!role) return;
            result[role].push(h);
        });

        const pickTop = (list, minMatches) => {
            return (list || [])
                .filter((h) => h.matches >= minMatches)
                .filter((h) => h.winrate >= 50)
                .map((h) => ({
                    ...h,
                    score: h.winrate * Math.log(Math.max(2, h.matches))
                }))
                .sort((a, b) => {
                    if (b.winrate !== a.winrate) return b.winrate - a.winrate;
                    if (b.score !== a.score) return b.score - a.score;
                    return b.matches - a.matches;
                })
                .slice(0, 5);
        };

        const thresholds = [minMatchesBase, 30, 20];
        Object.keys(result).forEach((role) => {
            let list = [];
            for (const minM of thresholds) {
                list = pickTop(result[role], minM);
                if (list.length >= 5) break;
            }
            result[role] = list;
        });

        return result;
    }

    function buildRoleTopFromStats(stats, minMatchesBase = 50) {
        const roles = ["Carry", "Mid", "Offlane", "Support", "Hard Support"];
        const candidates = { Carry: [], Mid: [], Offlane: [], Support: [], "Hard Support": [] };

        const scoreHero = (h) => {
            const rolesList = h.roles || [];
            const isSupport = rolesList.includes("Support");
            const isCarry = rolesList.includes("Carry");
            const isNuker = rolesList.includes("Nuker");
            const isDurable = rolesList.includes("Durable");
            const isInitiator = rolesList.includes("Initiator");
            const isDisabler = rolesList.includes("Disabler");

            return {
                Carry: (isCarry ? 4 : 0) + (isSupport ? -4 : 0) + (isNuker ? -1 : 0),
                Mid: (isNuker ? 4 : 0) + (isCarry ? 1 : 0) + (isSupport ? -4 : 0),
                Offlane: (isDurable ? 3 : 0) + (isInitiator ? 2 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -2 : 0),
                Support: (isSupport ? 4 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -4 : 0),
                "Hard Support": (isSupport ? 4 : 0) + (isDisabler ? 2 : 0) + (isCarry ? -4 : 0),
            };
        };

        (stats || []).forEach((h) => {
            const matches = h.pro_pick || h.matches || 0;
            const wins = h.pro_win || h.wins || 0;
            if (!matches) return;
            const winrate = matches ? (wins / matches) * 100 : 0;
            if (winrate < 50) return;
            const scores = scoreHero(h);
            const heroId = h.id || h.hero_id;
            roles.forEach((role) => {
                const score = scores[role] || 0;
                if (score <= 0) return;
                candidates[role].push({
                    hero_id: heroId,
                    matches,
                    wins,
                    winrate,
                    score: winrate * Math.log(Math.max(2, matches)),
                    roleScore: score
                });
            });
        });

        roles.forEach((role) => {
            candidates[role].sort((a, b) => {
                if (b.winrate !== a.winrate) return b.winrate - a.winrate;
                if (b.roleScore !== a.roleScore) return b.roleScore - a.roleScore;
                if (b.score !== a.score) return b.score - a.score;
                return b.matches - a.matches;
            });
        });

        const assigned = new Map(); // hero_id -> role
        const result = { Carry: [], Mid: [], Offlane: [], Support: [], "Hard Support": [] };
        const thresholds = [minMatchesBase, 30, 20];

        const takeForRole = (role) => {
            for (const minM of thresholds) {
                for (const cand of candidates[role]) {
                    if (result[role].length >= 5) break;
                    if (cand.matches < minM) continue;
                    if (assigned.has(cand.hero_id)) continue;
                    assigned.set(cand.hero_id, role);
                    result[role].push(cand);
                }
                if (result[role].length >= 5) break;
            }
        };

        roles.forEach((role) => takeForRole(role));

        return result;
    }

    async function loadWinrate() {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid || roleGrid.dataset.loaded) return;
        roleGrid.innerHTML = `<div class="muted">${t('loading_heroes')}</div>`;
        try {
            await ensureConstants();
            const [metaRes, roleRes, patchRes] = await Promise.all([
                fetch('/api/meta/heroes?days=8'),
                fetch('/api/meta/roles?days=8'),
                fetch('https://api.opendota.com/api/constants/patch')
            ]);
            let heroStats = [];
            let roleTop = null;
            if (roleRes.ok) {
                const roleData = await roleRes.json();
                const rows = (roleData && roleData.rows) ? roleData.rows : [];
                if (rows.length) roleTop = buildRoleTopFromRows(rows, 50);
            }
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
            if (!roleTop) {
                roleTop = buildRoleTopFromStats(heroStats, 50);
            }
            let patchLabel = 'Unknown';
            if (patchRes.ok) {
                const patchData = await patchRes.json();
                patchLabel = getLatestPatchName(patchData) || patchLabel;
            }
            const patchInfo = document.getElementById('patchInfo');
            if (patchInfo) patchInfo.textContent = `${t('patch_label')} ${patchLabel}`;

            window.__HERO_STATS__ = heroStats;
            renderRoleColumns(heroStats, roleTop);
            renderMetaTop5(heroStats);
            roleGrid.dataset.loaded = '1';
        } catch (e) {
            roleGrid.innerHTML = `<div class="muted">${t('failed_load_heroes')}</div>`;
        }
    }

    function getRoleTop(stats, role) {
        const scoreMap = (h) => {
            const roles = h.roles || [];
            const isSupport = roles.includes("Support");
            const isCarry = roles.includes("Carry");
            const isNuker = roles.includes("Nuker");
            const isDurable = roles.includes("Durable");
            const isInitiator = roles.includes("Initiator");
            const isDisabler = roles.includes("Disabler");
            const isJungler = roles.includes("Jungler");

            return {
                carry: (isCarry ? 3 : 0) + (isNuker ? 1 : 0) + (isSupport ? -3 : 0) + (isJungler ? -1 : 0),
                mid: (isNuker ? 3 : 0) + (isCarry ? 1 : 0) + (isSupport ? -3 : 0) + (isJungler ? -1 : 0),
                offlane: (isDurable ? 2 : 0) + (isInitiator ? 2 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -2 : 0),
                support: (isSupport ? 3 : 0) + (isDisabler ? 1 : 0) + (isCarry ? -3 : 0),
                hard: (isSupport ? 3 : 0) + (isDisabler ? 2 : 0) + (isCarry ? -3 : 0),
            };
        };

        const roleKey = role === "Carry" ? "carry"
            : role === "Mid" ? "mid"
            : role === "Offlane" ? "offlane"
            : role === "Support" ? "support"
            : "hard";

        const pickTop = (minMatches, minScore, requireGap) => stats
            .filter((h) => h.pro_pick >= minMatches)
            .filter((h) => {
                const wr = h.pro_pick ? (h.pro_win / h.pro_pick) * 100 : 0;
                return wr >= 50;
            })
            .map((h) => {
                const scores = scoreMap(h);
                return { ...h, __scores: scores, __score: scores[roleKey] || 0 };
            })
            .filter((h) => h.__score >= minScore)
            .filter((h) => {
                const s = h.__scores;
                if (roleKey === "carry") return h.__score >= s.mid + requireGap;
                if (roleKey === "mid") return h.__score >= s.carry + requireGap;
                if (roleKey === "offlane") return h.__score >= Math.max(s.carry, s.mid) + requireGap;
                if (roleKey === "support") return h.__score >= s.carry + requireGap;
                if (roleKey === "hard") return h.__score >= s.support + requireGap;
                return true;
            })
            .sort((a, b) => {
                const wrA = a.pro_win / a.pro_pick;
                const wrB = b.pro_win / b.pro_pick;
                if (wrB !== wrA) return wrB - wrA;
                if (b.__score !== a.__score) return b.__score - a.__score;
                return b.pro_pick - a.pro_pick;
            })
            .slice(0, 5);

        let list = pickTop(100, 2, 1);
        if (list.length < 5) list = pickTop(100, 2, 0);
        if (list.length < 5) list = pickTop(50, 1, 0);
        if (list.length < 5) list = pickTop(30, 1, 0);
        return list.map(({ __score, __scores, ...rest }) => rest);
    }

    function renderRoleColumns(stats, roleTop) {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid) return;
        const roles = ["Carry", "Mid", "Offlane", "Support", "Hard Support"];
        const html = roles.map((role) => {
            const list = roleTop && roleTop[role] ? roleTop[role].map((h) => {
                const heroConst = HERO_DATA_BY_ID[h.hero_id] || HERO_DATA[h.hero_id];
                return {
                    ...h,
                    name: heroConst ? heroConst.name : "npc_dota_hero_unknown",
                    localized_name: heroConst ? heroConst.localized_name : "Unknown"
                };
            }) : getRoleTop(stats, role);
            const rows = list.map((h) => {
                const matches = h.matches ?? h.pro_pick ?? 0;
                const wins = h.wins ?? h.pro_win ?? 0;
                const wr = matches ? ((wins / matches) * 100).toFixed(1) : "0.0";
                return `
                    <div class="role-hero">
                        <div class="role-hero-left">
                            <img class="leader-hero" src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${h.name.replace('npc_dota_hero_', '')}.png" alt="">
                            <div>
                                <div class="role-hero-name">${h.localized_name}</div>
                                <div class="role-hero-meta">${matches} РјР°С‚С‡С–РІ</div>
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

    function getTournamentDateValue(item) {
        const raw = item.startDate
            || item.start_date
            || item.startTimestamp
            || item.start_timestamp
            || item.endDate
            || item.end_date
            || item.endTimestamp
            || item.end_timestamp
            || item.last_match_time
            || item.last;
        if (raw == null || raw === '') return null;
        if (typeof raw === 'number') {
            return raw > 1e12 ? raw : raw * 1000;
        }
        const parsed = Date.parse(raw);
        return Number.isNaN(parsed) ? null : parsed;
    }

    function formatTournamentDate(ts) {
        if (!ts) return t('tournament_date_unknown');
        return new Intl.DateTimeFormat(currentLang === 'uk' ? 'uk-UA' : currentLang === 'de' ? 'de-DE' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(ts));
    }

    function formatTournamentPrize(value) {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount <= 0) return t('tournament_prize_unknown');
        return new Intl.NumberFormat(currentLang === 'uk' ? 'uk-UA' : currentLang === 'de' ? 'de-DE' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getTournamentInitials(name) {
        const words = String(name || '')
            .split(/\s+/)
            .map((part) => part.replace(/[^A-Za-zА-Яа-яІіЇїЄє0-9]/g, ''))
            .filter(Boolean);
        return (words.slice(0, 2).map((part) => part[0]).join('') || 'D2').slice(0, 2).toUpperCase();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeTournamentImageUrl(url) {
        if (!url) return '';
        if (String(url).startsWith('//')) return `https:${url}`;
        return String(url);
    }

    function handleTournamentIconError(img) {
        if (!img || !img.parentNode) return;
        const fallback = document.createElement('div');
        fallback.className = 'tournament-icon-fallback';
        fallback.innerHTML = `<span>${escapeHtml(img.dataset.initials || 'D2')}</span>`;
        img.parentNode.replaceChild(fallback, img);
    }

    function handleTournamentTeamIconError(img) {
        if (!img || !img.parentNode) return;
        const fallback = document.createElement('div');
        fallback.className = 'tournament-team-fallback';
        fallback.innerHTML = `<span>${escapeHtml(img.dataset.initials || 'TM')}</span>`;
        img.parentNode.replaceChild(fallback, img);
    }

    function formatTournamentTemplate(key, vars) {
        return Object.keys(vars || {}).reduce((acc, name) => acc.replace(`{${name}}`, vars[name]), t(key));
    }

    function getTeamInfoFromMatch(match, side) {
        if (side === 'radiant') {
            const radiantTeam = match.radiant_team || match.radiantTeam || {};
            const id = match.radiant_team_id || match.radiantTeamId || radiantTeam.team_id || radiantTeam.teamId || '';
            const teamMeta = TEAM_DATA_BY_ID[id] || {};
            return {
                id,
                name: match.radiant_name || match.radiant_team_name || match.radiantTeamName || radiantTeam.name || radiantTeam.tag || teamMeta.name || 'Radiant',
                logo: normalizeTournamentImageUrl(match.radiant_logo || match.radiant_team_logo || radiantTeam.logo_url || radiantTeam.logo || teamMeta.logo_url || ''),
                score: Number(match.radiant_score ?? match.radiantScore ?? 0)
            };
        }
        const direTeam = match.dire_team || match.direTeam || {};
        const id = match.dire_team_id || match.direTeamId || direTeam.team_id || direTeam.teamId || '';
        const teamMeta = TEAM_DATA_BY_ID[id] || {};
        return {
            id,
            name: match.dire_name || match.dire_team_name || match.direTeamName || direTeam.name || direTeam.tag || teamMeta.name || 'Dire',
            logo: normalizeTournamentImageUrl(match.dire_logo || match.dire_team_logo || direTeam.logo_url || direTeam.logo || teamMeta.logo_url || ''),
            score: Number(match.dire_score ?? match.direScore ?? 0)
        };
    }

    function collectTournamentTeams(matches) {
        const byId = new Map();
        (matches || []).forEach((match) => {
            [getTeamInfoFromMatch(match, 'radiant'), getTeamInfoFromMatch(match, 'dire')].forEach((team) => {
                if (!team.name) return;
                const key = team.id || team.name;
                if (!byId.has(key)) {
                    byId.set(key, { ...team, appearances: 0 });
                }
                byId.get(key).appearances += 1;
            });
        });
        return Array.from(byId.values())
            .sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name));
    }

    function mergeTournamentTeams(teams) {
        (teams || []).forEach((team) => {
            const teamId = team.team_id || team.teamId || team.id;
            if (!teamId) return;
            TEAM_DATA_BY_ID[teamId] = {
                ...(TEAM_DATA_BY_ID[teamId] || {}),
                ...team
            };
        });
    }

    function buildTeamsFromLeagueTeams(teams) {
        return (teams || [])
            .map((team) => ({
                id: team.team_id || team.teamId || team.id || '',
                name: team.name || team.tag || 'Unknown team',
                logo: normalizeTournamentImageUrl(team.logo_url || team.logo || team.image_url || ''),
                appearances: Number(team.matches_played || team.appearances || 0)
            }))
            .filter((team) => team.name)
            .sort((a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name));
    }

    function buildTournamentDescription(row) {
        if (row.description) return row.description;
        return formatTournamentTemplate('tournament_generated_description', {
            name: row.name
        });
    }

    function normalizeTournamentTier(value) {
        const tier = String(value || '').trim().toLowerCase();
        if (!tier) return '';
        if (['1', 'tier 1', 't1', 'premium', 'top_tier', 'top tier', 's'].includes(tier)) return 'tier1';
        if (['2', 'tier 2', 't2', 'professional', 'a'].includes(tier)) return 'tier2';
        return '';
    }

    function isAllowedTournamentTier(value) {
        const tier = normalizeTournamentTier(value);
        return tier === 'tier1' || tier === 'tier2';
    }

    function getKnownTournamentLabel(name) {
        const raw = String(name || '');
        const hit = KNOWN_TOURNAMENT_RULES.find((rule) => rule.match.test(raw));
        return hit ? hit.label : '';
    }

    function isKnownTournament(name) {
        return Boolean(getKnownTournamentLabel(name));
    }

    function getTournamentOverride(name) {
        const raw = String(name || '');
        return TOURNAMENT_METADATA_OVERRIDES.find((rule) => rule.match.test(raw)) || null;
    }

    function shouldKeepTournament(item, dateValue) {
        if (!dateValue || dateValue < TOURNAMENT_CUTOFF_TS) return false;
        const rawName = item.name || '';
        const tierAllowed = isAllowedTournamentTier(item.tier || item.league_tier || item.tournament_tier);
        const known = isKnownTournament(rawName);
        const hasMatches = Number(item.matchCount || 0) > 0 || ((item.matches || []).length > 0);
        return (tierAllowed && hasMatches) || known;
    }

    function getTournamentDateRange(matches) {
        const values = (matches || [])
            .map((match) => getTournamentDateValue({ last: match.start_time }))
            .filter(Boolean)
            .sort((a, b) => a - b);
        if (!values.length) return { start: null, end: null };
        return {
            start: values[0],
            end: values[values.length - 1]
        };
    }

    function formatTournamentDateRange(range) {
        if (!range || (!range.start && !range.end)) return t('tournament_date_unknown');
        if (range.start && range.end) {
            if (new Date(range.start).toDateString() === new Date(range.end).toDateString()) {
                return formatTournamentDate(range.start);
            }
            return `${formatTournamentDate(range.start)} - ${formatTournamentDate(range.end)}`;
        }
        return formatTournamentDate(range.start || range.end);
    }

    function buildTournamentRounds(matches) {
        const ordered = [...(matches || [])]
            .filter((match) => {
                const radiant = getTeamInfoFromMatch(match, 'radiant');
                const dire = getTeamInfoFromMatch(match, 'dire');
                return (radiant.id || radiant.name) && (dire.id || dire.name) && (match.start_time || match.startTime);
            })
            .map((match) => ({
                ...match,
                start_time: match.start_time || match.startTime || 0
            }))
            .sort((a, b) => (a.start_time || 0) - (b.start_time || 0))
            .slice(-7);
        if (!ordered.length) return [];
        const round1 = ordered.slice(0, Math.min(4, ordered.length));
        const round2 = ordered.length > 4 ? ordered.slice(4, Math.min(6, ordered.length)) : [];
        const round3 = ordered.length > 6 ? ordered.slice(6, 7) : [];
        const rounds = [
            { title: t('tournament_round_one'), matches: round1 },
            { title: t('tournament_round_two'), matches: round2 },
            { title: t('tournament_round_three'), matches: round3 }
        ];
        return rounds.filter((round) => round.matches.length);
    }

    function renderTournamentBracket(rounds) {
        if (!rounds.length) {
            return `<div class="bracket-empty">${t('tournament_no_bracket')}</div>`;
        }
        return `
            <div class="tournament-bracket-grid">
                ${rounds.map((round) => `
                    <div class="bracket-round">
                        <div class="bracket-round-title">${escapeHtml(round.title)}</div>
                        ${round.matches.map((match, index) => {
                            const radiant = getTeamInfoFromMatch(match, 'radiant');
                            const dire = getTeamInfoFromMatch(match, 'dire');
                            const radiantWin = radiant.score > dire.score;
                            const direWin = dire.score > radiant.score;
                            return `
                                <div class="bracket-match">
                                    <div class="bracket-match-head">${formatTournamentDate(getTournamentDateValue({ last: match.start_time }))} • #${index + 1}</div>
                                    <div class="bracket-team ${radiantWin ? 'is-winner' : ''}">
                                        <span>${escapeHtml(radiant.name)}</span>
                                        <span class="bracket-score">${Number.isFinite(radiant.score) ? radiant.score : '-'}</span>
                                    </div>
                                    <div class="bracket-team ${direWin ? 'is-winner' : ''}">
                                        <span>${escapeHtml(dire.name)}</span>
                                        <span class="bracket-score">${Number.isFinite(dire.score) ? dire.score : '-'}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function closeTournamentDetails() {
        TOURNAMENT_STATE.selectedLeagueId = null;
        document.querySelectorAll('.tournament-row.is-active').forEach((row) => row.classList.remove('is-active'));
        const modal = document.getElementById('tournamentModal');
        const details = document.getElementById('tournamentDetails');
        if (modal) modal.style.display = 'none';
        if (!details) return;
        details.style.display = 'none';
        details.innerHTML = '';
        document.body.style.overflow = '';
    }

    function handleTournamentModalBackdrop(event) {
        if (event.target && event.target.id === 'tournamentModal') {
            closeTournamentDetails();
        }
    }

    async function openTournamentDetails(leagueId) {
        const modal = document.getElementById('tournamentModal');
        const details = document.getElementById('tournamentDetails');
        const row = TOURNAMENT_STATE.byId.get(Number(leagueId));
        if (!modal || !details || !row) return;

        if (TOURNAMENT_STATE.selectedLeagueId === Number(leagueId)) {
            closeTournamentDetails();
            return;
        }

        TOURNAMENT_STATE.selectedLeagueId = Number(leagueId);
        document.querySelectorAll('.tournament-row').forEach((node) => {
            node.classList.toggle('is-active', Number(node.dataset.leagueId) === Number(leagueId));
        });
        modal.style.display = 'block';
        details.style.display = 'block';
        document.body.style.overflow = 'hidden';
        details.innerHTML = `<div class="tournament-detail-card"><div class="muted">${escapeHtml(t('tournament_loading_details'))}</div></div>`;

        if (!row.matchesLoaded) {
            try {
                const res = await fetch(`/api/tournaments/${leagueId}`);
                const payload = await res.json();
                if (Array.isArray(payload.matches) && payload.matches.length) {
                    row.matches = payload.matches;
                }
                if (Array.isArray(payload.teams)) {
                    row.leagueTeams = payload.teams;
                    mergeTournamentTeams(payload.teams);
                }
                const fetchedRange = getTournamentDateRange(row.matches);
                if (fetchedRange.start || fetchedRange.end) {
                    row.dateValue = fetchedRange.start || fetchedRange.end;
                    row.dateText = formatTournamentDateRange(fetchedRange);
                }
                row.matchesLoaded = true;
            } catch (e) {
                row.matchesLoaded = true;
            }
        }

        const teams = collectTournamentTeams(row.matches).length
            ? collectTournamentTeams(row.matches)
            : buildTeamsFromLeagueTeams(row.leagueTeams);
        const rounds = buildTournamentRounds(row.matches);
        details.innerHTML = `
            <div class="tournament-details-grid">
                <div class="tournament-stack">
                    <div class="tournament-detail-card reveal visible">
                        <div class="tournament-detail-header">
                            <div>
                                <div class="tournament-detail-title">${escapeHtml(t('tournament_details_title'))}</div>
                                <div class="tournament-detail-subtitle">${escapeHtml(row.name)} • ${escapeHtml(row.dateText)}</div>
                            </div>
                            <button class="tournament-close-btn" onclick="closeTournamentDetails()">${escapeHtml(t('tournament_close'))}</button>
                        </div>
                        <div class="tournament-description">${escapeHtml(buildTournamentDescription(row))}</div>
                        <div class="tournament-info-pills">
                            <span class="pill">${escapeHtml(row.prizeText)}</span>
                            <span class="pill">${escapeHtml(row.metaText || `#${row.leagueId}`)}</span>
                            <span class="pill">${teams.length} ${escapeHtml(t('tournament_teams_title'))}</span>
                        </div>
                    </div>
                    <div class="tournament-detail-card reveal visible">
                        <div class="section-title">
                            <h3>${escapeHtml(t('tournament_bracket_title'))}</h3>
                            <div class="muted">${escapeHtml(row.name)}</div>
                        </div>
                        ${renderTournamentBracket(rounds)}
                    </div>
                </div>
                <div class="tournament-detail-card reveal visible">
                    <div class="section-title">
                        <h3>${escapeHtml(t('tournament_teams_title'))}</h3>
                        <div class="muted">${teams.length} teams</div>
                    </div>
                    <div class="tournament-teams-list">
                        ${teams.map((team) => {
                            const initials = escapeHtml(getTournamentInitials(team.name));
                            const logo = team.logo
                                ? `<img class="tournament-team-logo" src="${escapeHtml(team.logo)}" alt="${escapeHtml(team.name)}" data-initials="${initials}" onerror="handleTournamentTeamIconError(this)">`
                                : `<div class="tournament-team-fallback"><span>${initials}</span></div>`;
                            return `
                                <div class="tournament-team-chip">
                                    ${logo}
                                    <div>
                                        <div class="tournament-team-name">${escapeHtml(team.name)}</div>
                                        <div class="tournament-team-meta">${team.appearances} ${escapeHtml(t('tournament_matches_count').toLowerCase())}</div>
                                    </div>
                                </div>
                            `;
                        }).join('') || `<div class="bracket-empty">${escapeHtml(t('tournament_no_teams'))}</div>`}
                    </div>
                </div>
            </div>
        `;
    }

    async function loadTournaments() {
        const list = document.getElementById('tournamentList');
        if (!list || list.dataset.loaded) return;
        list.innerHTML = `<div class="tournament-empty">${t('loading_tournaments')}</div>`;
        const modal = document.getElementById('tournamentModal');
        const details = document.getElementById('tournamentDetails');
        if (modal) modal.style.display = 'none';
        if (details) {
            details.style.display = 'none';
            details.innerHTML = '';
        }
        try {
            const [proMatchesRes, leaguesRes, teamsRes] = await Promise.all([
                fetch('https://api.opendota.com/api/proMatches'),
                fetch('https://api.opendota.com/api/leagues'),
                fetch('/api/teams')
            ]);
            const proMatches = await proMatchesRes.json();
            const leagues = await leaguesRes.json();
            const teams = await teamsRes.json();
            TEAM_DATA_BY_ID = {};
            (teams || []).forEach((team) => {
                const teamId = team.team_id || team.teamId || team.id;
                if (!teamId) return;
                TEAM_DATA_BY_ID[teamId] = team;
            });
            const grouped = new Map();

            (proMatches || []).slice(0, 120).forEach((match) => {
                const leagueId = match.leagueid || match.league_id;
                if (!leagueId) return;
                const existing = grouped.get(leagueId) || {
                    leagueId,
                    name: match.league_name || `League #${leagueId}`,
                    matchCount: 0,
                    last_match_time: null,
                    matches: []
                };
                existing.matchCount += 1;
                existing.matches.push(match);
                const matchTime = getTournamentDateValue({ last: match.start_time });
                if (matchTime && (!existing.last_match_time || matchTime > existing.last_match_time)) {
                    existing.last_match_time = matchTime;
                }
                grouped.set(leagueId, existing);
            });

            (leagues || []).forEach((league) => {
                const leagueId = league.leagueid || league.league_id || league.id;
                if (!leagueId) return;
                const existing = grouped.get(leagueId) || {
                    leagueId,
                    name: league.name || `League #${leagueId}`,
                    matchCount: 0,
                    last_match_time: null,
                    matches: []
                };
                grouped.set(leagueId, {
                    ...existing,
                    ...league,
                    leagueId,
                    name: league.name || existing.name,
                    matchCount: existing.matchCount || 0,
                    last_match_time: existing.last_match_time,
                    matches: existing.matches || []
                });
            });

            const now = Date.now();
            const mappedRows = Array.from(grouped.values())
                .map((item) => {
                    const override = getTournamentOverride(item.name);
                    const dateRange = getTournamentDateRange(item.matches || []);
                    const dateValue = getTournamentDateValue(item) || dateRange.start || dateRange.end;
                    const logo = normalizeTournamentImageUrl(item.banner || item.image_url || item.imageUrl || item.logo_url || item.logoUrl || '');
                    const prizeValue = item.prize_pool || item.prizepool || item.prizePool || (override ? override.prize : 0);
                    const normalizedTier = normalizeTournamentTier(item.tier || item.league_tier || item.tournament_tier);
                    const metaBits = [];
                    const seriesLabel = getKnownTournamentLabel(item.name);
                    if (seriesLabel) metaBits.push(seriesLabel);
                    if (normalizedTier === 'tier1') metaBits.push('TIER 1');
                    if (normalizedTier === 'tier2') metaBits.push('TIER 2');
                    if (item.matchCount) metaBits.push(`${item.matchCount} ${t('tournament_matches_count')}`);
                    return {
                        leagueId: item.leagueId,
                        name: item.name || `League #${item.leagueId}`,
                        logo,
                        description: item.description || item.desc || '',
                        tier: normalizedTier,
                        prizeText: formatTournamentPrize(prizeValue),
                        dateValue,
                        dateText: formatTournamentDateRange(dateRange.start || dateRange.end ? dateRange : { start: dateValue, end: dateValue }),
                        metaText: metaBits.join(' • '),
                        matches: item.matches || []
                    };
                })
                .filter((item) => item.name);

            let rows = mappedRows
                .filter((item) => {
                    const original = grouped.get(item.leagueId) || {};
                    return shouldKeepTournament(original, item.dateValue);
                })
                .sort((a, b) => {
                    const aDate = a.dateValue;
                    const bDate = b.dateValue;
                    if (aDate && bDate) {
                        const aFuture = aDate >= now;
                        const bFuture = bDate >= now;
                        if (aFuture && bFuture) return aDate - bDate;
                        if (aFuture !== bFuture) return aFuture ? -1 : 1;
                        return bDate - aDate;
                    }
                    if (aDate || bDate) return aDate ? -1 : 1;
                    return a.name.localeCompare(b.name);
                })
                .slice(0, 16);

            if (!rows.length) {
                rows = mappedRows
                    .filter((item) => item.dateValue && item.dateValue >= TOURNAMENT_CUTOFF_TS)
                    .sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0))
                    .slice(0, 16);
            }

            list.innerHTML = rows.map((row) => {
                const initials = escapeHtml(getTournamentInitials(row.name));
                const iconHtml = row.logo
                    ? `<img class="tournament-icon" src="${escapeHtml(row.logo)}" alt="${escapeHtml(row.name)}" data-initials="${initials}" onerror="handleTournamentIconError(this)">`
                    : `<div class="tournament-icon-fallback"><span>${initials}</span></div>`;
                return `
                    <div class="tournament-row reveal visible" data-league-id="${row.leagueId}" onclick="openTournamentDetails(${row.leagueId})" style="cursor:pointer">
                        <div class="tournament-icon-cell">${iconHtml}</div>
                        <div class="tournament-name-cell">
                            <div class="tournament-name">${escapeHtml(row.name)}</div>
                            <div class="tournament-meta">${escapeHtml(row.metaText || `#${row.leagueId}`)}</div>
                        </div>
                        <div class="tournament-prize-cell">
                            <div class="tournament-prize">${escapeHtml(row.prizeText)}</div>
                        </div>
                        <div class="tournament-date-cell">
                            <div class="tournament-date">${escapeHtml(row.dateText)}</div>
                        </div>
                    </div>
                `;
            }).join('') || `<div class="tournament-empty">${t('no_tournaments')}</div>`;
            TOURNAMENT_STATE.rows = rows;
            TOURNAMENT_STATE.byId = new Map(rows.map((row) => [Number(row.leagueId), row]));
            TOURNAMENT_STATE.selectedLeagueId = null;
            list.dataset.loaded = '1';
        } catch (e) {
            list.innerHTML = `<div class="tournament-empty">${t('failed_load_tournaments')}</div>`;
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
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && TOURNAMENT_STATE.selectedLeagueId != null) {
                closeTournamentDetails();
            }
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




























