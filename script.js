document.addEventListener("DOMContentLoaded", () => {
  // Tallennettu data
  let data = JSON.parse(localStorage.getItem('raccoinData')) || {
    pisteet: 0,
    tuplaKlikkaus: false,
    tehoKlikkaus: false,
    tuplaOstettu: false,
    tehoOstettu: false,
    kaivosTaso: 1,
    kaivosTuotto: 10,
    kaivosHinta: 50,
    kaivosAktiivinen: false,
    kaivosLoppu: 0
  };

  let { pisteet, tuplaKlikkaus, tehoKlikkaus, tuplaOstettu, tehoOstettu, kaivosTaso, kaivosTuotto, kaivosHinta, kaivosAktiivinen, kaivosLoppu } = data;

  const esineet = [
    { nimi: "Pizza", kuva: "pizza.png", voitto: 50 },
    { nimi: "Kala", kuva: "fish.png", voitto: 40 },
    { nimi: "Banaani", kuva: "banana.png", voitto: 30 },
    { nimi: "Kolikko", kuva: "coin.png", voitto: 20 },
    { nimi: "Timantti", kuva: "Diamond.png", voitto: 100 },
    { nimi: "Tyhjä", kuva: "tyhjä.png", voitto: 0 }
  ];

  function tallenna() {
    localStorage.setItem('raccoinData', JSON.stringify({
      pisteet, tuplaKlikkaus, tehoKlikkaus, tuplaOstettu, tehoOstettu,
      kaivosTaso, kaivosTuotto, kaivosHinta, kaivosAktiivinen, kaivosLoppu
    }));
  }

  function paivitaPisteet() {
    const el = document.getElementById("pisteet");
    if (el) {
      el.textContent = pisteet;
      tallenna();
    }
  }

  function klikkaa() {
    document.getElementById("clickSound").play();
    let lisays = 1;
    if (tuplaKlikkaus) lisays *= 2;
    if (tehoKlikkaus) lisays *= 5;
    pisteet += lisays;
    paivitaPisteet();
  }

  function ostaTuplaKlikkaus() {
    if (!tuplaOstettu && pisteet >= 10) {
      pisteet -= 10;
      tuplaKlikkaus = true;
      tuplaOstettu = true;
      paivitaPisteet();
    }
  }

  function ostaTehoKlikkaus() {
    if (!tehoOstettu && pisteet >= 25) {
      pisteet -= 25;
      tehoKlikkaus = true;
      tehoOstettu = true;
      paivitaPisteet();
    }
  }

  function naytaAlavalikko(id) {
    ["kaivos", "slotti", "parannukset", "taso", "esineet"].forEach(nimi => {
      const el = document.getElementById(nimi);
      if (el) el.style.display = (nimi === id) ? "block" : "none";
    });
    if (id === "kaivos") paivitaKaivos();
    if (id === "slotti") paivitaSlotti();
  }

  function avaaValikko() {
    document.getElementById("valikkoTausta").style.display = "block";
    document.getElementById("valikkoTausta").classList.add("nakyva");
  }

  function suljeValikko() {
    document.getElementById("valikkoTausta").style.display = "none";
    document.getElementById("valikkoTausta").classList.remove("nakyva");
  }

  function avaaKoti() {
    document.getElementById("kotiTausta").style.display = "block";
  }

  function suljeKoti() {
    document.getElementById("kotiTausta").style.display = "none";
  }

  function paivitaKaivos() {
    let animaatio = kaivosAktiivinen ? '<img class="kaivosAnimaatio" src="https://i.ibb.co/Wp2R8Dxm/Polish-20250408-213340783.png" alt="Kaivos">' : '';
    const sisalto = `${animaatio}<p>Taso: ${kaivosTaso}</p><button onclick="aloitaKaivos()">Aloita kaivostoiminta (${kaivosHinta})</button>`;
    document.getElementById("kaivos").innerHTML = sisalto;
  }

  window.aloitaKaivos = function () {
    if (pisteet >= kaivosHinta && !kaivosAktiivinen) {
      pisteet -= kaivosHinta;
      kaivosTaso++;
      kaivosTuotto *= 1.1;
      kaivosHinta = Math.floor(kaivosHinta * 1.5);
      kaivosAktiivinen = true;
      kaivosLoppu = Date.now() + 3 * 60 * 60 * 1000;
      paivitaKaivos();
      paivitaPisteet();
    }
  };

  setInterval(() => {
    if (kaivosAktiivinen && Date.now() < kaivosLoppu) {
      pisteet += Math.floor(kaivosTaso * (kaivosTuotto / 10));
      paivitaPisteet();
    } else if (kaivosAktiivinen) {
      kaivosAktiivinen = false;
      paivitaKaivos();
    }
  }, 3000);

  function paivitaSlotti() {
    document.getElementById("slotti").innerHTML = `
      <div id="slotMachine">
        <div class="reel" id="reel1"></div>
        <div class="reel" id="reel2"></div>
        <div class="reel" id="reel3"></div>
      </div>
      <button id="pyoritaNappi">Pyöritä (20 pistettä)</button>
    `;

    document.getElementById("pyoritaNappi").addEventListener("click", pyoritaSlotti);
  }

  function pyoritaSlotti() {
    if (pisteet >= 20) {
      pisteet -= 20;
      paivitaPisteet();
      document.getElementById("spinSound").play();
      for (let i = 1; i <= 3; i++) {
        const reel = document.getElementById(`reel${i}`);
        reel.innerHTML = "";
        reel.style.animation = "spinreel 3s linear";
      }
      const slotValues = [0, 0, 0].map(() => esineet[Math.floor(Math.random() * esineet.length)]);
      setTimeout(() => {
        slotValues.forEach((val, i) => {
          const reel = document.getElementById(`reel${i + 1}`);
          const img = document.createElement("img");
          img.src = val.kuva;
          reel.innerHTML = "";
          reel.appendChild(img);
        });
        const voitto = slotValues[0].nimi === slotValues[1].nimi && slotValues[1].nimi === slotValues[2].nimi ? slotValues[0].voitto : 0;
        pisteet += voitto;
        if (voitto > 0) document.getElementById("winSound").play();
        paivitaPisteet();
      }, 3000);
    }
  }

  // Kytketään tapahtumakäsittelijät
  document.getElementById("raccoon").addEventListener("click", klikkaa);
  document.getElementById("valikkoNappi").addEventListener("click", avaaValikko);
  document.getElementById("suljeValikko").addEventListener("click", suljeValikko);
  document.getElementById("kotiNappi").addEventListener("click", avaaKoti);
  document.getElementById("suljeKoti").addEventListener("click", suljeKoti);
  document.getElementById("kaivosNappi").addEventListener("click", () => naytaAlavalikko("kaivos"));
  document.getElementById("slottiNappi").addEventListener("click", () => naytaAlavalikko("slotti"));
  document.getElementById("parannusNappi").addEventListener("click", () => naytaAlavalikko("parannukset"));
  document.getElementById("tasoNappi").addEventListener("click", () => naytaAlavalikko("taso"));
  document.getElementById("esineetNappi").addEventListener("click", () => naytaAlavalikko("esineet"));
  document.getElementById("tuplaNappi").addEventListener("click", ostaTuplaKlikkaus);
  document.getElementById("tehoNappi").addEventListener("click", ostaTehoKlikkaus);

  paivitaPisteet();
});
