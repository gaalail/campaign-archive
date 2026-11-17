import { CharacterState, AbilityKey, AbilityMode, CustomAttack, INITIAL_CHARACTER_STATE } from './types';

export type CharacterAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_GENDER_OR_TITLE'; payload: string }
  | { type: 'SET_ALIGNMENT'; payload: string }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'SELECT_RACE'; payload: string | null }
  | { type: 'SELECT_SUBRACE'; payload: string | null }
  | { type: 'SELECT_CLASS'; payload: string | null }
  | { type: 'SELECT_SUBCLASS'; payload: string | null }
  | { type: 'SELECT_BACKGROUND'; payload: string | null }
  | { type: 'SELECT_FEAT'; payload: string | null }
  | { type: 'TOGGLE_FEAT'; payload: string }
  | { type: 'SET_FEAT_ABILITY_CHOICE'; payload: { featId: string; ability: AbilityKey } }
  | { type: 'SELECT_FIGHTING_STYLE'; payload: string | null }
  | { type: 'TOGGLE_CLASS_OPTION'; payload: string }
  | { type: 'TOGGLE_SPELL'; payload: string }
  | { type: 'SET_SPELLCASTING_ABILITY'; payload: AbilityKey | null }
  | { type: 'SELECT_CAMPAIGN'; payload: string | null }
  | { type: 'SELECT_DEITY'; payload: string | null }
  | { type: 'SET_ABILITY_MODE'; payload: AbilityMode }
  | { type: 'SET_ASI_SYSTEM'; payload: 'racial' | 'flexible' }
  | { type: 'SET_BASE_ABILITY'; payload: { ability: AbilityKey; score: number } }
  | { type: 'SET_ALL_BASE_ABILITIES'; payload: Record<AbilityKey, number> }
  | { type: 'SET_RACIAL_BONUS'; payload: { type: 'primary' | 'secondary'; ability: AbilityKey } }
  | { type: 'SET_RACIAL_CHOICE_ABILITIES'; payload: AbilityKey[] }
  | { type: 'TOGGLE_RACIAL_SKILL'; payload: { skill: string; max: number } }
  | { type: 'TOGGLE_CLASS_SKILL'; payload: { skill: string; max: number } }
  | { type: 'TOGGLE_BACKGROUND_SKILL'; payload: { skill: string; max: number; groupPool?: string[]; groupMax?: number } }
  | { type: 'TOGGLE_APPLY_BACKGROUND_GEAR' }
  | { type: 'TOGGLE_INCLUDE_SUBCLASS_SPELLS' }
  | { type: 'TOGGLE_SKILL'; payload: string }
  | { type: 'TOGGLE_SKILL_EXPERTISE'; payload: string }
  | { type: 'SET_SKILLS'; payload: string[] }
  | { type: 'SET_ARMOR'; payload: string }
  | { type: 'TOGGLE_SHIELD' }
  | { type: 'SET_HP_BONUS'; payload: number }
  | { type: 'SET_CURRENT_HP'; payload: number | null }
  | { type: 'SET_TEMP_HP'; payload: number }
  | { type: 'TOGGLE_SPELL_SLOT'; payload: { level: number; slotIndex: number } }
  | { type: 'LONG_REST' }
  | { type: 'ADD_EQUIPMENT'; payload: string }
  | { type: 'REMOVE_EQUIPMENT'; payload: number }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_ATTACK'; payload: CustomAttack }
  | { type: 'REMOVE_ATTACK'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<CharacterState> }
  | { type: 'RESET' };

