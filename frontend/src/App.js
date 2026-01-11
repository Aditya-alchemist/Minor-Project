import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Manufacturer from './pages/Manufacturer';
import Verify from './pages/Verify';
import { connectWallet } from './utils/blockchain';
import './App.css';

function App() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        // Check if wallet is already connected
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        handleWalletConnect();
                    }
                })
                .catch(console.error);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    setWalletAddress(null);
                    setContract(null);
                    setProvider(null);
                } else {
                    handleWalletConnect();
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    const handleWalletConnect = async () => {
        try {
            const { address, provider, contract } = await connectWallet();
            setWalletAddress(address);
            setProvider(provider);
            setContract(contract);
            console.log('Wallet connected:', address);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert(error.message);
        }
    };

    return (
        <Router>
            <div className="App">
                <Navbar 
                    walletAddress={walletAddress}
                    onWalletConnect={handleWalletConnect}
                />
                
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/manufacturer" 
                        element={
                            <Manufacturer 
                                walletAddress={walletAddress}
                                contract={contract}
                                provider={provider}
                            />
                        } 
                    />
                    <Route 
                        path="/verify" 
                        element={
                            <Verify 
                                walletAddress={walletAddress}
                                contract={contract}
                                provider={provider}
                            />
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
