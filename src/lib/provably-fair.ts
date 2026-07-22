/**
 * Provably Fair Engine for Bb.GAME
 * 
 * Uses HMAC-SHA256 to generate verifiable game outcomes.
 * hash = HMAC-SHA256(serverSeed, clientSeed + ":" + nonce)
 * Each game converts the hash to its specific outcome range.
 */

// ─── Utility: Hex to Uint8Array ──────────────────────────────
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Isomorphic Crypto Helpers ───────────────────────────────
// Works in both Node.js (API routes) and browser (client verification)

async function hmacSHA256(key: string, message: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await globalThis.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(message)
    );
    return bytesToHex(new Uint8Array(signature));
  }

  // Fallback to Node.js crypto
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}

async function sha256(message: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const hash = await globalThis.crypto.subtle.digest(
      'SHA-256',
      encoder.encode(message)
    );
    return bytesToHex(new Uint8Array(hash));
  }

  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(message).digest('hex');
}

function getRandomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

// ─── Core Provably Fair Functions ────────────────────────────

/**
 * Generate a random 64-character hex server seed
 */
export function generateServerSeed(): string {
  return getRandomHex(64);
}

/**
 * Hash a server seed with SHA-256 (shown to player before game)
 */
export async function hashServerSeed(seed: string): Promise<string> {
  return sha256(seed);
}

/**
 * Generate the game result hash using HMAC-SHA256
 * hash = HMAC-SHA256(serverSeed, clientSeed + ":" + nonce)
 */
export async function generateResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<string> {
  const message = `${clientSeed}:${nonce}`;
  return hmacSHA256(serverSeed, message);
}

/**
 * Extract a float [0, 1) from 4 hex characters at the given byte index
 * Takes 4 bytes (8 hex chars) from the hash starting at index * 4
 */
export function getFloatFromHash(hash: string, index: number = 0): number {
  const startIdx = index * 8;
  if (startIdx + 8 > hash.length) {
    throw new Error('Hash index out of range');
  }
  const hexSlice = hash.substring(startIdx, startIdx + 8);
  const intValue = parseInt(hexSlice, 16);
  return intValue / 0x100000000; // Divide by 2^32
}

// ─── Game-Specific Result Conversions ────────────────────────

/**
 * CRASH: Convert hash to crash multiplier
 * House edge: 1% (crash at 1.00x roughly 1% of the time)
 * Range: 1.00x to theoretically infinite (practically ~1,000,000x)
 */
export function getCrashResult(hash: string): number {
  // Use first 52 bits (13 hex chars) for high precision
  const h = parseInt(hash.substring(0, 13), 16);

  // House edge: 1 in 101 chance of instant crash (1.00x)
  if (h % 101 === 0) {
    return 1.0;
  }

  // e = 2^52, h = random value from hash
  const e = Math.pow(2, 52);
  const result = Math.floor((100 * e - h) / (e - h)) / 100;

  return Math.max(1.0, result);
}

/**
 * DICE: Convert hash to a result between 0.00 and 99.99
 */
export function getDiceResult(hash: string): number {
  const float = getFloatFromHash(hash, 0);
  // Scale to 0-9999 then divide by 100 for 2 decimal precision
  return Math.floor(float * 10000) / 100;
}

/**
 * PLINKO: Generate an array of L/R decisions for the ball path
 * Each row, the ball goes left (0) or right (1)
 */
export function getPlinkoResult(hash: string, rows: number): number[] {
  const path: number[] = [];

  for (let i = 0; i < rows; i++) {
    // Use different segments of the hash for each row
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    const startHex = byteIndex * 2;

    if (startHex + 2 > hash.length) {
      // If we run out of hash, use modular arithmetic
      const extraByte = parseInt(hash.substring(i % (hash.length - 2), (i % (hash.length - 2)) + 2), 16);
      path.push(extraByte % 2);
    } else {
      const byte = parseInt(hash.substring(startHex, startHex + 2), 16);
      path.push((byte >> bitIndex) & 1);
    }
  }

  return path;
}

/**
 * MINES: Generate unique mine positions on the grid
 * Uses Fisher-Yates shuffle seeded by the hash
 */
