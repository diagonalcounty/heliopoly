#!/usr/bin/env python3
"""Sunday 00:01 UTC unlock helper (#98 / #231).

Stage must not accept a free-form ISO that is labeled “Sunday” while being
Monday — or a far-future Thursday like 2026-12-31, which made cron skip 1.3.0.
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone

UNLOCK_HOUR = 0
UNLOCK_MINUTE = 1


def parse_iso(raw: str) -> datetime:
    s = raw.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        raise ValueError(f"{raw!r} has no timezone; use …Z (UTC)")
    return dt.astimezone(timezone.utc)


def is_sunday_unlock(dt: datetime) -> bool:
    return (
        dt.weekday() == 6
        and dt.hour == UNLOCK_HOUR
        and dt.minute == UNLOCK_MINUTE
        and dt.second == 0
        and dt.microsecond == 0
    )


def next_sunday_unlock(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    days_ahead = (6 - now.weekday()) % 7
    day = (now + timedelta(days=days_ahead)).date()
    candidate = datetime(
        day.year, day.month, day.day, UNLOCK_HOUR, UNLOCK_MINUTE, tzinfo=timezone.utc
    )
    if candidate <= now:
        candidate += timedelta(days=7)
    return candidate


def format_iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def validate(raw: str) -> datetime:
    dt = parse_iso(raw)
    if not is_sunday_unlock(dt):
        raise ValueError(
            f"{raw} is not Sunday 00:01 UTC "
            f"(got {dt.strftime('%A %H:%M:%S')} UTC)"
        )
    return dt


def self_test() -> None:
    sat = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    assert format_iso(next_sunday_unlock(sat)) == "2026-09-06T00:01:00.000Z"
    sun_before = datetime(2026, 9, 6, 0, 0, 30, tzinfo=timezone.utc)
    assert format_iso(next_sunday_unlock(sun_before)) == "2026-09-06T00:01:00.000Z"
    sun_after = datetime(2026, 9, 6, 12, 0, tzinfo=timezone.utc)
    assert format_iso(next_sunday_unlock(sun_after)) == "2026-09-13T00:01:00.000Z"
    validate("2026-09-06T00:01:00.000Z")
    try:
        validate("2026-09-07T00:01:00.000Z")
        raise AssertionError("Monday should fail")
    except ValueError:
        pass
    try:
        validate("2026-12-31T00:01:00.000Z")
        raise AssertionError("Thursday should fail")
    except ValueError:
        pass
    print("ok")


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("next", help="print next Sunday 00:01 UTC ISO")
    v = sub.add_parser("validate", help="exit 0 if ISO is Sunday 00:01 UTC")
    v.add_argument("iso")
    sub.add_parser("self-test")
    args = p.parse_args(argv)
    try:
        if args.cmd == "next":
            print(format_iso(next_sunday_unlock()))
            return 0
        if args.cmd == "validate":
            validate(args.iso)
            return 0
        if args.cmd == "self-test":
            self_test()
            return 0
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
