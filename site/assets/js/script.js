// main script
(function () {
  "use strict";

  function initItineraryMaps() {
    const articleLinks = [];
    const seenLinks = new Set();

    document.querySelectorAll('.content table a[href^="#"]').forEach(function (link) {
      const href = link.getAttribute("href");
      if (!seenLinks.has(href)) {
        seenLinks.add(href);
        articleLinks.push({ href: href, label: link.textContent.trim() });
      }
    });

    const articleHeadings = Array.from(document.querySelectorAll(".content h1[id], .content h2[id], .content h3[id]"))
      .map(function (heading) {
        return { href: "#" + encodeURIComponent(heading.id), label: heading.textContent.trim() };
      });

    document.querySelectorAll("[data-itinerary-map]").forEach(function (map) {
      const trigger = map.querySelector("[data-itinerary-map-trigger]");
      const dialog = map.querySelector("[data-itinerary-map-dialog]");
      const closeButton = map.querySelector("[data-itinerary-map-close]");
      const preview = map.querySelector("[data-itinerary-map-preview]");
      const expandedMap = map.querySelector("[data-itinerary-map-object]");
      const stageList = map.querySelector("[data-itinerary-map-stages]");
      const svgDocuments = new Set();
      let returnFocus = false;
      let afterClose = null;
      let closeTimer = null;

      if (!trigger || !dialog || !closeButton || !preview || !expandedMap || !stageList) return;

      function setSectionHighlight(index, active) {
        svgDocuments.forEach(function (svgDocument) {
          svgDocument.querySelectorAll(`[data-section="${index}"]`).forEach(function (node) {
            node.classList.toggle("is-linked-hover", active);
          });
        });
        stageList.querySelectorAll(`[data-map-section="${index}"]`).forEach(function (node) {
          node.classList.toggle("is-linked-hover", active);
        });
      }

      function scrollToSection(index) {
        const targets = articleLinks.length ? articleLinks : articleHeadings;
        const link = targets[index];
        if (!link) return;
        const target = document.getElementById(decodeURIComponent(link.href.slice(1)));
        if (!target) return;
        history.replaceState(null, "", link.href);
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      }

      function finishClose() {
        clearTimeout(closeTimer);
        closeTimer = null;
        dialog.classList.remove("is-closing");
        if (dialog.open) dialog.close();
      }

      function closeDialog(shouldReturnFocus, callback) {
        if (!dialog.open || dialog.classList.contains("is-closing")) return;
        returnFocus = shouldReturnFocus;
        afterClose = callback || null;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          finishClose();
          return;
        }
        dialog.classList.add("is-closing");
        closeTimer = setTimeout(finishClose, 240);
      }

      function visitSection(index) {
        setSectionHighlight(index, false);
        if (dialog.open) closeDialog(false, function () { scrollToSection(index); });
        else scrollToSection(index);
      }

      function connectHover(node, index) {
        node.addEventListener("mouseenter", function () { setSectionHighlight(index, true); });
        node.addEventListener("mouseleave", function () { setSectionHighlight(index, false); });
        node.addEventListener("focus", function () { setSectionHighlight(index, true); });
        node.addEventListener("blur", function () { setSectionHighlight(index, false); });
      }

      function renderStages(svgDocument) {
        const summaries = Array.from(svgDocument.querySelectorAll(".summary-stop"));
        stageList.replaceChildren();
        summaries.forEach(function (summary) {
          const section = Number(summary.dataset.section);
          const item = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.mapSection = String(section);
          button.textContent = summary.dataset.stopName || summary.textContent.trim();
          button.addEventListener("click", function () {
            setTimeout(function () {
              button.blur();
              setSectionHighlight(section, false);
            }, 0);
            visitSection(section);
          });
          connectHover(button, section);
          item.appendChild(button);
          stageList.appendChild(item);
        });
      }

      function enableStops(frame, mapOnly) {
        const svgDocument = frame.contentDocument;
        if (!svgDocument || !svgDocument.documentElement) return;
        svgDocuments.add(svgDocument);
        if (mapOnly) {
          svgDocument.documentElement.classList.add("lightbox-map");
          svgDocument.documentElement.setAttribute("viewBox", "42 82 810 620");
          renderStages(svgDocument);
        }
        svgDocument.querySelectorAll("[data-section]").forEach(function (stop) {
          if (stop.dataset.interactive === "true") return;
          stop.dataset.interactive = "true";
          stop.setAttribute("tabindex", "0");
          stop.setAttribute("role", "link");
          stop.setAttribute("aria-label", stop.dataset.stopName || stop.textContent.trim());
          const section = Number(stop.dataset.section);
          connectHover(stop, section);
          const activate = function () {
            setTimeout(function () {
              stop.blur();
              setSectionHighlight(section, false);
            }, 0);
            visitSection(section);
          };
          stop.addEventListener("click", activate);
          stop.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              activate();
            }
          });
        });
      }

      trigger.addEventListener("click", function () {
        returnFocus = false;
        dialog.classList.remove("is-closing");
        dialog.showModal();
      });
      closeButton.addEventListener("click", function () {
        closeDialog(true);
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          closeDialog(true);
        }
      });
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeDialog(true);
      });
      dialog.addEventListener("animationend", function (event) {
        if (event.target === dialog && dialog.classList.contains("is-closing")) finishClose();
      });
      dialog.addEventListener("close", function () {
        if (returnFocus) trigger.focus();
        const callback = afterClose;
        afterClose = null;
        if (callback) callback();
      });
      preview.addEventListener("load", function () { enableStops(preview, false); });
      expandedMap.addEventListener("load", function () { enableStops(expandedMap, true); });
      enableStops(preview, false);
      enableStops(expandedMap, true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initItineraryMaps);
  } else {
    initItineraryMaps();
  }

  // Preloader
  window.addEventListener("load", function () {
    const preloader = document.querySelector(".preloader");
    if (!preloader) return;
    preloader.classList.add("opacity-0");
    setTimeout(function () {
      preloader.style.display = "none";
    }, 350);
  });
})();
