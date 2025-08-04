# Guida all'Architettura DEX con Vault

## Panoramica dell'Architettura

La nuova architettura separa le responsabilità tra due contratti principali:

### 1. **LiquidityVault.sol** - Gestione della Liquidità
- **Responsabilità**: Conservare e gestire in modo sicuro ETH e token
- **Funzionalità principali**:
  - Deposito e prelievo di ETH e token
  - Controllo degli accessi (solo DEX autorizzato può prelevare)
  - Funzioni di emergenza per il proprietario
  - Verifiche di liquidità disponibile

### 2. **SimpleDEXWithVault.sol** - Logica di Trading
- **Responsabilità**: Gestire la logica di scambio e i prezzi
- **Funzionalità principali**:
  - Esecuzione degli scambi (buy/sell)
  - Calcolo dei prezzi tramite Oracle Chainlink
  - Interfaccia per gli utenti
  - Comunicazione con il vault per i movimenti di fondi

## Vantaggi dell'Architettura con Vault

### 🔒 **Sicurezza Migliorata**
- **Separazione delle responsabilità**: I fondi sono isolati dalla logica di business
- **Controllo degli accessi**: Solo contratti autorizzati possono accedere ai fondi
- **Protezione contro reentrancy**: Utilizzo di `ReentrancyGuard`

### 💰 **Gestione della Liquidità**
- **Pool centralizzato**: Tutti i fondi in un unico contratto sicuro
- **Facilità di monitoraggio**: Funzioni dedicate per verificare la liquidità
- **Scalabilità**: Possibilità di collegare più DEX allo stesso vault

### 🛠 **Manutenibilità**
- **Upgrade del DEX**: Si può aggiornare la logica di trading senza toccare i fondi
- **Funzioni di emergenza**: Il proprietario può recuperare i fondi in caso di emergenza

## Struttura dei File

```
contracts/
├── Token.sol                    # Token ERC20 di test
├── PriceConsumer.sol           # Oracle Chainlink per prezzi ETH/USD
├── LiquidityVault.sol          # Nuovo: Gestione sicura della liquidità
├── SimpleDEXWithVault.sol      # Nuovo: DEX che utilizza il vault
└── MockV3Aggregator.sol        # Mock per test (simula Chainlink)

scripts/
└── deployContractsWithVault.js # Script di deploy completo

test/
└── SimpleDEXWithVault.test.js  # Test completi dell'architettura
```

## Flusso di Utilizzo

### Setup Iniziale
1. **Deploy dei contratti**:
   ```bash
   npx hardhat run scripts/deployContractsWithVault.js --network sepolia
   ```

2. **Configurazione automatica**:
   - Il vault autorizza il DEX
   - Il DEX viene collegato al vault
   - Viene aggiunta la liquidità iniziale

### Operazioni Utente

#### Comprare Token (Buy)
```solidity
// Utente chiama buyToken() inviando ETH
simpleDEXWithVault.buyToken{value: 1 ether}();

// Flusso interno:
// 1. DEX calcola il prezzo tramite Oracle
// 2. DEX deposita ETH ricevuto nel vault
// 3. DEX preleva token dal vault e li invia all'utente
```

#### Vendere Token (Sell)
```solidity
// Utente approva i token e chiama sellToken()
token.approve(dexAddress, tokenAmount);
simpleDEXWithVault.sellToken(tokenAmount);

// Flusso interno:
// 1. DEX calcola il prezzo tramite Oracle
// 2. DEX trasferisce token dall'utente al vault
// 3. DEX preleva ETH dal vault e li invia all'utente
```

## Funzioni Chiave

### LiquidityVault
```solidity
// Gestione depositi
function depositEth() external payable
function depositTokens(uint256 amount) external

// Prelievi (solo DEX autorizzato)
function withdrawEth(address payable recipient, uint256 amount) external
function withdrawTokens(address recipient, uint256 amount) external

// Monitoraggio
function getEthBalance() external view returns (uint256)
function getTokenBalance() public view returns (uint256)
function hasLiquidity(uint256 ethAmount, uint256 tokenAmount) external view returns (bool)

// Emergenza (solo owner)
function emergencyWithdraw() external onlyOwner
```

### SimpleDEXWithVault
```solidity
// Trading
function buyToken() external payable
function sellToken(uint256 tokenAmount) external

// Calcoli
function calculateTokensForEth(uint256 ethAmount) external view returns (uint256)
function calculateEthForTokens(uint256 tokenAmount) external view returns (uint256)

// Liquidità (solo owner)
function depositEthToVault() external payable onlyOwner
function depositTokensToVault(uint256 amount) external onlyOwner

// Monitoraggio
function getVaultLiquidity() external view returns (uint256 ethBalance, uint256 tokenBalance)
```

## Esecuzione dei Test

```bash
# Compila i contratti
npx hardhat compile

# Esegui i test completi
npx hardhat test test/SimpleDEXWithVault.test.js

# Test con output dettagliato
npx hardhat test test/SimpleDEXWithVault.test.js --verbose
```

### Scenari di Test Coperti

1. **Setup e Configurazione**
   - Verifica corretta configurazione vault-DEX
   - Controllo liquidità iniziale
   - Test autorizzazioni

2. **Operazioni di Trading**
   - Acquisto token con ETH
   - Vendita token per ETH
   - Calcoli di prezzo accurati

3. **Gestione Liquidità**
   - Depositi da parte del proprietario
   - Verifiche di liquidità disponibile
   - Limiti e controlli

4. **Sicurezza**
   - Controlli di accesso
   - Protezione contro attacchi
   - Gestione casi limite

5. **Funzioni di Emergenza**
   - Prelievo di emergenza
   - Recupero fondi

## Deploy su Testnet

1. **Configura Hardhat** per Sepolia:
   ```javascript
   // hardhat.config.js
   networks: {
     sepolia: {
       url: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
       accounts: ["YOUR-PRIVATE-KEY"]
     }
   }
   ```

2. **Esegui il deploy**:
   ```bash
   npx hardhat run scripts/deployContractsWithVault.js --network sepolia
   ```

3. **Verifica gli indirizzi** nel file `deployed-addresses.json`

## Considerazioni di Sicurezza

### ✅ **Implementate**
- Controlli di accesso con `onlyOwner` e `onlyAuthorizedDEX`
- Protezione reentrancy con `ReentrancyGuard`
- Validazione input e controlli di saldo
- Uso di `SafeERC20` per trasferimenti sicuri

### 🔒 **Best Practices**
- Il vault non espone funzioni pubbliche per prelievi
- Solo il DEX autorizzato può muovere fondi
- Funzioni di emergenza solo per il proprietario
- Eventi emessi per tracciabilità

### ⚠️ **Attenzioni**
- Assicurarsi che l'Oracle sia sempre aggiornato
- Monitorare la liquidità del vault
- Testare sempre su testnet prima del deploy su mainnet
