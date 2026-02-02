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
    
    // Track number of mints per wallet
    mapping(address => uint256) public mintCounts;

    // Mint price (~$1 equivalent)
    uint256 public mintPrice = 0.0003 ether;
    // Max supply cap
    uint256 public constant MAX_SUPPLY = 5555;
    // Free mint global limit
    uint256 public constant FREE_MINT_LIMIT = 500;
    // Max per wallet
    uint256 public constant MAX_PER_WALLET = 3;

    event NFTMinted(address indexed player, uint256 tokenId);
    event GameAgentUpdated(address indexed newAgent);
    event MintPriceUpdated(uint256 newPrice);

    constructor(address _gameAgent) ERC721("8004 Arcade", "A8004") Ownable(msg.sender) {
        require(_gameAgent != address(0), "Invalid agent address");
        gameAgent = _gameAgent;
    }

    /**
     * @dev Mints new NFTs if the user has a valid signature.
     * First 500 global mints allow 1 free mint per wallet.
     * Subsequent mints or late mints cost $1.
     * Max 3 per wallet.
     */
    function mint(uint256 amount, bytes calldata signature) external payable {
        require(amount > 0, "Amount must be > 0");
        require(_tokenIds + amount <= MAX_SUPPLY, "Max supply reached");
        require(mintCounts[msg.sender] + amount <= MAX_PER_WALLET, "Wallet limit reached (3 max)");
        
        // Calculate Cost
        uint256 cost = 0;
        for (uint256 i = 0; i < amount; i++) {
            // Check if this specific mint is eligible for free tier
            // Rule: Global Supply must be within limit AND it must be user's first mint
            bool isFree = (_tokenIds + i + 1 <= FREE_MINT_LIMIT) && (mintCounts[msg.sender] + i == 0);
            
            if (!isFree) {
                cost += mintPrice;
            }
        }
        
        require(msg.value >= cost, "Insufficient ETH sent");
        
        // Verify the signature
        // The message includes the contract address to prevent cross-contract replay attacks
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, address(this)));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        address signer = ethSignedMessageHash.recover(signature);
        
        require(signer == gameAgent, "Invalid signature from game agent");
        
        // Update counts
        mintCounts[msg.sender] += amount;
        
        // Mint loop
        for (uint256 i = 0; i < amount; i++) {
            _tokenIds++;
            _safeMint(msg.sender, _tokenIds);
            emit NFTMinted(msg.sender, _tokenIds);
        }
    }

    /**
     * @dev Updates the mint price
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
        emit MintPriceUpdated(_newPrice);
    }

    /**
     * @dev Withdraws the collected ETH to a specific wallet
     */
    function withdraw(address payable _recipient) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        require(_recipient != address(0), "Invalid recipient address");
        _recipient.transfer(balance);
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
        return mintCounts[wallet] < MAX_PER_WALLET;
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
}
