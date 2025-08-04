# Progetto Homework 3: Collezione `ERC1155` per un Gioco Fantasy

Questo repository contiene la mia soluzione per l'homework3 del corso "Blockchain Developer" di MAsterZ. Il progetto consiste nella creazione di un ecosistema completo per la gestione di item digitali (NFT e token fungibili) per un ipotetico gioco fantasy sul Web3, basato sullo standard **`ERC1155`**.

## Struttura del Progetto

Il progetto è sviluppato utilizzando **Hardhat** e include:
*   **Contratti Solidity:** Un'implementazione dello standard `ERC1155` per gestire una collezione di item di gioco (`MyNFT.sol`).
*   **Metadati su IPFS:** Immagini e file JSON ospitati in modo decentralizzato per garantire la persistenza dei dati.
*   **Test Unitari Completi:** Una suite di test approfondita (`test/MyNFT.test.js`) per verificare ogni aspetto del contratto.
*   **Script di Deploy:** Per pubblicare il contratto sulla testnet Sepolia (`ignition/modules/DeployMyNFT.js`).
*   **Documentazione Automatica:** Generata tramite `solidity-docgen` per una facile comprensione del codice.

---

## 1. L'Idea: Un'Economia di Gioco On-Chain

L'intenzione di questo progetto è simulare la creazione di un'economia di gioco decentralizzata. La scelta dello standard **`ERC1155`** è stata fondamentale perché permette di gestire, in un unico contratto, sia item **fungibili** (come le monete) sia item **non-fungibili** (come le spade).

### La Collezione `MyNFT`

La collezione è pensata per un gioco di ruolo e include due categorie di item:

*   **Token Fungibile: `Moneta d'Oro`**
    1.  **ID:** `0`
    2.  **Descrizione:** La valuta principale del gioco, scambiabile in grandi quantità.
    3.  **Supply Iniziale:** 1000

*   **Token Non-Fungibili: Le Spade (`NFT`)**
    1.  **`Spada Leggendaria`:** ID `1`, Rarità "Leggendaria".
    2.  **`Spada del Valoroso`:** ID `2`, Rarità "Epica".
    3.  **`Spada dell'Eroe`:** ID `3`, Rarità "Rara".
    4.  **`Spada Comune`:** ID `4`, Rarità "Comune".

---

## 2. Architettura e Tecnologie

*   **Blockchain:** Ethereum (`Sepolia Testnet`)
*   **Smart Contract:** Solidity `^0.8.20`, `OpenZeppelin Contracts`.
*   **Ambiente di Sviluppo:** **Hardhat**.
*   **Hosting Metadati:** **IPFS** (tramite Pinata).
*   **Testing:** **Mocha & Chai**.

### Nota sulla Visualizzazione dei Metadati

L'intero ecosistema on-chain (contratto) e off-chain (metadati) è stato configurato correttamente. Tuttavia, la visualizzazione delle immagini su piattaforme di terze parti sulla `Sepolia Testnet` può essere inaffidabile. L'integrità e il possesso degli NFT sono comunque **garantiti e verificabili on-chain** tramite **Etherscan** e importazione manuale nel wallet, come dimostrato dai link diretti ai metadati e alle immagini su IPFS.

---

## Come Eseguire il Progetto

### 1. Installazione

Clonare il repository ed eseguire il seguente comando per installare tutte le dipendenze:
```bash
npm install
Use code with caution.
Markdown
2. Configurazione dell'Ambiente
Creare un file .env nella directory principale del progetto e aggiungere le seguenti variabili:
Generated code
SEPOLIA_RPC_URL="IL_TUO_URL_INFURA_O_ALCHEMY"
PRIVATE_KEY="LA_TUA_CHIAVE_PRIVATA_METAMASK"
ETHERSCAN_API_KEY="LA_TUA_API_KEY_DI_ETHERSCAN"
Use code with caution.
3. Eseguire i Test
Per verificare la correttezza del contratto, lanciare la suite di test completa.
Generated bash
npx hardhat test
Use code with caution.
Bash
4. Deploy su Testnet
Per deployare il contratto sulla rete Sepolia:
Generated bash
npx hardhat ignition deploy ./ignition/modules/DeployMyNFT.js --network sepolia
Use code with caution.
Bash
Dopo il deploy, usare il comando verify per pubblicare il codice sorgente:
Generated bash
npx hardhat verify --network sepolia <INDIRIZZO_DEL_CONTRATTO_DEPLOYATO>
Use code with caution.
Bash
5. Generare la Documentazione
Per creare la documentazione tecnica in formato HTML:```bash
npx hardhat docgen
Generated code
Il risultato sarà disponibile nel file `docs/MyNFT.html`.