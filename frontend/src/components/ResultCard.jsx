import React from 'react';

const ResultCard = ({ type, title, children }) => {
    const getStyles = () => {
        switch(type) {
            case 'success':
                return {
                    borderLeft: '4px solid #10b981',
                    icon: '✅',
                    color: '#10b981'
                };
            case 'error':
                return {
                    borderLeft: '4px solid #ef4444',
                    icon: '❌',
                    color: '#ef4444'
                };
            case 'warning':
                return {
                    borderLeft: '4px solid #f59e0b',
                    icon: '⚠️',
                    color: '#f59e0b'
                };
            default:
                return {
                    borderLeft: '4px solid #2563eb',
                    icon: 'ℹ️',
                    color: '#2563eb'
                };
        }
    };

    const cardStyle = getStyles();

    return (
        <div style={{...styles.card, ...cardStyle}}>
            <div style={styles.header}>
                <span style={styles.icon}>{cardStyle.icon}</span>
                <div>
                    <h3 style={styles.title}>{title}</h3>
                </div>
            </div>
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, link }) => (
    <div style={styles.detailItem}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>
            {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    {value}
                </a>
            ) : value}
        </span>
    </div>
);

const styles = {
    card: {
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: '1rem'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    icon: {
        fontSize: '3rem'
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0
    },
    content: {
        marginTop: '1rem'
    },
    detailItem: {
        padding: '0.75rem 0',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    label: {
        fontWeight: 600,
        color: '#6b7280',
        fontSize: '0.9rem'
    },
    value: {
        color: '#1f2937',
        wordBreak: 'break-all'
    },
    link: {
        color: '#2563eb',
        textDecoration: 'none'
    }
};

ResultCard.DetailItem = DetailItem;

export default ResultCard;