export function getMinePositions(
  hash: string,
  mineCount: number,
  gridSize: number = 25
): number[] {
  // Create array of all tile indices [0, 1, 2, ..., gridSize-1]
  const tiles: number[] = Array.from({ length: gridSize }, (_, i) => i);

  // Fisher-Yates shuffle using hash bytes
  for (let i = tiles.length - 1; i > 0; i--) {
    // Get a float from the hash for this shuffle step
    const hashIndex = (i * 8) % (hash.length - 8);
    const hexSlice = hash.substring(hashIndex, hashIndex + 8);
    const randValue = parseInt(hexSlice, 16) / 0x100000000;
    const j = Math.floor(randValue * (i + 1));

    // Swap
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Return the first mineCount positions as mines
  return tiles.slice(0, mineCount).sort((a, b) => a - b);
}

/**
 * LIMBO: Convert hash to a multiplier
 * Range: 1.00x to 1,000,000x
 * Uses exponential distribution for fair odds
 */
export function getLimboResult(hash: string): number {
  const float = getFloatFromHash(hash, 0);

  // House edge ~1%
  // Result = 0.99 / (1 - float)
  // This creates a distribution where higher multipliers are rarer
  if (float >= 0.99) {
    // Cap at 1,000,000x
    return 1000000;
  }

  const result = Math.floor((0.99 / (1 - float)) * 100) / 100;
  return Math.max(1.0, result);
}

/**
 * WHEEL: Convert hash to a segment index
 */
export function getWheelResult(hash: string, segmentCount: number): number {
  const float = getFloatFromHash(hash, 0);
  return Math.floor(float * segmentCount);
}

// ─── Plinko Multiplier Tables ────────────────────────────────

export type PlinkoRisk = 'low' | 'medium' | 'high';

export function getPlinkoMultipliers(rows: number, risk: PlinkoRisk): number[] {
  const tables: Record<number, Record<PlinkoRisk, number[]>> = {
    8: {
      low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
      medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    },
    10: {
      low: [8.9, 3, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3, 8.9],
      medium: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
      high: [76, 10, 3, 1.5, 0.3, 0.2, 0.3, 1.5, 3, 10, 76],
    },
    12: {
      low: [10, 3, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3, 10],
      medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
      high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    },
    14: {
      low: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
      medium: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.3, 0.4, 0.7, 1.3, 3, 6, 13, 43],
      high: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    },
    16: {
      low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
      medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
      high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    },
  };

  return tables[rows]?.[risk] || tables[8].low;
}

/**
 * Calculate the final landing bucket for a plinko ball
 */
export function getPlinkoBucket(path: number[], rows: number): number {
  // The bucket index is the sum of right-turns (1s) in the path
  return path.reduce((sum, dir) => sum + dir, 0);
}

// ─── Wheel Segment Configurations ────────────────────────────

export interface WheelSegment {
  multiplier: number;
  color: string;
  label: string;
}

export function getWheelSegments(
  segmentCount: number,
  risk: PlinkoRisk
): WheelSegment[] {
  const configs: Record<string, Record<PlinkoRisk, number[]>> = {
    '10': {
      low: [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.2, 1.5],
      medium: [0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 3],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 9.9],
    },
    '20': {
      low: [1.5, 1.2, 1.2, 1.3, 0, 1.2, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3],
      medium: [0, 2, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19.8],
    },
    '30': {
      low: [1.5, 1.2, 1.2, 1.3, 0, 1.2, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.2, 1.3, 1.5, 1.2, 1.3, 1.2, 0, 1.3],
      medium: [0, 2, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29.7],
    },
    '40': {
      low: [1.5, 1.2, 1.2, 1.3, 0, 1.2, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.2, 1.3, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.5, 1.2, 1.3, 1.2, 0, 1.2, 1.3, 1.2, 1.2, 1.5],
      medium: [0, 2, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 3, 0, 9.9],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39.6],
    },
    '50': {
      low: [1.5, 1.2, 1.2, 1.3, 0, 1.2, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.2, 1.2, 1.5, 1.2, 1.3, 1.2, 0, 1.2, 1.3, 1.5, 1.2, 1.3, 1.2, 0, 1.3, 1.5, 1.2, 1.3, 1.2, 0, 1.2, 1.3, 1.2, 1.2, 1.5, 1.2, 0, 1.3, 1.2, 1.5, 1.2, 0, 1.3, 1.2, 1.5],
      medium: [0, 2, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 1.5, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 3, 0, 2, 0, 1.5, 0, 5, 0, 2, 0, 3, 0, 9.9],
      high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49.5],
    },
  };

  const multipliers = configs[String(segmentCount)]?.[risk] || configs['10'].low;
  const colors = {
    0: '#1a1a2e',       // Loss - dark
    1: '#2d6a4f',       // Low win - green
    1.2: '#2d6a4f',
    1.3: '#40916c',
    1.5: '#52b788',
    2: '#74c69d',
    3: '#f4a261',       // Medium win - orange
    5: '#e76f51',       // High win - red-orange
    9.9: '#e63946',     // Jackpot - red
    19.8: '#e63946',
    29.7: '#e63946',
    39.6: '#e63946',
    49.5: '#e63946',
  };

  return multipliers.map((m) => {
    const colorKey = Object.keys(colors)
      .map(Number)
      .sort((a, b) => a - b)
      .reduce((prev, curr) => (m >= curr ? curr : prev), 0);

    return {
      multiplier: m,
      color: colors[colorKey as keyof typeof colors] || '#2d6a4f',
      label: m === 0 ? '0x' : `${m}x`,
    };
  });
}

