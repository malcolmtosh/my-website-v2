/* Accessibility progressive enhancements (2026-06).
   Runs after main.min.js; every block is guarded so a missing element
   or future markup change can never throw. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function asButton(el) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        el.click();
      }
    });
  }

  ready(function () {
    /* 1. Homepage slider pagination dots are <li> elements with click
       handlers bound by main.min.js. Make them reachable and operable
       by keyboard, with an accessible name from their title attribute. */
    try {
      var dots = document.querySelectorAll(".rslider-pagination li");
      Array.prototype.forEach.call(dots, function (dot, i) {
        asButton(dot);
        var label = dot.getAttribute("title") || "Slide " + (i + 1);
        dot.setAttribute("aria-label", "Go to slide: " + label);
      });
    } catch (e) { /* no-op */ }

    /* 2. Off-canvas menu: keep aria-expanded in sync on the Menu/Close
       buttons. main.min.js toggles classes ("navigation-opened" /
       "is-opened"), so observe class changes rather than re-implement
       the toggle logic. */
    try {
      var menuBtns = document.querySelectorAll(
        ".open-navigation button, .navigation .close"
      );
      var nav = document.querySelector(".navigation");
      if (nav && menuBtns.length) {
        if (!nav.id) nav.id = "site-navigation";
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
        var menuObserver = new MutationObserver(syncMenu);
        [document.documentElement, document.body, nav].forEach(function (el) {
          menuObserver.observe(el, { attributes: true, attributeFilter: ["class"] });
        });
      }
    } catch (e) { /* no-op */ }

    /* 3. About-page FAQ accordion: the toggles are anchors without href,
       which keyboard users cannot reach. Make them act as buttons and
       keep aria-expanded in sync with the "opened" class main.min.js
       toggles on the parent <li>. */
    try {
      var controls = document.querySelectorAll(
        ".section-collapse .collapse-control"
      );
      Array.prototype.forEach.call(controls, function (ctrl) {
        asButton(ctrl);
        var li = ctrl.closest("li");
        if (li) {
          var syncPanel = function () {
            ctrl.setAttribute(
              "aria-expanded",
              li.classList.contains("opened") ? "true" : "false"
            );
          };
          syncPanel();
          new MutationObserver(syncPanel).observe(li, {
            attributes: true,
            attributeFilter: ["class"],
          });
        }
      });
    } catch (e) { /* no-op */ }
  });
})();
