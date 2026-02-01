// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Arcade8004 is ERC721, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using Strings for uint256;

    uint256 private _tokenIds;
    
    // The address of the trusted game agent that signs the score verifications
    address public gameAgent;
    
    // Base URI for metadata
    string public baseURI;
    
    // Track if a wallet has already minted (global restriction across all games)
    mapping(address => bool) public hasMinted;

    // Mint price (~$5 equivalent)
    uint256 public constant MINT_PRICE = 0.002 ether;

    event NFTMinted(address indexed player, uint256 tokenId);
    event GameAgentUpdated(address indexed newAgent);

    constructor(address _gameAgent) ERC721("8004 Arcade", "A8004") Ownable(msg.sender) {
        require(_gameAgent != address(0), "Invalid agent address");
        gameAgent = _gameAgent;
    }

    /**
     * @dev Mints a new NFT if the user has a valid signature from the game agent.
     * The signature proves they reached the required score.
     * Users can only mint ONE NFT per wallet, regardless of which game they played.
     * 
     * @param signature The cryptographic signature from the game agent
     */
    function mint(bytes calldata signature) external payable {
        require(!hasMinted[msg.sender], "Wallet has already minted an NFT");
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent (0.002 ETH required)");
        
        // Verify the signature
        // The message includes the contract address to prevent cross-contract replay attacks
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, address(this)));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        address signer = ethSignedMessageHash.recover(signature);
        
        require(signer == gameAgent, "Invalid signature from game agent");
        
        // Mark as minted BEFORE interaction to prevent re-entrancy (though _mint is safe)
        hasMinted[msg.sender] = true;
        
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        
        _safeMint(msg.sender, newItemId);
        
        emit NFTMinted(msg.sender, newItemId);
    }

    /**
     * @dev Withdraws the collected ETH to the owner's wallet
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Updates the trusted game agent address
     */
    function setGameAgent(address _newAgent) external onlyOwner {
        require(_newAgent != address(0), "Invalid agent address");
        gameAgent = _newAgent;
        emit GameAgentUpdated(_newAgent);
    }

    /**
     * @dev Sets the Base URI for metadata
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    /**
     * @dev Internal function to return the base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Overrides tokenURI to append .json extension
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory base = _baseURI();
        return bytes(base).length > 0 ? string(abi.encodePacked(base, Strings.toString(tokenId), ".json")) : "";
    }

    /**
     * @dev View function to check if a wallet is eligible to mint
     */
    function canMint(address wallet) external view returns (bool) {
        return !hasMinted[wallet];
    }
}
