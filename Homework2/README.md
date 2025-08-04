# 🏦 Multi-Asset Wallet with Oracle Integration

Un contratto smart wallet avanzato per Ethereum che supporta depositi, prelievi e transazioni multi-asset (ETH e token ERC20) con integrazione di oracoli Chainlink per conversioni di prezzo in tempo reale.

## 📋 Panoramica del Progetto

Questo progetto implementa un sistema di wallet intelligente che estende le funzionalità tradizionali di gestione ETH per supportare **qualsiasi token ERC20**, permettendo la "vendita" di NFT utilizzando stablecoin o altri token i cui valori sono determinati tramite oracoli Chainlink.

### 🎯 Obiettivi Principali

- ✅ **Parità funzionale**: Stesse operazioni disponibili per ETH e token ERC20
- ✅ **Integrazione Oracle**: Prezzi real-time tramite Chainlink
- ✅ **Sicurezza**: Utilizzo di librerie OpenZeppelin auditate
- ✅ **Flessibilità**: Supporto per qualsiasi token ERC20

## 🏗️ Architettura

Il progetto include due implementazioni principali:

### 1. **Wallet.sol** (Implementazione Base)
Contratto che soddisfa i requisiti dell'esercizio base con:
- Depositi ETH e token ERC20
- Acquisti NFT con conversioni automatiche via oracle
- Sistema di prelievi sicuro
- Gestione separata dei fondi utente/proprietario

### 2. **EnhancedWallet.sol** (Implementazione Avanzata)
Versione estesa con funzionalità marketplace:
- Gestione fisica degli NFT (deposito/prelievo)
- Sistema di listing e vendita NFT
- Oracle multi-token configurabili
- Protezione re-entrancy
- Architettura modulare con eventi e errori custom

## 🚀 Funzionalità Principali

### 💰 Gestione Multi-Asset
```solidity
// Deposito ETH automatico
receive() external payable

// Deposito token ERC20
function userDeposit(address token, uint256 amount) external

// Prelievi sicuri
function userETHWithdraw() external
function userTokenWithdraw(address token) external
```

### 🔄 Conversioni con Oracle
```solidity
// Conversioni ETH ↔ USD
function convertEthInUSD(address user) public view returns (uint)
function convertUSDInETH(uint usdAmount) public view returns (uint)

// Conversioni Token ↔ USD
function convertUSDInToken(address token, uint usdAmount) public view returns (uint)
function convertNFTPriceInUSD() public view returns (uint)
```

### 🛒 Acquisti NFT Multi-Payment
```solidity
// Acquisto con ETH
function transferEthAmountOnBuy(uint nftNumber) public

// Acquisto con token ERC20
function transferTokenAmountOnBuy(address token, uint nftNumber) public
```

## 🛠️ Setup e Installazione

### Prerequisiti
- Node.js v18+
- NPM o Yarn
- Account Infura (per deploy su testnet)
- MetaMask o altro wallet

### 1. Clona il Repository
```bash
git clone https://github.com/your-username/multi-asset-wallet
cd multi-asset-wallet
```

### 2. Installa le Dipendenze
```bash
npm install
```

### 3. Configura l'Environment
Crea un file `.env` nella root del progetto:

```bash
# Sepolia RPC URL
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"

# Private key per il deploy (SOLO TESTNET!)
PRIVATE_KEY="your_private_key_here"

# Etherscan API key (opzionale, per verifica contratti)
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

### 4. Compila i Contratti
```bash
npx truffle compile
```

## 📦 Deploy

### Deploy Locale (Ganache)
```bash
# Avvia Ganache
npx ganache --deterministic

# Deploy su rete locale
npx truffle migrate --network development
```

### Deploy su Sepolia Testnet
```bash
npx truffle migrate --network sepolia
```

## 🧪 Testing

### Esegui i Test
```bash
npx truffle test
```

### Test Specifici
```bash
npx truffle test test/Wallet.test.js
```

## 🔧 Configurazione Reti

Il progetto è configurato per supportare:

- **Development** (Ganache locale)
- **Sepolia** (Ethereum testnet)
- **Goerli** (Deprecato, mantenuto per compatibilità)

### Indirizzi Oracle Chainlink

#### Sepolia Testnet
- **ETH/USD**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **BTC/USD**: `0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43`

#### Mainnet
- **ETH/USD**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`

## 📊 Struttura del Progetto

```
📦 multi-asset-wallet/
├── 📁 contracts/           # Smart contracts
│   ├── Wallet.sol         # Implementazione base
│   ├── EnhancedWallet.sol # Implementazione avanzata
│   ├── Token.sol          # Token ERC20 per testing
│   ├── PriceConsumer.sol  # Wrapper oracle Chainlink
│   └── interfaces/        # Interfacce
├── 📁 migrations/         # Script di deploy
├── 📁 test/              # Test suite
├── 📁 build/             # Artifacts di compilazione
├── truffle-config.js     # Configurazione Truffle
├── package.json          # Dipendenze NPM
└── README.md            # Questa documentazione
```

## 🔐 Sicurezza

### Misure Implementate
- ✅ **SafeERC20**: Trasferimenti token sicuri
- ✅ **Ownable**: Controllo accessi per funzioni admin
- ✅ **ReentrancyGuard**: Protezione da attacchi re-entrancy (EnhancedWallet)
- ✅ **Custom Errors**: Error handling efficiente (EnhancedWallet)

### Best Practices
- ✅ Checks-Effects-Interactions pattern
- ✅ Validazione input rigorosa
- ✅ Gestione sicura dei fondi utente
- ✅ Separazione fondi utente/proprietario

## 📈 Gas Optimization

### Strategie Implementate
- Uso di `uint256` per ottimizzazione storage
- Mapping efficienti per lookup O(1)
- Minimizzazione operazioni SSTORE
- Batch operations dove possibile

### Costi Stimati (Sepolia)
- Deploy Wallet: ~2.0M gas
- Deposito token: ~80k gas
- Acquisto NFT: ~120k gas
- Prelievo: ~60k gas


## 👥 Team

- **Developer**: Andrea91
- **Blockchain**: Ethereum
- **Framework**: Truffle
- **Oracles**: Chainlink



Made with ❤️ by Andrea91
