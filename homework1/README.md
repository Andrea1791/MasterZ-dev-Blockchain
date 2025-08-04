# Homework 1 – ERC20 Token con Blacklist

Questo progetto implementa un token ERC20 con funzionalità di blacklist, sviluppato come parte del corso MasterZ Developer Blockchain.

## 📦 Struttura del progetto

- `contracts/Token.sol`: contratto ERC20 che include:
  - Mint
  - Burn
  - Verifica di blacklist su `transfer`
- `contracts/Blacklist.sol`: contratto separato per gestire una blacklist di indirizzi
- `test/token.test.js`: test automatici per validare il comportamento del token e della blacklist
- `migrations/`: script di deploy per Truffle
- `truffle-config.js`: configurazione di rete per Truffle

## 🚀 Funzionalità implementate

- `mint(address, amount)`: solo l'owner può mintare
- `burn(amount)`: ogni utente può bruciare i propri token
- `transfer`: viene bloccato se il sender o il destinatario è in blacklist
- `Blacklist.setBlacklist(address[])`: aggiunge indirizzi alla blacklist
- `Blacklist.resetBlacklist(address[])`: rimuove indirizzi dalla blacklist

## 🔒 Sicurezza

- L'accesso alle funzioni critiche è controllato da `Ownable`
- Il contratto controlla che né il mittente né il destinatario siano blacklistati prima di ogni trasferimento

## 🧪 Testing

Il file `test/token.test.js` esegue:

- ✅ Deploy dei contratti
- ✅ Mint valido e non valido
- ✅ Set/reset della blacklist
- ✅ Transfer funzionante
- ✅ Transfer bloccato per indirizzo blacklistato

### 📜 Esempio di test superato

```js
await blacklist.setBlacklist([account3]);
expect(await blacklist.isBlacklisted(account3)).to.equal(true);
await expectRevert(token.transfer(account3, 10, { from: account1 }),
  "Transfer not allowed: address is blacklisted");
🔧 Requisiti
Node.js

Truffle (npm install -g truffle)

Ganache (o altra rete compatibile)

▶️ Esecuzione
Installa le dipendenze:

bash
Copia
Modifica
npm install
Avvia la rete locale con Ganache

Migra i contratti:

bash
Copia
Modifica
truffle migrate
Avvia i test:

bash
Copia
Modifica
truffle test
