// User type selection
document.querySelectorAll(".user-type-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".user-type-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    const userType = this.dataset.type;

    // Toggle field visibility
    document
      .querySelectorAll(".student-fields, .manager-fields")
      .forEach((el) => el.classList.remove("active"));
    document.querySelector(`.${userType}-fields`).classList.add("active");

    // Update form placeholders and requirements
    updateFormForUserType(userType);
  });
});

function updateFormForUserType(userType) {
  const emailInput = document.getElementById("email");

  if (userType === "student") {
    emailInput.placeholder = "Enter your student email";
    // Make student-specific fields required
    ["university", "yearOfStudy"].forEach((id) => {
      document.getElementById(id).required = true;
    });
    // Make manager fields optional
    ["businessName", "businessRegistration", "kraPin"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = false;
    });
  } else if (userType === "manager") {
    emailInput.placeholder = "Enter your business email";
    // Make manager-specific fields required
    ["businessName", "businessRegistration"].forEach((id) => {
      document.getElementById(id).required = true;
    });
    // Make student fields optional
    ["university", "yearOfStudy"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = false;
    });
  }
}

// Password toggle functionality
function setupPasswordToggle(inputId, toggleId) {
  const toggleElement = document.getElementById(toggleId);
  if (toggleElement) {
    toggleElement.addEventListener("click", function () {
      const passwordInput = document.getElementById(inputId);
      const icon = this.querySelector("i");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  }
}

setupPasswordToggle("password", "passwordToggle");
setupPasswordToggle("confirmPassword", "confirmPasswordToggle");

// Password strength checker
const passwordInput = document.getElementById("password");
if (passwordInput) {
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!strengthFill || !strengthText) return;

    const strength = calculatePasswordStrength(password);

    strengthFill.className = "strength-fill";

    if (password.length === 0) {
      strengthFill.classList.add("strength-weak");
      strengthText.innerHTML = "Password strength: <span>Not set</span>";
    } else if (strength < 2) {
      strengthFill.classList.add("strength-weak");
      strengthText.innerHTML =
        "Password strength: <span style='color: #ef4444;'>Weak</span>";
    } else if (strength < 3) {
      strengthFill.classList.add("strength-fair");
      strengthText.innerHTML =
        "Password strength: <span style='color: #f59e0b;'>Fair</span>";
    } else if (strength < 4) {
      strengthFill.classList.add("strength-good");
      strengthText.innerHTML =
        "Password strength: <span style='color: #10b981;'>Good</span>";
    } else {
      strengthFill.classList.add("strength-strong");
      strengthText.innerHTML =
        "Password strength: <span style='color: #059669;'>Strong</span>";
    }
  });
}

function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

// Enhanced function to show account exists message with login redirect option
function showAccountExistsMessage(email, userType) {
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  if (errorAlert && errorMessage) {
    errorMessage.innerHTML = `
      <div class="d-flex flex-column">
        <div class="mb-3">
          <strong>Account Already Exists!</strong><br>
          An account with the email <strong>${email}</strong> already exists in our system.
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-primary btn-sm" onclick="redirectToLogin('${email}', '${userType}')">
            <i class="fas fa-sign-in-alt me-1"></i>Go to Login
          </button>
          <button class="btn btn-outline-secondary btn-sm" onclick="clearEmailField()">
            <i class="fas fa-edit me-1"></i>Use Different Email
          </button>
        </div>
      </div>
    `;
    errorAlert.classList.remove("d-none");

    // Scroll to top of form section
    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    // Don't auto-hide this message since it has interactive buttons
  } else {
    // Fallback to confirm dialog
    const shouldRedirect = confirm(
      `An account with the email ${email} already exists. Would you like to go to the login page?`
    );
    if (shouldRedirect) {
      redirectToLogin(email, userType);
    }
  }
}

// Function to redirect to login page with pre-filled email
function redirectToLogin(email, userType) {
  const loginUrl = `login.html?email=${encodeURIComponent(
    email
  )}&type=${userType}&from=register`;
  window.location.href = loginUrl;
}

// Function to clear email field and focus on it
function clearEmailField() {
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.value = "";
    emailInput.focus();
    emailInput.classList.add("is-invalid");

    // Remove invalid class after user starts typing
    emailInput.addEventListener(
      "input",
      function () {
        this.classList.remove("is-invalid");
      },
      { once: true }
    );
  }
  hideMessages();
}

