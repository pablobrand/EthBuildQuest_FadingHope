// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// allow store, get special metadata on smart contract
/// On how mapping work, bytes32 of keccak256(string key) is used as key for cheaper operation.
/// Frontend will have to convert key to readable format by have a dictionary of possible key to read data
interface IPersonalization {
    event NewMetaData(bytes32 key, string value);

    /// get the metadata
    function getMetadata(bytes32 key) external view returns (string memory);

    /// set the metadata
    function setMetadata(bytes32 key, string memory _metadata) external;
}
