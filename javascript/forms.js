// Toggle password visibility for both password fields
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

// Add event listeners if elements exist
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        togglePasswordVisibility('password', this);
    });
}

if (toggleConfirmPassword) {
    toggleConfirmPassword.addEventListener('click', function() {
        togglePasswordVisibility('confirmPassword', this);
    });
}

function togglePasswordVisibility(inputId, toggleButton) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.src = './images/icons/eye-closed.png';
        } else {
            passwordInput.type = 'password';
            toggleButton.src = './images/icons/eye-open.png';
        }
    }
}

// Only add password matching validation if we're on the signup page
const confirmPasswordInput = document.getElementById('confirmPassword');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        
        try {
            if (password === null || confirmPassword === null) {
                throw new Error('Password fields cannot be null');
            }
            
            if (password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        } catch (error) {
            console.error('Password validation error:', error);
        }
    });
}