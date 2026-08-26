/* =========================================================
   EDITRO — Main JavaScript
   Scroll / Navigation / Reveal / Timeline Motion
========================================================= */

(() => {
  "use strict";


  /* =========================================================
     DOM
  ========================================================= */

  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("main-nav");
  const navToggle = document.getElementById("navToggle");
  const scrubHead = document.getElementById("scrubHead");
  const timecode = document.getElementById("tc-display");
  const year = document.getElementById("year");


  /* =========================================================
     YEAR
  ========================================================= */

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================================================
     MOBILE NAVIGATION
  ========================================================= */

  if (navToggle && nav) {

    navToggle.addEventListener("click", () => {

      const isOpen = nav.classList.toggle("is-open");

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      navToggle.setAttribute(
        "aria-label",
        isOpen
          ? "بستن منو"
          : "باز کردن منو"
      );

      body.classList.toggle(
        "menu-open",
        isOpen
      );

    });


    /* بستن منو هنگام کلیک روی لینک */

    nav.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", () => {

        nav.classList.remove("is-open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        navToggle.setAttribute(
          "aria-label",
          "باز کردن منو"
        );

        body.classList.remove(
          "menu-open"
        );

      });

    });


    /* بستن منو با Escape */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          nav.classList.contains("is-open")
        ) {

          nav.classList.remove(
            "is-open"
          );

          navToggle.setAttribute(
            "aria-expanded",
            "false"
          );

          navToggle.setAttribute(
            "aria-label",
            "باز کردن منو"
          );

          body.classList.remove(
            "menu-open"
          );
        }

      }
    );

  }


  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  const revealElements =
    document.querySelectorAll(
      ".reveal-up"
    );


  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "is-visible"
              );

            } else {

              /*
                هنگام برگشت اسکرول،
                افکت دوباره از ابتدا اجرا می‌شود.
              */

              entry.target.classList.remove(
                "is-visible"
              );

            }

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );


    revealElements.forEach(element => {

      revealObserver.observe(element);

    });

  } else {

    revealElements.forEach(element => {

      element.classList.add(
        "is-visible"
      );

    });

  }


  /* =========================================================
     SCROLL PROGRESS
  ========================================================= */

  let ticking = false;


  function updateScrollProgress() {

    const scrollTop =
      window.scrollY || window.pageYOffset;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      documentHeight > 0
        ? Math.min(
            Math.max(
              scrollTop / documentHeight,
              0
            ),
            1
          )
        : 0;


    if (scrubHead) {

      /*
        حرکت هد طلایی روی نوار بالای صفحه
      */

      const barWidth =
        scrubHead.parentElement
          ? scrubHead.parentElement.offsetWidth
          : window.innerWidth;

      const headWidth =
        scrubHead.offsetWidth || 56;

      const maxLeft =
        Math.max(
          0,
          barWidth - headWidth
        );

      scrubHead.style.left =
        `${progress * maxLeft}px`;

    }


    /*
      متحرک‌سازی المان‌های مرتبط با اسکرول
    */

    updateTimeline(progress);


    ticking = false;

  }


  function requestScrollUpdate() {

    if (!ticking) {

      window.requestAnimationFrame(
        updateScrollProgress
      );

      ticking = true;

    }

  }


  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestScrollUpdate
  );


  /* =========================================================
     TIMECODE
  ========================================================= */

  function updateTimecode() {

    if (!timecode) return;


    const scrollTop =
      window.scrollY || window.pageYOffset;

    const total =
      document.documentElement.scrollHeight -
      window.innerHeight;


    const progress =
      total > 0
        ? Math.min(
            Math.max(
              scrollTop / total,
              0
            ),
            1
          )
        : 0;


    /*
      تایم‌کد بر اساس موقعیت اسکرول
    */

    const totalFrames = 999;

    const frame =
      Math.round(
        progress * totalFrames
      );


    const seconds =
      Math.floor(
        progress * 59
      );


    const minutes =
      Math.floor(
        progress * 9
      );


    const hours = 0;


    const pad = number =>
      String(number).padStart(
        2,
        "0"
      );


    timecode.textContent =
      `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frame)}`;

  }


  window.addEventListener(
    "scroll",
    updateTimecode,
    {
      passive: true
    }
  );


  /* =========================================================
     SCROLL TIMELINE
     
     تایم‌لاین سینمایی طلایی:
     از بالا شروع می‌شود،
     هنگام اسکرول گسترش پیدا می‌کند،
     در انتها به حالت کامل می‌رسد.
  ========================================================= */

  function createTimeline() {

    if (
      document.querySelector(
        ".editro-scroll-timeline"
      )
    ) {
      return;
    }


    const timeline =
      document.createElement("div");

    timeline.className =
      "editro-scroll-timeline";

    timeline.setAttribute(
      "aria-hidden",
      "true"
    );


    const line =
      document.createElement("div");

    line.className =
      "editro-timeline-line";


    const progress =
      document.createElement("div");

    progress.className =
      "editro-timeline-progress";


    const head =
      document.createElement("div");

    head.className =
      "editro-timeline-head";


    const leftTrack =
      document.createElement("div");

    leftTrack.className =
      "editro-timeline-left";


    const rightTrack =
      document.createElement("div");

    rightTrack.className =
      "editro-timeline-right";


    const markerHome =
      document.createElement("span");

    markerHome.className =
      "editro-timeline-marker marker-home";


    const markerSkills =
      document.createElement("span");

    markerSkills.className =
      "editro-timeline-marker marker-skills";


    const markerServices =
      document.createElement("span");

    markerServices.className =
      "editro-timeline-marker marker-services";


    const markerOrder =
      document.createElement("span");

    markerOrder.className =
      "editro-timeline-marker marker-order";


    const markerAbout =
      document.createElement("span");

    markerAbout.className =
      "editro-timeline-marker marker-about";


    line.appendChild(progress);
    line.appendChild(head);

    leftTrack.appendChild(
      markerHome
    );

    leftTrack.appendChild(
      markerSkills
    );

    rightTrack.appendChild(
      markerServices
    );

    rightTrack.appendChild(
      markerOrder
    );

    rightTrack.appendChild(
      markerAbout
    );


    timeline.appendChild(
      leftTrack
    );

    timeline.appendChild(
      line
    );

    timeline.appendChild(
      rightTrack
    );


    document.body.appendChild(
      timeline
    );

  }


  createTimeline();


  /* =========================================================
     TIMELINE POSITION
  ========================================================= */

  function updateTimeline(progress) {

    const timeline =
      document.querySelector(
        ".editro-scroll-timeline"
      );


    if (!timeline) return;


    /*
      progress:
      0   = بالای سایت
      1   = انتهای سایت
    */

    timeline.style.setProperty(
      "--scroll-progress",
      progress.toFixed(4)
    );


    /*
      وضعیت‌های مختلف تایم‌لاین
    */

    if (progress <= 0.08) {

      timeline.classList.add(
        "timeline-start"
      );

      timeline.classList.remove(
        "timeline-active",
        "timeline-complete"
      );

    }

    else if (progress < 0.92) {

      timeline.classList.remove(
        "timeline-start",
        "timeline-complete"
      );

      timeline.classList.add(
        "timeline-active"
      );

    }

    else {

      timeline.classList.remove(
        "timeline-start"
      );

      timeline.classList.add(
        "timeline-active",
        "timeline-complete"
      );

    }

  }


  /* =========================================================
     ACTIVE NAVIGATION
  ========================================================= */

  const sections =
    document.querySelectorAll(
      "main section[id]"
    );


  const navLinks =
    document.querySelectorAll(
      '.main-nav a[href^="#"]'
    );


  if (
    "IntersectionObserver" in window &&
    sections.length &&
    navLinks.length
  ) {

    const sectionObserver =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }


            const id =
              entry.target.getAttribute(
                "id"
              );


            navLinks.forEach(link => {

              link.classList.remove(
                "is-active"
              );


              if (
                link.getAttribute(
                  "href"
                ) === `#${id}`
              ) {

                link.classList.add(
                  "is-active"
                );

              }

            });

          });

        },
        {
          threshold: 0.2,
          rootMargin:
            "-20% 0px -60% 0px"
        }
      );


    sections.forEach(section => {

      sectionObserver.observe(
        section
      );

    });

  }


  /* =========================================================
     SMOOTH ANCHOR SCROLL
  ========================================================= */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          const headerHeight =
            header
              ? header.offsetHeight
              : 0;


          const targetPosition =
            target.getBoundingClientRect()
              .top +
            window.scrollY -
            headerHeight -
            10;


          window.scrollTo({

            top: Math.max(
              0,
              targetPosition
            ),

            behavior:
              window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "auto"
                : "smooth"

          });

        }
      );

    });


  /* =========================================================
     HEADER SCROLL STATE
  ========================================================= */

  function updateHeader() {

    if (!header) return;


    if (
      window.scrollY > 20
    ) {

      header.classList.add(
        "is-scrolled"
      );

    } else {

      header.classList.remove(
        "is-scrolled"
      );

    }

  }


  window.addEventListener(
    "scroll",
    updateHeader,
    {
      passive: true
    }
  );


  /* =========================================================
     HERO PARALLAX
  ========================================================= */

  const hero =
    document.querySelector(
      ".hero"
    );


  const heroTitle =
    document.querySelector(
      ".hero-title"
    );


  function updateHero() {

    if (
      !hero ||
      !heroTitle
    ) {
      return;
    }


    const scroll =
      window.scrollY || 0;


    if (
      scroll < window.innerHeight
    ) {

      const offset =
        Math.min(
          scroll * 0.08,
          60
        );


      heroTitle.style.transform =
        `translateY(${offset}px)`;

    }

  }


  window.addEventListener(
    "scroll",
    updateHero,
    {
      passive: true
    }
  );


  /* =========================================================
     HOVER / POINTER DETAIL
  ========================================================= */

  document
    .querySelectorAll(
      ".service-card, .contact-card"
    )
    .forEach(card => {

      card.addEventListener(
        "pointermove",
        event => {

          const rect =
            card.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          card.style.setProperty(
            "--pointer-x",
            `${x}px`
          );


          card.style.setProperty(
            "--pointer-y",
            `${y}px`
          );

        }
      );


      card.addEventListener(
        "pointerleave",
        () => {

          card.style.removeProperty(
            "--pointer-x"
          );

          card.style.removeProperty(
            "--pointer-y"
          );

        }
      );

    });


  /* =========================================================
     INITIAL STATE
  ========================================================= */

  updateScrollProgress();
  updateTimecode();
  updateHeader();
  updateHero();


})();
