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
        background: '#111a2c',
        border: '1px solid #2a3a5e',
        borderRadius: '12px',
        boxShadow: '0 14px 32px rgba(0,0,0,0.35)'
    },
    label: {
        marginTop: '0.5rem',
        color: '#9fb0d2',
        fontSize: '0.9rem'
    }
};

export default QRCode;
