import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x197ecd355222dD8c403352c057dFb53f1280AbA9';

export const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "authorizedManufacturers",
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
        "inputs": [{"internalType": "string", "name": "_productId", "type": "string"}],
        "name": "productExists",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
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
        "inputs": [{"internalType": "address", "name": "_manufacturer", "type": "address"}],
        "name": "getManufacturerProducts",
        "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalProducts",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

export const SEPOLIA_CHAIN_ID = 11155111;

export const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask!');
    }

    const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== SEPOLIA_CHAIN_ID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
            });
        } catch (error) {
            throw new Error('Please switch to Sepolia testnet');
        }
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    return {
        address: accounts[0],
        provider,
        signer,
        contract
    };
};

export const getContract = (providerOrSigner) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
};

export const createImageHash = (data) => {
    return ethers.utils.id(data);
};

export const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
};
