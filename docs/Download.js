function download(filename, text){
    var element = document.createElement("a");
    element.setAttribute("href", "data:application/zip;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function downloadZip(liatext){
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

