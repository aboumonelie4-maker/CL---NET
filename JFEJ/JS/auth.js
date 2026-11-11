// ==========================================
// JFEJ School - Gestion de l'Authentification (Auth)
// Démonstration pédagogique avec localStorage
// ==========================================

let pendingRegistration = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialisation d'un compte de test si aucun utilisateur n'existe
  initDemoUsers();

  // 2. Gestion de l'affichage/masquage des mots de passe
  initPasswordToggles();

  // 3. Gestion de la page de Connexion
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // 4. Gestion de la page d'Inscription
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    initializeRegistrationSpecialties();
    registerForm.addEventListener("submit", handleRegister);
  }

  // 5. Mise à jour de la barre de navigation si un utilisateur est connecté
  updateNavbarAuthStatus();
});

// Création d'un utilisateur de test par défaut
function initDemoUsers() {
  const users = JSON.parse(localStorage.getItem("jfej_users") || "[]");
  if (users.length === 0) {
    const defaultUser = {
      prenom: "Élève",
      nom: "NSI",
      email: "eleve@jfej.fr",
      password: "jfej2026",
      classe: "1ère",
      specialite: [
        "Numérique et Sciences Informatiques (NSI)",
        "Mathématique",
        "Physique-Chimie"
      ],
      bio: "Passionné d'informatique, de projets web et d'algorithmes."
    };
    users.push(defaultUser);
    localStorage.setItem("jfej_users", JSON.stringify(users));
  }
}

// Bouton œil pour voir/masquer le mot de passe
function initPasswordToggles() {
  document.querySelectorAll(".toggle-pwd-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
        btn.setAttribute("aria-label", "Masquer le mot de passe");
      } else {
        input.type = "password";
        btn.textContent = "👁️";
        btn.setAttribute("aria-label", "Afficher le mot de passe");
      }
    });
  });
}

// Traitement de la connexion
function handleLogin(e) {
  e.preventDefault();
  const alertBox = document.getElementById("auth-alert");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  const users = JSON.parse(localStorage.getItem("jfej_users") || "[]");
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email && u.password === password
  );

  if (foundUser) {
    showAlert(alertBox, `Ravi de vous revoir, ${foundUser.prenom} ! Redirection vers The Site...`, "success");
    sessionStorage.setItem("jfej_current_user", JSON.stringify(foundUser));

    setTimeout(() => {
      window.location.href = "../../../The_Site/HTML/Mon%20compte.html";
    }, 1000);
  } else {
    showAlert(alertBox, "Adresse email ou mot de passe incorrect.", "error");
  }
}

