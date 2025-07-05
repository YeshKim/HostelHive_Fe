    
      const BASE_URL = "http://localhost:8099"; // Configurable backend URL

      // Set initial register link for default selected user type
      document.addEventListener('DOMContentLoaded', function() {
        const defaultUserType = document.querySelector('.user-type-btn.active')?.dataset.type;
        const registerLink = document.getElementById('registerLink');
        const registerLinkContainer = document.getElementById('registerLinkContainer');
        const emailInput = document.getElementById('email');

        // Set initial values based on default user type
        if (defaultUserType === 'student') {
          emailInput.placeholder = 'Enter your student email';
          registerLink.innerHTML = '<i class="fas fa-user-plus me-1"></i>Register as Student';
          registerLink.href = 'register-student.html';
          registerLinkContainer.style.display = 'block';
        } else if (defaultUserType === 'manager') {
          emailInput.placeholder = 'Enter your business email';
          registerLink.innerHTML = '<i class="fas fa-building me-1"></i>Register as Hostel Manager';
          registerLink.href = 'register-manager.html';
          registerLinkContainer.style.display = 'block';
        } else if (defaultUserType === 'admin') {
          emailInput.placeholder = 'Enter your admin email';
          registerLinkContainer.style.display = 'none';
        }
      });

      // User type selection
      document.querySelectorAll(".user-type-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          document
            .querySelectorAll(".user-type-btn")
            .forEach((b) => b.classList.remove("active"));
          this.classList.add("active");

          // Update form placeholders and links based on user type
          const userType = this.dataset.type;
          const emailInput = document.getElementById("email");
          const registerLink = document.getElementById("registerLink");
          const registerLinkContainer = document.getElementById("registerLinkContainer");

          if (userType === "student") {
            emailInput.placeholder = "Enter your student email";
            registerLink.innerHTML =
              '<i class="fas fa-user-plus me-1"></i>Register as Student';
            registerLink.href = "register-student.html";
            registerLinkContainer.style.display = 'block';
          } else if (userType === "manager") {
            emailInput.placeholder = "Enter your business email";
            registerLink.innerHTML =
              '<i class="fas fa-building me-1"></i>Register as Hostel Manager';
            registerLink.href = "register-manager.html";
            registerLinkContainer.style.display = 'block';
          } else if (userType === "admin") {
            emailInput.placeholder = "Enter your admin email";
            registerLinkContainer.style.display = 'none';
          }
        });
      });

      // Password toggle
      document
        .getElementById("passwordToggle")
        .addEventListener("click", function () {
          const passwordInput = document.getElementById("password");
          const icon = this.querySelector("i");

          if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
          } else {
            passwordInput.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
          }
        });

      // Form validation and submission
      document
        .getElementById("loginForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value;
          const userType = document.querySelector(".user-type-btn.active").dataset
            .type;

          // Clear previous messages
          hideMessages();

          // Basic validation
          if (!email || !password) {
            showError("Please fill in all fields");
            return;
          }

          if (!isValidEmail(email)) {
            showError("Please enter a valid email address");
            return;
          }

          if (password.length < 6) {
            showError("Password must be at least 6 characters long");
            return;
          }

          // Show loading state
          showLoading(true);

          try {
            // API call to login endpoint
            const response = await fetch(
              `${BASE_URL}/api/auth/login-${userType}`,
              {
                method: "POST",
                headers: {
                  Authorization: "Basic " + btoa(`${email}:${password}`),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              }
            );

            if (response.ok) {
              const data = await response.text();
              showSuccess(`Welcome back! Redirecting to ${userType} dashboard...`);

              // Store user session
              const userData = {
                email,
                userType: `ROLE_${userType.toUpperCase()}`,
                loginTime: new Date().toISOString(),
              };

              // Use sessionStorage for security
              try {
                sessionStorage.setItem("currentUser", JSON.stringify(userData));
              } catch (e) {
                console.warn("sessionStorage not available:", e);
              }

              // Redirect to dashboard based on user type
              setTimeout(() => {
                window.location.href = `dashboard.html?type=${userType}`;
              }, 1500);
            } else {
              const errorData = await response.text();
              showError(errorData || "Invalid email or password. Please try again.");
            }
          } catch (error) {
            console.error("Login error:", error);

            // For development - simulate successful login with demo credentials
            if (isDemoCredentials(email, password, userType)) {
              showSuccess(`Welcome back! Redirecting to ${userType} dashboard...`);

              const userData = {
                email,
                userType: `ROLE_${userType.toUpperCase()}`,
                loginTime: new Date().toISOString(),
              };

              try {
                sessionStorage.setItem("currentUser", JSON.stringify(userData));
              } catch (e) {
                console.warn("sessionStorage not available:", e);
              }

              setTimeout(() => {
                window.location.href = `dashboard.html?type=${userType}`;
              }, 1500);
            } else {
              showError("Network error. Please check your connection and try again.");
            }
          } finally {
            showLoading(false);
          }
        });

      // Check if credentials match demo accounts
      function isDemoCredentials(email, password, userType) {
        const demoAccounts = {
          student: { email: "student@strathmore.edu", password: "student123" },
          manager: { email: "manager@hostelhive.com", password: "manager123" },
          admin: { email: "admin@hostelhive.com", password: "admin123" }
        };

        const demo = demoAccounts[userType];
        return demo && demo.email === email && demo.password === password;
      }

      // Helper functions
      function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }

      function showError(message) {
        const errorAlert = document.getElementById("errorAlert");
        const errorMessage = document.getElementById("errorMessage");

        if (errorAlert && errorMessage) {
          errorMessage.textContent = message;
          errorAlert.classList.remove("d-none");

          // Auto hide after 5 seconds
          setTimeout(() => {
            errorAlert.classList.add("d-none");
          }, 5000);
        } else {
          alert("Error: " + message);
        }
      }

      function showSuccess(message) {
        const successAlert = document.getElementById("successAlert");
        const successMessage = document.getElementById("successMessage");

        if (successAlert && successMessage) {
          successMessage.textContent = message;
          successAlert.classList.remove("d-none");

          // Auto hide after 5 seconds
          setTimeout(() => {
            successAlert.classList.add("d-none");
          }, 5000);
        } else {
          alert("Success: " + message);
        }
      }

      function hideMessages() {
        const errorAlert = document.getElementById("errorAlert");
        const successAlert = document.getElementById("successAlert");

        if (errorAlert) errorAlert.classList.add("d-none");
        if (successAlert) successAlert.classList.add("d-none");
      }

      function showLoading(show) {
        const loadingSpinner = document.getElementById("loadingSpinner");
        const loginBtnText = document.getElementById("loginBtnText");
        const loginBtn = document.getElementById("loginBtn");

        if (loginBtn) {
          if (show) {
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";
            if (loginBtnText) {
              loginBtnText.innerHTML =
                '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
            }
            loginBtn.disabled = true;
          } else {
            if (loadingSpinner) loadingSpinner.style.display = "none";
            if (loginBtnText) {
              loginBtnText.innerHTML =
                '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
            }
            loginBtn.disabled = false;
          }
        }
      }

      // Forgot password handler
      document
        .getElementById("forgotPasswordLink")
        .addEventListener("click", function (e) {
          e.preventDefault();
          showSuccess("Password reset instructions will be sent to your email");
          // In real app: window.location.href = 'forgot-password.html';
        });

      // Network status listeners
      window.addEventListener("online", function () {
        console.log("Connection restored");
      });

      window.addEventListener("offline", function () {
        showError("No internet connection. Please check your network and try again.");
      });

      // Demo credentials info for development
      console.log("🔐 Demo Credentials for Testing:");
      console.log("👨‍🎓 Student: student@strathmore.edu / student123");
      console.log("🏢 Manager: manager@hostelhive.com / manager123");
      console.log("👮‍♂️ Admin: admin@hostelhive.com / admin123");
