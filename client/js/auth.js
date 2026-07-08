document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorElement = document.getElementById('errorMessage');

    
    function validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least 1 uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least 1 lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least 1 number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least 1 special character (!@#$%^&*)');
        }
        
        return errors;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            
            errorElement.style.display = 'none';
            errorElement.textContent = '';

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            submitBtn.style.opacity = '0.7';

            try {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;

                
                const passwordErrors = validatePassword(password);
                if (passwordErrors.length > 0) {
                    errorElement.textContent = passwordErrors.join('. ');
                    errorElement.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                    return;
                }

                const response = await api.login(email, password);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                redirectByRole(response.data.user.role);
            } catch (error) {
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
                
                if (error.message.includes('Too many')) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Please wait 1 minute...';
                    
                    setTimeout(function () {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        submitBtn.style.opacity = '1';
                        errorElement.style.display = 'none';
                    }, 60000);
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            
            errorElement.style.display = 'none';
            errorElement.textContent = '';

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
            submitBtn.style.opacity = '0.7';

            try {
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                
                if (password !== confirmPassword) {
                    errorElement.textContent = 'Passwords do not match!';
                    errorElement.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                    return;
                }

                
                const passwordErrors = validatePassword(password);
                if (passwordErrors.length > 0) {
                    errorElement.textContent = passwordErrors.join('. ');
                    errorElement.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                    return;
                }

                const userData = {
                    email: document.getElementById('email').value.trim(),
                    password: password,
                    firstName: document.getElementById('firstName').value.trim(),
                    lastName: document.getElementById('lastName').value.trim()
                };
                
                const response = await api.register(userData);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                redirectByRole(response.data.user.role);
            } catch (error) {
                errorElement.textContent = error.message;
                errorElement.style.display = 'block';
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
            }
        });
    }
});

function redirectByRole(role) {
    localStorage.setItem('activeRole', role);
    switch (role) {
        case 'admin':
            window.location.href = '/views/admin.html';
            break;
        case 'instructor':
            window.location.href = '/views/instructor.html';
            break;
        default:
            window.location.href = '/views/dashboard.html';
    }
}

function checkAuth() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = '/views/login.html';
        return null;
    }
    return JSON.parse(localStorage.getItem('user'));
}