function asd() {
    window.location.href = "/book.html";
}

function loadSite() {
    $("body").prepend(`<nav class="navbar navbar-expand-sm fixed-top navbar-scroll-0"><div class="container-fluid width1400"><a class="navbar-brand" href="/index.html">Bookey Hotel</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse justify-content-end" id="navbarNav"><div class="navbar-nav"><a id="fooldal" class="nav-link fd-600 ${(window.location.pathname == "/" || window.location.pathname == "/index.html") ? "disabled" : ""}" href="index.html"><i class="fa-regular fa-arrow-left"></i> Vissza a főoldalra </a><a id="szolg" class="nav-link fd-600 ${(window.location.pathname == "/book.html") ? "disabled" : ""}" href="book.html">Foglalás</a><a id="szob" class="nav-link fd-600 ${(window.location.pathname == "/szobak.html") ? "disabled" : ""}" href="szobak.html">Szobák</a><a id="aszf" class="nav-link fd-600 ${(window.location.pathname == "/aszf.html") ? "disabled" : ""}" href="aszf.html">ÁSZF</a></div></div></div></nav>`);
    $("section").eq(-1).after(`<footer id="feet" class="container-fluid align-items-center justify-content-center"><div id="felso" class="d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 text-center text-md-start"><div><h2 class="footer_szin">Bookey Hotel</h2><p>A hotel ahol a közös pihenés<br>egy felejthetetlen élménnyé válik</p></div><div class="vonalka d-none d-md-block"></div><div><h5 class="footer_szin">Elérhetőségeink</h5><a class="deco_none" href="#"><p class="smol"><i class="fa-regular fa-phone"></i> +36 70 615 7814</p></a><a class="deco_none" target="_blank" href="https://mail.google.com/mail/?view=cm&to=bookey@tamado.org&su=Kérdés+a+hotellal+kapcsolatban"><p class="smol"><i class="fa-regular fa-envelope"></i> bookey@tamado.org</p></a><a href="http://maps.google.com/?q=Makkoshotyka+Temető" class="deco_none"><p class="smol"><i class="fa-sharp fa-regular fa-location-dot"></i>3959 Makkoshotyka, Rákóczi Ferenc u. 1</p></a></div><div class="vonalka d-none d-md-block"></div><div><h5 class="footer_szin">Navigáció</h5><a class="deco_none" href="book.html"><p class="smol">Foglalás</p></a><a class="deco_none" href="szobak.html"><p class="smol">Szobák</p></a><a class="deco_none" href="aszf.html"><p class="smol">ÁSZF</p></a></div></div><div class="h-vonalka"></div><div id="also" class="text-center"><p>&copy; 2026 MDO works</p></div></footer><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>`);
}

let windowPos = 0;
document.addEventListener("scroll", (event) => {
    setTimeout(() => {
        windowPos = window.scrollY;
        if (windowPos > 50) {
            $("nav").removeClass("navbar-scroll-0");
            $("nav").addClass("navbar-scroll-x");
        }
        else {
            $("nav").addClass("navbar-scroll-0");
            $("nav").removeClass("navbar-scroll-x");
        }
    }, 40);
});
