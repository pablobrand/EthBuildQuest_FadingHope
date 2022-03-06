pragma solidity ^0.8.0;

/// Factory for mint new contracts
/// Factory should store unique ID for minted contract.
/// Storing on master logic contract cause duplication code.
/// Get playerID, unitID, will go through factory book instead of master.

interface IFactory {
    // mint
    function mintNFT(address owner, string memory id) external returns (address);

    // convert string to bytes32 by hash sha256 and revert will be handle on frontend part
    // Also NFT should store original string id on contract too. For easier reading.
    function getNFTbyID(bytes32 id) external view returns (address nftAddress);

    /// Since ENS rely on subgrapth to convert bytes32 to string. We cannot do the same.
    /// We simply store all string id on contract. Then call NFT view function to get ID. After to get the NFTs address from id
    /// So 2 call from ID to get real name
    function getNFTname(address nftAddress) external view returns (string memory);

    function getNFTNameFromID(bytes32 id) external view returns (string memory);
}