// Form validation and submission
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const userTypeBtn = document.querySelector(".user-type-btn.active");

    if (!userTypeBtn) {
      showError("Please select a user type (Student or Manager)");
      return;
    }

    const userType = userTypeBtn.dataset.type;
    const email = formData.get("email");

    // Clear previous messages
    hideMessages();

    // Validate form
    if (!validateForm(formData, userType)) {
      return;
    }

    // Show loading state
    showLoading(true);

    try {
      // Prepare data for API - matching backend DTO structure
      const registrationData = {
        fullName: `${formData.get("firstName")} ${formData.get("lastName")}`,
        email: email,
        phoneNumber: formData.get("phone").replace(/\D/g, ""), // Clean phone number
        password: formData.get("password"),
        userType: userType,
      };

      // Add user-type specific fields
      if (userType === "student") {
        registrationData.university = formData.get("university");
        registrationData.yearOfStudy = formData.get("yearOfStudy");
        registrationData.studentId = formData.get("studentId") || "";
        registrationData.budget = formData.get("budget") || "";
      } else if (userType === "manager") {
        registrationData.businessName = formData.get("businessName");
        registrationData.businessRegistration = formData.get(
          "businessRegistration"
        );
        registrationData.kraPin = formData.get("kraPin") || "";
        registrationData.businessDescription =
          formData.get("businessDescription") || "";
      }

      console.log("Sending registration data:", registrationData);

      // Make API call to the correct endpoint
      const response = await fetch(
        `http://localhost:8099/api/auth/register-${userType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      const responseText = await response.text();
      console.log("Server response:", responseText);

      if (response.ok) {
        showSuccess(
          "Account created successfully! Please check your email to verify your account."
        );

        // Store pending user data for demo purposes (remove localStorage usage in production)
        const userData = {
          email: formData.get("email"),
          fullName: registrationData.fullName,
          userType: `ROLE_${userType.toUpperCase()}`,
          registrationTime: new Date().toISOString(),
          verified: false,
        };

        // For production, remove this localStorage usage
        try {
          localStorage.setItem("pendingUser", JSON.stringify(userData));
        } catch (e) {
          console.warn("LocalStorage not available:", e);
        }

        // Reset form
        registerForm.reset();

        // Reset user type selection
        document
          .querySelectorAll(".user-type-btn")
          .forEach((btn) => btn.classList.remove("active"));
        document.querySelector('[data-type="student"]').classList.add("active");
        updateFormForUserType("student");

        // Redirect to login after successful registration
        setTimeout(() => {
          window.location.href = `login.html?registered=true&type=${userType}`;
        }, 2000);
      } else {
        // Handle different HTTP status codes
        if (response.status === 409) {
          // Enhanced handling for account already exists
          showAccountExistsMessage(email, userType);
        } else if (response.status === 400) {
          showError(
            "Invalid registration data. Please check all fields and try again."
          );
        } else if (response.status === 500) {
          showError("Server error occurred. Please try again later.");
        } else {
          let errorMsg =
            responseText || "Registration failed. Please try again.";

          // Try to parse error response for more specific messages
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
              errorMsg = errorData.message;
            }
          } catch (e) {
            // Use default message if parsing fails
          }

          showError(errorMsg);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showError(
          "Cannot connect to server. Please check if the server is running on port 8099."
        );
      } else {
        showError(`Registration error: ${error.message}`);
      }
    } finally {
      showLoading(false);
    }
  });
}

// Enhanced form validation function
function validateForm(formData, userType) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const phone = formData.get("phone");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const agreeTerms = formData.get("agreeTerms");

  // Basic validation
  if (!firstName || firstName.trim().length < 2) {
    showError("First name must be at least 2 characters long");
    return false;
  }

  if (!lastName || lastName.trim().length < 2) {
    showError("Last name must be at least 2 characters long");
    return false;
  }

  if (!email) {
    showError("Email is required");
    return false;
  }

  if (!phone) {
    showError("Phone number is required");
    return false;
  }

  if (!password) {
    showError("Password is required");
    return false;
  }

  if (!confirmPassword) {
    showError("Please confirm your password");
    return false;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address");
    return false;
  }

  if (!isValidPhone(phone)) {
    showError(
      "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)"
    );
    return false;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters long");
    return false;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return false;
  }

  if (calculatePasswordStrength(password) < 2) {
    showError(
      "Password is too weak. Please include uppercase, lowercase, numbers, and special characters."
    );
    return false;
  }

  if (!agreeTerms) {
    showError("You must accept the Terms of Service and Privacy Policy");
    return false;
  }

  // User type specific validation
  if (userType === "student") {
    const university = formData.get("university");
    const yearOfStudy = formData.get("yearOfStudy");

    if (!university || university.trim().length === 0) {
      showError("Please select your university");
      return false;
    }

    if (!yearOfStudy || yearOfStudy.trim().length === 0) {
      showError("Please select your year of study");
      return false;
    }

    // Special validation for Strathmore University
    if (
      university === "Strathmore University" &&
      !email.toLowerCase().includes("@strathmore.edu")
    ) {
      showError(
        "Please use your official Strathmore University email address (@strathmore.edu)"
      );
      return false;
    }
  } else if (userType === "manager") {
    const businessName = formData.get("businessName");
    const businessRegistration = formData.get("businessRegistration");

    if (!businessName || businessName.trim().length < 3) {
      showError("Business name must be at least 3 characters long");
      return false;
    }

    if (!businessRegistration || businessRegistration.trim().length === 0) {
      showError("Business registration number is required");
      return false;
    }

    const kraPin = formData.get("kraPin");
    if (kraPin && kraPin.trim().length > 0 && !isValidKRAPin(kraPin.trim())) {
      showError("Please enter a valid KRA PIN (e.g., P051234567M)");
      return false;
    }
  }

  return true;
}

// Enhanced helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidPhone(phone) {
  // Remove all spaces and non-digit characters except +
  const cleanPhone = phone.replace(/[\s-()]/g, "");

  // Check for Kenyan phone number formats
  const kenyanPatterns = [
    /^(\+254|254)[17]\d{8}$/, // +254 or 254 format
    /^0[17]\d{8}$/, // Local format starting with 0
  ];

  return kenyanPatterns.some((pattern) => pattern.test(cleanPhone));
}

function isValidKRAPin(pin) {
  // KRA PIN format: P + 9 digits + 1 letter
  const kraRegex = /^P\d{9}[A-Z]$/;
  return kraRegex.test(pin.toUpperCase());
}

function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  if (errorAlert && errorMessage) {
    errorMessage.innerHTML = message;
    errorAlert.classList.remove("d-none");

    // Scroll to top of form section
    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    // Auto-hide after 8 seconds (unless it contains buttons)
    if (!message.includes("<button")) {
      setTimeout(() => {
        errorAlert.classList.add("d-none");
      }, 8000);
    }
  } else {
    // Fallback to alert if elements not found
    alert("Error: " + message);
  }
}

function showSuccess(message) {
  const successAlert = document.getElementById("successAlert");
  const successMessage = document.getElementById("successMessage");

  if (successAlert && successMessage) {
    successMessage.textContent = message;
    successAlert.classList.remove("d-none");

    // Scroll to top of form section
    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    // Auto-hide after 10 seconds
    setTimeout(() => {
      successAlert.classList.add("d-none");
    }, 10000);
  } else {
    // Fallback to alert if elements not found
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
  const registerBtnText = document.getElementById("registerBtnText");
  const registerBtn = document.getElementById("registerBtn");

  if (registerBtn) {
    if (show) {
      if (loadingSpinner) loadingSpinner.style.display = "inline-block";
      if (registerBtnText) {
        registerBtnText.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
      }
      registerBtn.disabled = true;
    } else {
      if (loadingSpinner) loadingSpinner.style.display = "none";
      if (registerBtnText) {
        registerBtnText.innerHTML =
          '<i class="fas fa-user-plus me-2"></i>Create Account';
      }
      registerBtn.disabled = false;
    }
  }
}

// Enhanced phone number formatting
const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    let value = this.value.replace(/[^\d+]/g, ""); // Keep only digits and +

    // Handle different input formats
    if (value.startsWith("254") && !value.startsWith("+254")) {
      value = "+" + value;
    } else if (value.startsWith("07") || value.startsWith("01")) {
      // Keep local format as is
    } else if (
      value.length > 0 &&
      !value.startsWith("0") &&
      !value.startsWith("+254") &&
      !value.startsWith("254")
    ) {
      // If user starts typing without 0 or +254, assume they want local format
      if (value.charAt(0) === "7" || value.charAt(0) === "1") {
        value = "0" + value;
      }
    }

    // Limit length based on format
    if (value.startsWith("+254")) {
      value = value.substring(0, 13); // +254XXXXXXXXX
    } else if (value.startsWith("0")) {
      value = value.substring(0, 10); // 0XXXXXXXXX
    }

    this.value = value;
  });

  // Add placeholder
  phoneInput.placeholder = "0712345678 or +254712345678";
}

// Initialize form based on URL parameters
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get("type");

  if (userType && (userType === "student" || userType === "manager")) {
    const userTypeBtn = document.querySelector(`[data-type="${userType}"]`);
    if (userTypeBtn) {
      userTypeBtn.click();
    }
  } else {
    // Default to student
    const studentBtn = document.querySelector('[data-type="student"]');
    if (studentBtn) {
      studentBtn.click();
    }
  }

  updateFormForUserType(userType || "student");
});

// Enhanced demo data population (for testing - remove in production)
function populateDemoData() {
  const userTypeBtn = document.querySelector(".user-type-btn.active");
  const userType = userTypeBtn ? userTypeBtn.dataset.type : "student";

  if (userType === "student") {
    document.getElementById("firstName").value = "John";
    document.getElementById("lastName").value = "Doe";
    document.getElementById("email").value = "john.doe@strathmore.edu";
    document.getElementById("phone").value = "0712345678";

    const universitySelect = document.getElementById("university");
    const yearSelect = document.getElementById("yearOfStudy");

    if (universitySelect) universitySelect.value = "Strathmore University";
    if (yearSelect) yearSelect.value = "2";

    const studentIdInput = document.getElementById("studentId");
    const budgetSelect = document.getElementById("budget");

    if (studentIdInput) studentIdInput.value = "ST123456";
    if (budgetSelect) budgetSelect.value = "15000-20000";
  } else if (userType === "manager") {
    document.getElementById("firstName").value = "Jane";
    document.getElementById("lastName").value = "Smith";
    document.getElementById("email").value = "jane.smith@hostelbusiness.com";
    document.getElementById("phone").value = "0723456789";

    const businessNameInput = document.getElementById("businessName");
    const businessRegInput = document.getElementById("businessRegistration");
    const kraPinInput = document.getElementById("kraPin");
    const businessDescInput = document.getElementById("businessDescription");

    if (businessNameInput) businessNameInput.value = "Premium Student Hostels";
    if (businessRegInput) businessRegInput.value = "BUS123456789";
    if (kraPinInput) kraPinInput.value = "P123456789K";
    if (businessDescInput)
      businessDescInput.value = "Premium accommodation for students";
  }

  // Common fields
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("agreeTerms");

  if (passwordInput) {
    passwordInput.value = "SecurePass123!";
    passwordInput.dispatchEvent(new Event("input")); // Trigger password strength check
  }

  if (confirmPasswordInput) confirmPasswordInput.value = "SecurePass123!";
  if (agreeTermsCheckbox) agreeTermsCheckbox.checked = true;
}

// Add demo button for testing (remove in production)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  const demoBtn = document.createElement("button");
  demoBtn.innerHTML = "🔧 Fill Demo Data";
  demoBtn.className = "btn btn-outline-secondary btn-sm position-fixed";
  demoBtn.style.cssText =
    "top: 10px; right: 10px; z-index: 9999; font-size: 0.8rem;";
  demoBtn.onclick = populateDemoData;
  document.body.appendChild(demoBtn);
}

// Enhanced error handling for network issues
window.addEventListener("online", function () {
  console.log("Connection restored");
});

window.addEventListener("offline", function () {
  showError("No internet connection. Please check your network and try again.");
});

console.log("🎯 Registration Page Loaded");
console.log(
  "📝 Features: Student/Manager registration, password strength, enhanced field validation, login redirect"
);
console.log("🔧 Demo data available for testing");
console.log("🌐 Backend URL: http://localhost:8099/api/auth/");
