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
var darkM
document.addEventListener('deviceready',async () => {
    ScreenOrientation.lock({
        orientation: "portrait"
    })
    var url = "https://wifimap.alwaysdata.net/addnetworks.php"
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
        await uploadNetworks()
        await checkUpdates()
    }
    if(status == "none"|| status=="unknown" || status == "cellular"){
        await loadMap()
    }
    async function checkUpdates(){
    let apkurl
    try {
        const response = await CapacitorHttp.get({url:"https://wifimap.alwaysdata.net/updates.php?version=1.5.2"});
        var response2 = await response.text();
        if(response2==="null"){
        }else{
            try {
                apkurl = await response2
            Toast.show({
                text:"App Desactualizada, descargando nueva versión!",
                duration: "short"
            })
            enableProgressBar(true)
            var path = await Filesystem.downloadFile({
                url: apkurl,
                path: "/wifimap/WifiMap.1.5.2.apk",
                directory: Directory.Data
            })
            await Filesystem.getUri({path:"/wifimap/WifiMap.1.5.2.apk",directory: Directory.Data})
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
    async function enableProgressBar(mode){
        if(mode==true){
            let progressbar = document.getElementById("progressbar")
            progressbar.style.display = "flex"
        }else{
            let progressbar = document.getElementById("progressbar")
            progressbar.style.display = "none"
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
        zoom: 1,
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
    async function addNetwork(){
    const coordinates = await Geolocation.getCurrentPosition();
    const long = " "+coordinates.coords.longitude
    const lat = " "+coordinates.coords.latitude
    const id = " "+Math.floor(Math.random() * 10000)
    var { value, cancelled } = await Dialog.prompt({
    title: 'Añadir Red',
    message: `Nombre y contraseña de la red`,
    okButtonTitle: "Enviar",
    cancelButtonTitle: "Cancelar",
    inputPlaceholder: "Nombre:Contraseña"
    })
    var userinput = value.split(":")
    var name = userinput[0]
    var pass = userinput[1]
        switch(cancelled){
        case true:
            break;
        case false:
        var netstatus = (await Network.getStatus()).connectionType    
        switch(netstatus){
            case 'wifi':
                try {
                    if(name===""| name===" " || name===null){
                        await Toast.show({
                            text:" No puedes dejar el nombre vacio!",
                            duration:"long"
                        })
                    }else{
                        fetch(url+"?lat="+lat+"&long="+long+"&id="+id+"&name="+name+"&pass="+pass)   
                    await Toast.show({
                    text:"Tu solicitud se ha enviado!",
                    duration: 'short'
                })
                    }
                } catch (error) {
                    await Toast.show({
                        text:"Error al subir la solicitud, se subirá más tarde...",
                        duration:"short"
                    })  
                    const setName = async () => {
                    await Preferences.set({
                        key: 'lat',        
                        value: lat,
                    });
                    await Preferences.set({
                        key: 'long',        
                        value: long,
                    });
                    await Preferences.set({
                        key: 'id',        
                        value: id,
                    });
                    await Preferences.set({
                        key: 'name',
                        value: name,
                    });
                    await Preferences.set({
                        key: 'pass',
                        value: pass,
                    });
                };
                setName()
                }
                try {
                const response = await CapacitorHttp.get({url:"https://wifimap.alwaysdata.net/Networks.php"});  
                const json = JSON.stringify(response.data);   
                await Toast.show({
                    text:"Recargando Mapa..",
                    duration: 'long'
                })
                mapa.getSource('networks').setData(json)
                var mapdom = document.getElementById("map")
                mapdom.remove()
                var mapnew = document.createElement("div")
                mapnew.setAttribute("id","map");
                document.body.appendChild(mapnew);
                await downloadgeoJson()
                loadMap()
                } catch (error) {
                  await Toast.show({
                    text:"Error al actualizar :(",
                    duration: 'short'
                })  
                loadMap()
                }            
            break;
            case 'cellular':
                await Toast.show({
                    text:"Se subirá tu solicitud cuando abras la app y te conectes a internet!",
                    duration: 'long'
                })
                const setName = async () => {
                    await Preferences.set({
                        key: 'lat',        
                        value: lat,
                    });
                    await Preferences.set({
                        key: 'long',        
                        value: long,
                    });
                    await Preferences.set({
                        key: 'id',        
                        value: id,
                    });
                    await Preferences.set({
                        key: 'name',
                        value: name,
                    });
                    await Preferences.set({
                        key: 'pass',
                        value: pass,
                    });
                };
                setName()
                break;
            case 'none':
                await Toast.show({
                    text:"Se subirá tu solicitud cuando abras la app y te conectes a internet!",
                    duration: 'long'
                })
                const setName2 = async () => {
                    await Preferences.set({
                        key: 'lat',        
                        value: lat,
                    });
                    await Preferences.set({
                        key: 'long',        
                        value: long,
                    });
                    await Preferences.set({
                        key: 'id',        
                        value: id,
                    });
                    await Preferences.set({
                        key: 'name',
                        value: name,
                    });
                    await Preferences.set({
                        key: 'pass',
                        value: pass,
                    });
                };
                setName2()
                break;
            case 'unknown':
                await Toast.show({
                    text:"Se subirá tu solicitud cuando abras la app y te conectes a internet!",
                    duration: 'long'
                })
                const setName3 = async () => {
                    await Preferences.set({
                        key: 'lat',        
                        value: lat,
                    });
                    await Preferences.set({
                        key: 'long',        
                        value: long,
                    });
                    await Preferences.set({
                        key: 'id',        
                        value: id,
                    });
                    await Preferences.set({
                        key: 'name',
                        value: name,
                    });
                    await Preferences.set({
                        key: 'pass',
                        value: pass,
                    });
                };
                setName3()
                break;
        }
            break;
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
    window.addNetwork = addNetwork
    window.showqr = showqr

    }, false)