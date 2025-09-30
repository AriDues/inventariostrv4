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

      /* Ocultar el elemento específico de la encuesta NPS */
      .sc-bdvtL.sc-gsDKAQ.hImIuj.gHBEWx,
      div[transform="translateX(-50%)"].sc-bdvtL,
      div[class*="sc-bdvtL"][class*="sc-gsDKAQ"][class*="hImIuj"],
      fieldset.sc-bdvtL.kZobxy,
      div.sc-bdvtL.sc-gsDKAQ.kZobxy.iNsRQW,
      div.sc-bdvtL.sc-gsDKAQ.fPfpSe.bZienJ {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      loader.appendChild(dot);
    }

    document.body.appendChild(overlay);

    // Función para eliminar encuesta NPS con JavaScript
    const removeSurveyElements = () => {
      // Buscar por las clases específicas que viste en la imagen
      const surveySelectors = [
        '.sc-bdvtL.sc-gsDKAQ.hImIuj.gHBEWx',
        'div[transform="translateX(-50%)"]',
        'fieldset.sc-bdvtL.kZobxy',
        '.sc-bdvtL.sc-gsDKAQ.kZobxy.iNsRQW',
        '.sc-bdvtL.sc-gsDKAQ.fPfpSe.bZienJ'
      ];

      surveySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            // Intentar remover completamente
            try {
              el.remove();
            } catch (e) {
              // Si no se puede remover, solo ocultar
            }
          }
        });
      });

      // Buscar por texto específico de la encuesta
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.textContent && (
          el.textContent.includes('How likely are you to recommend') ||
          el.textContent.includes('Not at all likely') ||
          el.textContent.includes('Extremely likely')
        )) {
          let parent = el;
          // Subir hasta encontrar el contenedor principal
          for (let i = 0; i < 5; i++) {
            if (parent.parentElement) {
              parent = parent.parentElement;
            }
          }
          parent.style.display = 'none';
          try {
            parent.remove();
          } catch (e) {
            // Si no se puede remover, solo ocultar
          }
        }
      });
    };

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
        // Ejecutar eliminación de encuesta en cada cambio de página
        setTimeout(removeSurveyElements, 100);
        setTimeout(removeSurveyElements, 500);
        setTimeout(removeSurveyElements, 1000);
      });
    }

    listenToUrlChanges();

    // Observer más agresivo para eliminar encuestas
    const obs = new MutationObserver(() => {
      if (!document.body.contains(overlay)) {
        document.body.appendChild(overlay);
      }
      updateOverlayVisibility();
      // Ejecutar eliminación cada vez que el DOM cambie
      removeSurveyElements();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    // Ejecutar eliminación de encuestas al cargar la página
    removeSurveyElements();
    
    // Ejecutar múltiples veces con diferentes delays
    setTimeout(removeSurveyElements, 100);
    setTimeout(removeSurveyElements, 500);
    setTimeout(removeSurveyElements, 1000);
    setTimeout(removeSurveyElements, 2000);
    setTimeout(removeSurveyElements, 3000);
    
    // Ejecutar cada 2 segundos de forma continua
    setInterval(removeSurveyElements, 2000);

    // Hook equivalente a useEffect - ejecutar cuando el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeSurveyElements);
    } else {
      removeSurveyElements();
    }

    // Al inicio también ocultar overlay si estamos en login/logout
    updateOverlayVisibility();
  },
};