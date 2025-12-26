from pathlib import Path


def de_mojibake_and_strip_emoji(text: str) -> str:
    """Repair common UTF-8/CP1252 mojibake and remove emojis."""
    # 1) Try to fix typical mojibake (UTF-8 bytes read as CP1252, then re-saved)
    try:
        fixed = text.encode("cp1252", errors="ignore").decode("utf-8", errors="ignore")
    except Exception:
        fixed = text

    # 2) Remove emoji/symbol characters
    def is_emoji(ch: str) -> bool:
        o = ord(ch)
        # Most emoji live here
        if 0x1F000 <= o <= 0x1FFFF:
            return True
        # Misc symbols, dingbats etc.
        if 0x2600 <= o <= 0x27BF:
            return True
        return False

    fixed = "".join(ch for ch in fixed if not is_emoji(ch))
    return fixed


def main() -> None:
    root = Path(__file__).resolve().parent.parent / "docs"
    changed = []
    for path in sorted(root.glob("*.md")):
        original = path.read_text(encoding="utf-8", errors="ignore")
        cleaned = de_mojibake_and_strip_emoji(original)
        if cleaned != original:
            path.write_text(cleaned, encoding="utf-8")
            changed.append(path.name)
    if changed:
        print("Updated:", ", ".join(changed))
    else:
        print("No changes needed.")


if __name__ == "__main__":
    main()
