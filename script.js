  let isTouchDevice = () => (('ontouchstart' in window) ||
   (navigator.maxTouchPoints > 0) ||
   (navigator.msMaxTouchPoints > 0));

  // track mouse pos
  let mousePos = {}
  onmousemove = function(e){mousePos = {x: e.clientX, y: e.clientY}}
  /*window.addEventListener('touchstart', function(e) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
    mousePos = {x: clientX, y: clientY}
  }, false);*/
  
  const sel = q => document.querySelector(q)
  const mapPopup = sel('.map-popup')
  const countryDetails = sel('.country-details')

  let currentHoverD = null;
  fetch('ne_110m_populated_places_simple.geojson').then(res => res.json()).then(places => {
    fetch('ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries => {
      // flags preload
      places.features.forEach(p => {
        let img = new Image();
        img.src = 'flags/' + p.properties.iso_a2.toLowerCase() + '.png';
        img.style.display = 'none';
        document.body.appendChild(img)
      });

      let countries_features = countries.features.filter(d => d.properties.ISO_A2 !== 'AQ')
      fetch('country_details.json').then(res => res.json()).then(country_details => {
        let handleCountryClick = (h, world) => {
          let country_det = country_details.find(c => c.name.toLowerCase() === currentHoverD.properties.sov0name.toLowerCase());
          if(!isTouchDevice()){
            window.open(country_det.link);
          }
          else{
            // return;
            countryDetails.style.display = "";
            countryDetails.querySelector('.name').innerText = currentHoverD.properties.sov0name;
            // countryDetails.querySelector('.desc').innerText = country_det ? country_det.desc : "";
            countryDetails.querySelector('img').src = 'flags/' + currentHoverD.properties.iso_a2.toLowerCase() + '.png';
            if(country_det && country_det.link){
             // countryDetails.querySelector('.learn-more').style.display = "block";
             countryDetails.querySelector('a').href = country_det.link;
            }
            else countryDetails.querySelector('.learn-more').style.display = "none";
          }
        };
        const world = Globe()
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
          .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
          .labelsData(places.features)
          .labelLat(d => d.properties.latitude)
          .labelLng(d => d.properties.longitude)
          .labelText(d => {let details = country_details.find(cc => cc.name === d.properties.sov0name); return details.name2 || details.name})
          // Math.max(Math.min(d.properties.pop_max, 2000000), 0)
          .labelSize(d => Math.sqrt(Math.max(Math.min(d.properties.pop_max, 2000000), 500000)) * 4e-4) // 400000
          .labelDotRadius(d => Math.sqrt(1743000) * 4e-4)
          .labelColor(() => 'rgba(255, 165, 0, 0.75)')
          .labelResolution(2)
          .labelAltitude(0.01)
          .onLabelClick(h => {currentHoverD = h; handleCountryClick(h, world); })
          .onLabelHover(h => {
            if(isTouchDevice()) return;
            if(h){
              mapPopup.style.display = '';
              mapPopup.querySelector('.name').innerText = (() => {let details = country_details.find(cc => cc.name === h.properties.sov0name); return details.name2 || details.name})();
              mapPopup.querySelector('img').src = 'flags/' + h.properties.iso_a2.toLowerCase() + '.png';
              mapPopup.style.left = mousePos.x - mapPopup.getBoundingClientRect().width / 2 + 'px';
              mapPopup.style.top = mousePos.y - mapPopup.getBoundingClientRect().height + 'px';
            }else{
              mapPopup.style.display = 'none';              
            }
          })
        (document.getElementById('globeViz'));
        const controls = world.controls();
        controls.addEventListener('change', () => {
            const pov = world.pointOfView();
            // controls.rotateSpeed = pov.altitude * 0.25;
            controls.zoomSpeed = (pov.altitude + 1) * 0.5;
        });
      })
    })
  });
  
  sel('.btn-close').onclick = () => {
    countryDetails.style.display = 'none';
  }