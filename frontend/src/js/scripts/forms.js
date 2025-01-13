// Toggle password visibility for both password fields
document.getElementById('togglePassword').addEventListener('click', function() {
    togglePasswordVisibility('password', this);
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    togglePasswordVisibility('confirmPassword', this);
});

function togglePasswordVisibility(inputId, toggleButton) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.src = '/frontend/public/icons/eye-closed.png';
    } else {
        passwordInput.type = 'password';
        toggleButton.src = '/frontend/public/icons/eye-open.png';
    }
}

// Password validation
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }
    
    // WHEN PASSWORDS MATCH TODO:
    console.log('Form valid');
});

// Password matching validation
document.getElementById('confirmPassword').addEventListener('input', function() {
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
     } catch (error) {}
});