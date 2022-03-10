// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ChatSystem {
    string[] public pinMessages;
    uint256[] public pinTimestamps;

    event GlobalMessageEvent(string message);
    event PinGlobalMessageEvent(string message);

    function getLength() public view returns (uint256) {
        return pinMessages.length;
    }

    function ViewLastPinnedMessage(uint256 count) public view returns (string[] memory messages, uint256[] memory timestamps) {
        messages = new string[](count);
        timestamps = new uint256[](count);
        uint256 i = messages.length - count;
        uint256 j = 0;
        for (; i < messages.length; i++) {
            messages[j] = pinMessages[i];
            timestamps[j] = pinTimestamps[i];
            j++;
        }
    }

    function SendGlobalMessage(string calldata message) external {
        emit GlobalMessageEvent(message);
    }

    function PinGlobalMessage(string memory message) external {
        pinMessages.push(message);
        pinTimestamps.push(block.timestamp);
        emit PinGlobalMessageEvent(message);
    }
}
