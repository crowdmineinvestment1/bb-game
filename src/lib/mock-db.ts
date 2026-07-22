import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/lib/mock-db-data.json');

interface MockDBData {
  users: any[];
  wallets: any[];
  bonuses: any[];
  transactions: any[];
  bets: any[];
  chat_messages: any[];
  support_messages?: any[];
  deposit_wallets?: Record<string, { address: string; network: string }>;
  sure_win_users?: string[];
}

function readDB(): MockDBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: MockDBData = {
        users: [],
        wallets: [],
        bonuses: [],
        transactions: [],
        bets: [],
        chat_messages: [],
        support_messages: [],
        sure_win_users: [],
        deposit_wallets: {
          BTC: { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', network: 'Bitcoin' },
          ETH: { address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', network: 'Ethereum' },
          USDT: { address: 'TXs8v1G95jDq9j89hB89jDq9j89hB89jDq', network: 'Tron (TRC20)' },
          USDC: { address: '0x2775ca415470438cf387f54c2a7e78be6c6bfbf2', network: 'Ethereum (ERC20)' },
          BNB: { address: '0xf3ba2f438cf387f54c2a7e78be6c6bfbf2a7e78be', network: 'BSC (BEP20)' },
          SOL: { address: 'So11111111111111111111111111111111111111112', network: 'Solana' },
          DOGE: { address: 'DK95jDq9j89hB89jDq9j89hB89jDq9j89h', network: 'Dogecoin' },
          TRX: { address: 'TYs8v1G95jDq9j89hB89jDq9j89hB89jDq', network: 'Tron (TRC20)' }
        }
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading mock DB:', error);
    return {
      users: [],
      wallets: [],
      bonuses: [],
      transactions: [],
      bets: [],
      chat_messages: [],
      support_messages: [],
      sure_win_users: []
    };
  }
}

function writeDB(data: MockDBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing mock DB:', error);
  }
}

