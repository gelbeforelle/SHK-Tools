 

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
    console.log(files.length);
if(files.length<1) window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1");
const formData = new FormData();

let text = "";
for(let i=0; i<files.length; i++){
    console.log("Detected file " +files[i].name);
    let reader = new FileReader();
    let liatext;

    reader.readAsText(files[i]);
    reader.onloadend = function(){



        liatext = reader.result.toString("utf-8");
        
        downloadZip(liatext);
        
    }
    
}
console.log("Result is: ", text);
//if(text) alert("Result is: ", text);

}