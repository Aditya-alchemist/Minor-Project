import React, { useState } from 'react';

const ImageUpload = ({ onImageSelect, preview }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    return (
        <div 
            style={{
                ...styles.uploadArea,
                borderColor: dragActive ? '#2563eb' : '#e5e7eb'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={styles.input}
            />
            {preview ? (
                <img src={preview} alt="Preview" style={styles.preview} />
            ) : (
                <div style={styles.placeholder}>
                    <span style={styles.icon}>📸</span>
                    <p>Click or drag image here</p>
                    <small>PNG, JPG, JPEG (max 16MB)</small>
                </div>
            )}
        </div>
    );
};

const styles = {
    uploadArea: {
        position: 'relative',
        border: '2px dashed #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0,
        cursor: 'pointer'
    },
    placeholder: {
        pointerEvents: 'none'
    },
    icon: {
        fontSize: '3rem',
        display: 'block',
        marginBottom: '1rem'
    },
    preview: {
        maxWidth: '100%',
        maxHeight: '300px',
        borderRadius: '8px'
    }
};

export default ImageUpload;
