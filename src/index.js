import { Clipboard } from '@capacitor/clipboard';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Toast } from '@capacitor/toast';
import { Geolocation } from '@capacitor/geolocation';
var name
var pass
document.addEventListener('deviceready',() => {
    var permissions = Geolocation.checkPermissions()
        .then(async (permission) =>{
            if(permission.location == "prompt"){
                await Geolocation.requestPermissions("location")
                window.location.reload
            }
        })
    maplibregl.OfflineMap({
        container: 'map',
        style: 'styles/skedyy.json',
        center: [
            2.15,
            41.38
        ],
        zoom: 1,
        bearing: 0,
        hash: true
    }).then((map) => {
        map.addControl(new maplibregl.NavigationControl())
        map.addLayer({
            "id": "network-layer",
            "type": "circle",
            "source": "networks",
            "paint": {
                "circle-color": "hsla(0,0%,0%,1)",
                "circle-stroke-width": 3.5,
                "circle-stroke-color": "white"
            }
        })
            let geocontrol = new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
            map.addControl(geocontrol)
            geocontrol.trigger();
        map.on('click', 'network-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            name = e.features[0].properties.name;
            pass = e.features[0].properties.pass;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(name + '<br>' + '<button id="connectbutton">Conectar!</button>')
                .addTo(map);
            var button = document.getElementById("connectbutton")
            button.addEventListener("click", connectButton)
        });
    });
}, false)
async function connectButton() {
    console.log("button pressed: " + name + " " + pass)
    if(pass == ""|| pass == null || pass == undefined || pass == " "){
        await Toast.show({
            text: name + " Red Abierta!",
            duration: 'long'
        });
        console.log("toast shown")
        NativeSettings.open({
            optionAndroid: AndroidSettings.Wifi,
            optionIOS: IOSSettings.WiFi
        })
        console.log("settings opened")
    }else{
        await Clipboard.write({
            string: pass
        });
        console.log("clipboard copied")
        await Toast.show({
            text: name + " Contraseña Copiada al portapapeles!",
            duration: 'long'
        });
        console.log("toast shown")
        NativeSettings.open({
            optionAndroid: AndroidSettings.Wifi,
            optionIOS: IOSSettings.WiFi
        })
        console.log("settings opened")
    }
}