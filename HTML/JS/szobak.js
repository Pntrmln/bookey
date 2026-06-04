import { arFormazo } from './arFormazo.js';

fetch('api/szobak')
    .then(res => res.json())
    .then(szobaNevek => {
        szobaNevek.forEach(szoba => {
            $('#asd').append(`
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="assets/rooms/${szoba.kep["kep1"]}" class="card-img-top" alt="${szoba.nev}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-row gap-2 justify-content-between">
                            <div><h5 class="card-title text-start font-weight-bold">${szoba.nev}</h5>
                                <p class="card-text text-start text-muted flex-grow-1">
                                    ${szoba.leirasR}
                                </p>
                            </div>
                            <div class="gap-2 d-flex flex-column justify-content-end align-items-center">
                                <span class="badge badgeColor w-100">
                                    <i class="fa-regular fa-user"></i> ${szoba.ferohely} Fő
                                </span>
                                <span class="badge badgeColor w-100">
                                    ${arFormazo(szoba.ar)} Ft/Éj
                                </span>
                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${szoba.id}">Részletek</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="${szoba.id}" tabindex="-1" aria-labelledby="${szoba.id}Label" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="${szoba.id}Label">${szoba.nev}</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body d-flex flexIrany">
                                <div id="carousel${szoba.id}" class="carousel slide caruselKepek">
                                    ${kepnezegeto(szoba)}
                                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel${szoba.id}" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Previous</span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#carousel${szoba.id}" data-bs-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Next</span>
                                    </button>
                                </div>
                                <div class="leirasH">${szoba.leirasH}</div>
                            </div>
                            <div class="modal-footer justify-content-center mFooter">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Vissza</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            console.log(szoba.kep["kep1"]);
        });
    })
    .catch(err => console.error("Hiba történt a letöltéskor:", err));

function kepnezegeto(szoba) {
    const kepekObj = Object.values(szoba.kep);
    const kepek = kepekObj.map((img, index) => {
        return `<div class="carousel-item ${index == 0 ? 'active' : ''}">
                    <img class="d-block caruselKepek" src="assets/rooms/${img}" alt="Slide ${index + 1}">
                </div>`;
    }).join('');

    return `
        <div class="carousel-inner">
            ${kepek}
        </div>
    `;
}

// function nevatalakito(szobanev) {
//     return szobanev.split(" ").join("").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
// }