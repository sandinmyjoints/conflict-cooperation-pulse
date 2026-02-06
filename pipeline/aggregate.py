"""Aggregate GDELT event rows into weekly country-pair summaries."""

import json
import os
from collections import defaultdict
from datetime import datetime, timedelta

from . import config


def normalize_pair(actor1: str, actor2: str) -> tuple[str, str]:
    """Normalize pair direction alphabetically so USA-CHN == CHN-USA."""
    if actor1 <= actor2:
        return actor1, actor2
    return actor2, actor1


def monday_of_week(date_str: str) -> str:
    """Return the Monday (ISO week start) for a given YYYYMMDD date string."""
    dt = datetime.strptime(date_str, "%Y%m%d")
    monday = dt - timedelta(days=dt.weekday())
    return monday.strftime("%Y-%m-%d")


def aggregate_rows(rows: list[dict]) -> dict:
    """
    Aggregate raw GDELT rows into weekly country-pair buckets.

    Returns dict keyed by (actor1, actor2) -> list of weekly summaries.
    """
    # Group by (pair, week)
    buckets: dict[tuple[str, str], dict[str, list]] = defaultdict(lambda: defaultdict(list))

    for row in rows:
        a1 = row["Actor1CountryCode"]
        a2 = row["Actor2CountryCode"]
        pair = normalize_pair(a1, a2)
        week = monday_of_week(str(row["SQLDATE"]))
        buckets[pair][week].append(row)

    return buckets


def compute_weekly_stats(events: list[dict]) -> dict:
    """Compute summary stats for a list of events in one week."""
    goldstein_vals = [e["GoldsteinScale"] for e in events if e["GoldsteinScale"] is not None]
    avg_goldstein = sum(goldstein_vals) / len(goldstein_vals) if goldstein_vals else None

    coop = sum(1 for e in events if e.get("QuadClass") in (1, 2))
    conf = sum(1 for e in events if e.get("QuadClass") in (3, 4))
    total = len(events)
    mentions = sum(e.get("NumMentions", 0) for e in events)

    return {
        "avg_goldstein": round(avg_goldstein, 2) if avg_goldstein is not None else None,
        "coop": coop,
        "conf": conf,
        "total": total,
        "mentions": mentions,
    }


def build_week_list() -> list[str]:
    """Generate list of Monday dates for the full history window."""
    now = datetime.utcnow()
    current_monday = now - timedelta(days=now.weekday())
    weeks = []
    for i in range(config.WEEKS_HISTORY - 1, -1, -1):
        monday = current_monday - timedelta(weeks=i)
        weeks.append(monday.strftime("%Y-%m-%d"))
    return weeks


def rank_pairs(pair_summaries: list[dict]) -> dict:
    """Compute pre-ranked top-10 lists for the dashboard."""
    with_recent = [p for p in pair_summaries if p["recent_avg_goldstein"] is not None]

    most_conflictual = sorted(with_recent, key=lambda p: p["recent_avg_goldstein"])[:10]
    most_cooperative = sorted(with_recent, key=lambda p: -p["recent_avg_goldstein"])[:10]

    with_trend = [p for p in with_recent if p["trend"] is not None]
    biggest_shifts = sorted(with_trend, key=lambda p: abs(p["trend"]), reverse=True)[:10]

    def pair_key(p):
        return f"{p['actor1']}-{p['actor2']}"

    return {
        "most_conflictual": [pair_key(p) for p in most_conflictual],
        "most_cooperative": [pair_key(p) for p in most_cooperative],
        "biggest_shifts": [pair_key(p) for p in biggest_shifts],
    }


