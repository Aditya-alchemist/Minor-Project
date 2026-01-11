import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';
import { testAI } from '../utils/api';
import { createImageHash } from '../utils/blockchain';

const Verify = ({ walletAddress, contract }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [productId, setProductId] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [verificationHistory, setVerificationHistory] = useState([]);

    const handleImageSelect = (file) => {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!walletAddress) {
            alert('Please connect your wallet first!');
            return;
        }

        if (!image) {
            alert('Please select an image!');
            return;
        }

        setLoading(true);
        setResult(null);
        setProductInfo(null);
        setVerificationHistory([]);

        try {
            // Step 1: AI Analysis
            console.log('Step 1: Running AI analysis...');
            const aiResult = await testAI(image);
            
            if (!aiResult.success) {
                throw new Error('AI analysis failed');
            }

            console.log('AI Result:', aiResult.result);

            // Step 2: Check if product exists on blockchain
            let blockchainStatus = null;
            if (productId) {
                console.log('Step 2: Checking blockchain...');
                
                const exists = await contract.productExists(productId);
                
                if (exists) {
                    // Get product info
                    const info = await contract.getProduct(productId);
                    setProductInfo({
                        productName: info[0],
                        imageHash: info[1],
                        manufacturer: info[2],
                        registrationTime: new Date(info[3].toNumber() * 1000).toLocaleString(),
                        metadata: info[4],
                        verificationCount: info[5].toNumber()
                    });

                    // Get verification history
                    try {
                        const history = await contract.getVerificationHistory(productId);
                        setVerificationHistory(history.map(record => ({
                            verifier: record.verifier,
                            timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString(),
                            result: record.result,
                            location: record.location
                        })));
                    } catch (error) {
                        console.log('No verification history yet');
                    }

                    // Create image hash
                    const imageHash = createImageHash(
                        `${aiResult.result.genuine_prob}_${aiResult.result.counterfeit_prob}`
                    );

                    // Verify on blockchain
                    console.log('Step 3: Verifying on blockchain...');
                    const tx = await contract.verifyProduct(
                        productId,
                        imageHash,
                        location || 'Unknown'
                    );

                    console.log('Verification transaction sent:', tx.hash);
                    const receipt = await tx.wait();
                    console.log('Verification confirmed:', receipt);

                    blockchainStatus = {
                        verified: true,
                        txHash: receipt.transactionHash,
                        blockNumber: receipt.blockNumber
                    };
                } else {
                    blockchainStatus = {
                        verified: false,
                        message: 'Product not registered on blockchain'
                    };
                }
            }

            // Determine verdict
            const isGenuineAI = aiResult.result.label === 'genuine';
            const isOnBlockchain = blockchainStatus?.verified;

            let verdict, verdictType;
            if (isGenuineAI && isOnBlockchain) {
                verdict = '✅ AUTHENTIC PRODUCT';
                verdictType = 'success';
            } else if (isGenuineAI && !productId) {
                verdict = '⚠️ GENUINE (Not verified on blockchain)';
                verdictType = 'warning';
            } else if (isGenuineAI && !isOnBlockchain) {
                verdict = '⚠️ SUSPICIOUS (Product not registered)';
                verdictType = 'warning';
            } else {
                verdict = '❌ COUNTERFEIT DETECTED';
                verdictType = 'error';
            }

            setResult({
                type: verdictType,
                title: verdict,
                aiAnalysis: aiResult.result,
                blockchain: blockchainStatus
            });

        } catch (error) {
            console.error('Error:', error);
            setResult({
                type: 'error',
                title: 'Verification Failed',
                error: error.message,
                details: error.reason || error.data?.message || 'Transaction failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Verify Product Authenticity</h1>
                <p>Upload a product image to check if it's genuine</p>
                
                {walletAddress ? (
                    <div style={styles.walletInfo}>
                        ✅ Wallet Connected: {walletAddress.substring(0, 10)}...{walletAddress.substring(38)}
                    </div>
                ) : (
                    <div style={styles.walletWarning}>
                        ⚠️ Please connect your wallet to verify products
                    </div>
                )}
            </div>

            <div style={styles.mainContent}>
                <div style={styles.formSection}>
                    <h2>Scan Product</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product Image *</label>
                            <ImageUpload 
                                onImageSelect={handleImageSelect}
                                preview={preview}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product ID</label>
                            <input
                                type="text"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                placeholder="e.g., NIKE-AIR-001"
                                style={styles.input}
                            />
                            <small style={styles.hint}>Enter product ID for blockchain verification (optional)</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Location (Optional)</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Bhubaneswar, India"
                                style={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !walletAddress}
                            style={{
                                ...styles.button,
                                opacity: loading || !walletAddress ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Product'}
                        </button>
                    </form>
                </div>

                <div style={styles.resultSection}>
                    {result && (
                        <ResultCard type={result.type} title={result.title}>
                            <ResultCard.DetailItem 
                                label="AI Prediction" 
                                value={result.aiAnalysis.prediction.toUpperCase()}
                            />
                            <ResultCard.DetailItem 
                                label="Confidence Level" 
                                value={`${result.aiAnalysis.confidence.toFixed(2)}%`}
                            />
                            
                            <div style={{padding: '0.75rem 0'}}>
                                <div style={styles.progressBar}>
                                    <div 
                                        style={{
                                            ...styles.progressFill,
                                            width: `${result.aiAnalysis.genuine_prob}%`,
                                            background: result.type === 'success' ? '#10b981' : '#ef4444'
                                        }}
                                    />
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem'}}>
                                    <span style={{color: '#10b981'}}>Genuine: {result.aiAnalysis.genuine_prob.toFixed(2)}%</span>
                                    <span style={{color: '#ef4444'}}>Counterfeit: {result.aiAnalysis.counterfeit_prob.toFixed(2)}%</span>
                                </div>
                            </div>

                            {result.blockchain?.verified && (
                                <>
                                    <ResultCard.DetailItem 
                                        label="Blockchain Status" 
                                        value="✓ Verified on Blockchain"
                                    />
                                    <ResultCard.DetailItem 
                                        label="Verification TX" 
                                        value={`${result.blockchain.txHash.substring(0, 20)}...`}
                                        link={`https://sepolia.etherscan.io/tx/${result.blockchain.txHash}`}
                                    />
                                </>
                            )}

                            {result.blockchain?.message && (
                                <ResultCard.DetailItem 
                                    label="Blockchain Status" 
                                    value={`⚠ ${result.blockchain.message}`}
                                />
                            )}

                            {result.error && (
                                <>
                                    <ResultCard.DetailItem 
                                        label="Error" 
                                        value={result.error}
                                    />
                                    {result.details && (
                                        <ResultCard.DetailItem 
                                            label="Details" 
                                            value={result.details}
                                        />
                                    )}
                                </>
                            )}

                            <div style={{
                                ...styles.message,
                                background: result.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: result.type === 'success' ? '#059669' : '#dc2626'
                            }}>
                                {result.type === 'success' ? 
                                    '✓ This product appears to be genuine! All checks passed.' :
                                    result.type === 'warning' ?
                                    '⚠ Warning: Limited verification. Product may need blockchain registration.' :
                                    '⚠ Warning: This product may be counterfeit! Please verify with manufacturer.'
                                }
                            </div>
                        </ResultCard>
                    )}

                    {productInfo && (
                        <div style={styles.productInfoCard}>
                            <h3>Product Information</h3>
                            <ResultCard.DetailItem 
                                label="Product Name" 
                                value={productInfo.productName}
                            />
                            <ResultCard.DetailItem 
                                label="Manufacturer" 
                                value={`${productInfo.manufacturer.substring(0, 10)}...${productInfo.manufacturer.substring(38)}`}
                                link={`https://sepolia.etherscan.io/address/${productInfo.manufacturer}`}
                            />
                            <ResultCard.DetailItem 
                                label="Registration Date" 
                                value={productInfo.registrationTime}
                            />
                            <ResultCard.DetailItem 
                                label="Total Verifications" 
                                value={productInfo.verificationCount}
                            />
                        </div>
                    )}

                    {verificationHistory.length > 0 && (
                        <div style={styles.historyCard}>
                            <h3>Verification History ({verificationHistory.length})</h3>
                            <div style={styles.historyList}>
                                {verificationHistory.slice(0, 5).map((record, index) => (
                                    <div key={index} style={styles.historyItem}>
                                        <div style={styles.historyIcon}>
                                            {record.result ? '✅' : '❌'}
                                        </div>
                                        <div style={styles.historyDetails}>
                                            <div style={styles.historyText}>
                                                <strong>{record.location}</strong>
                                            </div>
                                            <div style={styles.historyMeta}>
                                                {record.timestamp} • {record.verifier.substring(0, 10)}...
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 20px',
        minHeight: 'calc(100vh - 200px)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem'
    },
    walletInfo: {
        marginTop: '1rem',
        padding: '1rem',
        background: '#f0fdf4',
        borderRadius: '8px',
        color: '#059669',
        display: 'inline-block'
    },
    walletWarning: {
        marginTop: '1rem',
        padding: '1rem',
        background: '#fef2f2',
        borderRadius: '8px',
        color: '#dc2626',
        display: 'inline-block'
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
    },
    formSection: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    formGroup: {
        marginBottom: '1.5rem'
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        color: '#1f2937'
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '1rem'
    },
    hint: {
        display: 'block',
        marginTop: '0.25rem',
        color: '#6b7280',
        fontSize: '0.875rem'
    },
    button: {
        width: '100%',
        padding: '1rem',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: 'pointer'
    },
    resultSection: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content'
    },
    progressBar: {
        width: '100%',
        height: '8px',
        background: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        transition: 'width 0.3s'
    },
    message: {
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center'
    },
    productInfoCard: {
        marginTop: '1rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    historyCard: {
        marginTop: '1rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    historyList: {
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    historyItem: {
        display: 'flex',
        gap: '0.75rem',
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '8px'
    },
    historyIcon: {
        fontSize: '1.5rem'
    },
    historyDetails: {
        flex: 1
    },
    historyText: {
        fontSize: '0.9rem',
        marginBottom: '0.25rem'
    },
    historyMeta: {
        fontSize: '0.8rem',
        color: '#6b7280'
    }
};

export default Verify;
