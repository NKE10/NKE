
(() => {
  document.documentElement.classList.add("js-ready");

  // Dark mode
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach((button) => {
      button.textContent = theme === "dark" ? "☀" : "☾";
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });
  }

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("nakie-theme");
  } catch {}

  const systemDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches;

  setTheme(savedTheme || (systemDark ? "dark" : "light"));

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

      try {
        localStorage.setItem("nakie-theme", next);
      } catch {}

      setTheme(next);
    });
  });

  // Mobile navigation
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav-links]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "☰";
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "☰";
      }
    });
  }

  // Scroll reveal and progress bars
  const revealItems = document.querySelectorAll(".reveal, .progress-fill");
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Project filters
  const projectFilters = document.querySelectorAll("[data-project-filter]");
  const projectCards = document.querySelectorAll("[data-project-category]");

  projectFilters.forEach((button) => {
    button.addEventListener("click", () => {
      projectFilters.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      const filter = button.dataset.projectFilter;

      projectCards.forEach((card) => {
        const categories = card.dataset.projectCategory.split(" ");
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });

  // Journal search and filters
  const search = document.querySelector("[data-journal-search]");
  const journalFilters = document.querySelectorAll("[data-journal-filter]");
  const journalCards = document.querySelectorAll("[data-journal-category]");
  let journalFilter = "all";

  function updateJournal() {
    const query = (search?.value || "").trim().toLowerCase();

    journalCards.forEach((card) => {
      const categories = card.dataset.journalCategory.split(" ");
      const categoryMatch = journalFilter === "all" ||
        categories.includes(journalFilter);
      const textMatch = card.textContent.toLowerCase().includes(query);

      card.hidden = !(categoryMatch && textMatch);
    });
  }

  search?.addEventListener("input", updateJournal);

  journalFilters.forEach((button) => {
    button.addEventListener("click", () => {
      journalFilter = button.dataset.journalFilter;

      journalFilters.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });

      updateJournal();
    });
  });

  // Copy email
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const email = button.dataset.copyEmail;

      try {
        await navigator.clipboard.writeText(email);
        const oldText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => button.textContent = oldText, 1500);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  });

  // Contact form: prepare an email, never pretend to send it.
  const contactForm = document.querySelector("[data-contact-form]");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const recipient = contactForm.dataset.recipient;

    if (!recipient || recipient.includes("example.com")) {
      alert("Replace the example email with your real email address first.");
      return;
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subjectText = String(data.get("topic") || "Website enquiry").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`${subjectText} - ${name}`);
    const body = encodeURIComponent(
      `${message}\n\nFrom: ${name}\nReply email: ${email}`
    );

    window.location.href =
      `mailto:${recipient}?subject=${subject}&body=${body}`;
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
