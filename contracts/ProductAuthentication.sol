// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



//	0x197ecd355222dD8c403352c057dFb53f1280AbA9

/**
 * @title ProductAuthentication
 * @dev Smart contract for anti-counterfeit product verification
 * @author Aditya - KIIT University
 */

contract ProductAuthentication {
    
    // Product structure
    struct Product {
        string productId;           // Unique product identifier (SKU/barcode)
        string productName;         // Product name
        bytes32 imageHash;          // Hash of product image features
        address manufacturer;       // Address of the manufacturer
        uint256 registrationTime;   // Timestamp of registration
        string metadata;            // Additional info (batch, category, etc.)
        bool exists;                // Check if product exists
        uint256 verificationCount;  // Number of times verified
    }
    
    // Mapping from productId to Product
    mapping(string => Product) public products;
    
    // Mapping to track manufacturer's products
    mapping(address => string[]) public manufacturerProducts;
    
    // Mapping to store verification history
    mapping(string => VerificationRecord[]) public verificationHistory;
    
    // Verification record structure
    struct VerificationRecord {
        address verifier;
        uint256 timestamp;
        bool result;
        string location;
    }
    
    // Authorized manufacturers (optional whitelist)
    mapping(address => bool) public authorizedManufacturers;
    address public owner;
    
    // Events
    event ProductRegistered(
        string indexed productId,
        address indexed manufacturer,
        uint256 timestamp
    );
    
    event ProductVerified(
        string indexed productId,
        address indexed verifier,
        bool result,
        uint256 timestamp
    );
    
    event ManufacturerAuthorized(address indexed manufacturer);
    event ManufacturerRevoked(address indexed manufacturer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedManufacturers[msg.sender] || msg.sender == owner,
            "Not authorized manufacturer"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedManufacturers[msg.sender] = true;
    }
    
    /**
     * @dev Register a new product on the blockchain
     * @param _productId Unique product identifier
     * @param _productName Name of the product
     * @param _imageHash Hash of product image features from AI model
     * @param _metadata Additional product information (JSON string)
     */
    function registerProduct(
        string memory _productId,
        string memory _productName,
        bytes32 _imageHash,
        string memory _metadata
    ) public onlyAuthorized {
        require(!products[_productId].exists, "Product already registered");
        require(bytes(_productId).length > 0, "Product ID cannot be empty");
        require(_imageHash != bytes32(0), "Image hash cannot be empty");
        
        products[_productId] = Product({
            productId: _productId,
            productName: _productName,
            imageHash: _imageHash,
            manufacturer: msg.sender,
            registrationTime: block.timestamp,
            metadata: _metadata,
            exists: true,
            verificationCount: 0
        });
        
        manufacturerProducts[msg.sender].push(_productId);
        
        emit ProductRegistered(_productId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify a product by comparing image hash
     * @param _productId Product identifier to verify
     * @param _imageHash Hash of the scanned product image
     * @param _location Location where verification happened (optional)
     * @return isAuthentic Whether the product is authentic
     */
    function verifyProduct(
        string memory _productId,
        bytes32 _imageHash,
        string memory _location
    ) public returns (bool isAuthentic) {
        require(products[_productId].exists, "Product not registered");
        
        // Compare image hash
        isAuthentic = (products[_productId].imageHash == _imageHash);
        
        // Record verification
        verificationHistory[_productId].push(VerificationRecord({
            verifier: msg.sender,
            timestamp: block.timestamp,
            result: isAuthentic,
            location: _location
        }));
        
        // Increment verification count
        products[_productId].verificationCount++;
        
        emit ProductVerified(_productId, msg.sender, isAuthentic, block.timestamp);
        
        return isAuthentic;
    }
    
    /**
     * @dev Get product details
     * @param _productId Product identifier
     */
    function getProduct(string memory _productId) 
        public 
        view 
        returns (
            string memory productName,
            bytes32 imageHash,
            address manufacturer,
            uint256 registrationTime,
            string memory metadata,
            uint256 verificationCount
        ) 
    {
        require(products[_productId].exists, "Product not found");
        Product memory product = products[_productId];
        
        return (
            product.productName,
            product.imageHash,
            product.manufacturer,
            product.registrationTime,
            product.metadata,
            product.verificationCount
        );
    }
    
    /**
     * @dev Check if product exists
     * @param _productId Product identifier
     */
    function productExists(string memory _productId) public view returns (bool) {
        return products[_productId].exists;
    }
    
    /**
     * @dev Get all products registered by a manufacturer
     * @param _manufacturer Address of the manufacturer
     */
    function getManufacturerProducts(address _manufacturer) 
        public 
        view 
        returns (string[] memory) 
    {
        return manufacturerProducts[_manufacturer];
    }
    
    /**
     * @dev Get verification history for a product
     * @param _productId Product identifier
     */
    function getVerificationHistory(string memory _productId)
        public
        view
        returns (VerificationRecord[] memory)
    {
        require(products[_productId].exists, "Product not found");
        return verificationHistory[_productId];
    }
    
    /**
     * @dev Authorize a manufacturer (only owner)
     * @param _manufacturer Address to authorize
     */
    function authorizeManufacturer(address _manufacturer) public onlyOwner {
        authorizedManufacturers[_manufacturer] = true;
        emit ManufacturerAuthorized(_manufacturer);
    }
    
    /**
     * @dev Revoke manufacturer authorization (only owner)
     * @param _manufacturer Address to revoke
     */
    function revokeManufacturer(address _manufacturer) public onlyOwner {
        authorizedManufacturers[_manufacturer] = false;
        emit ManufacturerRevoked(_manufacturer);
    }
    
    /**
     * @dev Update product metadata (only original manufacturer)
     * @param _productId Product identifier
     * @param _metadata New metadata
     */
    function updateProductMetadata(
        string memory _productId,
        string memory _metadata
    ) public {
        require(products[_productId].exists, "Product not found");
        require(
            products[_productId].manufacturer == msg.sender,
            "Only manufacturer can update"
        );
        
        products[_productId].metadata = _metadata;
    }
    
    /**
     * @dev Get total number of products registered
     */
    function getTotalProducts() public view returns (uint256) {
        return manufacturerProducts[owner].length;
    }
}
