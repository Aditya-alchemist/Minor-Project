import React from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const Navbar = ({ walletAddress, onWalletConnect }) => {
    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <h1 style={styles.logoText}>🔐 AuthentiScan</h1>
                    <p style={styles.logoSubtext}>AI-Powered Product Authentication</p>
                </Link>
                
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.link}>Home</Link>
                    <Link to="/manufacturer" style={styles.link}>Manufacturer</Link>
                    <Link to="/verify" style={styles.link}>Verify Product</Link>
                    <WalletConnect 
                        walletAddress={walletAddress}
                        onConnect={onWalletConnect}
                    />
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        textDecoration: 'none'
    },
    logoText: {
        fontSize: '1.5rem',
        color: '#2563eb',
        margin: 0
    },
    logoSubtext: {
        fontSize: '0.8rem',
        color: '#6b7280',
        margin: 0
    },
    navLinks: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
    },
    link: {
        textDecoration: 'none',
        color: '#1f2937',
        fontWeight: 500,
        transition: 'color 0.3s'
    }
};

export default Navbar;