function normalizeLoadedState(raw: Partial<CharacterState>): CharacterState {
  const merged: CharacterState = {
    ...INITIAL_CHARACTER_STATE,
    ...raw,
    baseAbilities: {
      ...INITIAL_CHARACTER_STATE.baseAbilities,
      ...(raw.baseAbilities || {})
    },
    racialBonuses: {
      ...INITIAL_CHARACTER_STATE.racialBonuses,
      ...(raw.racialBonuses || {})
    },
    asiSystem: raw.asiSystem === 'flexible' ? 'flexible' : 'racial',
    racialChoiceAbilities: Array.isArray(raw.racialChoiceAbilities) ? raw.racialChoiceAbilities : [],
    racialSkillChoices: Array.isArray(raw.racialSkillChoices) ? raw.racialSkillChoices : [],
    featAbilityChoices: raw.featAbilityChoices && typeof raw.featAbilityChoices === 'object' ? raw.featAbilityChoices : {},
    classSkillChoices: Array.isArray(raw.classSkillChoices) ? raw.classSkillChoices : [],
    backgroundSkillChoices: Array.isArray(raw.backgroundSkillChoices) ? raw.backgroundSkillChoices : [],
    applyBackgroundGear: typeof raw.applyBackgroundGear === 'boolean' ? raw.applyBackgroundGear : true,
    includeSubclassSpells: typeof raw.includeSubclassSpells === 'boolean' ? raw.includeSubclassSpells : true,
    selectedSkills: Array.isArray(raw.selectedSkills) ? raw.selectedSkills : [],
    expertSkills: Array.isArray(raw.expertSkills) ? raw.expertSkills : [],
    selectedClassOptionIds: Array.isArray(raw.selectedClassOptionIds) ? raw.selectedClassOptionIds : [],
    selectedSpellIds: Array.isArray(raw.selectedSpellIds) ? raw.selectedSpellIds : [],
    equipment: Array.isArray(raw.equipment) ? raw.equipment : INITIAL_CHARACTER_STATE.equipment,
    customAttacks: Array.isArray(raw.customAttacks) ? raw.customAttacks : [],
    usedSpellSlots: raw.usedSpellSlots && typeof raw.usedSpellSlots === 'object' ? raw.usedSpellSlots : {},
    level: Math.max(1, Math.min(20, Number(raw.level) || 1)),
    step: Math.max(1, Math.min(6, Number(raw.step) || 1))
  };

  if (Array.isArray(raw.selectedFeatIds) && raw.selectedFeatIds.length > 0) {
    merged.selectedFeatIds = raw.selectedFeatIds;
    merged.featId = raw.selectedFeatIds[0];
  } else if (raw.featId) {
    merged.selectedFeatIds = [raw.featId];
    merged.featId = raw.featId;
  } else {
    merged.selectedFeatIds = [];
    merged.featId = null;
  }

  return merged;
}

