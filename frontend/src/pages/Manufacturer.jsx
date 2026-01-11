import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';
import QRCode from '../components/QRCode';
import { testAI } from '../utils/api';
import { createImageHash } from '../utils/blockchain';

const Manufacturer = ({ walletAddress, contract }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('shoes');
    const [batch, setBatch] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [myProducts, setMyProducts] = useState([]);

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

        try {
            // Step 1: AI Analysis
            console.log('Step 1: Running AI analysis...');
            const aiResult = await testAI(image);
            
            if (!aiResult.success) {
                throw new Error('AI analysis failed');
            }

            console.log('AI Result:', aiResult.result);

            if (aiResult.result.label !== 'genuine') {
                setResult({
                    type: 'error',
                    title: 'Product appears to be counterfeit',
                    aiAnalysis: aiResult.result
                });
                setLoading(false);
                return;
            }

            // Step 2: Create image hash
            console.log('Step 2: Creating image hash...');
            const imageHash = createImageHash(
                `${aiResult.result.genuine_prob}_${aiResult.result.counterfeit_prob}`
            );

            // Step 3: Prepare metadata
            const metadata = {
                category,
                batch: batch || 'N/A',
                ai_confidence: aiResult.result.confidence,
                registered_at: new Date().toISOString()
            };

            // Step 4: Register on blockchain
            console.log('Step 3: Registering on blockchain...');
            const tx = await contract.registerProduct(
                productId,
                productName,
                imageHash,
                JSON.stringify(metadata)
            );

            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            setResult({
                type: 'success',
                title: 'Product Registered Successfully!',
                productId,
                productName,
                aiAnalysis: aiResult.result,
                blockchain: {
                    txHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    imageHash: imageHash
                }
            });

            // Refresh product list
            fetchMyProducts();

        } catch (error) {
            console.error('Error:', error);
            setResult({
                type: 'error',
                title: 'Registration Failed',
                error: error.message,
                details: error.reason || error.data?.message || 'Transaction failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMyProducts = async () => {
        if (!walletAddress || !contract) return;
        
        try {
            const products = await contract.getManufacturerProducts(walletAddress);
            setMyProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    React.useEffect(() => {
        fetchMyProducts();
    }, [walletAddress, contract]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Manufacturer Dashboard</h1>
                <p>Register your genuine products on the blockchain</p>
                
                {walletAddress ? (
                    <div style={styles.walletInfo}>
                        ✅ Wallet Connected: {walletAddress.substring(0, 10)}...{walletAddress.substring(38)}
                    </div>
                ) : (
                    <div style={styles.walletWarning}>
                        ⚠️ Please connect your wallet to register products
                    </div>
                )}
            </div>

            <div style={styles.mainContent}>
                <div style={styles.formSection}>
                    <h2>Register New Product</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product Image</label>
                            <ImageUpload 
                                onImageSelect={handleImageSelect}
                                preview={preview}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product ID / SKU *</label>
                            <input
                                type="text"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                placeholder="e.g., NIKE-AIR-001"
                                style={styles.input}
                                required
                            />
                            <small style={styles.hint}>Unique identifier for your product</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product Name *</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., Nike Air Jordan Retro"
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={styles.input}
                            >
                                <option value="shoes">Shoes</option>
                                <option value="electronics">Electronics</option>
                                <option value="cosmetics">Cosmetics</option>
                                <option value="pharmaceuticals">Pharmaceuticals</option>
                                <option value="luxury">Luxury Goods</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Batch Number (Optional)</label>
                            <input
                                type="text"
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                                placeholder="e.g., 2024-Q1"
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
                            {loading ? 'Registering...' : 'Register Product'}
                        </button>
                    </form>
                </div>

                <div style={styles.resultSection}>
                    {result && (
                        <ResultCard type={result.type} title={result.title}>
                            {result.type === 'success' ? (
                                <>
                                    <ResultCard.DetailItem 
                                        label="Product ID" 
                                        value={result.productId} 
                                    />
                                    <ResultCard.DetailItem 
                                        label="Product Name" 
                                        value={result.productName} 
                                    />
                                    <ResultCard.DetailItem 
                                        label="AI Analysis" 
                                        value={`${result.aiAnalysis.prediction} (${result.aiAnalysis.confidence.toFixed(2)}% confidence)`}
                                    />
                                    <ResultCard.DetailItem 
                                        label="Transaction Hash" 
                                        value={`${result.blockchain.txHash.substring(0, 20)}...`}
                                        link={`https://sepolia.etherscan.io/tx/${result.blockchain.txHash}`}
                                    />
                                    <ResultCard.DetailItem 
                                        label="Block Number" 
                                        value={result.blockchain.blockNumber} 
                                    />
                                    
                                    <div style={{marginTop: '2rem'}}>
                                        <h4>Product QR Code</h4>
                                        <QRCode value={result.productId} size={180} />
                                    </div>

                                    <div style={styles.successMessage}>
                                        🎉 Your product is now protected on the blockchain!<br/>
                                        <small>Consumers can verify this product using the Product ID or QR code</small>
                                    </div>
                                </>
                            ) : (
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
                                    {result.aiAnalysis && (
                                        <ResultCard.DetailItem 
                                            label="AI Analysis" 
                                            value={`${result.aiAnalysis.prediction} (${result.aiAnalysis.confidence.toFixed(2)}% confidence)`}
                                        />
                                    )}
                                </>
                            )}
                        </ResultCard>
                    )}

                    {myProducts.length > 0 && (
                        <div style={styles.productList}>
                            <h3>My Registered Products ({myProducts.length})</h3>
                            <div style={styles.products}>
                                {myProducts.map((pid, index) => (
                                    <div key={index} style={styles.productItem}>
                                        <span style={styles.productIcon}>📦</span>
                                        <span style={styles.productId}>{pid}</span>
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
        fontSize: '1rem',
        transition: 'border-color 0.3s'
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
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    resultSection: {
        position: 'sticky',
        top: '100px',
        height: 'fit-content'
    },
    successMessage: {
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f0fdf4',
        borderRadius: '8px',
        color: '#059669',
        textAlign: 'center'
    },
    productList: {
        marginTop: '2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    products: {
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    productItem: {
        padding: '0.75rem',
        background: '#f9fafb',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    productIcon: {
        fontSize: '1.5rem'
    },
    productId: {
        fontFamily: 'monospace',
        fontSize: '0.9rem'
    }
};

export default Manufacturer;
