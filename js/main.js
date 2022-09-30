require("babel-core/register");
require("babel-polyfill");

let map = L.map('map').setView([49.898, 10.897], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

var attribution = L.control.attribution().addTo(map);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

fetch('https://api.bonista.io/coupons/merchants-api/merchants/public').then(
  async function (response) {
    let responseJson = await response.json();
    let i = 2;
    for (i in responseJson) {
      let merchant = responseJson[i];
      console.log(merchant);
      attribution.setPrefix(i + '/' + responseJson.length);
      await sleep(800);
      let streetParts = merchant['street'].split(' ');
      let houseNumber = streetParts.pop();
      let streetName = streetParts.reduce(function (a, b) {
        return a + "+" + b;
      });

      let input = 'https://nominatim.openstreetmap.org/search?format=json' +
        '&street=' + houseNumber + '+' + streetName +
        '&city=' + merchant['city'] +
        '&postalcode=' + merchant['postalCode'];
      console.log(input);
      let nomiatimResponse = await fetch(input);
      let nomiatimJson = await nomiatimResponse.json();
      let nomiatimResult = nomiatimJson[0];

      var marker = L.marker(
        [nomiatimResult['lat'], nomiatimResult['lon']]
      ).addTo(map);
      marker.bindPopup(
        "<a href='" + merchant['website'] + "'>" +
        merchant['name'] +
        "</a><br>" +
        merchant['merchantType'] + "<br>" +
        merchant['street'] + ", " + merchant['postalCode'] + " " + merchant['city']
      );
    }
  });
