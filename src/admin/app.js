export default {
  config: {
    translations: {
      en: {
        "app.components.HomePage.welcome.again": "¡Hola! Bienvenido",
        "app.components.HomePage.welcomeBlock.content.again": "Este es tu panel.",
        "app.components.HomePage.welcomeBlock.content": "Aquí puedes gestionar tu contenido.",
      },
    },
  },

  bootstrap() {
    // Crear overlay y estilos
    const overlay = document.createElement("div");
    overlay.id = "global-beat-loader-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,0.5)",
      zIndex: "9999",
      pointerEvents: "none",
    });

    const loader = document.createElement("div");
    loader.className = "beat-loader";
    overlay.appendChild(loader);

    const style = document.createElement("style");
    style.type = "text/css";
    style.textContent = `
      #global-beat-loader-overlay .beat-loader {
        display: inline-flex;
        gap: 8px;
      }
      #global-beat-loader-overlay .beat-loader .dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #4E15CF;
        animation: beat 0.7s infinite ease-in-out;
      }
      #global-beat-loader-overlay .beat-loader .dot:nth-child(2) { animation-delay: 0.15s; }
      #global-beat-loader-overlay .beat-loader .dot:nth-child(3) { animation-delay: 0.3s; }
      @keyframes beat {
        0%, 80%, 100% { transform: scale(0.75); opacity: 0.6; }
        40% { transform: scale(1); opacity: 1; }
      }
      
      /* Ocultar el spinner por defecto de Strapi */
      .strapi-loader,
      [class*="loader"]:not(.beat-loader):not(.dot),
      [class*="spinner"],
      [data-testid*="loader"],
      [data-testid*="spinner"],
      .loading-wrapper,
      .loader-wrapper,
      [class*="LoadingIndicator"],
      [class*="Loader_loader"],
      .content-manager-loader {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      loader.appendChild(dot);
    }

    document.body.appendChild(overlay);

    // ----------------- NUEVO CÓDIGO -----------------

    let inFlight = 0;
    const show = () => {
      overlay.style.display = "flex";
    };
    const hide = () => {
      if (inFlight === 0) overlay.style.display = "none";
    };

    function isAuthPage() {
      const path = window.location.pathname.toLowerCase();
      return (
        path.includes("/admin/auth/login") || path.includes("/admin/auth/logout")
      );
    }

    function updateOverlayVisibility() {
      if (isAuthPage()) {
        overlay.style.display = "none";
        inFlight = 0;
      } else if (inFlight > 0) {
        overlay.style.display = "flex";
      } else {
        overlay.style.display = "none";
      }
    }

    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString?.() || "";

      const isInit = url.includes("/admin/init");
      const isLoginRequest = url.includes("/admin/login");
      const isLogoutRequest = url.includes("/admin/logout");

      // nunca mostrar spinner en login/logout/init o páginas de auth
      const shouldShowSpinner = !(
        isInit || isLoginRequest || isLogoutRequest || isAuthPage()
      );

      if (shouldShowSpinner) {
        inFlight += 1;
        show();
      }

      try {
        return await originalFetch(...args);
      } finally {
        if (shouldShowSpinner) {
          inFlight = Math.max(0, inFlight - 1);
          hide();
        } else {
          // forzar oculto en login/logout
          overlay.style.display = "none";
          inFlight = 0;
        }
      }
    };

    // Detectar cambios en la URL (SPA)
    function listenToUrlChanges() {
      const originalPushState = history.pushState;
      history.pushState = function (...args) {
        const result = originalPushState.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };

      window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
      });

      window.addEventListener("locationchange", () => {
        updateOverlayVisibility();
      });
    }

    listenToUrlChanges();

    // Observer para asegurar que overlay no desaparezca y actualizar visibilidad
    const obs = new MutationObserver(() => {
      if (!document.body.contains(overlay)) {
        document.body.appendChild(overlay);
      }
      updateOverlayVisibility();
    });
    obs.observe(document.body, { childList: true });

    // Al inicio también ocultar overlay si estamos en login/logout
    updateOverlayVisibility();
  },
};
