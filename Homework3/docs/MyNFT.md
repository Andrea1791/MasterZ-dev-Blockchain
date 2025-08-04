# Solidity API

## MyNFT

### GOLD_COIN

```solidity
uint256 GOLD_COIN
```

### LEGENDARY_SWORD

```solidity
uint256 LEGENDARY_SWORD
```

### VALOROUS_SWORD

```solidity
uint256 VALOROUS_SWORD
```

### HERO_SWORD

```solidity
uint256 HERO_SWORD
```

### COMMON_SWORD

```solidity
uint256 COMMON_SWORD
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(address account, uint256 id, uint256 amount, bytes data) public
```

Permette al proprietario di coniare nuovi token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | L'indirizzo che riceverà i nuovi token. |
| id | uint256 | L'ID del token da coniare. |
| amount | uint256 | La quantità di token da coniare. |
| data | bytes | Dati addizionali (solitamente vuoti). |

