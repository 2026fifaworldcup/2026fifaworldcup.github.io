#!/usr/bin/env python3
"""Fetch public ESPN soccer scoreboard data into a static JS payload.

Outputs ../live-data.js with:
- groupMatches: played World Cup matches that can feed standings
- warmups: recent/upcoming international friendlies involving qualified 2026 WC teams

This keeps the GitHub Pages app static while allowing a periodic/manual refresh.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_JS = ROOT / "data.js"
OUT_JS = ROOT / "live-data.js"

ESPN_WC = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=250"
ESPN_FRIENDLY = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.friendly/scoreboard?dates=20260516-20260610&limit=250"


def load_qualified_codes() -> set[str]:
    text = DATA_JS.read_text(encoding="utf-8")
    teams_block = text.split("teams:", 1)[1].split("groups:", 1)[0]
    return set(re.findall(r'^\s*([A-Z]{3}):\s*{', teams_block, flags=re.M))


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "StudioNaniWorldCupMVP/1.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def competitor_map(event: dict) -> tuple[dict, dict, dict]:
    comp = event.get("competitions", [{}])[0]
    teams = comp.get("competitors", [])
    by_side = {team.get("homeAway"): team for team in teams}
    return comp, by_side.get("home") or {}, by_side.get("away") or {}


def team_payload(item: dict) -> dict:
    team = item.get("team", {})
    return {
        "code": team.get("abbreviation") or "",
        "name": team.get("displayName") or team.get("name") or "",
        "score": int(item.get("score") or 0),
        "winner": bool(item.get("winner")),
    }


def status_payload(comp: dict) -> dict:
    status = (comp.get("status") or {}).get("type") or {}
    return {
        "name": status.get("name") or "",
        "description": status.get("description") or "",
        "completed": bool(status.get("completed")),
    }


def compact_event(event: dict, kind: str) -> dict:
    comp, home, away = competitor_map(event)
    venue = comp.get("venue") or {}
    return {
        "id": event.get("id"),
        "kind": kind,
        "date": event.get("date"),
        "name": event.get("name"),
        "shortName": event.get("shortName"),
        "status": status_payload(comp),
        "venue": venue.get("fullName") or None,
        "home": team_payload(home),
        "away": team_payload(away),
        "source": "ESPN public scoreboard API",
    }


def group_matches_from_worldcup(events: list[dict], qualified: set[str]) -> list[dict]:
    out = []
    for event in events:
        comp, home, away = competitor_map(event)
        status = status_payload(comp)
        hp, ap = team_payload(home), team_payload(away)
        if not status["completed"]:
            continue
        if hp["code"] not in qualified or ap["code"] not in qualified:
            continue
        out.append({
            "id": event.get("id"),
            "date": event.get("date"),
            "home": hp["code"],
            "away": ap["code"],
            "homeGoals": hp["score"],
            "awayGoals": ap["score"],
            "played": True,
            "status": status["description"],
            "venue": (comp.get("venue") or {}).get("fullName") or None,
            "source": "ESPN public scoreboard API",
        })
    return out


def friendly_warmups(events: list[dict], qualified: set[str]) -> list[dict]:
    filtered = []
    for event in events:
        comp, home, away = competitor_map(event)
        status = status_payload(comp)
        if status["description"].lower() == "canceled":
            continue
        hp, ap = team_payload(home), team_payload(away)
        if hp["code"] in qualified or ap["code"] in qualified:
            filtered.append(compact_event(event, "friendly"))
    filtered.sort(key=lambda item: item.get("date") or "")
    return filtered


def main() -> int:
    qualified = load_qualified_codes()
    wc = fetch_json(ESPN_WC)
    friendly = fetch_json(ESPN_FRIENDLY)
    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": {
            "name": "ESPN public scoreboard API",
            "worldCupUrl": ESPN_WC,
            "friendlyUrl": ESPN_FRIENDLY,
            "note": "Unofficial data feed for static MVP refresh; verify against FIFA/official sources before high-stakes public claims.",
        },
        "groupMatches": group_matches_from_worldcup(wc.get("events", []), qualified),
        "warmups": friendly_warmups(friendly.get("events", []), qualified),
    }
    OUT_JS.write_text(
        "window.WORLD_CUP_LIVE_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({"qualified": len(qualified), "groupMatches": len(payload["groupMatches"]), "warmups": len(payload["warmups"]), "out": str(OUT_JS)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
