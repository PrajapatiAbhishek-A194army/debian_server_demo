from passlib.context import CryptContext

# Set up the crypt context with bcrypt hashing scheme
password_cryptography_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_encrypted_password_hash(plain_text_password: str) -> str:
    """
    Computes a secure bcrypt hash of the given plain text password.
    """
    return password_cryptography_context.hash(plain_text_password)

def verify_submitted_plain_text_password(plain_text_password: str, stored_password_hash: str) -> bool:
    """
    Verifies a plain text password matches the stored bcrypt password hash.
    """
    return password_cryptography_context.verify(plain_text_password, stored_password_hash)
