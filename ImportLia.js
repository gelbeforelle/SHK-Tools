const taskType = {
    text: 0,
    multipleChoice: 1,
    singleChoice: 2,
    paragraph: 3
};

function idGen(){
 return "id-TUBAF-" + Date.now();
}


const xmlns = "http://www.imsglobal.org/xsd/imsqti_v2p1";

var currType = taskType.text;

var doc = document.createElement("itemBody");

class Task {
    constructor(type, isCorrect, text) {
        this.type = type;
        this.isCorrect = isCorrect;
        this.text = text;
        
    }
}

class Test {
    

   // head = `<assessmentItem title="${title}" timeDependent="false" adaptive="false" identifier="id75621a10-12f5-4c51-962c-fe9866df6b3e" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1p1.xsd http://www.w3.org/1998/Math/MathML http://www.w3.org/Math/XMLSchema/mathml2/mathml2.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1">`;
    
    constructor(title){
        if(title) this.title = title;

        else this.title = "Unnamed test";
        this.tasks = [];
        this.valid = false;
    }

    parseResponse(lastType, i, xmlDoc, main){
        var response;
        if(this.tasks[i].type != taskType.paragraph) if(this.tasks[i].type != lastType || this.tasks[i].type == taskType.text){
            
            lastType = this.tasks[i].type;
            response = xmlDoc.createElement("responseDeclaration");
            response.setAttribute("identifier", "RESPONSE_"+i);

            let cardinality;
            if(this.tasks[i].type == taskType.multipleChoice) cardinality = "multiple";
            else cardinality = "single";
            response.setAttribute("cardinality", cardinality);

            if(this.tasks[i].type == taskType.text){
                let correct = xmlDoc.createElement("correctResponse");
                let value = xmlDoc.createElement("value");
                value.innerHTML = this.tasks[i].text;
                correct.appendChild(value);
                response.appendChild(correct);
            }

        } if((this.tasks[i].type == taskType.singleChoice || this.tasks[i].type == taskType.multipleChoice) && this.tasks[i].isCorrect) {
            if(response) if(response.getElementsByTagName("correctResponse").length<=0){
                response.appendChild(xmlDoc.createElement("correctResponse"));
                console.log("Created missing correctResponse!");
            }
            
            let value = xmlDoc.createElement("value");
            value.innerHTML = "ID_" + i;
            console.log("Data added:");
            console.log(value.innerText);
            console.log(this.tasks[i].text);

            if(response) response.getElementsByTagName("correctResponse")[0].appendChild(value);
        }
        if(response) main.appendChild(response);
        return { lastType : lastType, i : i, main : main} ;
    }

    parseTask(xmlDoc, body, currParagraph, i){
        let entry;
        switch(this.tasks[i].type){
            case taskType.text : entry = xmlDoc.createElement("textEntryInteraction");
                                 entry.setAttribute("responseIdentifier", "RESPONSE_"+i);
                                 console.log("Text entry: ", entry.outerHTML);
                                 currParagraph.innerHTML+=entry.outerHTML;
                                 console.log(this.tasks[i]);
                                 i++;
                                 
                                 break;
            case taskType.multipleChoice : case taskType.singleChoice : if(currParagraph.innerHTML) body.appendChild(currParagraph);
                                           currParagraph = xmlDoc.createElement("p");
                                           entry = xmlDoc.createElement("choiceInteraction");
                                           entry.setAttribute("responseIdentifier", "RESPONSE_"+i);
                                           for(; i<this.tasks.length; i++){
                                            if(!(this.tasks[i].type == taskType.singleChoice || this.tasks[i].type == taskType.multipleChoice)) break;
                                            console.log("Adding to MC/ SC: ", this.tasks[i].text);
                                            let choice = xmlDoc.createElement("simpleChoice");
                                            choice.setAttribute("identifier", "ID_"+i);
                                            let p = xmlDoc.createElement("p");
                                            p.innerHTML=this.tasks[i].text;
                                            choice.appendChild(p);
                                            entry.appendChild(choice);
                                           }
                                           body.appendChild(entry);
                                           console.log(this.tasks[i]);
                                           
                                           break;
            case taskType.paragraph : if(this.tasks[i].isCorrect && this.tasks[i].text){
                                       body.appendChild(currParagraph);
                                       currParagraph = xmlDoc.createElement("p");
                                       currParagraph.innerHTML = this.tasks[i].text;
                                      } else {
                                        currParagraph.innerHTML += this.tasks[i].text;
                                      }
                                      console.log(this.tasks[i]);
                                      i++;
                                      
                                      break;
            default: console.log("Something went wrong.... ", this.tasks[i].type); i++; break;

        }
        return i;
    }

