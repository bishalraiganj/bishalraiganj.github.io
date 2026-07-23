/* Bishal Adhikary — portfolio v2 scripts */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal (blur rise) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- pointer spotlight on cards ---------- */
  document.querySelectorAll(".card, .proj").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- skill meters ---------- */
  var meters = document.querySelectorAll(".meter");
  if (meters.length) {
    if ("IntersectionObserver" in window && !reduced) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); mio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      meters.forEach(function (m) { mio.observe(m); });
    } else {
      meters.forEach(function (m) { m.classList.add("in"); });
    }
  }

  /* ---------- count-up stats ---------- */
  var nums = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = Math.round(target * p) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length) {
    if ("IntersectionObserver" in window && !reduced) {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); nio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { nio.observe(n); });
    } else {
      nums.forEach(function (n) {
        n.textContent = n.getAttribute("data-count") + (n.getAttribute("data-suffix") || "");
      });
    }
  }

  /* ---------- typing line ---------- */
  var boot = document.getElementById("typeline");
  if (boot) {
    var lines = [
      "$ whoami",
      "→ java backend · microservices · kafka · grpc <span class=\"ok\">✓</span>",
      "$ location → hyderabad, india _"
    ];
    if (reduced) {
      boot.innerHTML = lines[1];
    } else {
      var li = 0, ci = 0;
      var cursor = "<span class=\"cursor\"></span>";
      function strip(s) { return s.replace(/<[^>]*>/g, ""); }
      function type() {
        var plain = strip(lines[li]);
        ci++;
        if (ci <= plain.length) {
          boot.innerHTML = plain.slice(0, ci) + cursor;
          setTimeout(type, 30);
        } else {
          boot.innerHTML = lines[li] + (li < lines.length - 1 ? "" : cursor);
          li++; ci = 0;
          if (li < lines.length) setTimeout(type, 650);
        }
      }
      setTimeout(type, 500);
    }
  }

  /* ---------- thread scheduler canvas ---------- */
  var canvas = document.getElementById("sched");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W, H;
    var CORES = 4;
    var tasks = [];
    var nextId = 0;
    var blue = "#6ea8ff", violet = "#a78bfa", pink = "#f472b6", green = "#4ade80";
    var lineC = "rgba(255,255,255,.08)", faint = "#63636b";

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function laneY(i) { return 26 + i * ((H - 40) / CORES); }
    function laneH() { return (H - 40) / CORES - 12; }

    function spawn() {
      var r = Math.random();
      tasks.push({
        id: (nextId++) % 256,
        core: Math.floor(Math.random() * CORES),
        x: -50,
        w: 40 + Math.random() * 34,
        speed: 1.2 + Math.random() * 1.2,
        state: "queued",
        runX: 0.32 + Math.random() * 0.34,
        runT: 0,
        runDur: 50 + Math.random() * 90,
        color: r < 0.55 ? blue : (r < 0.85 ? violet : pink)
      });
    }

    function pad(n) { return (n < 16 ? "0" : "") + n.toString(16); }

    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    var spawnTimer = 0, rafId;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = "11px 'JetBrains Mono', monospace";

      for (var i = 0; i < CORES; i++) {
        var y = laneY(i);
        ctx.strokeStyle = lineC;
        ctx.lineWidth = 1;
        rr(ctx, 66, y, W - 92, laneH(), 8);
        ctx.stroke();
        ctx.fillStyle = faint;
        ctx.fillText("CORE " + i, 16, y + laneH() / 2 + 4);
      }

      spawnTimer--;
      if (spawnTimer <= 0 && tasks.length < 14) {
        spawn();
        spawnTimer = 26 + Math.random() * 44;
      }

      for (var t = tasks.length - 1; t >= 0; t--) {
        var k = tasks[t];
        var y2 = laneY(k.core) + 6;
        var h2 = laneH() - 12;
        var target = 66 + (W - 92) * k.runX;

        if (k.state === "queued") {
          k.x += k.speed;
          if (k.x >= target) k.state = "running";
        } else if (k.state === "running") {
          k.runT++;
          if (k.runT >= k.runDur) k.state = "retired";
        } else {
          k.x += k.speed * 1.9;
          if (k.x > W + 12) { tasks.splice(t, 1); continue; }
        }

        var running = k.state === "running";
        ctx.globalAlpha = k.state === "retired" ? 0.4 : 1;

        if (running) {
          ctx.shadowColor = k.color;
          ctx.shadowBlur = 16;
          ctx.fillStyle = k.color;
          rr(ctx, k.x, y2, k.w, h2, 7);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#08080c";
        } else {
          ctx.strokeStyle = "rgba(255,255,255,.25)";
          ctx.lineWidth = 1;
          rr(ctx, k.x, y2, k.w, h2, 7);
          ctx.stroke();
          ctx.fillStyle = faint;
        }
        ctx.fillText("t" + pad(k.id), k.x + 8, y2 + h2 / 2 + 4);

        if (running) {
          ctx.fillStyle = green;
          ctx.fillRect(k.x, y2 + h2 + 4, k.w * (k.runT / k.runDur), 2.5);
        }
        ctx.globalAlpha = 1;
      }

      rafId = requestAnimationFrame(frame);
    }

    if (reduced) {
      for (var s = 0; s < 6; s++) spawn();
      tasks.forEach(function (k) {
        k.x = 66 + (W - 140) * Math.random();
        k.state = "running";
        k.runT = k.runDur * 0.5;
      });
      frame();
      cancelAnimationFrame(rafId);
    } else if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) rafId = requestAnimationFrame(frame);
          else cancelAnimationFrame(rafId);
        });
      });
      cio.observe(canvas);
    } else {
      rafId = requestAnimationFrame(frame);
    }
  }
})();
