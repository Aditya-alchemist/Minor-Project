import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # Blockchain
    RPC_URL = os.getenv('RPC_URL', 'https://sepolia-rollup.arbitrum.io/rpc')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '0x197ecd355222dD8c403352c057dFb53f1280AbA9')
    PRIVATE_KEY = os.getenv('PRIVATE_KEY', '')
    
    # AI Model
    MODEL_PATH = os.getenv('MODEL_PATH', '../models/best_model.pth')
    
    # Upload
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
