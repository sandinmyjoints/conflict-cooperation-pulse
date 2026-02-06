"""Tests for the aggregation module."""

from pipeline.aggregate import (
    normalize_pair,
    monday_of_week,
    compute_weekly_stats,
    aggregate_rows,
    rank_pairs,
)


def test_normalize_pair_alphabetical():
    assert normalize_pair("USA", "CHN") == ("CHN", "USA")
    assert normalize_pair("CHN", "USA") == ("CHN", "USA")
    assert normalize_pair("DEU", "FRA") == ("DEU", "FRA")


def test_monday_of_week():
    # 2024-01-15 is a Monday
    assert monday_of_week("20240115") == "2024-01-15"
    # 2024-01-17 is a Wednesday → Monday is 2024-01-15
    assert monday_of_week("20240117") == "2024-01-15"
    # 2024-01-21 is a Sunday → Monday is 2024-01-15
    assert monday_of_week("20240121") == "2024-01-15"


def test_compute_weekly_stats():
    events = [
        {"GoldsteinScale": -5.0, "QuadClass": 4, "NumMentions": 10},
        {"GoldsteinScale": 3.0, "QuadClass": 1, "NumMentions": 5},
        {"GoldsteinScale": -2.0, "QuadClass": 3, "NumMentions": 8},
    ]
    stats = compute_weekly_stats(events)
    assert stats["total"] == 3
    assert stats["coop"] == 1
    assert stats["conf"] == 2
    assert stats["mentions"] == 23
    assert round(stats["avg_goldstein"], 2) == -1.33


def test_compute_weekly_stats_empty():
    stats = compute_weekly_stats([])
    assert stats["total"] == 0
    assert stats["avg_goldstein"] is None


def test_aggregate_rows_merges_directions():
    rows = [
        {"Actor1CountryCode": "USA", "Actor2CountryCode": "CHN",
         "SQLDATE": "20240115", "GoldsteinScale": -3.0, "QuadClass": 3, "NumMentions": 5, "AvgTone": -1.0},
        {"Actor1CountryCode": "CHN", "Actor2CountryCode": "USA",
         "SQLDATE": "20240115", "GoldsteinScale": 2.0, "QuadClass": 1, "NumMentions": 3, "AvgTone": 0.5},
    ]
    buckets = aggregate_rows(rows)
    # Both should merge into a single pair
    assert len(buckets) == 1
    pair = ("CHN", "USA")
    assert pair in buckets
    # Both events in same week
    assert len(buckets[pair]["2024-01-15"]) == 2


def test_rank_pairs():
    summaries = [
        {"actor1": "A", "actor2": "B", "recent_avg_goldstein": -5.0, "trend": -2.0},
        {"actor1": "C", "actor2": "D", "recent_avg_goldstein": 5.0, "trend": 0.5},
        {"actor1": "E", "actor2": "F", "recent_avg_goldstein": 0.0, "trend": 3.0},
    ]
    rankings = rank_pairs(summaries)
    assert rankings["most_conflictual"][0] == "A-B"
    assert rankings["most_cooperative"][0] == "C-D"
    assert rankings["biggest_shifts"][0] == "E-F"
