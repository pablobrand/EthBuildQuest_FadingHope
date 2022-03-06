pragma solidity ^0.8.0;

interface IFactory {
    // mint
    function mintNFT(address, bytes32) external returns (address);
}