    addTask(task){
        this.tasks[this.tasks.length] = task;
        if(task.type != taskType.paragraph){

             this.valid = true;
             
        }
    }
    toQTI2(){
        let xmlDoc = document.implementation.createDocument("", "", null);
       
        var body = xmlDoc.createElement("itemBody");
        var currParagraph=xmlDoc.createElement("p");
        var main = xmlDoc.createElement("assessmentItem");
        
        for(let i=0, lastType=taskType.paragraph, lastIndex=0; i<this.tasks.length; i++){
            for(;i<this.tasks.length; i++){
                if(this.tasks[i].type != lastType && this.tasks[i].type != taskType.paragraph){
                    main.append(body);
                
                    download("Test of alternative parser", main.outerHTML);
                    console.log("IMPORTANT#######################");
                    console.log(main);
                    
                    body = xmlDoc.createElement("itemBody");
                    currParagraph=xmlDoc.createElement("p");
                    main = xmlDoc.createElement("assessmentItem");
                    break;
                }
                

                var returned = this.parseResponse(lastType, i, xmlDoc, main);

                if(this.tasks[i].type != taskType.paragraph) i = this.parseTask(xmlDoc, body, currParagraph, i);
                
                main = returned.main;
                lastType = returned.lastType;

                if(i<this.tasks.length && this.tasks[i].type == taskType.paragraph){
                    for(;i<this.tasks.length && this.tasks[i].type == taskType.paragraph; i++){
                        currParagraph.innerHTML += this.tasks[i].text;
                        
                        if(this.tasks[i].isCorrect) break;
                    }
                }
                if(currParagraph.innerHTML) body.appendChild(currParagraph);

                
            }

           /* if(this.tasks[i].type != lastType && this.tasks[i].type != taskType.paragraph){
                // Doc parser
                
                //if(currParagraph.innerHTML) body.appendChild(currParagraph);
                
                
                lastIndex=i;
                
                
                
                
            
                
                
                

                
                
                
                
            } else if(this.tasks[i].type == taskType.paragraph){
                if(this.tasks[i].isCorrect && this.tasks[i].text){
                    if(currParagraph) body.appendChild(currParagraph);
                    currParagraph = xmlDoc.createElement("p");
                    currParagraph.innerHTML = this.tasks[i].text;
                   } else {
                     currParagraph.innerHTML += this.tasks[i].text;
                   }
                   console.log(this.tasks[i]);
                   


            }
            */
        }
    }

    toQTI(){
        var xmlDoc = document.implementation.createDocument("", "", null);
        var main = xmlDoc.createElement("assessmentItem");
        main.setAttribute("title", this.title);
        main.setAttribute("identifier", idGen());
        main.setAttribute("xmlns", xmlns);
        
        var response;

        for(let i=0, lastType=taskType.paragraph; i<this.tasks.length; i++){
            let returned = this.parseResponse(lastType, i, xmlDoc, main);
            lastType = returned.lastType;
            i = returned.i;
            main = returned.main;
        }

        //new function here!
        if(response) main.appendChild(response);
        let body = xmlDoc.createElement("itemBody");
        let currParagraph=xmlDoc.createElement("p");
        for(let i=0; i<this.tasks.length;){
            i = this.parseTask(xmlDoc, body, currParagraph, i);
            console.log("Starting switch... ", i);
            
        }
        if(currParagraph.innerHTML) body.appendChild(currParagraph);
        main.appendChild(body);
        xmlDoc.appendChild(main);
       // xmlDoc.appendChild(node);
        console.log(xmlDoc.childNodes);
        return xmlDoc;
    }
   

}

