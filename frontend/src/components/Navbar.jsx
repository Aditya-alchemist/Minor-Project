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
        background: 'rgba(8, 14, 26, 0.78)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(110, 139, 191, 0.25)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
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
        color: '#72f1ff',
        margin: 0
    },
    logoSubtext: {
        fontSize: '0.8rem',
        color: '#9fb0d2',
        margin: 0
    },
    navLinks: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
    },
    link: {
        textDecoration: 'none',
        color: '#e8eefc',
        fontWeight: 500,
        transition: 'color 0.3s'
    }
};

export default Navbar;
