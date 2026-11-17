/* Accessibility progressive enhancements.
   Runs after main.min.js; idempotent and resilient to PJAX route transitions. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function enhanceSliderDots() {
    try {
      var dots = document.querySelectorAll(".rslider-pagination li");
      Array.prototype.forEach.call(dots, function (dot, i) {
        if (!dot.getAttribute("role")) {
          dot.setAttribute("role", "button");
          dot.setAttribute("tabindex", "0");
          var label = dot.getAttribute("title") || "Slide " + (i + 1);
          dot.setAttribute("aria-label", "Go to slide: " + label);
        }
      });
    } catch (e) { /* no-op */ }
  }

  function enhanceOffCanvasMenu() {
    try {
      var menuBtns = document.querySelectorAll(
        ".open-navigation button, .navigation .close"
      );
      var nav = document.querySelector(".navigation");
      if (nav && menuBtns.length) {
        if (!nav.id) nav.id = "site-navigation";
        nav.setAttribute("aria-label", "Main Navigation");
        var syncMenu = function () {
          var open =
            document.documentElement.classList.contains("navigation-opened") ||
            document.body.classList.contains("navigation-opened") ||
            nav.classList.contains("is-opened");
          Array.prototype.forEach.call(menuBtns, function (b) {
            b.setAttribute("aria-expanded", open ? "true" : "false");
            b.setAttribute("aria-controls", nav.id);
          });
        };
        syncMenu();
        if (!nav._observed) {
          nav._observed = true;
          var menuObserver = new MutationObserver(syncMenu);
          [document.documentElement, document.body, nav].forEach(function (el) {
            menuObserver.observe(el, { attributes: true, attributeFilter: ["class"] });
          });
        }
      }
    } catch (e) { /* no-op */ }
  }

  function enhanceAccordions() {
    try {
      var controls = document.querySelectorAll(
        ".section-collapse .collapse-control"
      );
      Array.prototype.forEach.call(controls, function (ctrl, idx) {
        var li = ctrl.closest("li");
        var content = li ? li.querySelector(".content-collapse") : null;
        var panelId = content ? (content.id || "faq-panel-" + (idx + 1)) : "";
        if (content && !content.id) {
          content.id = panelId;
          content.setAttribute("role", "region");
        }
        if (content) {
          ctrl.setAttribute("aria-controls", panelId);
          if (content.id) content.setAttribute("aria-labelledby", ctrl.id || (ctrl.id = "faq-ctrl-" + (idx + 1)));
        }
        if (ctrl.tagName !== "BUTTON") {
          ctrl.setAttribute("role", "button");
          ctrl.setAttribute("tabindex", "0");
        }
        if (li && !li._observed) {
          li._observed = true;
          var syncPanel = function () {
            var isOpen = li.classList.contains("opened");
            ctrl.setAttribute("aria-expanded", isOpen ? "true" : "false");
          };
          syncPanel();
          new MutationObserver(syncPanel).observe(li, {
            attributes: true,
            attributeFilter: ["class"],
          });
        }
      });
    } catch (e) { /* no-op */ }
  }

  function initAll() {
    enhanceSliderDots();
    enhanceOffCanvasMenu();
    enhanceAccordions();
  }

  ready(function () {
    initAll();

    // Re-run enhancements when PJAX transitions inject new page-view content
    try {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes.length) {
            initAll();
            break;
          }
        }
      });
      var mainEl = document.querySelector("main") || document.body;
      observer.observe(mainEl, { childList: true, subtree: true });
    } catch (e) { /* no-op */ }

    // Global keyboard delegation for custom button-like elements (dots, controls)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        var target = e.target.closest(".rslider-pagination li, a.collapse-control");
        if (target && target.tagName !== "BUTTON" && target.tagName !== "INPUT") {
          e.preventDefault();
          target.click();
        }
      } else if (e.key === "Escape" || e.key === "Esc") {
        var nav = document.querySelector(".navigation");
        var isOpened = nav && (
          nav.classList.contains("is-opened") ||
          document.body.classList.contains("navigation-opened") ||
          document.documentElement.classList.contains("navigation-opened")
        );
        if (isOpened) {
          var closeBtn = document.querySelector(".navigation .close");
          if (closeBtn) {
            closeBtn.click();
            var openBtn = document.querySelector(".open-navigation button");
            if (openBtn) openBtn.focus();
          }
        }
      }
    });
  });
})();