// Traitement de l'inscription
function handleRegister(e) {
  e.preventDefault();
  const alertBox = document.getElementById("auth-alert");
  const registerForm = document.getElementById("register-form");
  if (registerForm && !registerForm.checkValidity()) {
    registerForm.reportValidity();
    return;
  }

  const prenom = document.getElementById("prenom").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const classe = document.getElementById("classe") ? document.getElementById("classe").value : "1ère";
  const specialite = getRegistrationSpecialtySelects()
    .map((select) => select.value)
    .filter(Boolean);
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const terms = document.getElementById("terms");

  if (terms && !terms.checked) {
    showAlert(alertBox, "Veuillez accepter la charte d'utilisation.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert(alertBox, "Les deux mots de passe ne correspondent pas.", "error");
    return;
  }

  if (password.length < 6) {
    showAlert(alertBox, "Le mot de passe doit comporter au moins 6 caractères.", "error");
    return;
  }

  const requiredSpecialtyCount = getSpecialtyLimit(classe);
  if (specialite.length !== requiredSpecialtyCount) {
    showAlert(
      alertBox,
      requiredSpecialtyCount
        ? `Veuillez choisir exactement ${requiredSpecialtyCount} spécialité(s) pour votre classe.`
        : "Aucune spécialité n'est à choisir en Seconde.",
      "error"
    );
    return;
  }

  const users = JSON.parse(localStorage.getItem("jfej_users") || "[]");
  const existingUser = users.find((u) => u.email.toLowerCase() === email);

  if (existingUser) {
    showAlert(alertBox, "Cette adresse email possède déjà un compte.", "error");
    return;
  }

  pendingRegistration = {
    prenom,
    nom,
    email,
    classe,
    specialite,
    password,
    bio: requiredSpecialtyCount
      ? `Élève en ${classe}, spécialités ${specialite.join(", ")}.`
      : `Élève en ${classe}.`
  };

  completeRegistration();
}

function completeRegistration() {
  if (!pendingRegistration) return;

  const alertBox = document.getElementById("auth-alert");
  const users = JSON.parse(localStorage.getItem("jfej_users") || "[]");
  const existingUser = users.find((user) => user.email.toLowerCase() === pendingRegistration.email);
  if (existingUser) {
    pendingRegistration = null;
    showAlert(alertBox, "Cette adresse email possède déjà un compte.", "error");
    return;
  }

  const newUser = pendingRegistration;
  users.push(newUser);
  localStorage.setItem("jfej_users", JSON.stringify(users));
  sessionStorage.setItem("jfej_current_user", JSON.stringify(newUser));
  pendingRegistration = null;

  showAlert(alertBox, `Compte créé avec succès ! Bienvenue ${newUser.prenom} sur JFEJ School. Redirection vers The Site...`, "success");

  setTimeout(() => {
    window.location.href = "../../../The_Site/HTML/Mon%20compte.html";
  }, 1200);
}

function initializeRegistrationSpecialties() {
  const classSelect = document.getElementById("classe");
  const specialtyHelp = document.getElementById("specialite-help");
  const specialtySelects = getRegistrationSpecialtySelects();
  if (!classSelect || specialtySelects.length === 0 || !specialtyHelp) return;

  const updateSpecialtyOptions = () => {
    const limit = getSpecialtyLimit(classSelect.value);
    specialtySelects.forEach((select, index) => {
      select.value = "";
      select.disabled = index >= limit;
      select.required = index < limit;
      const field = select.closest(".registration-specialty-field");
      if (field) field.hidden = index >= limit;
    });
    specialtyHelp.textContent = limit
      ? `Sélectionnez exactement ${limit} spécialité(s) (${limit === 3 ? "Première" : "Terminale"}).`
      : classSelect.value === "Seconde"
        ? "En Seconde, aucune spécialité n'est à choisir."
        : "Choisissez votre classe pour connaître le nombre de spécialités à sélectionner.";
  };

  specialtySelects.forEach((changedSelect) => {
    changedSelect.addEventListener("change", () => {
      const selected = specialtySelects.map((select) => select.value).filter(Boolean);
      if (new Set(selected).size !== selected.length) {
        changedSelect.value = "";
        specialtyHelp.textContent = "Choisissez une spécialité différente dans chaque menu.";
        return;
      }
      specialtyHelp.textContent = `Sélectionnées : ${selected.length}/${getSpecialtyLimit(classSelect.value)}.`;
    });
  });

  classSelect.addEventListener("change", updateSpecialtyOptions);
  updateSpecialtyOptions();
}

function getRegistrationSpecialtySelects() {
  return [1, 2, 3]
    .map((number) => document.getElementById(`specialite-${number}`))
    .filter(Boolean);
}

function getSpecialtyLimit(classe) {
  if (classe === "Seconde") return 0;
  if (classe.startsWith("1ère")) return 3;
  if (classe.startsWith("Terminale")) return 2;
  return 0;
}

// Affichage des notifications
function showAlert(alertBox, message, type) {
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `auth-alert ${type}`;
}

// Mise à jour de l'état de connexion dans la topbar
function updateNavbarAuthStatus() {
  const currentUserRaw = sessionStorage.getItem("jfej_current_user");
  const ctaBtn = document.querySelector(".btn-cta");
  if (!ctaBtn) return;

  // Calcul du bon chemin relatif vers profil.html
  const isInsideHtmlDir = window.location.pathname.includes("/HTML/") || window.location.pathname.endsWith("/HTML");
  const profilPath = isInsideHtmlDir ? "../../../The_Site/HTML/Mon%20compte.html" : "../../HTML/profil.html";

  if (currentUserRaw) {
    const user = JSON.parse(currentUserRaw);
    
    // Si on est déjà sur la page de profil
    if (window.location.pathname.includes("profil.html")) {
      ctaBtn.textContent = "Déconnexion";
      ctaBtn.href = "#logout";
      ctaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("jfej_current_user");
        window.location.href = "index.html";
      });
    } else {
      ctaBtn.textContent = `Mon Profil (${user.prenom})`;
      ctaBtn.href = profilPath;
    }
  }
}
