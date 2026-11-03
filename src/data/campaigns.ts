import { CampaignInfo } from '../types';

export const CAMPAIGNS: CampaignInfo[] = [
  {
    id: 'ra-golvek',
    name: "Ra Gol'vek",
    tagline: 'Coastal intrigue, ancient magic, and supernatural threats',
    description: "Ra Gol'vek is a coastal realm caught between ancient tides of forgotten magic, fierce merchant guilds, and eldritch whispers rising from beneath the abyssal trenches. The kingdom faces political turmoil as ancient sunken ruins begin to resurface along the shores.",
    theme: 'Maritime adventure, political scheming, and coastal eldritch mystery.',
    setting: "Kingdom of Ra Gol'vek, Sapphire Coast, and the Whispering Archipelago.",
    calendarName: "Gol'vek Solar Calendar",
    currentDate: "14th of Flamerule, 1248 Year of the Crest",
    sessions: [
      {
        number: 1,
        title: "The Sinking of the Maiden's Hope",
        date: "1248-04-02",
        summary: "The party awakened on the driftwood shores of Oakhaven after a mysterious squall wrecked their merchant vessel. They encountered strange amphibious creatures wearing ancient brass talismans.",
        characters: ["Captain Theresa", "Corin the Archivist"],
        locations: ["Port Oakhaven", "Whisper Cliffs"],
        loot: ["Brass Talisman of the Deep", "50 Gold Sovereigns", "Navigator's Spyglass"]
      },
      {
        number: 2,
        title: "Secrets of the Harbor Guild",
        date: "1248-04-08",
        summary: "Investigating the drowned sailor markings, the adventurers uncovered a conspiracy linking high-ranking dock wardens with the clandestine Cult of the Trench.",
        characters: ["Lord Alden", "Sister Martha"],
        locations: ["Port Oakhaven", "Sunken Spire"],
        loot: ["Letter with Guild Crest", "Dagger of Venom", "Scroll of Water Breathing"]
      },
      {
        number: 3,
        title: "The Descent into Sunken Spire",
        date: "1248-04-14",
        summary: "Venturing into the partially submerged obelisk at low tide, the adventurers activated the planetary tide mechanism and stopped an impending tidal surge.",
        characters: ["Corin the Archivist", "High Tide Priestess Varis"],
        locations: ["Sunken Spire", "Sunless Basin"],
        loot: ["Ring of Water Elemental Command", "Pearl of Power"]
      }
    ],
    characters: [
      {
        name: "Lord Alden",
        role: "High Warden of Oakhaven Harbor",
        faction: "Naval Admiralty",
        status: "Alive",
        summary: "Stern nobleman guarding the crown's commercial interests, distrustful of sorcery.",
        details: "A veteran naval commander who suspects his own inner circle has been infiltrated by aquatic cultists. Offers bounties for relics recovered from the Trench."
      },
      {
        name: "Captain Theresa",
        role: "Corsair Captain of 'The Sea Wyrm'",
        faction: "Free Mariners",
        status: "Alive",
        summary: "Charismatic privateer with deep knowledge of coastal navigation and treacherous reefs.",
        details: "Saved the party's surviving crew members during the tempest. Values loyalty and silver above all kingdom laws."
      },
      {
        name: "Corin the Archivist",
        role: "Scholar of Pre-Crest Dynasties",
        faction: "College of Antiquities",
        status: "Alive",
        summary: "Obsessive historian translating runes from the Sunken Spire.",
        details: "Provides the party with vital lore decrypting ancient texts, deciphering maritime curses, and identifying anomalous magic items."
      },
      {
        name: "Sister Martha",
        role: "Priestess of the Beacon",
        faction: "Order of the Vigilant Lighthouse",
        status: "Alive",
        summary: "Cleric maintaining the perpetual holy light guiding ships safely into port.",
        details: "Offers healing and sanctuary to injured adventurers, warning that darkness creeps closer when the Beacon's flames waver."
      }
    ],
    locations: [
      {
        name: "Port Oakhaven",
        type: "Major City & Fortified Harbor",
        summary: "The bustling economic gateway of Ra Gol'vek, known for stone docks, crowded markets, and towering lighthouses.",
        significance: "Party base of operations, supplies, shipwrights, and trade hub."
      },
      {
        name: "Sunken Spire",
        type: "Ancient Submerged Ruin",
        summary: "A colossal crystalline obelisk that rises from the sea during spring low tides, brimming with forgotten sorcery.",
        significance: "Site of the mysterious tidal engine and abyssal guardian beasts."
      },
      {
        name: "Whisper Cliffs",
        type: "Haunted Coastline",
        summary: "Sheer sea cliffs honeycombed with natural sea caves and pirate hideaways, known for phantom sirens.",
        significance: "Smuggling tunnels and entrance to coastal goblin enclaves."
      }
    ],
    houseRules: [
      {
        title: "Tides of the Arcane",
        category: "spellcasting",
        summary: "Water and lightning spells gain +1 to save DC when cast in or on the open ocean.",
        text: "Due to the heightened elemental resonance along the Sapphire Coast, any spell dealing cold, lightning, or acid damage, or that manipulates water currents, gains a +1 bonus to its spell save DC when cast within 1 mile of the sea."
      },
      {
        title: "Maritime Survival & Exhaustion",
        category: "adventuring",
        summary: "Swimming in heavy armor without magical aid inflicts disadvantage on Athletics checks after 10 minutes.",
        text: "Characters wearing heavy armor who end their turn fully submerged without a swim speed sink 20 feet and must pass a DC 13 Constitution saving throw each minute or incur 1 level of exhaustion."
      }
    ]
  },
  {
    id: 'vyrun',
    name: "Vyrun",
    tagline: "Frontier exploration, survival, and mysteries in untamed lands",
    description: "Vyrun is a rugged frontier continent of unforgiving mountain peaks, dense ancient forests, and volcanic calderas. Brave pioneers, exiles, and seekers of lost empires risk everything to map its uncharted territories.",
    theme: "Frontier survival, exploration, ancient constructs, and untamed wilderness.",
    setting: "The Vyrun Expanse, Thunder Peaks, and the Ironfall Caldera.",
    calendarName: "Frontier Seasonal Reckoning",
    currentDate: "28th of Frostfall, 3rd Pioneer Era",
    sessions: [
      {
        number: 1,
        title: "Beyond Outpost Seven",
        date: "Year 3-10-12",
        summary: "The expedition departed the safety of Outpost Seven to map the mist-covered Ashwood. They repelled an ambush by mutated forest dire wolves.",
        characters: ["Scout Varek", "High Warden Selise"],
        locations: ["Outpost 7", "Ashwood Forest"],
        loot: ["Rations (10 days)", "Dire Wolf Pelts", "Ironwood Longbow"]
      },
      {
        number: 2,
        title: "The Clanking Tomb of Bronn",
        date: "Year 3-10-18",
        summary: "Inside an abandoned forge complex, the group discovered a still-functioning clockwork automaton preserving the blueprints of a lost dwarven bastion.",
        characters: ["Master Bronn", "Construct Unit 09"],
        locations: ["Ironfall Caverns", "Lost Forge"],
        loot: ["Mithral Ingot (x4)", "Adamantine Armor", "Schematic of the Great Mill"]
      }
    ],
    characters: [
      {
        name: "High Warden Selise",
        role: "Commander of Frontier Vanguard",
        faction: "Settler Council",
        status: "Alive",
        summary: "Pragmatic ranger and commander who enforces frontier discipline and rationing.",
        details: "Directs scouting expeditions, handles treaties with indigenous beastfolk, and ensures outpost defenses survive the brutal winters."
      },
      {
        name: "Scout Varek",
        role: "Lead Pathfinder",
        faction: "Wilderness Scouts",
        status: "Alive",
        summary: "Expert tracker with an uncanny instinct for spotting planar anomalies and predator nests.",
        details: "Guides the party through uncharted passes, warning them of unstable tectonic rifts and territorial wyverns."
      },
      {
        name: "Master Bronn",
        role: "Expedition Artificer & Blacksmith",
        faction: "Ironwright Guild",
        status: "Alive",
        summary: "Gruff craftsman seeking ancient ores and primordial power conduits.",
        details: "Upgrades weapons and repairs damaged magical equipment using rare ore harvested from the Dread Caldera."
      }
    ],
    locations: [
      {
        name: "Outpost 7",
        type: "Frontier Stronghold",
        summary: "The outermost fortified perimeter post holding back the savage wilderness creatures of Vyrun.",
        significance: "Trading post, tavern, bounty board, and staging grounds."
      },
      {
        name: "Ironfall Caverns",
        type: "Subterranean Forge Complex",
        summary: "Cavernous underground tunnels filled with molten basalt, clockwork remnants, and rich veins of adamantine.",
        significance: "Source of high-grade smithing materials and ancient defense constructs."
      },
      {
        name: "Dread Caldera",
        type: "Active Volcanic Plateau",
        summary: "Smoldering caldera rumored to house the dormant egg of an ancient cataclysmic dragon.",
        significance: "Dangerous end-game exploration territory filled with magma mephits and fire elementals."
      }
    ],
    houseRules: [
      {
        title: "Harsh Wilderness Foraging",
        category: "adventuring",
        summary: "Survival checks to forage in the deep wilderness require a DC 15 check during winter months.",
        text: "Failure on a wilderness foraging check requires consuming expedition iron rations or taking a level of exhaustion from caloric deficit in freezing conditions."
      },
      {
        title: "Relic Overcharge",
        category: "campaign_rule",
        summary: "Ancient relics harvested in Vyrun can be overloaded once per long rest for double effectiveness at risk of breaking.",
        text: "When rolling a 1 on an overcharged relic activation, the device expends all charges and becomes inert until repaired by a master artificer."
      }
    ]
  },
  {
    id: 'curse-of-strahd',
    name: "Curse of Strahd",
    tagline: "Gothic horror in the mist-shrouded realm of Barovia",
    description: "Trapped behind impenetrable mists, the desolate land of Barovia is gripped in perpetual twilight under the iron fist of Strahd von Zarovich. Vampires, werewolves, ghosts, and dark powers tempt or torment any outsider daring enough to defy the Darklord.",
    theme: "Gothic horror, dread, psychological tension, and vampire hunting.",
    setting: "Barovia, Castle Ravenloft, Mount Baratok, and Lake Zarovich.",
    calendarName: "Barovian Calendar",
    currentDate: "13th of Barov, Count's Reign 735",
    sessions: [
      {
        number: 1,
        title: "Into the Mists",
        date: "735-01-04",
        summary: "After receiving a desperate plea letter from the Burgomaster of Barovia, the party entered the mist-choked woods and encountered the eerie haunted mansion of Death House.",
        characters: ["Ireena Kolyana", "Ismark Kolyanovich"],
        locations: ["Village of Barovia", "Death House"],
        loot: ["Silver Dagger", "Cloak of Protection", "Deed to the Mill"]
      },
      {
        number: 2,
        title: "The Tarokka Reading of Madam Eva",
        date: "735-01-08",
        summary: "At Tser Pool Encampment, Madam Eva laid down the cards of destiny, revealing the locations of the Holy Symbol of Ravenkind, the Sunsword, and the Tome of Strahd.",
        characters: ["Madam Eva", "Father Donavich"],
        locations: ["Tser Pool Encampment", "Church of Barovia"],
        loot: ["Tarokka Deck Clues", "Holy Water (3 vials)", "Potion of Healing"]
      },
      {
        number: 3,
        title: "Shadows over Vallaki",
        date: "735-01-14",
        summary: "Arriving at the walled town of Vallaki, the adventurers became entangled in the tyrannical Baron Vallakovich's mandatory 'All Will Be Well' festival and the Feast of St. Andral.",
        characters: ["Rictavio (Rudolph van Richten)", "Baron Vallakovich"],
        locations: ["Vallaki", "Blue Water Inn", "St. Andral's Church"],
        loot: ["Bones of St. Andral", "Wand of Magic Missiles"]
      }
    ],
    characters: [
      {
        name: "Strahd von Zarovich",
        role: "Darklord and Vampire Count of Barovia",
        faction: "House von Zarovich",
        status: "Alive",
        summary: "Master of Castle Ravenloft, supreme tyrant, tactical genius, and ancient vampire.",
        details: "Views Barovia as his personal playground and prison. Pursues Ireena Kolyana with relentless obsession while testing the party's mettle and morality."
      },
      {
        name: "Ireena Kolyana",
        role: "Target of Strahd's Affection",
        faction: "Barovian Townsfolk",
        status: "Alive",
        summary: "Adopted daughter of the late Burgomaster Kolyan, marked by Strahd's bite.",
        details: "Determined noblewoman with martial training who refuses to surrender her soul to Castle Ravenloft. Key party companion."
      },
      {
        name: "Madam Eva",
        role: "Vistani Seer & Fortune Teller",
        faction: "Vistani",
        status: "Alive",
        summary: "Ancient mystic at Tser Pool capable of revealing the secrets of Strahd's demise.",
        details: "Performs the Tarokka reading that guides the adventurers to legendary artifacts needed to slay the vampire lord."
      },
      {
        name: "Rudolph van Richten (Rictavio)",
        role: "Legendary Monster Hunter",
        faction: "Independent",
        status: "Alive",
        summary: "Veteran vampire slayer undercover as a flamboyant carnival ringmaster.",
        details: "Possesses extensive encyclopedic knowledge of undead weaknesses, fiendish psychology, and holy weapons."
      }
    ],
    locations: [
      {
        name: "Castle Ravenloft",
        type: "Gothic Citadel & Vampire Stronghold",
        summary: "A terrifying fortress perched atop a 1,000-foot spire of rock, housing catacombs, crypts, and Strahd's throne.",
        significance: "Final battleground, resting place of Sergei's tomb, and the Heart of Sorrow."
      },
      {
        name: "Village of Barovia",
        type: "Desolate Settlement",
        summary: "Dismal village under the direct shadow of Ravenloft, filled with despairing citizens and wailing spirits.",
        significance: "Starting town, home of Ireena and Ismark, and site of the haunted church."
      },
      {
        name: "Vallaki",
        type: "Walled Town",
        summary: "Larger fortified settlement governed by a paranoid Burgomaster who forces mandatory festivals to ward off despair.",
        significance: "Social intrigue hub, Blue Water Inn, wereravens, and St. Andral's church."
      },
      {
        name: "Amber Temple",
        type: "Forgotten Mountain Sanctuary",
        summary: "Ancient temple carved into the snowy peaks of Mount Baratok, sealing dark vestiges of cosmic evil.",
        significance: "Source of dark gifts, lich's library, and supreme forbidden magic."
      }
    ],
    houseRules: [
      {
        title: "Alterations to Magic in Barovia",
        category: "spellcasting",
        summary: "Spells cannot leave Barovia's borders. Planar travel fails. Divination is intercepted by Strahd.",
        text: "The Mists of Barovia prevent any entity from contacting deities or planes outside Barovia. Teleportation, Plane Shift, and Astral Projection fail. Strahd senses whenever a spellcaster uses divination spells like Scrying or Commune, and can choose to speak as the respondent or redirect the vision. In addition, spells that summon creatures summon bats, ravens, wolves, or skeletal steeds instead of normal celestial or fey beasts."
      },
      {
        title: "Undead Resiliency & Sunlight",
        category: "combat",
        summary: "Sunlight is only generated by specific holy artifacts (Sunsword, Holy Symbol of Ravenkind); natural sun is always clouded.",
        text: "Because Barovia's sky is choked with eternal twilight mists, standard daylight does not count as natural sunlight for vampire vulnerabilities. Only the Sunsword and Holy Symbol emit genuine sunlight."
      }
    ]
  }
];
