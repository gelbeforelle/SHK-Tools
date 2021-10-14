 

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
    let liatext;

    reader.readAsText(files[i]);
    reader.onloadend = function(){

        liatext = reader.result.toString("utf-8");
        console.log("Got data: " + liatext);
        var tests = importLia(liatext);
        var comp = document.getElementById("onyxmode").checked;
        console.log("Zipping...");
        var zip = new JSZip();
        for(let j=0; j<tests.length; j++){
            if(comp) {
                var simple = tests[j].compatibilityMode();
                for(let k=0; k<simple.length; k++){
                    console.log("Simple version: ");
                    console.log(simple[k].title);
                    zip.file(simple[k].title.replace(/[^a-zA-Z0-9 ]/g, "") + ".xml",new XMLSerializer().serializeToString(simple[k].toQTI()));
                }
            } else {
                zip.file(tests[j].title.replace(/[^a-zA-Z0-9 ]/g, "") + ".xml", new XMLSerializer().serializeToString(tests[j].toQTI()));
                
            }
            
        }
        zip.generateAsync({type:"blob"}).then(function (content) {
            saveAs(content, "Test.zip");
       });
        
    }
    
}
console.log("Result is: ", text);
if(text) alert("Result is: ", text);

}