def compute_pair_summary(pair: tuple[str, str], weekly_data: dict[str, dict],
                         all_weeks: list[str], countries: dict[str, str]) -> dict:
    """Build the full summary object for one country pair."""
    a1, a2 = pair
    label1 = countries.get(a1, a1)
    label2 = countries.get(a2, a2)

    data = []
    total_events = 0
    for week in all_weeks:
        if week in weekly_data:
            entry = weekly_data[week]
            entry["week"] = week
            data.append(entry)
            total_events += entry["total"]
        else:
            data.append({"week": week, "avg_goldstein": None, "coop": 0, "conf": 0, "total": 0, "mentions": 0})

    # Recent stats (last 12 weeks)
    recent = [d for d in data[-config.RECENT_WEEKS:] if d["avg_goldstein"] is not None]
    recent_avg = sum(d["avg_goldstein"] for d in recent) / len(recent) if recent else None

    # Prior 12 weeks for trend
    prior = [d for d in data[-(2 * config.RECENT_WEEKS):-config.RECENT_WEEKS] if d["avg_goldstein"] is not None]
    prior_avg = sum(d["avg_goldstein"] for d in prior) / len(prior) if prior else None

    trend = None
    if recent_avg is not None and prior_avg is not None:
        trend = round(recent_avg - prior_avg, 2)

    return {
        "actor1": a1,
        "actor2": a2,
        "label": f"{label1} \u2014 {label2}",
        "total_events": total_events,
        "recent_avg_goldstein": round(recent_avg, 2) if recent_avg is not None else None,
        "trend": trend,
        "data": data,
    }


def aggregate_to_json(rows: list[dict], countries: dict[str, str],
                       existing_data: dict | None = None) -> dict:
    """
    Full aggregation pipeline: raw rows → structured JSON.

    If existing_data is provided (incremental mode), merges new data into it.
    """
    all_weeks = build_week_list()
    buckets = aggregate_rows(rows)

    if existing_data and "pairs" in existing_data:
        # Merge: load existing weekly data, overlay new buckets
        merged_buckets = _rebuild_buckets(existing_data)
        for pair, week_events in buckets.items():
            for week, events in week_events.items():
                merged_buckets[pair][week] = compute_weekly_stats(events)
        weekly_stats = merged_buckets
    else:
        # Full build
        weekly_stats: dict[tuple[str, str], dict[str, dict]] = {}
        for pair, week_events in buckets.items():
            weekly_stats[pair] = {}
            for week, events in week_events.items():
                weekly_stats[pair][week] = compute_weekly_stats(events)

    # Rank by total event volume, keep top N
    pair_volumes = []
    for pair, weeks_data in weekly_stats.items():
        vol = sum(w.get("total", 0) for w in weeks_data.values())
        pair_volumes.append((pair, vol))

    pair_volumes.sort(key=lambda x: -x[1])
    top_pairs = [p for p, _ in pair_volumes[:config.TOP_PAIRS]]

    # Build pair summaries
    pair_summaries = []
    for pair in top_pairs:
        summary = compute_pair_summary(pair, weekly_stats[pair], all_weeks, countries)
        pair_summaries.append(summary)

    rankings = rank_pairs(pair_summaries)

    # Collect only country codes that appear in our pairs
    used_codes = set()
    for p in pair_summaries:
        used_codes.add(p["actor1"])
        used_codes.add(p["actor2"])

    filtered_countries = {code: countries.get(code, code) for code in sorted(used_codes)}

    return {
        "generated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "weeks": all_weeks,
        "pairs": pair_summaries,
        "rankings": rankings,
        "countries": filtered_countries,
    }


def _rebuild_buckets(existing_data: dict) -> dict[tuple[str, str], dict[str, dict]]:
    """Rebuild weekly stat buckets from previously generated JSON."""
    buckets: dict[tuple[str, str], dict[str, dict]] = defaultdict(dict)
    for pair_data in existing_data["pairs"]:
        pair = (pair_data["actor1"], pair_data["actor2"])
        for entry in pair_data["data"]:
            if entry["total"] > 0:
                buckets[pair][entry["week"]] = {
                    "avg_goldstein": entry["avg_goldstein"],
                    "coop": entry["coop"],
                    "conf": entry["conf"],
                    "total": entry["total"],
                    "mentions": entry["mentions"],
                }
    return buckets
