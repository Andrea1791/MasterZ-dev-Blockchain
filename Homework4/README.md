# Progetto Homework 4: Architetture Avanzate di Smart Contract

Questo repository contiene la mia soluzione per l'homework del corso "Blockchain Developer" di MAsterZ. Il progetto esplora due architetture fondamentali per lo sviluppo di applicazioni decentralizzate robuste e scalabili: i **Contratti Aggiornabili** e le **Clone Factory**.

## Struttura del Progetto

Il progetto è sviluppato utilizzando **Hardhat** e include:
*   **Contratti Solidity:** Implementazioni dei pattern richiesti.
*   **Script di Deploy e Interazione:** Per la gestione e l'utilizzo dei contratti su una testnet.
*   **Test Unitari Completi:** Una suite di test approfondita scritta con Mocha e Chai per garantire l'affidabilità e la correttezza del codice.

---

## 1. Il Contratto Aggiornabile (`Notary`)

La prima parte del progetto affronta il problema dell'immutabilità della blockchain. Per consentire la manutenzione e l'evoluzione futura di un contratto senza dover migrare i dati, ho implementato un sistema di notarizzazione di documenti basato sul **Proxy Pattern**.

### Architettura

*   **`NotaryV1.sol`**: La prima versione del contratto logico. Permette a chiunque di registrare l'hash di un documento. È stato progettato seguendo lo standard **UUPS (Universal Upgradeable Proxy Standard)**, ereditando da `UUPSUpgradeable` e `OwnableUpgradeable` per una gestione sicura degli aggiornamenti.
*   **`NotaryV2.sol`**: Una seconda versione che estende la V1, aggiungendo una nuova funzionalità (`renameDocument`) che solo il proprietario del contratto può eseguire. È stato scritto per essere compatibile con lo storage della V1.
*   **Test (`test/Notary.test.js`)**: I test verificano l'intero ciclo di vita:
    1.  Il corretto funzionamento della V1.
    2.  Il successo dell'aggiornamento alla V2.
    3.  La **preservazione dello stato** attraverso l'aggiornamento.
    4.  Il funzionamento della nuova logica e dei relativi permessi nella V2.

---

## 2. La Token Factory (`GameItemsFactory`)

La seconda parte del progetto esplora come creare istanze multiple di un contratto in modo efficiente ed economico. Ho applicato questo concetto a un mio progetto precedente – un contratto `ERC1155` per oggetti di gioco – trasformandolo da un singolo prodotto a una piattaforma scalabile.

### L'Idea: Da Gioco a Piattaforma ("MAsterZ Game Engine")

L'intenzione di questo esercizio va oltre la semplice creazione di token. L'obiettivo era quello di costruire l'infrastruttura per una **piattaforma di gioco decentralizzata**, simile a un "Roblox" o "Minecraft" on-chain, che ho chiamato "MAsterZ Game Engine".

In questo modello:
*   Il mio contratto `GameItems.sol` non rappresenta più gli oggetti del *mio* gioco, ma è un **modello standardizzato** che la piattaforma offre.
*   La `GameItemsFactory.sol` è il **portale** attraverso cui altri creatori possono lanciare i propri mondi di gioco.

### Come Funziona la Piattaforma

1.  **Un Nuovo Sviluppatore si Unisce:** Uno sviluppatore di giochi indie vuole creare il suo gioco, "Le Cronache di Etheria", usando il mio motore.
2.  **Usa la Factory:** Interagisce con la `GameItemsFactory` e chiama la funzione `createGameSet()`.
3.  **Fornisce la Propria Creatività:** Durante la chiamata, passa un parametro fondamentale: il **suo URI IPFS**. Questo URI punta ai *suoi* metadati, con la *sua* arte e le *sue* statistiche per spade, scudi e pozioni.
4.  **Creazione Istantanea e Sovrana:** La factory usa il pattern **Clone (EIP-1167)** per creare un'istanza del contratto `GameItems` quasi istantaneamente e a un costo irrisorio. Questo nuovo contratto clonato è:
    *   **Isolato:** I suoi oggetti sono separati da tutti gli altri giochi.
    *   **Sovrano:** Lo sviluppatore indie ne è il `owner`, con pieno controllo sui suoi oggetti di gioco.

### Architettura e Test

*   **`GameItems.sol`**: Il mio contratto `ERC1155` originale, "rifattorizzato" per essere un modello clonabile. Tutta la logica che era nel `constructor` è stata spostata in una funzione `initialize`, che accetta l'URI e il proprietario come parametri.
*   **`GameItemsFactory.sol`**: Il contratto "fabbrica" che contiene l'indirizzo del modello e la funzione pubblica per creare i cloni.
*   **Test (`test/GameItemsFactory.test.js`)**: La suite di test dedicata è stata fondamentale per verificare:
    1.  Che la factory crei cloni correttamente, emettendo gli eventi attesi.
    2.  Che ogni clone sia **inizializzato con l'URI e il proprietario giusti**.
    3.  Che il **minting iniziale** degli oggetti nel clone avvenga correttamente.
    4.  Che i cloni siano **indipendenti e sovrani**, e che solo il loro proprietario possa usare le funzioni con privilegi come `mint`.

Questo approccio trasforma un singolo prodotto in un **ecosistema aperto e scalabile**, abilitando i contenuti generati dagli utenti (UGC) e la vera proprietà digitale in un contesto multi-gioco.

---

### Come Eseguire il Progetto

#### 1. Installazione

Clonare il repository ed eseguire il seguente comando per installare tutte le dipendenze:
```bash
npm install
```

#### 2. Configurazione dell'Ambiente

Creare un file `.env` nella directory principale del progetto e aggiungere le seguenti variabili:
```
SEPOLIA_RPC_URL="IL_TUO_URL_INFURA_O_ALCHEMY"
PRIVATE_KEY="LA_TUA_CHIAVE_PRIVATA_METAMASK"
```

#### 3. Eseguire i Test

Per verificare la correttezza di tutti i contratti, lanciare la suite di test completa. Questo comando eseguirà sia `Notary.test.js` che `GameItemsFactory.test.js`.
```bash
npx hardhat test
```

#### 4. Deploy e Interazione su Testnet

Gli script sono forniti per deployare e interagire con i contratti sulla rete Sepolia.

**Contratto Aggiornabile `Notary`:**
```bash
# 1. Deploya la V1 del contratto
npx hardhat run scripts/deploy.js --network sepolia

# 2. Aggiorna alla V2 (ricorda di inserire l'indirizzo del proxy nello script 'upgrade.js')
npx hardhat run scripts/upgrade.js --network sepolia
```

**Piattaforma `GameItemsFactory`:**
```bash
# 1. Deploya il modello e la factory
npx hardhat run scripts/deploy-game-factory.js --network sepolia

# 2. Usa la factory per creare un nuovo set di oggetti (ricorda di inserire l'indirizzo della factory nello script 'use-game-factory.js')
npx hardhat run scripts/use-game-factory.js --network sepolia
```