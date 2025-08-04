// File: contracts/NotaryV2.sol (MODIFICATO)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NotaryV1.sol";

contract NotaryV2 is NotaryV1 {
    // Non servono modifiche qui, eredita tutto da V1
    function renameDocument(bytes32 oldHash, bytes32 newHash) public {
        require(msg.sender == owner(), "Only owner can rename"); // Usiamo owner()
        
        address docOwner = getDocumentOwner(oldHash);
        require(docOwner != address(0), "Old document does not exist");
        require(getDocumentOwner(newHash) == address(0), "New document hash already in use");

        _documents[newHash] = docOwner;
        delete _documents[oldHash];
    }
}