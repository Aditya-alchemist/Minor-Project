import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCode = ({ value, size = 200 }) => {
    return (
        <div style={styles.container}>
            <QRCodeCanvas 
                value={value}
                size={size}
                level="H"
                includeMargin={true}
            />
            <p style={styles.label}>Scan to verify product</p>
        </div>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    label: {
        marginTop: '0.5rem',
        color: '#6b7280',
        fontSize: '0.9rem'
    }
};

export default QRCode;
