from pathlib import Path

root = Path(__file__).parent / "content" / "lists"

LEVEL_NAMES = {
    0: "Cantrips",
    1: "1st-Level",
    2: "2nd-Level",
    3: "3rd-Level",
    4: "4th-Level",
    5: "5th-Level",
    6: "6th-Level",
    7: "7th-Level",
    8: "8th-Level",
    9: "9th-Level",
}


def make_spell_base(class_name: str, max_level: int, include_cantrips: bool) -> str:
    levels = list(range(0 if include_cantrips else 1, max_level + 1))
    views = [
        f"""  - type: table
    name: All {class_name} Spells
    groupBy:
      property: level
      direction: ASC
    order: [formula.Name, school, casting_time, concentration, source]
    sort:
      - property: level
        direction: ASC
      - property: file.name
        direction: ASC"""
    ]
    for lvl in levels:
        extra = (
            "    order: [formula.Name, school, casting_time]"
            if lvl == 0
            else "    order: [formula.Name, school, concentration]"
        )
        views.append(
            f"""  - type: table
    name: {LEVEL_NAMES[lvl]}
    filters:
      and:
        - level == {lvl}
{extra}
    sort:
      - property: file.name
        direction: ASC"""
        )
    return f'''filters:
  and:
    - file.inFolder("spells")
    - file.name != "index"
    - classes.contains("{class_name}")
formulas:
  Name: file.asLink(title)
properties:
  formula.Name:
    displayName: Name
  level:
    displayName: Level
  school:
    displayName: School
  casting_time:
    displayName: Casting time
  concentration:
    displayName: Concentration
  source:
    displayName: Source
views:
''' + "\n".join(views) + "\n"


specs = [
    ("bard-spells.base", "Bard", 9, True),
    ("cleric-spells.base", "Cleric", 9, True),
    ("druid-spells.base", "Druid", 9, True),
    ("paladin-spells.base", "Paladin", 5, False),
    ("ranger-spells.base", "Ranger", 5, False),
    ("sorcerer-spells.base", "Sorcerer", 9, True),
    ("warlock-spells.base", "Warlock", 9, True),
    ("wizard-spells.base", "Wizard", 9, True),
]

for fname, cls, mx, can in specs:
    path = root / fname
    path.write_text(make_spell_base(cls, mx, can), encoding="utf-8")
    print("wrote", path)
