import pg from 'pg';
const { Client } = pg;
import nodemailer from 'nodemailer';
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const connectionString = 'postgresql://postgres:hungaryen@pg.tamado.org:5432/Hotel';
import { createServer } from 'node:http';
const hostname = '127.0.0.1';
const port = 3000;
import { arFormazo } from './arFormazo.js';


const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
});

const transporter = nodemailer.createTransport({
    host: 'mail.tamado.org',
    port: 587,
    secure: false,
    auth: {
        user: 'bookey@tamado.org',
        pass: 'f4LbuKQ6-9'
    },
    tls: {
        rejectUnauthorized: false
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const client = new Client({
    connectionString,
});

await client.connect();

const szobaDarabQuery = await client.query("SELECT COUNT(*) FROM szobak");
const szobaQuery = await client.query('SELECT * from szobak ORDER BY szobaid');
const szobaDarab = szobaDarabQuery.rows[0].count;

const szobaObjArr = [];

for (let i = 0; i < szobaDarab; i++) {
    const szobaObj = {
        id: szobaQuery.rows[i].szobaid,
        nev: szobaQuery.rows[i].nev,
        leirasR: szobaQuery.rows[i].leirasrovid,
        leirasH: szobaQuery.rows[i].leirashosszu,
        ferohely: szobaQuery.rows[i].ferohely,
        kep: szobaQuery.rows[i].kep,
        ar: szobaQuery.rows[i].ar
    }
    szobaObjArr.push(szobaObj);
}
const app = express();

const foglalasiIdok = await client.query("SELECT bejelentkezes, kijelentkezes, szid FROM vendegek;");
const vendegSzamQuery = await client.query("SELECT COUNT(*) FROM vendegek");
const vendegSzam = vendegSzamQuery.rows[0].count;

const bejDatumok = [];
const kijDatumok = [];
const szobaIdk = [];

for (let i = 0; i < vendegSzam; i++){
    let b = new Date(foglalasiIdok.rows[i].bejelentkezes);
    b.setTime(b.getTime() + 2 * 60 * 60 * 1000);
    let k = new Date(foglalasiIdok.rows[i].kijelentkezes);
    k.setTime(k.getTime() + 2 * 60 * 60 * 1000);
    bejDatumok.push(b);
    kijDatumok.push(k);
    szobaIdk.push(foglalasiIdok.rows[i].szid);
}

const foglalas = {
    bejelentkezesArr: bejDatumok,
    kijelentkezesArr: kijDatumok,
    szobaIdArr: szobaIdk
}

/* ================================ */
/* ======== api endpointok ======== */
/* ================================ */

app.get('/api/szobak', async (req, res) => {
    try {
        res.send(szobaObjArr);
    } catch (err) {
        console.error(err);
        res.status(500).send('DB error');
    }
});

app.get('/api/foglalasIdok', async (req, res) => {
    try {
        res.send(foglalas);
    } catch (err) {
        console.error(err);
        res.status(500).send('DB error');
    }
});

app.use(express.json());

function genRandBSzamla(){
    var bsz = "";
    for (let i = 1; i <= 16; i++){
        bsz += Math.floor(Math.random() * 9) + 1;
        if (i == 8){bsz += "-"};
    }
    return bsz;
}

app.post('/api/veglegesites', async (req, res) => {
    const foglalasi_adatok = req.body;

    try {
        let q;
        let x = 1;
        while (q != ""){
            q = await client.query("SELECT * FROM vendegek WHERE vendegid = " + x);
            if (q.rows[0] == undefined){
                break;
            }
            x++;
        }

        await transporter.sendMail({
            from: 'bookey@tamado.org',
            to: foglalasi_adatok[2],
            subject: 'Foglalás összegző',
            html: `
            <h2>Tisztelt ${foglalasi_adatok[0]}!</h2>
            <p>Örömmel tájékoztatjuk, hogy sikeresen lefoglalta a(z) <b>"${szobaObjArr[parseInt(foglalasi_adatok[3]) - 1].nev}"</b> szobát a következő időszakra: <b>${foglalasi_adatok[4]} - ${foglalasi_adatok[5]}</b></p>
            <p>A foglalás azonosítója: <b>${x}</b></p>
            <p>A foglalás összege: <b>${arFormazo(foglalasi_adatok[6])} Ft</b></p>
            <p>A foglalás összegének kifizetését a <b>${genRandBSzamla()}</b> bankszámlaszámra utalva, vagy személyesen a helyszínen készpénzben vagy bankkártyával teheti meg.</p>`
            
        });
        
        let insert_szoveg = "INSERT INTO vendegek VALUES(" + x;
        for (let i = 0; i < foglalasi_adatok.length - 1; i++){
            if (i == 3){
                insert_szoveg += ", " + parseInt(foglalasi_adatok[i]);
            } else {
                insert_szoveg += `, '${foglalasi_adatok[i]}'`;
            }
        }
        await client.query(insert_szoveg + ");");

        res.send('ok');
    } catch (err) {
        console.error(err);
        res.status(500).send('fail');
    }
});

app.use(express.static('../'));

app.listen(3000, () => console.log('http://localhost:3000'));