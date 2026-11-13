// ─────────────────────────────────────────────────────────────
// Mission Control: Mars Outpost — core game types
// ─────────────────────────────────────────────────────────────

export type GamePage = 'landing' | 'briefing' | 'game' | 'results';

export type GameStatus = 'playing' | 'won' | 'lost';

export type Severity = 'info' | 'warning' | 'critical';

export type WeatherCondition =
  | 'clear'
  | 'dusty'
  | 'moderate_storm'
  | 'severe_storm'
  | 'solar_storm';

export type CrewStatus = 'healthy' | 'injured' | 'sick' | 'deceased';

export type CrewActivity =
  | 'sleep'
  | 'science'
  | 'experiment'
  | 'maintenance'
  | 'repair'
  | 'medical'
  | 'command';

export type SubsystemId =
  | 'oxygenPump'
  | 'waterRecycler'
  | 'greenhouse'
  | 'power'
  | 'thermal'
  | 'solarPanels';

export type SubsystemStatus = 'nominal' | 'degraded' | 'failed';

export interface SubsystemCondition {
  id: SubsystemId;
  name: string;
  condition: number; // 0-100
  status: SubsystemStatus;
}

/** A stored quantity or safety indicator, both carrying value + capacity. */
export interface Resource {
  value: number;
  max: number;
}

export interface Resources {
  energy: Resource; // kWh stored in the battery bank
  water: Resource; // liters of potable water
  oxygen: Resource; // liters of reserve O2
  food: Resource; // kg of provisions
  radiationProtection: Resource; // effective shielding level (0-100)
  crewHealth: Resource; // aggregate crew health (0-100)
}

export interface Habitat {
  integrity: number; // 0-100
  temperature: number; // °C inside the habitat
  pressure: number; // relative pressure (1.0 = nominal)
}

export interface WeatherState {
  condition: WeatherCondition;
  description: string;
  solarGeneration: number; // kWh/sol available
  radiationLevel: number; // relative exposure multiplier
  temperature: number; // external °C
}

export interface CrewMember {
  id: string;
  name: string;
  callsign: string;
  role: string;
  specialization: string;
  bio: string;
  health: number;
  maxHealth: number;
  status: CrewStatus;
  morale: number;
  activity: CrewActivity;
  ability: string;
  abilityDescription: string;
}

export interface ResourceDelta {
  energy?: number;
  water?: number;
  oxygen?: number;
  food?: number;
  radiation?: number;
  crewHealth?: number;
  morale?: number;
  habitatIntegrity?: number;
  temperature?: number;
  pressure?: number;
  samples?: number;
  subsystems?: Partial<Record<SubsystemId, number>>; // condition deltas per subsystem
  flags?: Partial<Flags>;
  memberId?: string; // if crewHealth targets a specific astronaut
  targetSickest?: boolean; // if crewHealth should target the most injured astronaut
}

export interface EventChoice {
  id: string;
  label: string;
  detail?: string;
  consequence: ResourceDelta;
}

export interface GameEventDef {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  icon: string; // lucide icon key, resolved by the UI
  minSol: number;
  maxSol: number;
  weight: number;
  cooldown: number; // sols before the same event may recur
  /** If set, the event persists for N sols and auto-resolves when they elapse. */
  duration?: number;
  /** Consequence applied automatically if the event runs out without a choice. */
  expireConsequence?: ResourceDelta;
  /** Damage inflicted by the event itself the moment it strikes. */
  onsetConsequence?: ResourceDelta;
  choices: EventChoice[];
}

export interface ActiveEvent {
  def: GameEventDef;
  spawnedSol: number;
  solsRemaining: number;
}

export interface LogEntry {
  id: number;
  sol: number;
  message: string;
  type: Severity | 'success';
}

export interface GeologicalSample {
  id: number;
  sol: number;
  label: string;
  location: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  duration: number; // sols required
  progress: number; // sols of work applied
  energyPerSol: number;
}

export interface Objectives {
  experimentsCompleted: number;
  samplesCollected: number;
  sampleProgress: number; // 0-100 toward the next sample
}

export interface IncidentRecord {
  sol: number;
  title: string;
  resolution: string;
}

export interface MissionScore {
  total: number;
  survival: number;
  samples: number;
  experiments: number;
  habitat: number;
  crew: number;
}

export interface TelemetryPoint {
  sol: number;
  energy: number;
  oxygen: number;
  water: number;
  habitat: number;
}

export interface Flags {
  rationMeals: boolean;
  reducedOperations: boolean;
}

export interface GameState {
  status: GameStatus;
  outcome?: 'mission_success' | 'mission_failure';
  sol: number;
  resources: Resources;
  crew: CrewMember[];
  habitat: Habitat;
  weather: WeatherState;
  subsystems: SubsystemCondition[];
  activeEvent: ActiveEvent | null;
  eventCooldowns: Record<string, number>; // eventId -> sol when it may next spawn
  log: LogEntry[];
  samples: GeologicalSample[];
  experiments: Experiment[];
  objectives: Objectives;
  incidents: IncidentRecord[];
  score: MissionScore;
  telemetry: TelemetryPoint[];
  flags: Flags;
  startedAt: number;
  endedAt?: number;
  milestone: number; // index of last milestone shown
}

export interface MissionRating {
  label: 'MISSION FAILURE' | 'BARELY SURVIVED' | 'SUCCESSFUL COMMANDER' | 'OUTSTANDING COMMANDER';
  tone: Severity | 'success';
  description: string;
}

export interface AdvisorMessage {
  id: string;
  source: 'rule' | 'llm';
  priority: string;
  message: string;
}
