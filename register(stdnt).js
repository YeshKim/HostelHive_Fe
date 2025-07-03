const BASE_URL = "http://localhost:8099"; // Configurable backend URL

document.querySelectorAll(".user-type-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".user-type-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    const userType = this.dataset.type;

    document
      .querySelectorAll(".student-fields, .manager-fields")
      .forEach((el) => el.classList.remove("active"));
    document.querySelector(`.${userType}-fields`).classList.add("active");

    updateFormForUserType(userType);
  });
});

function updateFormForUserType(userType) {
  const emailInput = document.getElementById("email");

  if (userType === "student") {
    emailInput.placeholder = "Enter your student email";
    ["university"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = true;
    });
    ["businessName", "businessRegistration", "kraPin"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = false;
    });
  } else if (userType === "manager") {
    emailInput.placeholder = "Enter your business email";
    ["businessName", "businessRegistration"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = true;
    });
    ["university"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = false;
    });
  }
}

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

    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  } else {
    const shouldRedirect = confirm(
      `An account with the email ${email} already exists. Would you like to go to the login page?`
    );
    if (shouldRedirect) {
      redirectToLogin(email, userType);
    }
  }
}

function redirectToLogin(email, userType) {
  const loginUrl = `login.html?email=${encodeURIComponent(
    email
  )}&type=${userType}&from=register`;
  window.location.href = loginUrl;
}

function clearEmailField() {
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.value = "";
    emailInput.focus();
    emailInput.classList.add("is-invalid");

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

    hideMessages();

    if (!validateForm(formData, userType)) {
      return;
    }

    showLoading(true);

    try {
      const registrationData = {
        fullName: `${formData.get("firstName")} ${formData.get("lastName")}`,
        email: email,
        phoneNumber: formData.get("phone").replace(/\D/g, ""),
        password: formData.get("password"),
        userType: userType,
      };

      if (userType === "student") {
        registrationData.university = formData.get("university");
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

      const response = await fetch(
        `${BASE_URL}/api/auth/register-${userType}`,
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

        const userData = {
          email: formData.get("email"),
          fullName: registrationData.fullName,
          userType: `ROLE_${userType.toUpperCase()}`,
          registrationTime: new Date().toISOString(),
          verified: false,
        };

        try {
          localStorage.setItem("pendingUser", JSON.stringify(userData));
        } catch (e) {
          console.warn("LocalStorage not available:", e);
        }

        registerForm.reset();
        document
          .querySelectorAll(".user-type-btn")
          .forEach((btn) => btn.classList.remove("active"));
        document.querySelector('[data-type="student"]').classList.add("active");
        updateFormForUserType("student");

        setTimeout(() => {
          window.location.href = `login.html?registered=true&type=${userType}`;
        }, 2000);
      } else {
        if (response.status === 409) {
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

          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message) {
              errorMsg = errorData.message;
            }
          } catch (e) {}

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

function validateForm(formData, userType) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const phone = formData.get("phone");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const agreeTerms = formData.get("agreeTerms");

  if (!firstName || firstName.trim().length < 2) {
    const firstNameInput = document.getElementById("firstName");
    if (firstNameInput) firstNameInput.classList.add("is-invalid");
    showError("First name must be at least 2 characters long");
    return false;
  }

  if (!lastName || lastName.trim().length < 2) {
    const lastNameInput = document.getElementById("lastName");
    if (lastNameInput) lastNameInput.classList.add("is-invalid");
    showError("Last name must be at least 2 characters long");
    return false;
  }

  if (!email) {
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.classList.add("is-invalid");
    showError("Email is required");
    return false;
  }

  if (!phone) {
    const phoneInput = document.getElementById("phone");
    if (phoneInput) phoneInput.classList.add("is-invalid");
    showError("Phone number is required");
    return false;
  }

  if (!password) {
    const passwordInput = document.getElementById("password");
    if (passwordInput) passwordInput.classList.add("is-invalid");
    showError("Password is required");
    return false;
  }

  if (!confirmPassword) {
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) confirmPasswordInput.classList.add("is-invalid");
    showError("Please confirm your password");
    return false;
  }

  if (!isValidEmail(email)) {
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.classList.add("is-invalid");
    showError("Please enter a valid email address");
    return false;
  }

  if (!isValidPhone(phone)) {
    const phoneInput = document.getElementById("phone");
    if (phoneInput) phoneInput.classList.add("is-invalid");
    showError(
      "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)"
    );
    return false;
  }

  if (password.length < 8) {
    const passwordInput = document.getElementById("password");
    if (passwordInput) passwordInput.classList.add("is-invalid");
    showError("Password must be at least 8 characters long");
    return false;
  }

  if (password !== confirmPassword) {
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput) confirmPasswordInput.classList.add("is-invalid");
    showError("Passwords do not match");
    return false;
  }

  if (calculatePasswordStrength(password) < 2) {
    const passwordInput = document.getElementById("password");
    if (passwordInput) passwordInput.classList.add("is-invalid");
    showError(
      "Password is too weak. Please include uppercase, lowercase, numbers, and special characters."
    );
    return invalido;
  }

  if (!agreeTerms) {
    const agreeTermsCheckbox = document.getElementById("agreeTerms");
    if (agreeTermsCheckbox) agreeTermsCheckbox.classList.add("is-invalid");
    showError("You must accept the Terms of Service and Privacy Policy");
    return false;
  }

  if (userType === "student") {
    const university = formData.get("university");

    if (!university || university === "") {
      const universitySelect = document.getElementById("university");
      if (universitySelect) universitySelect.classList.add("is-invalid");
      showError("Please select your university");
      return false;
    }

    if (
      university === "Strathmore University" &&
      !email.toLowerCase().includes("@strathmore.edu")
    ) {
      const emailInput = document.getElementById("email");
      if (emailInput) emailInput.classList.add("is-invalid");
      showError(
        "Please use your official Strathmore University email address (@strathmore.edu)"
      );
      return false;
    }

    const universitySelect = document.getElementById("university");
    if (universitySelect) universitySelect.classList.remove("is-invalid");
  } else if (userType === "manager") {
    const businessName = formData.get("businessName");
    const businessRegistration = formData.get("businessRegistration");

    if (!businessName || businessName.trim().length < 3) {
      const businessNameInput = document.getElementById("businessName");
      if (businessNameInput) businessNameInput.classList.add("is-invalid");
      showError("Business name must be at least 3 characters long");
      return false;
    }

    if (!businessRegistration || businessRegistration.trim().length === 0) {
      const businessRegInput = document.getElementById("businessRegistration");
      if (businessRegInput) businessRegInput.classList.add("is-invalid");
      showError("Business registration number is required");
      return false;
    }

    const kraPin = formData.get("kraPin");
    if (kraPin && kraPin.trim().length > 0 && !isValidKRAPin(kraPin.trim())) {
      const kraPinInput = document.getElementById("kraPin");
      if (kraPinInput) kraPinInput.classList.add("is-invalid");
      showError("Please enter a valid KRA PIN (e.g., P051234567M)");
      return false;
    }

    ["businessName", "businessRegistration", "kraPin"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.classList.remove("is-invalid");
    });
  }

  [
    "firstName",
    "lastName",
    "email",
    "phone",
    "password",
    "confirmPassword",
    "agreeTerms",
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.classList.remove("is-invalid");
  });

  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function isValidPhone(phone) {
  const cleanPhone = phone.replace(/[\s-()]/g, "");
  const kenyanPatterns = [/^(\+254|254)[17]\d{8}$/, /^0[17]\d{8}$/];
  return kenyanPatterns.some((pattern) => pattern.test(cleanPhone));
}