function readLine(array, index){
    let result="";
    for(let i=index; i<array.length; i++){
        if(array[i]=="\n") break;
        result+=array[i];
    }
    return result;
}

function nextLine(array, index){
    let i=index
    for(; i<array.length; i++){
        if(array[i]=="\n") break;
    }
    return i;
}

function importLia(lia){
    
    console.log("importing lia for read");
    let array = Array.from(lia);
    console.log(array);
    let currPage = "";
    let title = "";
    let result;
    let hasTitle = false;
    for(var i=0; i<array.length; i++){
        //different condtions could be set here!
        if((array[i] == "#" && array[i-1] != "\\" ) || i==array.length-1){
            result += parsePage(currPage, new Test(title));
            currPage = "";
            title = "";  
            hasTitle = false;
        } else{
            if(array[i]=="\n") hasTitle = true;
            if(hasTitle) currPage += array[i];
            else title += array[i];
            
        }
    }
    console.log(result);
    
}

function parsePage(text, test){
    var active = [];
    let hasTask = false;
    let linestart=0;

    console.log("parsing lia page");
    //text="Füllen Sie \r\n die [[Lücke]] aus. \r\n    Eine Frage: \r\n [[x]] Erstens  \r\n [[X]] Zweitens \r\n [[]] Drittens \r\n [[ ]] Viertens \r\n  Bewertung: \r\n [()] Gut \r\n [(x)] Schlecht";
    let result = "";
    let array = Array.from(text);
    console.log(array);
    
    
    console.log("starting read");
    for(let i=0; i<array.length; i++){
        if(array[i]=="[" && array[i+1]=="["){
            console.log("detected brackets");
            for(let j=i; j<array.length; j++){
                if((array[j]=="]" && array[j+1]=="]")){
                    switch(j-i){
                        case 2 : test.addTask(new Task(taskType.multipleChoice, false, readLine(array, j+2))); break;
                        case 3 : if(!array[i+2].localeCompare("x", undefined, { sensitivity: 'accent' })) test.addTask(new Task(taskType.multipleChoice, true, readLine(array, j+2)));
                                 else if(array[i+2]==" ") test.addTask(new Task(taskType.multipleChoice, false, readLine(array, j+2)));
                                 else test.addTask(new Task(taskType.text, true, array[i+2])); break;
                        default : console.log("Text Task detected");
                                  let k=0;
                                  let text ="";
                                  for(let l=linestart; l<i; l++){
                                    text+=array[l];
                                  }
                                  test.addTask(new Task(taskType.paragraph, false, text));
                                  text="";
                                  if(i+2<j) for(k=i+2; k<j; k++) text += array[k];
                                  test.addTask(new Task(taskType.text, false, text)); 
                                  text="";
                                  for(let l=k+2; l<array.length; l++){
                                      if(array[l]=="\n") break;
                                    text+=array[l];
                                  }
                                  test.addTask(new Task(taskType.paragraph, false, text)); break;
                                
                    }
                    i=nextLine(array, i);
                    linestart = i;
                    break;
                } 
            }
        } else if(array[i]=="[" && array[i+1]=="("){
            for(let j=i; j<array.length; j++){
                if(array[j]==")" && array[j+1]=="]" && j-i < 4){
                    switch(j-i){
                        case 2 : test.addTask(new Task(taskType.singleChoice, false, readLine(array, j+2))); break;
                        case 3 : if(!array[i+2].localeCompare("x", undefined, { sensitivity: 'accent' })) test.addTask(new Task(taskType.singleChoice, true, readLine(array, j+2)));
                                 else if(array[i+2] == " ") test.addTask(new Task(taskType.singleChoice, false, readLine(array, j+2))); break;
                    }
                    
                    i=nextLine(array, i);
                    linestart=i;
                }
            }
        } else if(array[i]=="\n"){
            console.log(readLine(array, i));
            
            test.addTask(new Task(taskType.paragraph, true, readLine(array, linestart)));
            linestart = i;
        }
    }
    console.log("Finished reading");
    
    var content = test.toQTI();
    if(test.valid && content != undefined){
        
        download(test.title, content.childNodes[0].outerHTML);
    }
    console.log(test);
    test.toQTI2();
}