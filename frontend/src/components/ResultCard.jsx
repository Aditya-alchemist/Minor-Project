import React from 'react';

const ResultCard = ({ type, title, children }) => {
    const getStyles = () => {
        switch(type) {
            case 'success':
                return {
                    borderLeft: '4px solid #34d399',
                    icon: '✅',
                    color: '#34d399'
                };
            case 'error':
                return {
                    borderLeft: '4px solid #fb7185',
                    icon: '❌',
                    color: '#fb7185'
                };
            case 'warning':
                return {
                    borderLeft: '4px solid #fbbf24',
                    icon: '⚠️',
                    color: '#fbbf24'
                };
            default:
                return {
                    borderLeft: '4px solid #36d1ff',
                    icon: 'ℹ️',
                    color: '#36d1ff'
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
        background: '#111a2c',
        border: '1px solid #2a3a5e',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 14px 32px rgba(0,0,0,0.35)',
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
        borderBottom: '1px solid #2a3a5e',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    label: {
        fontWeight: 600,
        color: '#9fb0d2',
        fontSize: '0.9rem'
    },
    value: {
        color: '#e8eefc',
        wordBreak: 'break-all'
    },
    link: {
        color: '#36d1ff',
        textDecoration: 'none'
    }
};

ResultCard.DetailItem = DetailItem;

export default ResultCard;