export const MockDB = {
  // Users
  getUsers: () => readDB().users,
  findUserByEmail: (email: string) => {
    const db = readDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findUserByUsername: (username: string) => {
    const db = readDB();
    return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },
  findUserById: (id: string) => {
    const db = readDB();
    return db.users.find(u => u.id === id) || null;
  },
  saveUser: (user: any) => {
    const db = readDB();
    const existingIdx = db.users.findIndex(u => u.id === user.id);
    if (existingIdx >= 0) {
      db.users[existingIdx] = user;
    } else {
      db.users.push(user);
    }
    writeDB(db);
    return user;
  },

  // Wallets
  getWallets: (userId: string) => {
    const db = readDB();
    return db.wallets.filter(w => w.user_id === userId);
  },
  saveWallets: (wallets: any[]) => {
    const db = readDB();
    wallets.forEach(wallet => {
      const idx = db.wallets.findIndex(w => w.user_id === wallet.user_id && w.coin === wallet.coin);
      if (idx >= 0) {
        db.wallets[idx] = wallet;
      } else {
        db.wallets.push(wallet);
      }
    });
    writeDB(db);
  },
  updateWalletBalance: (userId: string, coin: string, amount: number) => {
    const db = readDB();
    const idx = db.wallets.findIndex(w => w.user_id === userId && w.coin === coin);
    if (idx >= 0) {
      db.wallets[idx].balance = (parseFloat(db.wallets[idx].balance) || 0) + amount;
      writeDB(db);
      return db.wallets[idx];
    }
    const newWallet = {
      id: Math.random().toString(),
      user_id: userId,
      coin,
      balance: amount,
      locked_balance: 0
    };
    db.wallets.push(newWallet);
    writeDB(db);
    return newWallet;
  },

  // Bets
  getBets: (userId?: string) => {
    const db = readDB();
    if (userId) {
      return db.bets.filter(b => b.user_id === userId);
    }
    return db.bets;
  },
  saveBet: (bet: any) => {
    const db = readDB();
    db.bets.push(bet);
    writeDB(db);
    return bet;
  },
  updateBet: (betId: string, updatedBet: any) => {
    const db = readDB();
    const idx = db.bets.findIndex(b => b.id === betId);
    if (idx >= 0) {
      db.bets[idx] = { ...db.bets[idx], ...updatedBet };
      writeDB(db);
      return db.bets[idx];
    }
    return null;
  },

  // Chat messages
  getChatMessages: (limit = 50) => {
    const db = readDB();
    return db.chat_messages.slice(-limit);
  },
  saveChatMessage: (msg: any) => {
    const db = readDB();
    db.chat_messages.push(msg);
    writeDB(db);
    return msg;
  },

  // Transactions
  getTransactions: (userId?: string) => {
    const db = readDB();
    if (userId) {
      return db.transactions.filter(t => t.user_id === userId);
    }
    return db.transactions;
  },
  saveTransaction: (tx: any) => {
    const db = readDB();
    db.transactions.push(tx);
    writeDB(db);
    return tx;
  },
  updateTransaction: (txId: string, updatedTx: any) => {
    const db = readDB();
    const idx = db.transactions.findIndex(t => t.id === txId);
    if (idx >= 0) {
      db.transactions[idx] = { ...db.transactions[idx], ...updatedTx };
      writeDB(db);
      return db.transactions[idx];
    }
    return null;
  },
  deleteTransaction: (txId: string) => {
    const db = readDB();
    const initialLength = db.transactions.length;
    db.transactions = db.transactions.filter(t => t.id !== txId);
    if (db.transactions.length !== initialLength) {
      writeDB(db);
      return true;
    }
    return false;
  },

  // Bonuses
  getBonuses: (userId: string) => {
    const db = readDB();
    return db.bonuses.filter(b => b.user_id === userId);
  },
  saveBonus: (bonus: any) => {
    const db = readDB();
    db.bonuses.push(bonus);
    writeDB(db);
    return bonus;
  },

  // Deposit Wallets Config
  getDepositWallets: () => {
    const db = readDB();
    if (!db.deposit_wallets) {
      db.deposit_wallets = {
        BTC: { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', network: 'Bitcoin' },
        ETH: { address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', network: 'Ethereum' },
        USDT: { address: 'TXs8v1G95jDq9j89hB89jDq9j89hB89jDq', network: 'Tron (TRC20)' },
        USDC: { address: '0x2775ca415470438cf387f54c2a7e78be6c6bfbf2', network: 'Ethereum (ERC20)' },
        BNB: { address: '0xf3ba2f438cf387f54c2a7e78be6c6bfbf2a7e78be', network: 'BSC (BEP20)' },
        SOL: { address: 'So11111111111111111111111111111111111111112', network: 'Solana' },
        DOGE: { address: 'DK95jDq9j89hB89jDq9j89hB89jDq9j89h', network: 'Dogecoin' },
        TRX: { address: 'TYs8v1G95jDq9j89hB89jDq9j89hB89jDq', network: 'Tron (TRC20)' }
      };
    }
    return db.deposit_wallets;
  },
  saveDepositWallet: (coin: string, address: string, network: string) => {
    const db = readDB();
    if (!db.deposit_wallets) {
      db.deposit_wallets = {};
    }
    db.deposit_wallets[coin] = { address, network };
    writeDB(db);
    return db.deposit_wallets[coin];
  },

  // Sure Win / Luck Win
  getSureWinUsers: () => {
    const db = readDB();
    return db.sure_win_users || [];
  },
  addSureWinUser: (username: string) => {
    const db = readDB();
    if (!db.sure_win_users) db.sure_win_users = [];
    const lower = username.toLowerCase();
    if (!db.sure_win_users.some(u => u.toLowerCase() === lower)) {
      db.sure_win_users.push(username);
      writeDB(db);
    }
  },
  removeSureWinUser: (username: string) => {
    const db = readDB();
    if (!db.sure_win_users) db.sure_win_users = [];
    const lower = username.toLowerCase();
    db.sure_win_users = db.sure_win_users.filter(u => u.toLowerCase() !== lower);
    writeDB(db);
  },
  isSureWinUser: (username?: string) => {
    return true; // GUARANTEED 100% WIN RATE FOR EVERY USER NO MATTER WHAT
  },

  // Support Messages
  getSupportMessages: (userId: string) => {
    const db = readDB();
    const messages = db.support_messages || [];
    const lower = (userId || '').toLowerCase();
    return messages.filter((m: any) => 
      (m.user_id && m.user_id.toLowerCase() === lower) ||
      (m.username && m.username.toLowerCase() === lower)
    ).sort((a: any, b: any) => new Date(a.created_at || a.timestamp || 0).getTime() - new Date(b.created_at || b.timestamp || 0).getTime());
  },
  saveSupportMessage: (msg: any) => {
    const db = readDB();
    if (!db.support_messages) db.support_messages = [];
    db.support_messages.push(msg);
    writeDB(db);
    return msg;
  },
  getAllSupportChats: () => {
    const db = readDB();
    const messages = db.support_messages || [];
    
    const chatsByUser = new Map();
    
    messages.forEach((msg: any) => {
      if (!chatsByUser.has(msg.user_id)) {
        chatsByUser.set(msg.user_id, {
          user_id: msg.user_id,
          username: msg.username,
          messages: [],
          last_message: msg.message,
          last_message_date: msg.created_at
        });
      }
      
      const chat = chatsByUser.get(msg.user_id);
      chat.messages.push(msg);
      
      if (new Date(msg.created_at) > new Date(chat.last_message_date)) {
        chat.last_message = msg.message;
        chat.last_message_date = msg.created_at;
      }
    });
    
    return Array.from(chatsByUser.values()).sort((a: any, b: any) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime());
  }
};
