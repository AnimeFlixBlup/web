// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB4mQLv4CrnKL1xJtbH-6igzM1mBBfdQXg",
    authDomain: "streaming-1969b.firebaseapp.com",
    projectId: "streaming-1969b",
    storageBucket: "streaming-1969b.firebasestorage.app",
    messagingSenderId: "616007335933",
    appId: "1:616007335933:web:f3191781369e28484f6394"
  };
  

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const homePage = document.getElementById('homePage');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Helper Functions
function showLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
}

function hideLoading(button) {
    button.classList.remove('loading');
    button.disabled = false;
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Comprobar si hay un usuario autenticado al cargar la página
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario está autenticado
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        homePage.style.display = 'flex';
    } else {
        // No hay usuario autenticado
        homePage.style.display = 'none';
        loginPage.style.display = 'flex';
    }
});

// Show Register Page
showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginPage.style.display = 'none';
    registerPage.style.display = 'flex';
});

// Show Login Page
showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    registerPage.style.display = 'none';
    loginPage.style.display = 'flex';
});

// Login Form Submit
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    showLoading(submitBtn);
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login exitoso
            loginForm.reset();
            hideLoading(submitBtn);
        })
        .catch((error) => {
            hideLoading(submitBtn);
            let errorMessage;
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No existe una cuenta con este email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email no válido';
                    break;
                default:
                    errorMessage = 'Error al iniciar sesión: ' + error.message;
            }
            
            showError(loginError, errorMessage);
        });
});

// Register Form Submit
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    
    // Validación
    if (password !== confirmPassword) {
        showError(registerError, 'Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        showError(registerError, 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    showLoading(submitBtn);
    
    // Crear usuario en Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registro exitoso
            const user = userCredential.user;
            
            // Guardar información adicional del usuario en Firestore
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            registerForm.reset();
            hideLoading(submitBtn);
        })
        .catch((error) => {
            hideLoading(submitBtn);
            let errorMessage;
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email no válido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es demasiado débil';
                    break;
                default:
                    errorMessage = 'Error al registrarse: ' + error.message;
            }
            
            showError(registerError, errorMessage);
        });
});

// Logout Button
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    auth.signOut().then(() => {
        // Sign-out exitoso
        homePage.style.display = 'none';
        loginPage.style.display = 'flex';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
    
});