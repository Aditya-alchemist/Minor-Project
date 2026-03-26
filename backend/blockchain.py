from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
import json
import hashlib
from typing import Dict, Optional


class BlockchainManager:
    """Manage blockchain interactions for product authentication"""
    
    def __init__(self, rpc_url: str, contract_address: str, private_key: str):
        """
        Initialize blockchain connection
        
        Args:
            rpc_url: RPC endpoint (e.g., Ethereum Sepolia)
            contract_address: Deployed contract address
            private_key: Your wallet private key
        """
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Add PoA middleware for testnets
        self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        
        # Verify connection
        if not self.w3.is_connected():
            raise Exception("Failed to connect to blockchain")
        
        print(f"✅ Connected to blockchain")
        print(f"   Network Chain ID: {self.w3.eth.chain_id}")
        
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.private_key = private_key
        self.account = self.w3.eth.account.from_key(private_key)
        
        print(f"   Account: {self.account.address}")
        print(f"   Balance: {self.w3.from_wei(self.w3.eth.get_balance(self.account.address), 'ether')} ETH")
        
        # Load contract ABI
        self.contract = self.load_contract()
    
    def load_contract(self):
        """Load smart contract ABI"""
        # Contract ABI (copy from Hardhat artifacts or compile output)
        abi = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "address", "name": "manufacturer", "type": "address"}
            ],
            "name": "ManufacturerAuthorized",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "address", "name": "manufacturer", "type": "address"}
            ],
            "name": "ManufacturerRevoked",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "string", "name": "productId", "type": "string"},
                {"indexed": True, "internalType": "address", "name": "manufacturer", "type": "address"},
                {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
            ],
            "name": "ProductRegistered",
            "type": "event"
        },
        {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "internalType": "string", "name": "productId", "type": "string"},
                {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"},
                {"indexed": False, "internalType": "bool", "name": "result", "type": "bool"},
                {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
            ],
            "name": "ProductVerified",
            "type": "event"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "authorizedManufacturers",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "_manufacturer", "type": "address"}],
            "name": "authorizeManufacturer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"},
                      {"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "manufacturerProducts",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "", "type": "string"}],
            "name": "products",
            "outputs": [
                {"internalType": "string", "name": "productId", "type": "string"},
                {"internalType": "string", "name": "productName", "type": "string"},
                {"internalType": "bytes32", "name": "imageHash", "type": "bytes32"},
                {"internalType": "address", "name": "manufacturer", "type": "address"},
                {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
                {"internalType": "string", "name": "metadata", "type": "string"},
                {"internalType": "bool", "name": "exists", "type": "bool"},
                {"internalType": "uint256", "name": "verificationCount", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "_productId", "type": "string"}],
            "name": "productExists",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_productId", "type": "string"},
                {"internalType": "string", "name": "_productName", "type": "string"},
                {"internalType": "bytes32", "name": "_imageHash", "type": "bytes32"},
                {"internalType": "string", "name": "_metadata", "type": "string"}
            ],
            "name": "registerProduct",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "_manufacturer", "type": "address"}],
            "name": "revokeManufacturer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_productId", "type": "string"},
                {"internalType": "string", "name": "_metadata", "type": "string"}
            ],
            "name": "updateProductMetadata",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "string", "name": "_productId", "type": "string"},
                {"internalType": "bytes32", "name": "_imageHash", "type": "bytes32"},
                {"internalType": "string", "name": "_location", "type": "string"}
            ],
            "name": "verifyProduct",
            "outputs": [{"internalType": "bool", "name": "isAuthentic", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "_productId", "type": "string"}],
            "name": "getProduct",
            "outputs": [
                {"internalType": "string", "name": "productName", "type": "string"},
                {"internalType": "bytes32", "name": "imageHash", "type": "bytes32"},
                {"internalType": "address", "name": "manufacturer", "type": "address"},
                {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
                {"internalType": "string", "name": "metadata", "type": "string"},
                {"internalType": "uint256", "name": "verificationCount", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "_manufacturer", "type": "address"}],
            "name": "getManufacturerProducts",
            "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "_productId", "type": "string"}],
            "name": "getVerificationHistory",
            "outputs": [
                {
                    "components": [
                        {"internalType": "address", "name": "verifier", "type": "address"},
                        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                        {"internalType": "bool", "name": "result", "type": "bool"},
                        {"internalType": "string", "name": "location", "type": "string"}
                    ],
                    "internalType": "struct ProductAuthentication.VerificationRecord[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTotalProducts",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "string", "name": "", "type": "string"},
                      {"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "verificationHistory",
            "outputs": [
                {"internalType": "address", "name": "verifier", "type": "address"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "bool", "name": "result", "type": "bool"},
                {"internalType": "string", "name": "location", "type": "string"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]


        
        contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=abi
        )
        
        print(f"✅ Contract loaded: {self.contract_address}\n")
        return contract
    
    def create_image_hash(self, image_features: bytes) -> bytes:
        """
        Create a hash from image features extracted by AI model
        
        Args:
            image_features: Feature vector from CNN model
        
        Returns:
            bytes32 hash
        """
        hash_obj = hashlib.sha256(image_features)
        return hash_obj.digest()
    
    def register_product(
        self,
        product_id: str,
        product_name: str,
        image_features: bytes,
        metadata: str
    ) -> Dict:
        """
        Register a new product on blockchain
        
        Args:
            product_id: Unique product identifier (SKU/barcode)
            product_name: Name of the product
            image_features: Feature vector from AI model
            metadata: Additional product info (JSON string)
        
        Returns:
            Transaction receipt
        """
        try:
            # Create image hash
            image_hash = self.create_image_hash(image_features)
            
            # Get current gas price and increase by 20% for faster confirmation
            gas_price = int(self.w3.eth.gas_price * 1.2)
            
            # Build transaction
            txn = self.contract.functions.registerProduct(
                product_id,
                product_name,
                image_hash,
                metadata
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': gas_price,
                'chainId': self.w3.eth.chain_id
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            print(f"📤 Transaction sent: {tx_hash.hex()}")
            print(f"   View on Etherscan: https://sepolia.etherscan.io/tx/{tx_hash.hex()}")
            
            # Wait for confirmation with 5 minute timeout
            print("⏳ Waiting for confirmation (may take 1-3 minutes on Sepolia)...")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            if receipt['status'] == 1:
                print(f"✅ Transaction confirmed in block {receipt['blockNumber']}")
                return {
                    'success': True,
                    'tx_hash': tx_hash.hex(),
                    'block_number': receipt['blockNumber'],
                    'gas_used': receipt['gasUsed'],
                    'product_id': product_id,
                    'image_hash': image_hash.hex()
                }
            else:
                print(f"❌ Transaction failed")
                return {
                    'success': False,
                    'error': 'Transaction reverted'
                }
            
        except Exception as e:
            print(f"❌ Error registering product: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_product(
        self,
        product_id: str,
        image_features: bytes,
        location: str = ""
    ) -> Dict:
        """
        Verify a product against blockchain
        
        Args:
            product_id: Product identifier to verify
            image_features: Feature vector from scanned product
            location: Location where verification happened
        
        Returns:
            Verification result
        """
        try:
            # Create image hash from scanned product
            image_hash = self.create_image_hash(image_features)
            
            # Get current gas price and increase by 20%
            gas_price = int(self.w3.eth.gas_price * 1.2)
            
            # Build transaction
            txn = self.contract.functions.verifyProduct(
                product_id,
                image_hash,
                location
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 300000,
                'gasPrice': gas_price,
                'chainId': self.w3.eth.chain_id
            })
            
            # Sign and send
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            print(f"📤 Verification transaction: {tx_hash.hex()}")
            print(f"   View on Etherscan: https://sepolia.etherscan.io/tx/{tx_hash.hex()}")
            print("⏳ Waiting for confirmation...")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            # Check transaction status
            is_authentic = receipt['status'] == 1
            
            if is_authentic:
                print(f"✅ Verification confirmed in block {receipt['blockNumber']}")
            else:
                print(f"❌ Verification transaction failed")
            
            return {
                'success': True,
                'is_authentic': is_authentic,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt['blockNumber']
            }
            
        except Exception as e:
            print(f"❌ Error verifying product: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_product_info(self, product_id: str) -> Optional[Dict]:
        """
        Get product information from blockchain
        
        Args:
            product_id: Product identifier
        
        Returns:
            Product details or None
        """
        try:
            result = self.contract.functions.getProduct(product_id).call()
            
            return {
                'product_name': result[0],
                'image_hash': result[1].hex(),
                'manufacturer': result[2],
                'registration_time': result[3],
                'metadata': result[4],
                'verification_count': result[5]
            }
            
        except Exception as e:
            print(f"❌ Error getting product info: {e}")
            return None
    
    def check_product_exists(self, product_id: str) -> bool:
        """Check if product is registered on blockchain"""
        try:
            return self.contract.functions.productExists(product_id).call()
        except:
            return False


