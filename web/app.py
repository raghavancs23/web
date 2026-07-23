# ================================================================
# EcoTrack - Flask Backend Application
# Author: Senior Software Architect
# Version: 1.0.0
# ================================================================

import os
import random
import string
import logging
from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = os.urandom(24)

# Database Configuration Defaults
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'ecotrack_db')

def get_db_connection():
    """Establishes connection to MySQL database with graceful fallback."""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=3
        )
        if connection.is_connected():
            return connection
    except Error as e:
        logging.error(f"MySQL connection failed: {e}. Running in Mock Mode.")
    return None

# Mock Database for testing in case MySQL is not running
mock_db = {
    'users': [
        # Prepopulated mock verified user: test@example.com / Password123
        {
            'id': 1,
            'username': 'eco_champion',
            'email': 'test@example.com',
            'password_hash': generate_password_hash('Password123'),
            'is_verified': True,
            'verification_code': None,
            'eco_score': 82
        }
    ],
    'verification_codes': {}
}

def generate_verification_code():
    """Generates a random 6-character numeric verification code."""
    return ''.join(random.choices(string.digits, k=6))

# ----------------------------------------------------------------
# HTML PAGE SERVING (Routing from root)
# ----------------------------------------------------------------
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/login')
def login_page():
    return send_from_directory('.', 'login.html')

@app.route('/register')
def register_page():
    return send_from_directory('.', 'register.html')

@app.route('/forgot-password')
def forgot_password_page():
    return send_from_directory('.', 'forgot-password.html')

@app.route('/verify-email')
def verify_email_page():
    return send_from_directory('.', 'verify-email.html')

# ----------------------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------------------

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    hashed_pw = generate_password_hash(password)
    v_code = generate_verification_code()

    # Try live MySQL DB first
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # Check duplicate email
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'Email already registered.'}), 409

            # Check duplicate username
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'Username already taken.'}), 409

            # Insert user
            query = """INSERT INTO users (username, email, password_hash, verification_code, is_verified) 
                       VALUES (%s, %s, %s, %s, FALSE)"""
            cursor.execute(query, (username, email, hashed_pw, v_code))
            conn.commit()
            
            # Print verification code to server console (mock email delivery)
            logging.info(f"===> EMAIL VERIFICATION CODE FOR {email}: {v_code} <===")
            session['pending_email'] = email
            
            return jsonify({'success': True, 'message': 'Registration successful. Check console/terminal for verification code.'})
        except Error as e:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    else:
        # Mock Fallback Flow
        for user in mock_db['users']:
            if user['email'] == email:
                return jsonify({'success': False, 'message': 'Email already registered (Mock DB).'}), 409
            if user['username'] == username:
                return jsonify({'success': False, 'message': 'Username already taken (Mock DB).'}), 409

        new_user = {
            'id': len(mock_db['users']) + 1,
            'username': username,
            'email': email,
            'password_hash': hashed_pw,
            'is_verified': False,
            'verification_code': v_code,
            'eco_score': 0
        }
        mock_db['users'].append(new_user)
        logging.info(f"===> MOCK EMAIL VERIFICATION CODE FOR {email}: {v_code} <===")
        session['pending_email'] = email
        return jsonify({'success': True, 'message': 'Registration successful (Mock Database). Check console for code.'})

