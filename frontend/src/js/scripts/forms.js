// hide/show password
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.src = '../../public/icons/eye-closed.png';
    } else {
        passwordInput.type = 'password';
        this.src = '../../public/icons/eye-open.png';
    }
});