// ─── Mines Multiplier Calculator ─────────────────────────────

/**
 * Calculate the progressive multiplier for mines game
 * Based on the probability of picking safe tiles
 */
export function getMinesMultiplier(
  mineCount: number,
  revealedCount: number,
  gridSize: number = 25
): number {
  if (revealedCount === 0) return 1;

  const safeTiles = gridSize - mineCount;
  let multiplier = 1;
  const houseEdge = 0.99; // 1% house edge

  for (let i = 0; i < revealedCount; i++) {
    const remaining = gridSize - i;
    const safeRemaining = safeTiles - i;
    multiplier *= remaining / safeRemaining;
  }

  return Math.floor(multiplier * houseEdge * 100) / 100;
}

// ─── Verification ────────────────────────────────────────────

export type GameType = 'crash' | 'dice' | 'plinko' | 'mines' | 'limbo' | 'wheel';

export interface GameVerification {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  gameType: GameType;
  hash: string;
  result: number | number[];
  details: string;
}

/**
 * Verify a game result given all seeds
 */
export async function verifyGame(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  gameType: GameType,
  options?: { rows?: number; mineCount?: number; segmentCount?: number }
): Promise<GameVerification> {
  const hash = await generateResult(serverSeed, clientSeed, nonce);
  const serverSeedHashValue = await hashServerSeed(serverSeed);

  let result: number | number[];
  let details: string;

  switch (gameType) {
    case 'crash': {
      const crashResult = getCrashResult(hash);
      result = crashResult;
      details = `Crash point: ${crashResult.toFixed(2)}x`;
      break;
    }
    case 'dice': {
      const diceResult = getDiceResult(hash);
      result = diceResult;
      details = `Dice roll: ${diceResult.toFixed(2)}`;
      break;
    }
    case 'plinko': {
      const rows = options?.rows || 8;
      const path = getPlinkoResult(hash, rows);
      result = path;
      details = `Plinko path (${rows} rows): [${path.map((d) => (d ? 'R' : 'L')).join(', ')}]`;
      break;
    }
    case 'mines': {
      const mineCount = options?.mineCount || 3;
      const positions = getMinePositions(hash, mineCount);
      result = positions;
      details = `Mine positions (${mineCount} mines): [${positions.join(', ')}]`;
      break;
    }
    case 'limbo': {
      const limboResult = getLimboResult(hash);
      result = limboResult;
      details = `Limbo multiplier: ${limboResult.toFixed(2)}x`;
      break;
    }
    case 'wheel': {
      const segmentCount = options?.segmentCount || 10;
      const segment = getWheelResult(hash, segmentCount);
      result = segment;
      details = `Wheel segment: ${segment} (of ${segmentCount})`;
      break;
    }
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }

  return {
    serverSeed,
    serverSeedHash: serverSeedHashValue,
    clientSeed,
    nonce,
    gameType,
    hash,
    result,
    details,
  };
}
