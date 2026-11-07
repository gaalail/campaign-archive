---
entity_type: character_option
canonical_id: character_option.character-options.subclasses.primal.bone-binder
edition: "2014"
adaptation: curated
license_status: CC-BY-4.0
title: "Bone Binder"
parent_class: Primal
summary: "Recycles the remains of the fallen to forge macabre bone armor, command a companion bone construct, and open grasping skeletal graves."
source: "Curated Supplement"
source_type: third-party
content_status: complete
---

# Bone Binder

*Commanding the dark powers of the fallen, a Bone Binder Primal watches over the final silence of mortal life, binding bone into armor, weapons, and crushing constructs.*

Solemn and grim, Bone Binder Primals view skeletons and remains not with disgust, but as sacred physical resources of the natural cycle. They forge suits of macabre bone plating, conjure towering skeletal servitors from the soil, and drag enemies into earthen tombs of grasping bony arms.

---

## Primal Bond Features

| Primal Level | Features |
| :---: | :--- |
| **1st** | Bone Construct, Macabre Mantle, Innate Magic |
| **3rd** | Bone Emissary, Bonded Endurance |
| **7th** | Unearthed Titan, Unliving Resilience |
| **14th** | Grave Grip |
| **17th** | Death's Domain |

---

### Bone Construct
*1st-level Bone Binder feature*

Starting at 1st level, as an action, you can call forth a grim construct of bones that bursts from the ground in an unoccupied space within 10 feet of you.

The construct shares your turn in initiative. It cannot take actions unless you use your action to command it to take the Dodge or Dash action, or an action from its stat block. When you gain the **Extra Attack** feature at 5th level, you can replace one of your own attacks with commanding your Bone Construct to act. Outside of combat, it obeys simple commands.

If the construct is ever more than 120 feet from you or reduced to 0 hit points, it crumbles to dust. You can dismiss it at any time as a bonus action. Its hit points are maintained between summons; if destroyed, it returns with hit points equal to your Primal level when re-summoned, and regains all hit points when you complete a long rest. 

Its Slam damage die increases in size with any feature that increases your natural weapon damage dice.

```statblock
monster: Bone Construct
size: Medium
type: Undead
alignment: Unaligned
ac: 12 + your PB
hp: 5 × your Primal level
speed: 30 ft.
stats: [16, 12, 14, 1, 10, 5]
damage_vulnerabilities: bludgeoning
damage_resistances: piercing, necrotic
damage_immunities: poison, psychic
condition_immunities: exhaustion
senses: darkvision 60 ft., passive Perception 10
languages: understands languages you speak
traits:
  - name: Primal Strength
    desc: "The construct's Strength score is equal to your Strength or Wisdom score (your choice)."
actions:
  - name: Slam
    desc: "Melee Weapon Attack: your spell/attack modifier to hit, reach 5 ft., one target. Hit: 1d8 + your construct's STR modifier bludgeoning damage."
  - name: Grapple
    desc: "The Bone Construct makes a grapple or shove check against a target within 5 feet."
```

---

### Macabre Mantle
*1st-level Bone Binder feature*

At 1st level, if your armor is damaged, you can repair it using the bones of a Medium or larger corpse. 

You can also forge entirely new armor this way: the created armor can be any mundane armor with a maximum market value of **100 × your Primal level in gp** (usable only by you). 

While wearing armor created this way or integrated with your **Mystic Bulwark**, you gain proficiency in the **Intimidation** skill.

---

### Innate Magic
*1st-level Bone Binder feature*

You gain access to several innate magical abilities by channeling your primal connection. You gain the following spells at the listed Primal levels, and can cast each spell once without material components or spell slots (regained on a long rest). 

Wisdom is your spellcasting ability for these spells. You can cast a spell again before completing a long rest by spending **1 + the level of the spell** Endurance Dice (except *animate dead*, which cannot be recast early using dice).

| Primal Level | Innate Spells (1/Long Rest Each) |
| :---: | :--- |
| **1st** | *grip of the dead* |
| **3rd** | *false life* |
| **5th** | *augury* |
| **9th** | *speak with dead* |
| **13th** | *animate dead* |
| **17th** | *ribcage* |

---

### Bone Emissary
*3rd-level Bone Binder feature*

Starting at 3rd level, your Bone Construct gains its own **Primal Interdiction** radiating out to a 5-foot radius. 

When you recklessly defend your allies within your Primal Interdiction, your Bone Construct does the same for any allies within its aura.

---

### Bonded Endurance
*3rd-level Bone Binder feature*

Additionally at 3rd level, you can expend Endurance Dice to reduce damage taken by your Bone Construct. When you do so, you gain temporary hit points equal to the value rolled. 

Conversely, whenever you use an Endurance Die to reduce damage taken by yourself, your Bone Construct gains temporary hit points equal to the value rolled.

---

### Unearthed Titan
*7th-level Bone Binder feature*

Starting at 7th level, your Bone Construct gains the following upgrades:
- **Large Size:** You can summon it as a Large creature.
- **Immediate Commands:** When you use your action to summon it, you can use a bonus action to command it to take an action immediately.
- **Magical Attacks:** Its attacks count as magical for overcoming resistance and immunity to nonmagical attacks.

---

### Unliving Resilience
*7th-level Bone Binder feature*

Additionally at 7th level, you gain resistance to your choice of **cold, necrotic, or poison damage**. 

You also gain advantage on saving throws against poison and disease, and you can survive twice as long without breathing, eating, or sleeping before suffering exhaustion.

---

### Grave Grip
*14th-level Bone Binder feature*

Starting at 14th level, as an action, you can call forth grasping skeletal hands from the earth. 

All Large or smaller creatures of your choice within your Primal Interdiction (or your construct's interdiction) must make a Dexterity saving throw (DC = 8 + your Strength or Wisdom modifier + your proficiency bonus). On a failure, a creature is **restrained** by a skeletal hand (AC 13, 13 hit points, vulnerable to bludgeoning damage). A restrained creature takes **3d6 necrotic damage** if it ends its turn while grappled in this manner.

Once you use this feature, you cannot use it again until you complete a short or long rest.

---

### Death's Domain
*17th-level Bone Binder feature*

Starting at 17th level, as a bonus action, you can project an aura of final repose for 1 minute:
- **Expanded Domain:** The radius of your Primal Interdiction is doubled.
- **Spare the Dying:** If an allied creature drops to 0 hit points within your Primal Interdiction, you can cast *spare the dying* on them as a reaction from any distance within range.
- **Boneyard:** Skeletal allies and constructs (including your Bone Construct, hands from Grave Grip, and undead from *animate dead*) gain resistance to all damage while within your Primal Interdiction.

Once you invoke this domain, you cannot do so again until you complete a long rest.
