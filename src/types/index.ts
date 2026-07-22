// ============================================================
// Enums
// ============================================================

export enum GameType {
  DICE = 'dice',
  CRASH = 'crash',
  PLINKO = 'plinko',
  MINES = 'mines',
  TOWER = 'tower',
  LIMBO = 'limbo',
  HILO = 'hilo',
  KENO = 'keno',
  SLOTS = 'slots',
  ROULETTE = 'roulette',
  BLACKJACK = 'blackjack',
  BACCARAT = 'baccarat',
  VIDEO_POKER = 'video_poker',
  WHEEL = 'wheel',
  COINFLIP = 'coinflip',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  BET = 'bet',
  WIN = 'win',
  BONUS = 'bonus',
  TIP = 'tip',
  RAIN = 'rain',
  RAKEBACK = 'rakeback',
  REFERRAL = 'referral',
}

export enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
  CASHOUT = 'cashout',
}

export type CoinType =
  | 'BTC'
  | 'ETH'
  | 'USDT'
  | 'USDC'
  | 'BNB'
  | 'SOL'
  | 'DOGE'
  | 'TRX'
  | 'LTC'
  | 'XRP'
  | 'ADA'
  | 'MATIC';

// ============================================================
// Core Interfaces
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  vip_level: number;
  vip_progress: number;
  xp?: number;
  kyc_status?: string;
  total_wagered: number;
  total_deposited: number;
  total_withdrawn: number;
  total_profit: number;
  is_verified: boolean;
  is_banned: boolean;
  referral_code: string;
  referred_by: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  coin: CoinType;
  balance: number;
  locked_balance: number;
  deposit_address: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  coin: CoinType;
  amount: number;
  fee: number;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  tx_hash: string | null;
  from_address: string | null;
  to_address: string | null;
  confirmations: number;
  network: string;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  game_type: GameType;
  coin: CoinType;
  amount: number;
  bet_amount?: number;
  multiplier: number;
  payout: number;
  profit: number;
  status: BetStatus;
  client_seed: string;
  server_seed_hash: string;
  server_seed: string | null;
  nonce: number;
  game_data: Record<string, unknown>;
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  type: GameType;
  provider: string;
  thumbnail: string;
  description: string;
  house_edge: number;
  min_bet: number;
  max_bet: number;
  max_multiplier: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_hot: boolean;
  play_count: number;
  category: string;
  tags: string[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  vip_level: number;
  message: string;
  type: 'message' | 'tip' | 'rain' | 'system' | 'win';
  room: string;
  amount?: number;
  coin?: CoinType;
  game_type?: GameType;
  multiplier?: number;
  is_deleted: boolean;
  created_at: string;
}

export interface Bonus {
  id: string;
  user_id: string;
  type: 'welcome' | 'deposit' | 'reload' | 'cashback' | 'rakeback' | 'vip' | 'promo';
  title: string;
  description: string;
  coin: CoinType;
  amount: number;
  wager_requirement: number;
  wagered_amount: number;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
}

export interface VIPTier {
  level: number;
  name: string;
  color: string;
  icon: string;
  min_wager: number;
  rakeback_percent: number;
  level_up_bonus: number;
  weekly_bonus: number;
  monthly_bonus: number;
  features: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string;
  vip_level: number;
  wagered: number;
  profit: number;
  games_played: number;
  best_multiplier: number;
}

// ============================================================
// Component Props
// ============================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'green' | 'purple' | 'gold' | 'none';
  onClick?: () => void;
}

export interface BadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================
// Game State Types
// ============================================================

export interface DiceGameState {
  target: number;
  rollOver: boolean;
  result?: number;
  multiplier: number;
  winChance: number;
}

export interface CrashGameState {
  multiplier: number;
  status: 'waiting' | 'running' | 'crashed';
  crashPoint?: number;
  cashedOut: boolean;
  cashOutAt?: number;
}

export interface MinesGameState {
  gridSize: number;
  minesCount: number;
  revealed: number[];
  mines: number[];
  multiplier: number;
  status: 'idle' | 'playing' | 'won' | 'lost';
}

export interface PlinkoGameState {
  rows: number;
  risk: 'low' | 'medium' | 'high';
  result?: number;
  path?: number[];
}

// ============================================================
// Realtime Types
// ============================================================

export interface RealtimePayload<T> {
  event: string;
  payload: T;
  type: 'broadcast' | 'presence' | 'postgres_changes';
}

export interface LiveBetData {
  id: string;
  username: string;
  avatar_url: string;
  vip_level: number;
  game_type: GameType;
  game_name: string;
  coin: CoinType;
  bet_amount: number;
  multiplier: number;
  payout: number;
  profit: number;
  status: BetStatus;
  created_at: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
