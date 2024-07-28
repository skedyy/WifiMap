import { Clipboard } from '@capacitor/clipboard';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Toast } from '@capacitor/toast';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';
import { Preferences } from '@capacitor/preferences';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import {ScreenOrientation} from '@capacitor/screen-orientation'
import { FileOpener } from '@capacitor-community/file-opener';
import { DarkMode } from '@aparajita/capacitor-dark-mode';
import write_blob from "capacitor-blob-writer";

var name
var pass
var styleUri
var apkUri
var mapa
var darkMode
var datatoggle = document.querySelector("#mobile-data")
let darkM = (await DarkMode.isDarkMode()).dark
document.addEventListener('deviceready',async () => {
    ScreenOrientation.lock({
        orientation: "portrait"
    })
    var mobilepref = (await Preferences.get({key: "mobile-data"})).value
    await Geolocation.requestPermissions("location")
    await Toast.show({
            text:"Recuerda conectarte a internet la primera vez y frecuentemente para actualizar la app!",
            duration: 'long'
    });
    var connected = (await Network.getStatus()).connected
    var status = (await Network.getStatus()).connectionType
    if (status == "wifi" && connected==true){
        await downloadStyle()    
        await downloadgeoJson()
        await uploadNetworks()
        await checkUpdates()
    }
    if(status == "cellular" && mobilepref=="true" && connected==true){
        await downloadStyle()    
        await downloadgeoJson()
        await uploadNetworks()
        await checkUpdates()
        await Toast.show({
            text:"Estás usando datos móviles, esto puedes cambiarlo en configuracion.",
            duration:"long"
        })
    }
    if(status == "none"|| status=="unknown" || connected==false){
        await loadMap()
    }
    async function checkUpdates(){
    let apkurl
    try {
        const response = await CapacitorHttp.get({url:"https://wifimap.alwaysdata.net/updates.php?version=1.5.4"});
        var response2 = response.data;
        console.log(response2)
        if(response2==="null"){
            console.log("App actualizada")
            console.log(response2)
        }else{
            try {
                apkurl = await response2
                console.log(response2)
            Toast.show({
                text:"App Desactualizada, descargando nueva versión!",
                duration: "short"
            })
            enableProgressBar(true)
            var path = await Filesystem.downloadFile({
                url: apkurl,
                path: "/wifimap/WifiMap.1.5.4.apk",
                directory: Directory.Data
            })
            await Filesystem.getUri({path:"/wifimap/WifiMap.1.5.4.apk",directory: Directory.Data})
            .then((urlresult)=>{
            apkUri = urlresult.uri
            })
            await FileOpener.open({
            filePath: apkUri,
            contentType: "application/vnd.android.package-archive",
            openWithDefault: false
            })
            enableProgressBar(false)  
            } catch (error) {
                Toast.show({
                    text:"Error al actualizar la app, comprueba tu conexión",
                    duration: "short"
                })   
                enableProgressBar(false)  
            }
            }
    }catch{
    }
    }   
    async function uploadNetworks(){
        var url = "https://wifimap.alwaysdata.net/addnetworks.php"
        var long = await Preferences.get({ key: 'long' })
        var lat = await Preferences.get({ key: 'lat' })
        var id = await Preferences.get({ key: 'id' })
        var name = await Preferences.get({ key: 'name' })
        var pass = await Preferences.get({ key: 'pass' })
          if (lat.value ===null ||long.value === null || id.value === null || name.value === null || pass.value === null) {
        }else{
            fetch(url+"?lat="+lat.value+"&long="+long.value+"&id="+id.value+"&name="+name.value+"&pass="+pass.value)
            await Preferences.remove({
                key: 'long'
            })
            await Preferences.remove({
                key: 'lat'
            })
            await Preferences.remove({
                key: 'id'
            })
            await Preferences.remove({
                key: 'name'
            })
            await Preferences.remove({
                key: 'pass'
            })
        }
    }
    async function downloadStyle() {
            try {
            const response = await CapacitorHttp.request({method:"get",url:"https://wifimap.alwaysdata.net/style.php"});
            enableProgressBar(true)
            var json = JSON.stringify(response.data);
            } catch (error) {
                loadMap(darkMode) 
                enableProgressBar(false)  
            }
            const filename = 'style.json';
            await Filesystem.writeFile({
                directory: Directory.Data,
                path: `wifimap/${filename}`,
                data: json,
                recursive: true,
                encoding: Encoding.UTF8
            });
            try {
                const darkjson = await CapacitorHttp.get({url:"https://wifimap.alwaysdata.net/dark.php"})
                enableProgressBar(true)
                var jsondark = JSON.stringify(darkjson.data);
            } catch (error) {
                loadMap(darkMode)
                enableProgressBar(false)
            }
            const filenamedark = 'dark.json';
            await Filesystem.writeFile({
                directory: Directory.Data,
                path: `wifimap/${filenamedark}`,
                data: jsondark,
                recursive: true,
                encoding: Encoding.UTF8
            });
        }
        async function downloadgeoJson() {
            try {
                const response = await CapacitorHttp.get({url:"https://wifimap.alwaysdata.net/Networks.php"});  
                enableProgressBar(true)
            var json = JSON.stringify(response.data);   
            } catch (error) {
                loadMap(darkMode)
                enableProgressBar(false)
            }
            const filename = 'Networks.geojson';
            await Filesystem.writeFile({
                directory: Directory.Data,
                path: `wifimap/${filename}`,
                data: json,
                recursive: true,
                encoding: Encoding.UTF8
            }).then((result)=>{
                if(!result.uri==""||!result.uri==null||!result.uri==undefined){
                    loadMap(darkMode)
                    enableProgressBar(false)
                }
            })
        }
        async function loadMap(darkMode){
            let darkM = (await DarkMode.isDarkMode()).dark
            if(darkM == true){
                await Filesystem.getUri({path:"wifimap/dark.json",directory: Directory.Data})
                    .then((urlresult)=>{
                        styleUri = urlresult.uri
            })
            }else{
                await Filesystem.getUri({path:"wifimap/style.json",directory: Directory.Data})
                    .then((urlresult)=>{
                        styleUri = urlresult.uri
            })
            }
            maplibregl.OfflineMap({
        container: 'map',
        style: Capacitor.convertFileSrc(styleUri),
        center: [
            2.15,
            41.38
        ],
        zoom: 15,
        bearing: 0,
        hash: true
    }).then(async (map) => {
        let darkM = (await DarkMode.isDarkMode()).dark
        mapa = map
        map.addControl(new maplibregl.NavigationControl())
        if(darkM==true){
            map.addLayer({
            "id": "network-layer",
            "type": "circle",
            "source": "networks",
            "paint": {
                "circle-radius": 8,
                "circle-color": "#008744",
                "circle-stroke-width": 3,
                "circle-stroke-color": "black",
            }
        })
        }else{
            map.addLayer({
            "id": "network-layer",
            "type": "circle",
            "source": "networks",
            "paint": {
                "circle-radius": 8,
                "circle-color": "#008744",
                "circle-stroke-width": 3,
                "circle-stroke-color": "white",
            }
        })
        }
            let geocontrol = new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                
                trackUserLocation: true
            })
            map.addControl(geocontrol)
            geocontrol.trigger();

            var geoctrl = document.querySelector(".maplibregl-ctrl-top-right")
            var geoctrlheight = geoctrl.offsetHeight
            var btnadd = document.querySelector(".buttonadd")
            btnadd.style.marginTop = geoctrlheight+10+"px"
            var btnaddheight = btnadd.offsetHeight

            var configbtn = document.querySelector(".configbtn")
            configbtn.style.marginTop = geoctrlheight+51+"px"
        map.on('click', 'network-layer', async(e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            name = e.features[0].properties.name;
            pass = e.features[0].properties.pass;
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            let darkM = (await DarkMode.isDarkMode()).dark
            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(name + '<br>' + '<button id="connectbutton">Conectar!</button>'+'<br>'+'<button id="qrButton">Mostrar QR</button>')
                .addTo(map);
            if(darkM == true){
            var popup = document.querySelector(".maplibregl-popup-content")
            popup.style.background = "#121212"
            popup.style.color = "#FFFFFF"
            var closePopup = document.querySelector(".maplibregl-popup-close-button")
            closePopup.style.color = "#FFFFFF"
            var popuptip = document.querySelector(".maplibregl-popup-tip")
            popuptip.style["border-top-color"] = "#121212"
            }
            var button = document.getElementById("connectbutton")
            button.addEventListener("click", connectButton)
            var qrbutton = document.getElementById("qrButton")
            qrbutton.addEventListener("click", showqr)
        });
    });
    }

    async function connectButton() {    if(pass == ""|| pass == null || pass == undefined || pass == " "){
        await Toast.show({
            text: name + " Red Abierta!",
            duration: 'long'
        });
        NativeSettings.open({
            optionAndroid: AndroidSettings.Wifi,
            optionIOS: IOSSettings.WiFi
        })
    }else{
        await Clipboard.write({
            string: pass
        });
        await Toast.show({
            text: name + " Contraseña Copiada al portapapeles!",
            duration: 'long'
        });
        NativeSettings.open({
            optionAndroid: AndroidSettings.Wifi,
            optionIOS: IOSSettings.WiFi
        })
    }
}
    async function showqr(){
        const qrcode = require('wifi-qr-code-generator')
        if(pass == ""|| pass === "null" || pass == undefined || pass == " "){
            const pr = qrcode.generateWifiQRCode({
            ssid: name,
            password: "",
            encryption: 'None',
            hiddenSSID: false,
            outputFormat: { type: 'image/png' }
        })
    pr.then((data) =>{
        var img = document.getElementById("imgModal")
        img.className = "animated fadein"
        var outside = document.getElementById("divOutside")
        img.style.display = "flex";
        outside.style.display = "flex"
        img.src = data
        outside.addEventListener("click", ()=>{
            img.style.display = "none"
            outside.style.display = "none"
        })
    })   
    }else{
        const pr = qrcode.generateWifiQRCode({
        ssid: name,
        password: pass,
        encryption: 'WPA',
        hiddenSSID: false,
        outputFormat: { type: 'image/png' }
    })
    pr.then((data) =>{
        var img = document.getElementById("imgModal")
        var outside = document.getElementById("divOutside")
        img.style.display = "flex";
        outside.style.display = "flex"
        img.src = data
        outside.addEventListener("click", ()=>{
            img.style.display = "none"
            outside.style.display = "none"
        })
    })
    }
    }
    window.showqr = showqr
    }, false)
export async function enableProgressBar(mode){
    if(mode==true){
        let progressbar = document.getElementById("progressbar")
        progressbar.style.display = "flex"
    }else{
        let progressbar = document.getElementById("progressbar")
        progressbar.style.display = "none"
    }
}