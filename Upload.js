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