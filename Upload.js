function upload(){
    console.log("Upload script triggered");
var files = document.getElementById('xmlupload').files;
const formData = new FormData();

let text = "";
for(let i=0; i<files.length; i++){
    console.log("Detected file " +files[i].name);
    let reader = new FileReader();
    reader.readAsText(files[i]);
    let xmlData;
    reader.onloadend = function(){
        xmlData = reader.result;
        console.log("Got data: " + xmlData);
        text = XMLDOM(xmlData);
        document.getElementById("liafield").textContent = text;
        //alert("Resulting text is: " + text);
    }
    
}

}

function liaUpload(){
    console.log("Lia Upload-Script triggered");
    var files = document.getElementById('xmlupload').files;
const formData = new FormData();

let text = "";
for(let i=0; i<files.length; i++){
    console.log("Detected file " +files[i].name);
    let reader = new FileReader();
    reader.readAsText(files[i]);
    let liatext;
    reader.onloadend = function(){
        liatext = reader.result;
        console.log("Got data: " + liatext);
        text += importLia(liatext);
        console.log("This file contains: ", text);
    }
    
}
console.log("Result is: ", text);
if(text) alert("Result is: ", text);

}