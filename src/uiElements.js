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
import {enableProgressBar} from './main.js'


var datatoggle = document.querySelector("#mobile-data")
let darkM = (await DarkMode.isDarkMode()).dark
var nameInput = document.querySelector("#nameInput")
var passInput = document.querySelector("#passInput")
document.addEventListener('deviceready',async () => {
//Solo variables antes de estas 2 lineas
    nameInput.addEventListener('ionInput', (ev) => {
        const value = ev.target.value;
        Preferences.set({
            key: "nameInput",
            value: value
        })
    });
    passInput.addEventListener('ionInput', (ev) => {
        const value = ev.target.value;
        Preferences.set({
            key: "passInput",
            value: value
        })
    });
    datatoggle.addEventListener('ionChange', async (event)=>{
        const estado = event.detail.checked
        await Preferences.set({
            key: 'mobile-data',        
            value: `${estado}`,
        });
        console.log(estado)
    });
    async function loadConfigModal() {
        var modal = document.getElementById("config-modal")
        var mobiletoggle = document.querySelector("#mobile-data")
        var configsCont = document.querySelector("#configs-cont")
        if(darkM == true){
            modal.style.setProperty('--ion-background-color', '#1e2023');
            modal.style.setProperty('--ion-text-color', '#ffffff');
            mobiletoggle.setAttribute("color","light")
            configsCont.setAttribute("color","dark")
        }
        var mobilepref = await Preferences.get({key: "mobile-data"})
        if(mobilepref.value){
            mobiletoggle.setAttribute("checked",mobilepref.value)
        }
    }
    function closeConfig() {
        var modal = document.querySelector('#config-modal');
        modal.dismiss(null, 'cancel');
        enableProgressBar(true)
        setInterval(()=>{
            enableProgressBar(false)
        },1000)
    }
    async function addNetwork(){
        var url = "https://wifimap.alwaysdata.net/addnetworks.php"
        const coordinates = await Geolocation.getCurrentPosition();
        const long = " "+coordinates.coords.longitude
        const lat = " "+coordinates.coords.latitude
        const id = " "+Math.floor(Math.random() * 10000)
        var name = (await Preferences.get({key:"nameInput"}))
        var pass = (await Preferences.get({key:"passInput"}))
        name = name.value
        pass = pass.value
        console.log("name: "+name)
        console.log("pass: "+pass)
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

    }
    async function loadAddNetwork(){
        var modal = document.getElementById("addNetwork-modal")
        var nameInput = document.querySelector("#nameInput")
        var passInput = document.querySelector("#passInput")
        var addNetworkCont = document.querySelector("#addNetwork-cont")
        if(darkM == true){
            modal.style.setProperty('--ion-background-color', '#1e2023');
            modal.style.setProperty('--ion-text-color', '#ffffff');
            nameInput.setAttribute("color","light")
            passInput.setAttribute("color","light")
            nameInput.style.setProperty("--color","white")
            passInput.style.setProperty("--color","white")
            addNetworkCont.setAttribute("color","dark")
        }
    }
    async function closeAddNetwork (){
        var modal = document.querySelector('#addNetwork-modal');
        modal.dismiss(null, 'cancel');
        enableProgressBar(true)
        setInterval(()=>{
            enableProgressBar(false)
        },1000)   
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
    
    //No poner funciones despues de estas lineas
    window.showqr = showqr
    window.closeConfig = closeConfig
    window.loadConfigModal = loadConfigModal
    window.loadAddNetwork = loadAddNetwork
    window.addNetwork = addNetwork
    window.closeAddNetwork = closeAddNetwork

}, false)