function isValidKRAPin(pin) {
  const kraRegex = /^P\d{9}[A-Z]$/;
  return kraRegex.test(pin.toUpperCase());
}

function showError(message) {
  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  if (errorAlert && errorMessage) {
    errorMessage.innerHTML = message;
    errorAlert.classList.remove("d-none");

    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    if (!message.includes("<button")) {
      setTimeout(() => {
        errorAlert.classList.add("d-none");
      }, 8000);
    }
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

    const formSection = document.querySelector(".form-section");
    if (formSection) {
      formSection.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    setTimeout(() => {
      successAlert.classList.add("d-none");
    }, 10000);
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

const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", function () {
    let value = this.value.replace(/[^\d+]/g, "");

    if (value.startsWith("254") && !value.startsWith("+254")) {
      value = "+" + value;
    } else if (value.startsWith("07") || value.startsWith("01")) {
    } else if (
      value.length > 0 &&
      !value.startsWith("0") &&
      !value.startsWith("+254") &&
      !value.startsWith("254")
    ) {
      if (value.charAt(0) === "7" || value.charAt(0) === "1") {
        value = "0" + value;
      }
    }

    if (value.startsWith("+254")) {
      value = value.substring(0, 13);
    } else if (value.startsWith("0")) {
      value = value.substring(0, 10);
    }

    this.value = value;
  });

  phoneInput.placeholder = "0712345678 or +254712345678";
}

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userType = urlParams.get("type");

  if (userType && (userType === "student" || userType === "manager")) {
    const userTypeBtn = document.querySelector(`[data-type="${userType}"]`);
    if (userTypeBtn) {
      userTypeBtn.click();
    }
  } else {
    const studentBtn = document.querySelector('[data-type="student"]');
    if (studentBtn) {
      studentBtn.click();
    }
  }

  updateFormForUserType(userType || "student");
});

function populateDemoData() {
  const userTypeBtn = document.querySelector(".user-type-btn.active");
  const userType = userTypeBtn ? userTypeBtn.dataset.type : "student";

  if (userType === "student") {
    document.getElementById("firstName").value = "John";
    document.getElementById("lastName").value = "Doe";
    document.getElementById("email").value = "john.doe@strathmore.edu";
    document.getElementById("phone").value = "0712345678";

    const universitySelect = document.getElementById("university");
    if (universitySelect) universitySelect.value = "Strathmore University";
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

  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const agreeTermsCheckbox = document.getElementById("agreeTerms");

  if (passwordInput) {
    passwordInput.value = "SecurePass123!";
    passwordInput.dispatchEvent(new Event("input"));
  }

  if (confirmPasswordInput) confirmPasswordInput.value = "SecurePass123!";
  if (agreeTermsCheckbox) agreeTermsCheckbox.checked = true;
}

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
console.log(`🌐 Backend URL: ${BASE_URL}/api/auth/`);
