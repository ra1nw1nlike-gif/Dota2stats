def analyze_match(match):
    advice = []
    players = match.get("players", [])
    radiant_win = match.get("radiant_win")

    for p in players:
        is_radiant = p["player_slot"] < 128
        won = (is_radiant and radiant_win) or (not is_radiant and not radiant_win)
        
        if not won:
            # Проти магії без BKB (ID 116)
            magic_enemies = [74, 22, 25, 34] # Invoker, Zeus, Lina, Tinker
            count_magic = sum(1 for en in players if (en["player_slot"] < 128) != is_radiant and en["hero_id"] in magic_enemies)
            if count_magic >= 2:
                has_bkb = any(p.get(f"item_{i}") == 116 for i in range(6))
                if not has_bkb:
                    advice.append(f"Hero {p['hero_id']}: Відсутність BKB проти магічного піку завадила перемозі.")

            # Проти PA (ID 44) без MKB (ID 135)
            has_pa = any(en["hero_id"] == 44 for en in players if (en["player_slot"] < 128) != is_radiant)
            if has_pa:
                has_mkb = any(p.get(f"item_{i}") == 135 for i in range(6))
                if not has_mkb and p.get("total_gold", 0) > 18000:
                    advice.append(f"Hero {p['hero_id']}: Потрібен був Monkey King Bar проти ухилень Phantom Assassin.")

    if any(p.get("buyback_count", 0) == 0 and p.get("deaths", 0) > 10 for p in players):
        advice.append("Критична помилка: Команді не вистачило викупів (buybacks) у фінальних битвах.")

    return list(set(advice))