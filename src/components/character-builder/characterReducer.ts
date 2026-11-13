import { CharacterState, AbilityKey, AbilityMode, CustomAttack, INITIAL_CHARACTER_STATE } from './types';

export type CharacterAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_GENDER_OR_TITLE'; payload: string }
  | { type: 'SET_ALIGNMENT'; payload: string }
  | { type: 'SELECT_RACE'; payload: string | null }
  | { type: 'SELECT_CLASS'; payload: string | null }
  | { type: 'SELECT_SUBCLASS'; payload: string | null }
  | { type: 'SELECT_BACKGROUND'; payload: string | null }
  | { type: 'SELECT_FEAT'; payload: string | null }
  | { type: 'SELECT_CAMPAIGN'; payload: string | null }
  | { type: 'SELECT_DEITY'; payload: string | null }
  | { type: 'SET_ABILITY_MODE'; payload: AbilityMode }
  | { type: 'SET_BASE_ABILITY'; payload: { ability: AbilityKey; score: number } }
  | { type: 'SET_ALL_BASE_ABILITIES'; payload: Record<AbilityKey, number> }
  | { type: 'SET_RACIAL_BONUS'; payload: { type: 'primary' | 'secondary'; ability: AbilityKey } }
  | { type: 'TOGGLE_SKILL'; payload: string }
  | { type: 'SET_SKILLS'; payload: string[] }
  | { type: 'SET_ARMOR'; payload: string }
  | { type: 'TOGGLE_SHIELD' }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'ADD_ATTACK'; payload: CustomAttack }
  | { type: 'REMOVE_ATTACK'; payload: string }
  | { type: 'LOAD_STATE'; payload: CharacterState }
  | { type: 'RESET' };

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

    case 'SELECT_RACE':
      return {
        ...state,
        raceId: action.payload
      };

    case 'SELECT_CLASS':
      return {
        ...state,
        classId: action.payload,
        // Reset subclass if class changes
        subclassId: null
      };

    case 'SELECT_SUBCLASS':
      return { ...state, subclassId: action.payload };

    case 'SELECT_BACKGROUND':
      return { ...state, backgroundId: action.payload };

    case 'SELECT_FEAT':
      return { ...state, featId: action.payload };

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

    case 'TOGGLE_SKILL': {
      const exists = state.selectedSkills.includes(action.payload);
      return {
        ...state,
        selectedSkills: exists
          ? state.selectedSkills.filter(s => s !== action.payload)
          : [...state.selectedSkills, action.payload]
      };
    }

    case 'SET_SKILLS':
      return { ...state, selectedSkills: action.payload };

    case 'SET_ARMOR':
      return { ...state, customArmor: action.payload };

    case 'TOGGLE_SHIELD':
      return { ...state, shieldEquipped: !state.shieldEquipped };

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
      return {
        ...action.payload,
        step: action.payload.step || 1
      };

    case 'RESET':
      return {
        ...INITIAL_CHARACTER_STATE,
        step: 1
      };

    default:
      return state;
  }
}
