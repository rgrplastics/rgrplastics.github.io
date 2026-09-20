const setRecaptchaSiteKey = () => {
  const captcha = document.getElementById("enq-recaptcha");
  if (captcha && window.RGR_CONFIG && window.RGR_CONFIG.recaptchaSiteKey) {
    captcha.dataset.sitekey = window.RGR_CONFIG.recaptchaSiteKey;
  }
};

const setAppVersion = () => {
  const versionEl = document.getElementById("app-version");
  if (versionEl && window.RGR_CONFIG && window.RGR_CONFIG.version) {
    versionEl.textContent = `v${window.RGR_CONFIG.version}`;
  }
};

setAppVersion();
setRecaptchaSiteKey();

bootstrap.ScrollSpy.getOrCreateInstance(document.body, {
  target: "#site-navigation",
  rootMargin: "0px 0px -35%",
});

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

fetch("assests/products.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load products");
    return response.json();
  })
  .then((products) => {
    const grid = document.getElementById("product-grid");
    [...products]
      .sort((a, b) => (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER))
      .forEach((product) => {
        const colours = product.colours.map((colour) => `<option value="${escapeHtml(colour)}">${escapeHtml(colour)}</option>`).join("");
        const sizes = (product.size ?? ["Standard"]).map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("");
        const purpose = escapeHtml(product.purpose || "Plastic container");
        const code = escapeHtml(product.product_code);
        const material = escapeHtml(product.material);
        const grade = escapeHtml(product.grade);
        const imageAlt = escapeHtml(`${product.product_code} ${product.purpose || "plastic container"} ${product.size?.[0] || "standard size"} ${product.grade || ""} product image`);
        grid.insertAdjacentHTML(
          "beforeend",
          `<div class="col"><article class="product-card h-100" data-product-code="${code}" data-product-purpose="${purpose}" data-product-material="${material}" data-product-grade="${grade}"><div class="d-flex align-items-center gap-3"><img src="img/products/${code.toLowerCase()}.png" onerror="this.onerror=null;this.src='img/products/container.jpg';" class="product-card-image product-image-trigger flex-shrink-0" alt="${imageAlt}" width="112" height="112" loading="lazy" role="button" tabindex="0" aria-label="View larger image of ${purpose}"><div class="flex-grow-1"><div class="d-flex align-items-center gap-2"><h3 class="h5 mb-0">${purpose}</h3></div><p class="small text-secondary mb-1">${material} material - ${grade} grade</p><span class="product-code small fw-bold">${code}</span></div></div><div class="row g-2 product-quote-form"><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="colour-${code}">Colour</label><select id="colour-${code}" class="form-select form-select-sm quote-colour">${colours}</select></div><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="size-${code}">Size</label><select id="size-${code}" class="form-select form-select-sm quote-size">${sizes}</select></div><div class="col-6 col-md-3"><label class="form-label small fw-semibold" for="quantity-${code}">Quantity</label><input id="quantity-${code}" class="form-control form-control-sm quote-quantity" type="number" min="100" step="100" placeholder="100" inputmode="numeric"></div><div class="col-6 col-md-3 d-flex align-items-end"><button type="button" class="btn btn-outline-primary btn-sm w-100 add-to-cart"><i class="fa-solid fa-cart-plus me-2" aria-hidden="true"></i>Add to cart</button></div><div class="col-12"><div class="product-quote-error text-danger small mt-2 d-none" role="alert"></div></div></div></article></div>`,
        );
      });
    const productSchema = document.createElement("script");
    productSchema.type = "application/ld+json";
    productSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "RGR Plastics product range",
      itemListElement: [...products]
        .sort((a, b) => (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER))
        .map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: item.purpose || "Plastic container",
            sku: item.product_code,
            image: `https://rgrplastics.in/img/products/${item.product_code.toLowerCase()}.png`,
            category: `${item.grade} plastic container`,
          },
        })),
    });
    document.head.appendChild(productSchema);
  })
  .catch(() => {
    document.getElementById("product-grid").innerHTML = '<div class="col-12"><p class="text-center">Products are temporarily unavailable. Please contact us directly.</p></div>';
  });

const cartStorageKey = "rgrQuoteCart";
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
} catch {
  cart = [];
}

const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const appToast = bootstrap.Toast.getOrCreateInstance(document.getElementById("app-toast"));
const appToastMessage = document.getElementById("app-toast-message");

