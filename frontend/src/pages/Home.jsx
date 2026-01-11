import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { getContract, CONTRACT_ADDRESS } from '../utils/blockchain';

const Home = () => {
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider(
                'https://sepolia.etherscan.io'
            );
            const contract = getContract(provider);
            const total = await contract.getTotalProducts();
            setTotalProducts(total.toNumber());
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div>
            <header style={styles.hero}>
                <div style={styles.container}>
                    <div style={styles.heroContent}>
                        <h1 style={styles.heroTitle}>Stop Counterfeit Products</h1>
                        <p style={styles.heroSubtitle}>Powered by AI & Blockchain Technology</p>
                        <div style={styles.buttonGroup}>
                            <Link to="/manufacturer" style={{...styles.button, ...styles.primaryButton}}>
                                Register Products
                            </Link>
                            <Link to="/verify" style={{...styles.button, ...styles.secondaryButton}}>
                                Verify Product
                            </Link>
                        </div>
                    </div>
                    
                    <div style={styles.featureCards}>
                        <div style={styles.featureCard}>
                            <span style={styles.featureIcon}>🤖</span>
                            <h3>AI Detection</h3>
                            <p>VGG16 CNN model with 100% accuracy</p>
                        </div>
                        <div style={styles.featureCard}>
                            <span style={styles.featureIcon}>⛓️</span>
                            <h3>Blockchain Verified</h3>
                            <p>Immutable product registry</p>
                        </div>
                        <div style={styles.featureCard}>
                            <span style={styles.featureIcon}>⚡</span>
                            <h3>Real-time Scanning</h3>
                            <p>Instant verification results</p>
                        </div>
                    </div>
                </div>
            </header>

            <section style={styles.features}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>How It Works</h2>
                    <div style={styles.grid}>
                        {[
                            { num: 1, title: 'Register Product', desc: 'Manufacturers upload genuine product images to create blockchain fingerprint' },
                            { num: 2, title: 'AI Analysis', desc: 'Deep learning model extracts features and analyzes packaging quality' },
                            { num: 3, title: 'Blockchain Storage', desc: 'Product data stored immutably on Ethereum Sepolia testnet' },
                            { num: 4, title: 'Consumer Verification', desc: 'Anyone can scan products to check authenticity instantly' }
                        ].map(item => (
                            <div key={item.num} style={styles.featureItem}>
                                <div style={styles.featureNumber}>{item.num}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={styles.stats}>
                <div style={styles.container}>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <h3 style={styles.statNumber}>{totalProducts}</h3>
                            <p>Products Registered</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statNumber}>100%</h3>
                            <p>AI Accuracy</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statNumber}>⚡</h3>
                            <p>Real-time Verification</p>
                        </div>
                        <div style={styles.statCard}>
                            <h3 style={styles.statNumber}>🔒</h3>
                            <p>Blockchain Secured</p>
                        </div>
                    </div>
                </div>
            </section>

            <section style={styles.about}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>About This Project</h2>
                    <div style={styles.aboutGrid}>
                        <div>
                            <h3>Anti-Counterfeit Product Scanner</h3>
                            <p>A minor project from KIIT University combining cutting-edge technologies:</p>
                            <ul style={styles.list}>
                                <li>✅ VGG16 Convolutional Neural Network for image classification</li>
                                <li>✅ Smart contracts deployed on Ethereum Sepolia</li>
                                <li>✅ Flask backend with Web3.py integration</li>
                                <li>✅ React frontend with MetaMask integration</li>
                                <li>✅ Real-time product authentication</li>
                                <li>✅ QR code generation for products</li>
                            </ul>
                        </div>
                        <div>
                            <h4>Tech Stack</h4>
                            <div style={styles.badges}>
                                {['Python', 'PyTorch', 'Solidity', 'React', 'Web3.js', 'Flask'].map(tech => (
                                    <span key={tech} style={styles.badge}>{tech}</span>
                                ))}
                            </div>
                            <div style={{marginTop: '2rem'}}>
                                <h4>Smart Contract</h4>
                                <a 
                                    href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.contractLink}
                                >
                                    View on Etherscan →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={styles.footer}>
                <div style={styles.container}>
                    <p>&copy; 2026 AuthentiScan - Anti-Counterfeit Scanner</p>
                    <p>Built with ❤️ by Aditya | KIIT University</p>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 0'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
    },
    heroContent: {
        marginBottom: '3rem'
    },
    heroTitle: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
        opacity: 0.9
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    button: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 600,
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'all 0.3s'
    },
    primaryButton: {
        background: '#2563eb',
        color: 'white'
    },
    secondaryButton: {
        background: 'white',
        color: '#2563eb'
    },
    featureCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
    },
    featureCard: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    featureIcon: {
        fontSize: '2rem',
        display: 'block',
        marginBottom: '0.5rem'
    },
    features: {
        padding: '4rem 0',
        background: 'white'
    },
    sectionTitle: {
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '3rem',
        color: '#1f2937'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
    },
    featureItem: {
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '12px',
        background: '#f9fafb'
    },
    featureNumber: {
        width: '60px',
        height: '60px',
        background: '#2563eb',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: '0 auto 1rem'
    },
    stats: {
        background: '#1f2937',
        color: 'white',
        padding: '3rem 0'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem'
    },
    statCard: {
        textAlign: 'center',
        padding: '2rem'
    },
    statNumber: {
        fontSize: '3rem',
        color: '#10b981',
        marginBottom: '0.5rem'
    },
    about: {
        padding: '4rem 0'
    },
    aboutGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '3rem'
    },
    list: {
        listStyle: 'none',
        padding: 0
    },
    badges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem'
    },
    badge: {
        background: '#2563eb',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem'
    },
    contractLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontWeight: 600
    },
    footer: {
        background: '#1f2937',
        color: 'white',
        padding: '2rem 0',
        textAlign: 'center'
    }
};

export default Home;
