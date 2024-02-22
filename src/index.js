import { Clipboard } from '@capacitor/clipboard';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Toast } from '@capacitor/toast';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import write_blob from "capacitor-blob-writer";

var name
var pass
var styleUri
var blobB64
document.addEventListener('deviceready',async () => {
    await Geolocation.requestPermissions("location")
    await Toast.show({
            text:"Recuerda conectarte a internet la primera vez y frecuentemente para actualizar la app!",
            duration: 'long'
        });
    var status = (await Network.getStatus()).connectionType
    if (status == "wifi"){
        alert("Actualizando la base de datos, No te desconectes!")
        await downloadStyle()    
        await downloadgeoJson()
    }
    if(status == "none"|| status=="unknown"){
        loadMap()
    }
    async function downloadStyle() {
            // Descargar el archivo
            const response = await axios.get("https://skedyy.000webhostapp.com/WifiMap/style.json"
            );
            const json = JSON.stringify(response.data);
            // Guardar el archivo en la carpeta de descargas
            const filename = 'style.json';
            await Filesystem.writeFile({
                directory: Directory.Data,
                path: `wifimap/${filename}`,
                data: json,
                recursive: true,
                encoding: Encoding.UTF8
            });
        }
        async function downloadgeoJson() {
            // Descargar el archivo
            const response = await axios.get("https://skedyy.000webhostapp.com/WifiMap/Networks.geojson"
            );  
            const json = JSON.stringify(response.data);
            // Guardar el archivo en la carpeta de descargas
            const filename = 'Networks.geojson';
            await Filesystem.writeFile({
                directory: Directory.Data,
                path: `wifimap/${filename}`,
                data: json,
                recursive: true,
                encoding: Encoding.UTF8
            }).then((result)=>{
                if(!result.uri==""||!result.uri==null||!result.uri==undefined){
                    loadMap()
                }
            })
        }
        async function downloadtiles() {
            try{
                await Filesystem.readFile({
                    path:"wifimap/WifiMap.mbtiles",
                    directory: Directory.Data
                }).then((result)=>{
                    if(!result.data==""){
                        loadMap();
                    }else{
                        alert("Actualizando la base de datos, no te desconectes!")
                      throw console.error("not exists");
                         
                    }
                })
            }catch{
  const videoResponse = await fetch("https://skedyy.000webhostapp.com/WifiMap/WifiMap.mbtiles");
  const videoBlob = await videoResponse.blob();
  await write_blob({
    path: "/wifimap/WifiMap.mbtiles",
    directory: Directory.Data,
    blob: videoBlob,
    recursive: true,
  });
  loadMap()
}
            }
        async function loadMap(){
    await Filesystem.getUri({path:"wifimap/style.json",directory: Directory.Data})
    .then((urlresult)=>{
        styleUri = urlresult.uri
    })
            maplibregl.OfflineMap({
        container: 'map',
        style: Capacitor.convertFileSrc(styleUri),
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
    }
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
}, false)