export function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: Math.max(1, Math.min(6, action.payload)) };

    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_GENDER_OR_TITLE':
      return { ...state, genderOrTitle: action.payload };

    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload };

    case 'SET_LEVEL': {
      const nextLevel = Math.max(1, Math.min(20, action.payload || 1));
      return { ...state, level: nextLevel, currentHp: null };
    }

    case 'SELECT_RACE':
      if (state.raceId === action.payload) return state;
      return {
        ...state,
        raceId: action.payload,
        subrace: null,
        racialChoiceAbilities: [],
        racialSkillChoices: []
      };

    case 'SELECT_SUBRACE':
      return {
        ...state,
        subrace: action.payload,
        racialChoiceAbilities: [],
        racialSkillChoices: []
      };

    case 'SELECT_CLASS':
      if (state.classId === action.payload) return state;
      return {
        ...state,
        classId: action.payload,
        subclassId: null,
        selectedClassOptionIds: [],
        classSkillChoices: [],
        spellcastingAbilityOverride: null,
        currentHp: null,
        usedSpellSlots: {}
      };

    case 'SELECT_SUBCLASS':
      return { ...state, subclassId: action.payload };

    case 'SELECT_BACKGROUND':
      if (state.backgroundId === action.payload) return state;
      return {
        ...state,
        backgroundId: action.payload,
        backgroundSkillChoices: []
      };

    case 'SELECT_FEAT': {
      if (!action.payload) {
        return { ...state, featId: null, selectedFeatIds: [], featAbilityChoices: {} };
      }
      const next = state.selectedFeatIds.includes(action.payload)
        ? state.selectedFeatIds
        : [action.payload, ...state.selectedFeatIds.slice(1)];
      return { ...state, featId: next[0] || null, selectedFeatIds: next };
    }

    case 'TOGGLE_FEAT': {
      const exists = state.selectedFeatIds.includes(action.payload);
      const next = exists
        ? state.selectedFeatIds.filter(id => id !== action.payload)
        : [...state.selectedFeatIds, action.payload];
      const nextChoices = { ...state.featAbilityChoices };
      if (exists) delete nextChoices[action.payload];
      return {
        ...state,
        selectedFeatIds: next,
        featId: next[0] || null,
        featAbilityChoices: nextChoices
      };
    }

    case 'SET_FEAT_ABILITY_CHOICE':
      return {
        ...state,
        featAbilityChoices: {
          ...state.featAbilityChoices,
          [action.payload.featId]: action.payload.ability
        }
      };

    case 'SELECT_FIGHTING_STYLE':
      return { ...state, selectedFightingStyleId: action.payload };

    case 'TOGGLE_CLASS_OPTION': {
      const exists = state.selectedClassOptionIds.includes(action.payload);
      return {
        ...state,
        selectedClassOptionIds: exists
          ? state.selectedClassOptionIds.filter(id => id !== action.payload)
          : [...state.selectedClassOptionIds, action.payload]
      };
    }

    case 'TOGGLE_SPELL': {
      const exists = state.selectedSpellIds.includes(action.payload);
      return {
        ...state,
        selectedSpellIds: exists
          ? state.selectedSpellIds.filter(id => id !== action.payload)
          : [...state.selectedSpellIds, action.payload]
      };
    }

    case 'SET_SPELLCASTING_ABILITY':
      return { ...state, spellcastingAbilityOverride: action.payload };

    case 'SELECT_CAMPAIGN':
      return {
        ...state,
        campaignId: action.payload,
        deityId: null
      };

    case 'SELECT_DEITY':
      return { ...state, deityId: action.payload };

    case 'SET_ABILITY_MODE':
      return { ...state, abilityMode: action.payload };

    case 'SET_ASI_SYSTEM':
      return { ...state, asiSystem: action.payload };

    case 'SET_BASE_ABILITY':
      return {
        ...state,
        baseAbilities: {
          ...state.baseAbilities,
          [action.payload.ability]: action.payload.score
        }
      };

    case 'SET_ALL_BASE_ABILITIES':
      return {
        ...state,
        baseAbilities: {
          ...action.payload
        }
      };

    case 'SET_RACIAL_BONUS':
      return {
        ...state,
        racialBonuses: {
          ...state.racialBonuses,
          [action.payload.type]: action.payload.ability
        }
      };

    case 'SET_RACIAL_CHOICE_ABILITIES':
      return { ...state, racialChoiceAbilities: action.payload };

    case 'TOGGLE_RACIAL_SKILL': {
      const { skill, max } = action.payload;
      const exists = state.racialSkillChoices.includes(skill);
      if (exists) {
        return { ...state, racialSkillChoices: state.racialSkillChoices.filter(s => s !== skill) };
      }
      if (state.racialSkillChoices.length >= max) {
        return { ...state, racialSkillChoices: [...state.racialSkillChoices.slice(1), skill] };
      }
      return { ...state, racialSkillChoices: [...state.racialSkillChoices, skill] };
    }

    case 'TOGGLE_CLASS_SKILL': {
      const { skill, max } = action.payload;
      const exists = state.classSkillChoices.includes(skill);
      if (exists) {
        return { ...state, classSkillChoices: state.classSkillChoices.filter(s => s !== skill) };
      }
      if (state.classSkillChoices.length >= max) {
        return { ...state, classSkillChoices: [...state.classSkillChoices.slice(1), skill] };
      }
      return { ...state, classSkillChoices: [...state.classSkillChoices, skill] };
    }

    case 'TOGGLE_BACKGROUND_SKILL': {
      const { skill, max, groupPool, groupMax } = action.payload;
      const exists = state.backgroundSkillChoices.includes(skill);
      if (exists) {
        return { ...state, backgroundSkillChoices: state.backgroundSkillChoices.filter(s => s !== skill) };
      }
      let next = [...state.backgroundSkillChoices];
      if (groupPool && groupMax && groupMax === 1) {
        // Swap within same pool group (e.g. Martyr Scholarly vs Devout)
        next = next.filter(s => !groupPool.includes(s));
      } else if (next.length >= max) {
        next = next.slice(1);
      }
      return { ...state, backgroundSkillChoices: [...next, skill] };
    }

    case 'TOGGLE_APPLY_BACKGROUND_GEAR':
      return { ...state, applyBackgroundGear: !state.applyBackgroundGear };

    case 'TOGGLE_INCLUDE_SUBCLASS_SPELLS':
      return { ...state, includeSubclassSpells: !state.includeSubclassSpells };

    case 'TOGGLE_SKILL': {
      const exists = state.selectedSkills.includes(action.payload);
      return {
        ...state,
        selectedSkills: exists
          ? state.selectedSkills.filter(s => s !== action.payload)
          : [...state.selectedSkills, action.payload],
        expertSkills: exists
          ? state.expertSkills.filter(s => s !== action.payload)
          : state.expertSkills
      };
    }

    case 'TOGGLE_SKILL_EXPERTISE': {
      const isExpert = state.expertSkills.includes(action.payload);
      const isProf = state.selectedSkills.includes(action.payload);
      if (isExpert) {
        return {
          ...state,
          expertSkills: state.expertSkills.filter(s => s !== action.payload)
        };
      }
      return {
        ...state,
        selectedSkills: isProf ? state.selectedSkills : [...state.selectedSkills, action.payload],
        expertSkills: [...state.expertSkills, action.payload]
      };
    }

    case 'SET_SKILLS':
      return { ...state, selectedSkills: action.payload };

    case 'SET_ARMOR':
      return { ...state, customArmor: action.payload };

    case 'TOGGLE_SHIELD':
      return { ...state, shieldEquipped: !state.shieldEquipped };

    case 'SET_HP_BONUS':
      return { ...state, hpModifierBonus: action.payload, currentHp: null };

    case 'SET_CURRENT_HP':
      return { ...state, currentHp: action.payload };

    case 'SET_TEMP_HP':
      return { ...state, tempHp: Math.max(0, action.payload) };

    case 'TOGGLE_SPELL_SLOT': {
      const { level, slotIndex } = action.payload;
      const currentUsed = state.usedSpellSlots[level] || 0;
      const nextUsed = slotIndex < currentUsed ? slotIndex : slotIndex + 1;
      return {
        ...state,
        usedSpellSlots: {
          ...state.usedSpellSlots,
          [level]: Math.max(0, nextUsed)
        }
      };
    }

    case 'LONG_REST':
      return {
        ...state,
        currentHp: null,
        tempHp: 0,
        usedSpellSlots: {}
      };

    case 'ADD_EQUIPMENT': {
      const item = action.payload.trim();
      if (!item) return state;
      return {
        ...state,
        equipment: [...state.equipment, item]
      };
    }

    case 'REMOVE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.filter((_, idx) => idx !== action.payload)
      };

    case 'SET_NOTES':
      return { ...state, notes: action.payload };

    case 'ADD_ATTACK':
      return {
        ...state,
        customAttacks: [...state.customAttacks, action.payload]
      };

    case 'REMOVE_ATTACK':
      return {
        ...state,
        customAttacks: state.customAttacks.filter(a => a.id !== action.payload)
      };

    case 'LOAD_STATE':
      return normalizeLoadedState(action.payload);

    case 'RESET':
      return {
        ...INITIAL_CHARACTER_STATE,
        step: 1
      };

    default:
      return state;
  }
}
