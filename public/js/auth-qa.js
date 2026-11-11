(function () {
    const container = document.querySelector("[data-qa-login]");
    if (!container) {
        return;
    }

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitButton = document.querySelector('.auth-box form button[type="submit"]');
    const statusText = document.getElementById("qa-fill-status");
    const buttons = Array.from(container.querySelectorAll("[data-qa-fill]"));

    if (!emailInput || !passwordInput || buttons.length === 0) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const email = button.dataset.qaEmail || "";
            const password = button.dataset.qaPassword || "";
            const roleLabel = button.dataset.qaRole || "";

            emailInput.value = email;
            passwordInput.value = password;
            emailInput.dispatchEvent(new Event("input", { bubbles: true }));
            passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

            buttons.forEach((item) => {
                const selected = item === button;
                item.classList.toggle("is-selected", selected);
                item.setAttribute("aria-pressed", selected ? "true" : "false");
            });

            if (statusText) {
                statusText.textContent = `Form terisi untuk ${roleLabel} (${email}). Klik Masuk untuk melanjutkan.`;
            }

            submitButton?.focus();
        });
    });
})();