const showToast = (message) => {
  appToastMessage.textContent = message;
  appToast.show();
};

const saveCart = () => localStorage.setItem(cartStorageKey, JSON.stringify(cart));

const clearProductError = (errorCallout) => {
  if (errorCallout.errorTimeout) window.clearTimeout(errorCallout.errorTimeout);
  errorCallout.textContent = "";
  errorCallout.classList.add("d-none");
  errorCallout.errorTimeout = null;
};

const renderCart = () => {
  cartCount.textContent = cart.length;
  cartCount.classList.toggle("d-none", !cart.length);
  if (!cart.length) {
    cartItems.innerHTML = '<p class="text-secondary">Your quote cart is empty.</p>';
    return;
  }
  cartItems.innerHTML = cart.map((item, index) => `<div class="cart-item border-bottom pb-3 mb-3"><div class="d-flex gap-3"><img class="cart-item-image flex-shrink-0" src="img/products/${item.code.toLowerCase()}.png" onerror="this.onerror=null;this.src='img/products/container.jpg';" alt="${escapeHtml(item.purpose)}" width="64" height="64"><div class="flex-grow-1"><div class="d-flex justify-content-between gap-2"><h3 class="h6 mb-1">${escapeHtml(item.purpose)}</h3><button type="button" class="btn btn-sm btn-link text-danger p-0 remove-cart-item" data-cart-index="${index}" aria-label="Remove ${escapeHtml(item.purpose)} from cart"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div><p class="small text-secondary mb-1">${escapeHtml(item.code)} · ${escapeHtml(item.material)} · ${escapeHtml(item.grade)}</p><p class="small mb-0">Quantity: ${item.quantity} · ${escapeHtml(item.colour)} · ${escapeHtml(item.size)}</p></div></div></div>`).join("");
};

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-to-cart");
  if (addButton) {
    const card = addButton.closest(".product-card");
    const quantityField = card.querySelector(".quote-quantity");
    const quantity = Number(quantityField.value);
    if (!Number.isInteger(quantity) || quantity < 100 || quantity % 100 !== 0) {
      const errorCallout = card.querySelector(".product-quote-error");
      clearProductError(errorCallout);
      errorCallout.textContent = "Please enter a quantity in multiples of 100, such as 100, 200, or 500.";
      errorCallout.classList.remove("d-none");
      errorCallout.errorTimeout = window.setTimeout(() => clearProductError(errorCallout), 5000);
      quantityField.focus();
      return;
    }
    const errorCallout = card.querySelector(".product-quote-error");
    clearProductError(errorCallout);
    const item = {
      code: card.dataset.productCode,
      purpose: card.dataset.productPurpose,
      material: card.dataset.productMaterial,
      grade: card.dataset.productGrade,
      quantity,
      colour: card.querySelector(".quote-colour").value,
      size: card.querySelector(".quote-size").value,
    };
    const existing = cart.find((cartItem) => cartItem.code === item.code && cartItem.colour === item.colour && cartItem.size === item.size);
    if (existing) existing.quantity += item.quantity;
    else cart.push(item);
    saveCart();
    renderCart();
    renderEnquiryItems();
    addButton.innerHTML = '<i class="fa-solid fa-check me-2" aria-hidden="true"></i>Added to cart';
    window.setTimeout(() => {
      addButton.innerHTML = '<i class="fa-solid fa-cart-plus me-2" aria-hidden="true"></i>Add to cart';
    }, 1400);
    return;
  }

  const removeButton = event.target.closest(".remove-cart-item");
  if (removeButton) {
    cart.splice(Number(removeButton.dataset.cartIndex), 1);
    saveCart();
    renderCart();
    renderEnquiryItems();
    return;
  }

  const removeEnquiryButton = event.target.closest(".remove-enquiry-item");
  if (removeEnquiryButton) {
    cart.splice(Number(removeEnquiryButton.dataset.cartIndex), 1);
    saveCart();
    renderCart();
    renderEnquiryItems();
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches(".quote-quantity")) return;
  const errorCallout = event.target.closest(".product-card").querySelector(".product-quote-error");
  clearProductError(errorCallout);
});

