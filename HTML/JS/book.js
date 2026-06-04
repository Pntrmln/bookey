import { arFormazo } from './arFormazo.js';

let x = 1;
var szobaLeirasok = [];
var szobaArak = [];
var szobaNevek = [];
fetch('/api/szobak').then(res => res.json()).then(szobaObjArr => {
    szobaObjArr.forEach(szobaObj => {
        $("#szobaValaszto").append(`<option value=${x}>${szobaObj.nev}</option>`);
        szobaLeirasok.push(szobaObj.leirasR);
        szobaArak.push(szobaObj.ar);
        szobaNevek.push(szobaObj.nev);
        x++;
    });
});

var bejDates = [];
var kijDates = [];
var szobaIds = [];
fetch('/api/foglalasIdok').then(res => res.json()).then(book => {
    book.bejelentkezesArr.forEach(bejDate => {
        bejDates.push(bejDate);
    });
    book.kijelentkezesArr.forEach(kijDate => {
        kijDates.push(kijDate);
    });
    book.szobaIdArr.forEach(id => {
        szobaIds.push(id);
    });
});

var egyNap = 24 * 60 * 60 * 1000;
var foglalasAr;

function changeDesc(){
    if ($("#szobaValaszto").val() != "" && $("#szobaValaszto").val() != null){
        $("#leiras").removeClass("warn").html(szobaLeirasok[$("#szobaValaszto").val() - 1]);
        let foglalasKulonbseg = Math.round(Math.abs((new Date($("#bej_date").val()) - new Date($("#kij_date").val())) / egyNap));
        let szobaAr = szobaArak[$("#szobaValaszto").val() - 1];
        foglalasAr = szobaAr * foglalasKulonbseg;
        if (!isNaN(foglalasKulonbseg) && foglalasKulonbseg != 0){
            $("#szobaAr").show().html("<h4>Ár összesen: " + arFormazo(foglalasAr) + " Ft</h4><h5>(Ár/éj: " + arFormazo(szobaAr) + " Ft)</h5>");
        } else {
            $("#szobaAr").show().html("<h4>Ár/éj: " + arFormazo(szobaAr) + " Ft</h4>");
        }
    } else {
        $("#leiras").addClass("warn").text("Ön még nem választott szobát!");
        $("#szobaAr").hide();
    }
}

var hiba;
var tval;
var valasztottSzoba;
var bejDatum;
var kijDatum;

var vissza = 10;
function foglalas() {
    let foglalasi_adatok = [];

    checkHiba();

    if (!hiba){
        foglalasi_adatok.push($("#vnev").val() + " " + $("#knev").val());
        foglalasi_adatok.push(tval);
        foglalasi_adatok.push($("#email").val());
        foglalasi_adatok.push(valasztottSzoba);
        foglalasi_adatok.push(bejDatum.toISOString().substring(0, 10));
        foglalasi_adatok.push(kijDatum.toISOString().substring(0, 10));
        foglalasi_adatok.push(foglalasAr);
    }

    if (foglalasi_adatok.length != 0){
        fetch('/api/veglegesites', {
            method: 'POST',
            body: JSON.stringify(foglalasi_adatok),
            headers: { 'Content-Type': 'application/json' }
        });

        $("#siker").show();
        $("#foglalasbtn").prop("disabled", true);
        let int = setInterval(function(){
            vissza--;
            $("#visszaszamlalo").text(vissza);
            if (vissza == 0){
                clearInterval(int);
                window.location.href = "index.html";
    }
    }, 1000);
    }
}
function checkHiba(){
var specialChars = /[!-\/:-@[-`{-~]/;

    hiba = false;
    $("input").removeClass("is-invalid");
    $("#szobaValaszto").removeClass("is-invalid");
    $("#chkBox").css("border-color", "black");

    if (/[0-9]/.test($("#vnev").val()) || specialChars.test($("#vnev").val()) || $("#vnev").val() == "") {
        setHiba($("#vnev"));
    }
    if (/[0-9]/.test($("#knev").val()) || specialChars.test($("#knev").val()) || $("#knev").val() == "") {
        setHiba($("#knev"));
    }
    if (!$("#email").val().includes("@") || !$("#email").val().includes(".")) {
        setHiba($("#email"));
    }
    if (/[a-z]/i.test($("#telefon").val()) || $("#telefon").val() == "") {
        setHiba($("#telefon"));
    }
    tval = $("#telefon").val();
    if (tval.startsWith("+36")){
        tval = tval.substring(2);
        tval = "0" + tval;
    }
    let seged = "";
    let indxs = [2, 4, 7];
    if (!tval.includes("-")){
        for (let i = 0; i < tval.length; i++){
            if (indxs.includes(i)){
                seged += "-";
            }
            seged += tval[i];
        }
        tval = seged;
    }
    if (tval.length != 14){
        setHiba($("#telefon"));
    }
    let datumMa = new Date();
    datumMa.setHours(0,0,0,0);
    bejDatum = new Date($("#bej_date").val());
    bejDatum.setHours(0,0,0,0);
    kijDatum = new Date($("#kij_date").val());
    kijDatum.setHours(0,0,0,0);
    if (bejDatum < datumMa || $("#bej_date").val() == ""){
        setHiba($("#bej_date"));
    }
    if (kijDatum <= bejDatum || $("#kij_date").val() == ""){
        setHiba($("#kij_date"));
    }
    valasztottSzoba = $("#szobaValaszto").find(":selected").val();
    if (valasztottSzoba == ""){
        setHiba($("#szobaValaszto"));
    }
    console.log(bejDatum);
    for (let i = 0; i < bejDates.length; i++){
        console.log(bejDates[i], kijDates[i], szobaIds[i]);
        if (bejDatum >= new Date(bejDates[i]) && bejDatum < new Date(kijDates[i]) && valasztottSzoba == szobaIds[i]){
            setHiba($("#bej_date"));
        }
        if (kijDatum >= new Date(bejDates[i]) && kijDatum <= new Date(kijDates[i]) && valasztottSzoba == szobaIds[i]){
            setHiba($("#kij_date"));
        }
        if (bejDatum < new Date(bejDates[i]) && kijDatum > new Date(kijDates[i]) && valasztottSzoba == szobaIds[i]){
            setHiba($("#bej_date"));
        }
    }
    if (!$("#chkBox").is(":checked")){
        setHiba($("#chkBox"));
    }
}
function setHiba(element){
    if (element[0].id == "chkBox"){
        console.log("asdsad");
        element.css("border-color", "red");
    }
    element.addClass("is-invalid");
    hiba = true;
}

window.changeDesc = changeDesc;
window.foglalas = foglalas;