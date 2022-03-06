// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMaster.sol";
import "./interfaces/IKingdom.sol";

/// This master contract have size limit. So split logic of factory to their own file.
/// This should implement diamond/facet storage contract but it was too complicated for hackathon.
/// So this contract will handle most of logic in game without modular code.

/// Store most of logic here.
/// It is the best that master contract only have logic and not store storage.

contract MasterContract is Ownable { // , IMaster {

    IKingdom public  kingdomNFT;

    function setKingdomNFT(IKingdom _kingdomNFT) external onlyOwner() {
        kingdomNFT = _kingdomNFT;
    }

    function freeMint(address _to, string memory kingdomName) external {
        kingdomNFT.mint(_to, kingdomName);
    }

}
