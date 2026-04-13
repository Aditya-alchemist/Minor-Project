import React, { useState, useEffect } from 'react';
import { shortenAddress } from '../utils/blockchain';

const WalletConnect = ({ walletAddress, onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <button
            onClick={handleConnect}
            disabled={isConnecting || walletAddress}
            style={{
                ...styles.button,
                background: walletAddress ? '#14b884' : 'linear-gradient(135deg, #00aee6 0%, #3b82f6 100%)'
            }}
        >
            {isConnecting ? 'Connecting...' : 
             walletAddress ? shortenAddress(walletAddress) : 
             'Connect Wallet'}
        </button>
    );
};

const styles = {
    button: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s'
    }
};

export default WalletConnect;
