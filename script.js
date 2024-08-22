import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUXq-xxfcFczuGetdwZhY25qQgQHLJkGA",
    authDomain: "fir-story-c0236.firebaseapp.com",
    databaseURL: "https://fir-story-c0236-default-rtdb.firebaseio.com",
    projectId: "fir-story-c0236",
    storageBucket: "fir-story-c0236.appspot.com",
    messagingSenderId: "833687841349",
    appId: "1:833687841349:web:f3b64406da1a1623c9112c",
    measurementId: "G-Q1LSHVHSWL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Sticky header
    const header = document.querySelector('.main-header');
    const sticky = header.offsetTop;

    function stickyHeader() {
        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }

    window.onscroll = function() {
        stickyHeader();
        animateOnScroll();
    };

    // Animate on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('appear');
            }
        });
    }

    // Initialize animations
    animateOnScroll();

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu when clicking a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // Checklist button
    const checklistBtn = document.getElementById('checklist-btn');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://forms.gle/rjcKEEvt6rpyDcLT7', '_blank');
        });
    }

    // Newsletter subscription button
    const newsletterBtn = document.getElementById('newsletter-btn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://maily.so/lsb.0214', '_blank');
        });
    }

    // Profile image upload
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('profile-upload');
    const profileImage = document.getElementById('profile-image');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                }
                reader.readAsDataURL(file);

                // Upload to Firebase Storage
                const storageRef = ref(storage, 'profile-images/' + file.name);
                uploadBytes(storageRef, file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');
                    getDownloadURL(snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        // Here you can save the downloadURL to the user's profile in your database
                    });
                });
            }
        });
    }

    // Password validation function
    function isPasswordValid(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasNonalphas = /\W/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
    }

    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitButton = signupForm.querySelector('button[type="submit"]');

        function updateButtonState() {
            submitButton.disabled = !(emailInput.value.trim() && passwordInput.value.trim());
        }

        emailInput.addEventListener('input', updateButtonState);
        passwordInput.addEventListener('input', updateButtonState);

        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!isPasswordValid(password)) {
                showMessage("비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.", "error");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("User registered:", userCredential.user);
                showMessage("회원가입이 완료되었습니다!", "success");
                signupForm.reset();
                updateButtonState();
            } catch (error) {
                console.error("Error:", error.code, error.message);
                let errorMessage = "회원가입 중 오류가 발생했습니다: ";
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage += "이미 사용 중인 이메일 주소입니다.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage += "유효하지 않은 이메일 주소입니다.";
                        break;
                    case 'auth/weak-password':
                        errorMessage += "비밀번호가 너무 약합니다.";
                        break;
                    default:
                        errorMessage += error.message;
                }
                showMessage(errorMessage, "error");
            }
        });

        updateButtonState();
    }

    // Mini-game button
    const playGameBtn = document.getElementById('play-game-btn');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://make100services.netlify.app/', '_blank');
        });
    }

    // Show message function
    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 3000);
    }
});