@app.route('/api/verify-email', methods=['POST'])
def api_verify():
    data = request.get_json() or {}
    email = data.get('email', session.get('pending_email', '')).strip()
    code = data.get('code', '').strip()

    if not email or not code:
        return jsonify({'success': False, 'message': 'Email and verification code are required.'}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, verification_code FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'success': False, 'message': 'User not found.'}), 404

            if user['verification_code'] == code:
                cursor.execute("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = %s", (user['id'],))
                conn.commit()
                session.pop('pending_email', None)
                return jsonify({'success': True, 'message': 'Email verified successfully!'})
            else:
                return jsonify({'success': False, 'message': 'Invalid verification code.'}), 400
        except Error as e:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    else:
        # Mock Database Flow
        for user in mock_db['users']:
            if user['email'] == email:
                if user['verification_code'] == code:
                    user['is_verified'] = True
                    user['verification_code'] = None
                    session.pop('pending_email', None)
                    return jsonify({'success': True, 'message': 'Email verified successfully (Mock DB)!'})
                else:
                    return jsonify({'success': False, 'message': 'Invalid verification code (Mock DB).'}), 400
        return jsonify({'success': False, 'message': 'User email not found.'}), 404

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if user and check_password_hash(user['password_hash'], password):
                if not user['is_verified']:
                    session['pending_email'] = email
                    return jsonify({'success': False, 'needs_verification': True, 'message': 'Email not verified yet.'}), 403
                
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['email'] = user['email']
                return jsonify({'success': True, 'message': 'Login successful!', 'username': user['username']})
            else:
                return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401
        except Error as e:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    else:
        # Mock Database Flow
        for user in mock_db['users']:
            if user['email'] == email and check_password_hash(user['password_hash'], password):
                if not user['is_verified']:
                    session['pending_email'] = email
                    return jsonify({'success': False, 'needs_verification': True, 'message': 'Email not verified (Mock DB).'}), 403
                
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['email'] = user['email']
                return jsonify({'success': True, 'message': 'Login successful (Mock DB)!', 'username': user['username']})
        
        return jsonify({'success': False, 'message': 'Invalid email or password (Mock DB).'}), 401

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip()

    if not email:
        return jsonify({'success': False, 'message': 'Email address is required.'}), 400

    temp_code = generate_verification_code()
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if user:
                # Update temporary verification code as reset token
                cursor.execute("UPDATE users SET verification_code = %s WHERE id = %s", (temp_code, user['id']))
                conn.commit()
                logging.info(f"===> RESET PASSWORD CODE FOR {email}: {temp_code} <===")
                session['reset_email'] = email
                return jsonify({'success': True, 'message': 'Reset code sent to console. Check server terminal.'})
            else:
                return jsonify({'success': False, 'message': 'Email address not found.'}), 404
        except Error as e:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    else:
        # Mock Database Flow
        for user in mock_db['users']:
            if user['email'] == email:
                user['verification_code'] = temp_code
                logging.info(f"===> RESET PASSWORD CODE FOR {email}: {temp_code} <===")
                session['reset_email'] = email
                return jsonify({'success': True, 'message': 'Reset code sent to console (Mock DB). Check server terminal.'})
        return jsonify({'success': False, 'message': 'Email address not found (Mock DB).'}), 404

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    data = request.get_json() or {}
    email = data.get('email', session.get('reset_email', '')).strip()
    code = data.get('code', '').strip()
    new_password = data.get('new_password', '')

    if not email or not code or not new_password:
        return jsonify({'success': False, 'message': 'Email, code, and new password are required.'}), 400

    hashed_pw = generate_password_hash(new_password)
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, verification_code FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'success': False, 'message': 'User not found.'}), 404

            if user['verification_code'] == code:
                cursor.execute("UPDATE users SET password_hash = %s, verification_code = NULL WHERE id = %s", (hashed_pw, user['id']))
                conn.commit()
                session.pop('reset_email', None)
                return jsonify({'success': True, 'message': 'Password reset successful!'})
            else:
                return jsonify({'success': False, 'message': 'Invalid reset code.'}), 400
        except Error as e:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    else:
        # Mock Database Flow
        for user in mock_db['users']:
            if user['email'] == email:
                if user['verification_code'] == code:
                    user['password_hash'] = hashed_pw
                    user['verification_code'] = None
                    session.pop('reset_email', None)
                    return jsonify({'success': True, 'message': 'Password reset successful (Mock DB)!'})
                else:
                    return jsonify({'success': False, 'message': 'Invalid reset code (Mock DB).'}), 400
        return jsonify({'success': False, 'message': 'User not found (Mock DB).'}), 404

@app.route('/api/logout', methods=['GET', 'POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'})

@app.route('/api/session', methods=['GET'])
def api_session():
    """Returns current user session data if logged in."""
    if 'user_id' in session:
        return jsonify({
            'logged_in': True,
            'user_id': session['user_id'],
            'username': session['username'],
            'email': session['email']
        })
    return jsonify({'logged_in': False})

if __name__ == '__main__':
    # Add simple console instructions on launch
    print("\n" + "="*50)
    print("EcoTrack Backend Initialized Successfully!")
    print("Serving from current directory. Defaulting to Dark Mode landing page.")
    print("Click http://127.0.0.1:5000 to launch landing page.")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
