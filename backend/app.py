from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sys
import json
from datetime import datetime
from PIL import Image
import io

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.blockchain import BlockchainManager
from backend.config import Config
from models.predict import ProductAuthenticator

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize AI model
print("🤖 Loading AI model...")
ai_model = ProductAuthenticator(model_path=app.config['MODEL_PATH'])

# Initialize blockchain manager
print("🔗 Connecting to blockchain...")
try:
    blockchain = BlockchainManager(
        rpc_url=app.config['RPC_URL'],
        contract_address=app.config['CONTRACT_ADDRESS'],
        private_key=app.config['PRIVATE_KEY']
    )
except Exception as e:
    print(f"⚠️  Blockchain connection failed: {e}")
    print("   Running in AI-only mode")
    blockchain = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_features(image_path):
    """
    Extract features from image using AI model
    Returns bytes for blockchain hashing
    """
    # Load image and get prediction
    result = ai_model.predict(image_path)
    
    # Create feature vector (simplified - using prediction probabilities)
    # In production, you'd extract actual CNN features
    feature_string = f"{result['genuine_prob']:.6f}_{result['counterfeit_prob']:.6f}"
    return feature_string.encode('utf-8')

@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'message': 'Anti-Counterfeit Product Scanner API',
        'version': '1.0.0',
        'endpoints': {
            'register': '/api/register-product',
            'verify': '/api/verify-product',
            'product': '/api/product/<product_id>',
            'health': '/api/health'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ai_model': 'loaded',
        'blockchain': 'connected' if blockchain else 'disconnected',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/register-product', methods=['POST'])
def register_product():
    """
    Register a new product (Manufacturer endpoint)
    
    Expected form data:
    - image: Product image file
    - product_id: Unique product ID (SKU/barcode)
    - product_name: Product name
    - metadata: Additional info (JSON string)
    """
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Use PNG, JPG, or JPEG'}), 400
        
        # Get form data
        product_id = request.form.get('product_id')
        product_name = request.form.get('product_name')
        metadata = request.form.get('metadata', '{}')
        
        if not product_id or not product_name:
            return jsonify({'error': 'product_id and product_name are required'}), 400
        
        # Save uploaded file
        filename = secure_filename(f"{product_id}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"\n📸 Processing registration for: {product_name} ({product_id})")
        
        # Run AI prediction on the image
        ai_result = ai_model.predict(filepath)
        
        print(f"🤖 AI Analysis:")
        print(f"   Prediction: {ai_result['prediction']}")
        print(f"   Confidence: {ai_result['confidence']:.2f}%")
        
        # Check if product appears genuine
        if ai_result['label'] == 'counterfeit':
            return jsonify({
                'error': 'Product appears to be counterfeit. Cannot register fake products.',
                'ai_analysis': ai_result
            }), 400
        
        # Extract features for blockchain
        features = extract_features(filepath)
        
        # Register on blockchain
        if blockchain:
            print(f"⛓️  Registering on blockchain...")
            
            # Add AI confidence to metadata
            metadata_dict = json.loads(metadata)
            metadata_dict['ai_confidence'] = ai_result['confidence']
            metadata_dict['registration_date'] = datetime.now().isoformat()
            
            blockchain_result = blockchain.register_product(
                product_id=product_id,
                product_name=product_name,
                image_features=features,
                metadata=json.dumps(metadata_dict)
            )
            
            if not blockchain_result['success']:
                return jsonify({
                    'error': 'Blockchain registration failed',
                    'details': blockchain_result.get('error')
                }), 500
            
            print(f"✅ Product registered successfully!")
            print(f"   Transaction: {blockchain_result['tx_hash']}")
            
            return jsonify({
                'success': True,
                'message': 'Product registered successfully',
                'product_id': product_id,
                'product_name': product_name,
                'ai_analysis': ai_result,
                'blockchain': {
                    'tx_hash': blockchain_result['tx_hash'],
                    'block_number': blockchain_result['block_number'],
                    'image_hash': blockchain_result['image_hash']
                }
            }), 201
        else:
            # Blockchain not available - AI only mode
            return jsonify({
                'success': True,
                'message': 'Product analyzed (blockchain unavailable)',
                'product_id': product_id,
                'product_name': product_name,
                'ai_analysis': ai_result,
                'warning': 'Blockchain not connected - running in AI-only mode'
            }), 201
            
    except Exception as e:
        print(f"❌ Error in register_product: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-product', methods=['POST'])
def verify_product():
    """
    Verify a product (Consumer endpoint)
    
    Expected form data:
    - image: Product image file
    - product_id: Product ID to verify (optional)
    - location: Location where verification happened (optional)
    """
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Use PNG, JPG, or JPEG'}), 400
        
        # Get optional data
        product_id = request.form.get('product_id', '')
        location = request.form.get('location', 'Unknown')
        
        # Save uploaded file
        filename = secure_filename(f"verify_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"\n🔍 Verifying product...")
        
        # Run AI prediction
        ai_result = ai_model.predict(filepath)
        
        print(f"🤖 AI Analysis:")
        print(f"   Prediction: {ai_result['prediction']}")
        print(f"   Confidence: {ai_result['confidence']:.2f}%")
        
        # Extract features
        features = extract_features(filepath)
        
        response_data = {
            'ai_analysis': {
                'prediction': ai_result['label'],
                'status': ai_result['prediction'],
                'confidence': ai_result['confidence'],
                'probabilities': {
                    'genuine': ai_result['genuine_prob'],
                    'counterfeit': ai_result['counterfeit_prob']
                }
            }
        }
        
        # If product_id provided, verify on blockchain
        if product_id and blockchain:
            print(f"⛓️  Checking blockchain for product: {product_id}")
            
            # Check if product exists
            if not blockchain.check_product_exists(product_id):
                response_data['blockchain'] = {
                    'status': 'not_registered',
                    'message': 'Product not found on blockchain'
                }
                response_data['verdict'] = 'SUSPICIOUS - Product not registered'
            else:
                # Get product info
                product_info = blockchain.get_product_info(product_id)
                
                # Verify on blockchain
                blockchain_result = blockchain.verify_product(
                    product_id=product_id,
                    image_features=features,
                    location=location
                )
                
                response_data['blockchain'] = {
                    'status': 'registered',
                    'product_info': product_info,
                    'verification': blockchain_result,
                    'tx_hash': blockchain_result.get('tx_hash')
                }
                
                # Determine final verdict
                ai_genuine = ai_result['label'] == 'genuine'
                blockchain_authentic = blockchain_result.get('is_authentic', False)
                
                if ai_genuine and blockchain_authentic:
                    response_data['verdict'] = 'AUTHENTIC ✅'
                elif not ai_genuine and not blockchain_authentic:
                    response_data['verdict'] = 'COUNTERFEIT ❌'
                else:
                    response_data['verdict'] = 'SUSPICIOUS ⚠️ (AI and blockchain mismatch)'
                
                print(f"✅ Verification complete: {response_data['verdict']}")
        else:
            # AI-only verification
            response_data['verdict'] = 'GENUINE ✅' if ai_result['label'] == 'genuine' else 'COUNTERFEIT ❌'
            response_data['note'] = 'AI-only verification (no blockchain check)'
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Error in verify_product: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/product/<product_id>', methods=['GET'])
def get_product(product_id):
    """
    Get product information from blockchain
    
    Args:
        product_id: Product identifier
    """
    try:
        if not blockchain:
            return jsonify({'error': 'Blockchain not connected'}), 503
        
        # Check if product exists
        if not blockchain.check_product_exists(product_id):
            return jsonify({'error': 'Product not found'}), 404
        
        # Get product info
        product_info = blockchain.get_product_info(product_id)
        
        if product_info:
            return jsonify({
                'success': True,
                'product': product_info
            }), 200
        else:
            return jsonify({'error': 'Failed to retrieve product info'}), 500
            
    except Exception as e:
        print(f"❌ Error in get_product: {e}")
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/check-authorization', methods=['GET'])
def check_authorization():
    """Check if current account is authorized manufacturer"""
    try:
        if not blockchain:
            return jsonify({'error': 'Blockchain not connected'}), 503
        
        # Check authorization
        is_authorized = blockchain.contract.functions.authorizedManufacturers(
            blockchain.account.address
        ).call()
        
        is_owner = blockchain.contract.functions.owner().call()
        
        return jsonify({
            'account': blockchain.account.address,
            'is_authorized': is_authorized,
            'contract_owner': is_owner,
            'is_owner': blockchain.account.address.lower() == is_owner.lower()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-ai', methods=['POST'])
def test_ai():
    """Test endpoint for AI model only"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save temporarily
        filename = secure_filename(f"test_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Run AI prediction
        result = ai_model.predict(filepath)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 Anti-Counterfeit Scanner API Server")
    print("="*70)
    print(f"   Contract Address: {app.config['CONTRACT_ADDRESS']}")
    print(f"   AI Model: {app.config['MODEL_PATH']}")
    print(f"   Upload Folder: {app.config['UPLOAD_FOLDER']}")
    print("="*70 + "\n")
    
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=5000)


    
