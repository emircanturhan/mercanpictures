/* Mercan Pictures — site davranışları
   WhatsApp numarası, e-posta adresi ve YouTube video kimliği her sayfadaki
   <body> etiketinde tanımlı: data-wa, data-mail, data-youtube */
(function () {
  "use strict";

  var body = document.body;
  var wa = body.dataset.wa;
  var mail = body.dataset.mail;
  var lang = body.dataset.lang === "en" ? "en" : "tr";

  var tall = window.matchMedia("(max-width: 700px) and (orientation: portrait)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pick(el) {
    return tall && el.dataset.srcTall ? el.dataset.srcTall : el.dataset.srcWide;
  }

  /* Eksik görselleri gizle (yer tutucu zemin görünür kalır) */
  document.querySelectorAll("img").forEach(function (img) {
    function miss() { img.classList.add("is-missing"); }
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener("error", miss);
  });

  /* Açılış videosu: dikey telefonda 9:16, diğerlerinde 16:9 */
  var hero = document.querySelector(".hero-video");
  if (hero) {
    if (reduceMotion) {
      hero.removeAttribute("autoplay");
    } else {
      hero.src = pick(hero);
      var p = hero.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  /* Showreel penceresi: YouTube, gelişmiş gizlilik modu.
     Oynatıcı yalnızca düğmeye basılınca yüklenir, pencere kapanınca kaldırılır. */
  var dialog = document.querySelector(".reel");
  var youtubeId = body.dataset.youtube;
  if (dialog && youtubeId) {
    var frame = dialog.querySelector(".reel-frame");
    document.querySelectorAll("[data-open-reel]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        /* Dosya bilgisayardan açıldıysa YouTube gömülü oynatıcıyı çalıştırmaz,
           bu durumda videoyu YouTube'da yeni sekmede aç */
        if (window.location.protocol === "file:") {
          window.open("https://www.youtube.com/watch?v=" + youtubeId, "_blank", "noopener");
          return;
        }
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + youtubeId +
          "?autoplay=1&rel=0&playsinline=1";
        iframe.title = "Mercan Pictures showreel";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });
    dialog.querySelector(".reel-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () { frame.innerHTML = ""; });
  }

  /* WhatsApp bağlantıları */
  document.querySelectorAll("[data-wa-link]").forEach(function (a) {
    a.href = "https://wa.me/" + wa;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Mobil menü */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  /* İletişim formu: veriyi sunucuya göndermez,
     mesajı hazırlayıp WhatsApp'ta ya da e-posta uygulamasında açar */
  var text = {
    tr: {
      error: "Adını, hikâyeni ve aydınlatma metni onayını doldurman gerekiyor.",
      subject: "Mercan Pictures proje talebi",
      hello: "Merhaba Mercan Pictures,",
      name: "Adım: ",
      business: "İşletme / marka: ",
      kind: "İlgilendiğim iş: ",
      story: "Hikâyem: "
    },
    en: {
      error: "Please add your name, your story and confirm the privacy notice.",
      subject: "Mercan Pictures project enquiry",
      hello: "Hello Mercan Pictures,",
      name: "My name: ",
      business: "Business / brand: ",
      kind: "I’m interested in: ",
      story: "My story: "
    }
  }[lang];

  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var error = form.querySelector(".form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get("name") || "").trim();
      var story = (d.get("story") || "").trim();
      var business = (d.get("business") || "").trim();

      if (!name || !story || !d.get("consent")) {
        error.textContent = text.error;
        error.hidden = false;
        return;
      }
      error.hidden = true;

      var lines = [text.hello, "", text.name + name];
      if (business) lines.push(text.business + business);
      lines.push(text.kind + d.get("kind"), "", text.story + story);
      var message = lines.join("\n");

      var via = e.submitter && e.submitter.value === "mail" ? "mail" : "wa";
      if (via === "mail") {
        window.location.href = "mailto:" + mail +
          "?subject=" + encodeURIComponent(text.subject) +
          "&body=" + encodeURIComponent(message);
      } else {
        window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(message), "_blank", "noopener");
      }
    });
  }
})();