document.getElementById("request-quote").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Please add at least one product to your quote cart.");
    return;
  }
  const items = cart.map((item, index) => `${index + 1}. ${item.code} - ${item.purpose}\nQuantity: ${item.quantity}\nColour: ${item.colour}\nMaterial: ${item.material}\nGrade: ${item.grade}\nSize: ${item.size}`);
  const message = `Hello RGR Plastics, I would like to request a quote:\n\n${items.join("\n\n")}\n\nPlease share your best price and availability.`;
  window.open(`https://wa.me/${window.RGR_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

renderCart();

const productImageModalElement = document.getElementById("product-image-modal");
const productImageModal = bootstrap.Modal.getOrCreateInstance(productImageModalElement);
const productImagePreview = document.getElementById("product-image-modal-preview");
const productImageModalTitle = document.getElementById("product-image-modal-title");

const openProductImage = (image) => {
  const card = image.closest(".product-card");
  productImagePreview.src = image.src;
  productImagePreview.alt = image.alt;
  productImageModalTitle.textContent = `${card.dataset.productPurpose} (${card.dataset.productCode})`;
  productImageModal.show();
};

document.addEventListener("click", (event) => {
  if (event.target.matches(".product-image-trigger")) openProductImage(event.target);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches(".product-image-trigger")) openProductImage(event.target);
});

const enquiryItems = document.getElementById("enquiry-items");
const enquiryCount = document.getElementById("enquiry-count");
const enquiryPanelTitle = document.getElementById("enquiry-panel-title");
const enquiryStepCart = document.getElementById("enquiry-step-cart");
const enquiryStepForm = document.getElementById("enquiry-step-form");
const enquiryStepSuccess = document.getElementById("enquiry-step-success");
const enquiryContinueBtn = document.getElementById("enquiry-continue");
const enquiryBackBtn = document.getElementById("enquiry-back");
const enquiryForm = document.getElementById("enquiry-form");
const enquiryFormAlert = document.getElementById("enquiry-form-alert");
const enquirySubmitBtn = document.getElementById("enquiry-submit");
const enquiryCaptchaFeedback = document.getElementById("enq-captcha-feedback");

const getServerDate = async () => {
  const response = await fetch(window.RGR_CONFIG.supabaseTableUrl, {
    method: "HEAD",
    headers: {
      apikey: window.RGR_CONFIG.supabaseAnonKey,
    },
  });

  const dateHeader = response.headers.get("date");
  if (!dateHeader) {
    throw new Error("Unable to read server date");
  }

  return new Date(dateHeader);
};

const renderEnquiryItems = () => {
  enquiryCount.textContent = cart.length;
  enquiryCount.classList.toggle("d-none", !cart.length);
  enquiryContinueBtn.disabled = !cart.length;
  if (!cart.length) {
    enquiryItems.innerHTML = '<p class="text-secondary">Your enquiry cart is empty.</p>';
    return;
  }
  enquiryItems.innerHTML = cart.map((item, index) => `<div class="cart-item border-bottom pb-3 mb-3"><div class="d-flex gap-3"><img class="cart-item-image flex-shrink-0" src="img/products/${item.code.toLowerCase()}.png" onerror="this.onerror=null;this.src='img/products/container.jpg';" alt="${escapeHtml(item.purpose)}" width="56" height="56"><div class="flex-grow-1"><div class="d-flex justify-content-between gap-2"><h3 class="h6 mb-1">${escapeHtml(item.purpose)}</h3><button type="button" class="btn btn-sm btn-link text-danger p-0 remove-enquiry-item" data-cart-index="${index}" aria-label="Remove ${escapeHtml(item.purpose)} from enquiry"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div><p class="small text-secondary mb-1">${escapeHtml(item.code)} · ${escapeHtml(item.material)} · ${escapeHtml(item.grade)}</p><p class="small mb-0">Quantity: ${item.quantity} · ${escapeHtml(item.colour)} · ${escapeHtml(item.size)}</p></div></div></div>`).join("");
};

const showEnquiryStep = (step) => {
  enquiryStepCart.classList.toggle("d-none", step !== "cart");
  enquiryStepForm.classList.toggle("d-none", step !== "form");
  enquiryStepSuccess.classList.toggle("d-none", step !== "success");
  enquiryPanelTitle.textContent = step === "form" ? "Your details" : step === "success" ? "Enquiry received" : "Enquiry cart";
};

const recaptchaReady = () => typeof window.grecaptcha !== "undefined" && typeof window.grecaptcha.reset === "function";
const resetEnquiryCaptcha = () => {
  if (recaptchaReady()) window.grecaptcha.reset();
  enquiryCaptchaFeedback.classList.add("d-none");
};

document.getElementById("enquiry-panel").addEventListener("show.bs.offcanvas", () => {
  renderEnquiryItems();
  showEnquiryStep("cart");
});

document.getElementById("enquiry-done").addEventListener("click", renderEnquiryItems);

enquiryContinueBtn.addEventListener("click", () => {
  if (!cart.length) return;
  resetEnquiryCaptcha();
  showEnquiryStep("form");
});

enquiryBackBtn.addEventListener("click", () => showEnquiryStep("cart"));

const enquiryField = (id) => document.getElementById(id);
const latestEnquiry = { current: null };

const generateEnquiryId = async () => {
  const serverDate = await getServerDate();
  const y = serverDate.getUTCFullYear();
  const rand = Math.random().toString(36).substring(3, 8).toUpperCase();
  return `RGR-ENQ-${rand}/${y}`;
};

// ─── OTP / Phone Auth UI ─────────────────────────────────────────────────────

const mobileRe = /^[6-9]\d{9}$/;

// OTP UI elements
const otpSendBtn = document.getElementById("otp-send-btn");
const otpRow = document.getElementById("otp-row");
const otpInput = document.getElementById("otp-input");
const otpConfirmBtn = document.getElementById("otp-confirm-btn");
const otpError = document.getElementById("otp-error");
const otpResendBtn = document.getElementById("otp-resend-btn");
const otpCountdown = document.getElementById("otp-countdown");
const otpVerifiedBadge = document.getElementById("otp-verified-badge");
const mobileInput = enquiryField("enq-mobile");

let otpCountdownTimer = null;
const OTP_RESEND_SECONDS = 30;

/** Show an error message in the OTP error callout */
const showOtpError = (message) => {
  otpError.textContent = message;
  otpError.classList.remove("d-none");
};

const clearOtpError = () => otpError.classList.add("d-none");

/** Start the resend cooldown countdown */
const startResendCountdown = () => {
  otpResendBtn.disabled = true;
  let remaining = OTP_RESEND_SECONDS;
  otpCountdown.textContent = `(${remaining}s)`;
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  otpCountdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(otpCountdownTimer);
      otpCountdown.textContent = "";
      otpResendBtn.disabled = false;
    } else {
      otpCountdown.textContent = `(${remaining}s)`;
    }
  }, 1000);
};

/** Reset the entire OTP UI back to initial state */
const resetOtpUi = () => {
  otpRow.classList.add("d-none");
  otpVerifiedBadge.classList.add("d-none");
  otpInput.value = "";
  clearOtpError();
  mobileInput.readOnly = false;
  mobileInput.disabled = false;
  otpSendBtn.disabled = false;
  otpSendBtn.innerHTML = '<i class="fa-solid fa-shield-halved me-1" aria-hidden="true"></i>Verify';
  otpSendBtn.classList.remove("btn-outline-success");
  otpSendBtn.classList.add("btn-outline-secondary");
  mobileInput.classList.remove("is-valid", "is-invalid");
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  otpCountdown.textContent = "";
  otpResendBtn.disabled = true;
  // Reset Firebase auth state
  if (window.RGR_FIREBASE_AUTH) window.RGR_FIREBASE_AUTH.resetVerification();
};

/** Show the "verified" state on the mobile field */
const markMobileVerified = () => {
  otpRow.classList.add("d-none");
  otpVerifiedBadge.classList.remove("d-none");
  mobileInput.classList.add("is-valid");
  mobileInput.classList.remove("is-invalid");
  mobileInput.readOnly = true;
  otpSendBtn.innerHTML = '<i class="fa-solid fa-circle-check me-1" aria-hidden="true"></i>Verified';
  otpSendBtn.classList.remove("btn-outline-secondary");
  otpSendBtn.classList.add("btn-outline-success");
  otpSendBtn.disabled = true;
};

/** Trigger OTP send — shared by Verify button and Resend button */
const doSendOtp = async () => {
  const mobile = mobileInput.value.trim();
  if (!mobileRe.test(mobile)) {
    mobileInput.classList.add("is-invalid");
    return;
  }
  mobileInput.classList.remove("is-invalid");
  clearOtpError();

  otpSendBtn.disabled = true;
  otpSendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Sending…';

  try {
    await window.RGR_FIREBASE_AUTH.sendOtp("+91" + mobile);
    // Show OTP row
    otpRow.classList.remove("d-none");
    otpInput.value = "";
    otpInput.focus();
    startResendCountdown();
    otpSendBtn.innerHTML = '<i class="fa-solid fa-shield-halved me-1" aria-hidden="true"></i>Verify';
    // Re-enable so user can change number (clicking unlocks the field)
    otpSendBtn.disabled = true; // locked while OTP row is shown; resend handles retry
  } catch (err) {
    console.error("[OTP] Send failed:", err);
    const friendly = err.code === "auth/invalid-phone-number" ? "Invalid phone number. Please check and retry." : err.code === "auth/too-many-requests" ? "Too many attempts. Please wait a few minutes and try again." : err.code === "auth/captcha-check-failed" ? "reCAPTCHA verification failed. Please ensure your domain is added to Firebase Authorized Domains." : err.code === "auth/invalid-app-credential" ? "Invalid App Credential or App Check required. Please check your Firebase settings." : err.message || "Failed to send OTP. Please try again.";
    showOtpError(friendly);
    otpSendBtn.disabled = false;
    otpSendBtn.innerHTML = '<i class="fa-solid fa-shield-halved me-1" aria-hidden="true"></i>Verify';
  }
};

// "Verify" button
otpSendBtn.addEventListener("click", doSendOtp);

// "Resend OTP" button
otpResendBtn.addEventListener("click", doSendOtp);

// "Edit number" button
const otpChangeBtn = document.getElementById("otp-change-btn");
if (otpChangeBtn) {
  otpChangeBtn.addEventListener("click", () => {
    resetOtpUi();
    mobileInput.focus();
  });
}

// "Confirm OTP" button
otpConfirmBtn.addEventListener("click", async () => {
  const code = otpInput.value.trim();
  if (!/^\d{6}$/.test(code)) {
    showOtpError("Please enter the 6-digit OTP.");
    return;
  }
  clearOtpError();

  otpConfirmBtn.disabled = true;
  otpConfirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Confirming…';

  try {
    await window.RGR_FIREBASE_AUTH.verifyOtp(code);
    markMobileVerified();
  } catch (err) {
    console.error("[OTP] Confirm failed:", err);
    const friendly = err.code === "auth/invalid-verification-code" ? "Incorrect OTP. Please check and try again." : err.code === "auth/code-expired" ? "OTP has expired. Please request a new one." : "OTP verification failed. Please try again.";
    showOtpError(friendly);
  } finally {
    otpConfirmBtn.disabled = false;
    otpConfirmBtn.innerHTML = '<i class="fa-solid fa-check me-1" aria-hidden="true"></i>Confirm';
  }
});

// Reset verification when the user edits the mobile number
mobileInput.addEventListener("input", () => {
  if (window.RGR_FIREBASE_AUTH?.isVerified) {
    resetOtpUi();
  }
});

// ─── Enquiry Form Submit ──────────────────────────────────────────────────────

enquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  enquiryFormAlert.classList.add("d-none");

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const companyName = enquiryField("enq-company").value.trim();
  const firstName = enquiryField("enq-first-name").value.trim();
  const lastName = enquiryField("enq-last-name").value.trim();
  const designation = enquiryField("enq-designation").value.trim();
  const address = enquiryField("enq-address").value.trim();
  const mobile = mobileInput.value.trim();
  const whatsapp = enquiryField("enq-whatsapp").value.trim();
  const email = enquiryField("enq-email").value.trim();

  let valid = true;

  enquiryField("enq-first-name").classList.toggle("is-invalid", !firstName);
  if (!firstName) valid = false;

  enquiryField("enq-last-name").classList.toggle("is-invalid", !lastName);
  if (!lastName) valid = false;

  enquiryField("enq-address").classList.toggle("is-invalid", !address);
  if (!address) valid = false;

  // Mobile — must be valid AND verified (unless localhost dev)
  const mobileBad = !mobileRe.test(mobile);
  const mobileUnverified = !window.RGR_FIREBASE_AUTH?.isVerified;

  if (mobileBad) {
    mobileInput.classList.add("is-invalid");
    document.getElementById("enq-mobile-feedback").textContent = "Enter a valid 10-digit mobile number.";
    valid = false;
  } else if (mobileUnverified) {
    mobileInput.classList.add("is-invalid");
    document.getElementById("enq-mobile-feedback").textContent = "Please verify your mobile number with OTP before submitting.";
    valid = false;
  } else {
    mobileInput.classList.remove("is-invalid");
    document.getElementById("enq-mobile-feedback").textContent = "Enter a valid 10-digit mobile number.";
  }

  const whatsappBad = whatsapp !== "" && !mobileRe.test(whatsapp);
  const emailBad = email !== "" && !emailRe.test(email);
  const noContact = whatsapp === "" && email === "";

  enquiryField("enq-whatsapp").classList.toggle("is-invalid", whatsappBad || noContact);
  enquiryField("enq-email").classList.toggle("is-invalid", emailBad || noContact);

  if (whatsappBad) valid = false;
  if (emailBad) valid = false;
  if (noContact) {
    valid = false;
    enquiryFormAlert.textContent = "Please provide at least your WhatsApp number or email ID.";
    enquiryFormAlert.classList.remove("d-none");
  }

  if (!valid) return;

  let recaptchaToken = "";
  recaptchaToken = recaptchaReady() ? window.grecaptcha.getResponse() : "";
  const captchaOk = recaptchaToken.length > 0;
  enquiryCaptchaFeedback.classList.toggle("d-none", captchaOk);
  if (!captchaOk) valid = false;

  if (!valid) return;

  enquirySubmitBtn.disabled = true;
  enquirySubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Submitting…';

  try {
    // Refresh Firebase token in case it is close to expiry (tokens last 1 hour)
    let idToken = null;
    if (window.RGR_FIREBASE_AUTH?.isVerified) {
      idToken = await window.RGR_FIREBASE_AUTH.refreshToken();
    }

    const enquiryId = await generateEnquiryId();
    const row = {
      enquiry_id: enquiryId,
      company_name: companyName || null,
      first_name: firstName,
      last_name: lastName,
      designation: designation || null,
      address: address || null,
      mobile: mobile || null,
      whatsapp: whatsapp || null,
      email: email || null,
      items: cart,
      source: window.location.href,
      recaptcha_token: recaptchaToken || "localhost",
    };

    const headers = {
      "Content-Type": "application/json",
      apikey: window.RGR_CONFIG.supabaseAnonKey,
      Prefer: "return=minimal",
    };

    // Attach Firebase ID token as Bearer for authenticated Supabase RLS
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }

    const response = await fetch(window.RGR_CONFIG.supabaseTableUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(row),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Supabase returned ${response.status}`);
    }

    latestEnquiry.current = {
      enquiryId,
      firstName,
      lastName,
      companyName,
      items: cart.map((item) => ({ ...item })),
      address,
      mobile,
      whatsapp,
      email,
      enquiryDate: new Date().toLocaleDateString("en-CA"),
      source: window.location.href,
      status: "Submitted",
    };
    window.RGR_LATEST_ENQUIRY = latestEnquiry.current;

    document.getElementById("enquiry-success-name").textContent = firstName;
    document.getElementById("enquiry-id-display").textContent = enquiryId;
    const channels = [];

    if (false) {
      if (whatsapp) channels.push(`WhatsApp (${whatsapp})`);
      if (email) channels.push(email);
      document.getElementById("enquiry-success-channels").textContent = channels.length ? `We've sent your enquiry details to ${channels.join(" and ")}.` : "";
    }

    cart = [];
    saveCart();
    renderCart();
    renderEnquiryItems();

    enquiryForm.reset();
    resetOtpUi();
    resetEnquiryCaptcha();
    showEnquiryStep("success");
  } catch (error) {
    console.error("Enquiry submission failed:", error);
    enquiryFormAlert.textContent = "Sorry, we couldn't send your enquiry just now. Please try again in a moment.";
    enquiryFormAlert.classList.remove("d-none");
    resetEnquiryCaptcha();
  } finally {
    enquirySubmitBtn.disabled = false;
    enquirySubmitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2" aria-hidden="true"></i>Submit enquiry';
  }
});

document.getElementById("enquiry-download").addEventListener("click", () => {
  if (typeof window.downloadEnquiryPdf === "function") {
    window.downloadEnquiryPdf(latestEnquiry.current || window.RGR_LATEST_ENQUIRY);
  }
});

renderEnquiryItems();
