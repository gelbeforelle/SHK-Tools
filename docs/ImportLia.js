
const ns = "http://www.imsglobal.org/xsd/imsqti_v2p1";

const taskType = {
    text: 0,
    multipleChoice: 1,
    singleChoice: 2,
    paragraph: 3,
    inlineChoice : 4
};

function textHandler(string){
    var isChoice = false;
    var answers = [];
    var correctAnswers = [];
    var isCorrect = false;
    var result;
    var array = Array.from(string);
    var j=0;

    for(var i=0; i<array.length; i++){
        if(array[i]=="|" || (isChoice && i+1 == array.length)){
            if(i>0){
                if(isChoice && i+1 == array.length) i++;
                isChoice ||= array[i-1] != "\\";
                if(isChoice){
                    var answer = "";
                    for(; j<i; j++){
                        answer += array[j];
                        console.log("inner loop");
                    }
                    j++;
                    var aux = answer.trim();
                    
                    if(aux.slice(0, 1) == "(" && aux.slice(-1) == ")"){
                        
                        isCorrect = true;
                        answer = answer.replace("(", "").replace(")", "");
                    }
                    answers[answers.length] = new InlineChoiceAnswer(answer, isCorrect);
                    var isCorrect = false;
                }
            }
        }
    }

    

    
    if(isChoice) result = new Task(taskType.inlineChoice, false, answers);
    else result = new Task(taskType.text, false, string);
    return result;
}


function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

function isNullOrUndefined(n){
    if(n==null ||typeof(n)=="undefined") return true;
    return false;
}

function idGen(){
 return "id-TUBAF-" + Date.now();
}

function ToHTML(string){
    var conv = new showdown.Converter();
    return conv.makeHtml(string).slice(3, -4);
}



var currType = taskType.text;



var doc = document.createElementNS(ns, "itemBody");

class InlineChoiceAnswer {
    constructor(name, isCorrect){
        this.isCorrect = isCorrect;
        this.name = name;
    }
}

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
    addTask(task){
        this.tasks[this.tasks.length] = task;
        if(task.type != taskType.paragraph){
             this.valid = true;
             
        }
    }

    splitCondition(i,  lastTask, lastType){
        

        var result = false;

        var breakFlag = false;
        var taskFlag = false;
        
        for(i++ ; i<this.tasks.length && !breakFlag; i++){
            if(this.tasks[i].type != taskType.paragraph){
                if(this.tasks[i].type != lastTask){
                     taskFlag = true;
                     break;
                }
                else if(this.tasks[i].type != lastType && this.tasks[i] != taskType.paragraph) return true;
                
                
            
            } else if(this.tasks[i].type==taskType.paragraph && this.tasks[i].isCorrect){
                if(isEmptyOrSpaces(this.tasks[i].text)) {
                    for(; i<this.tasks.length && this.tasks[i].type == taskType.paragraph; i++){
                        if(!isEmptyOrSpaces(this.tasks[i].text)) breakFlag = true;
                    }                  
                    
                } 
            }

        }
        
       // return (this.tasks[i].type != lastTask && this.tasks[i].type != taskType.paragraph) || ((this.tasks[i].type != lastTask || linebreak) && (this.tasks[i].type==taskType.singleChoice || this.tasks[i].type==taskType.multipleChoice));
       if(breakFlag) return false;
       else return taskFlag && !isNullOrUndefined(lastTask);
    }
    compatibilityMode(){

        // takes a Test class and returns smaller, non-composite tests in an array
        var result = [];
        var qti = [];
        var linebreak = false;
        var lastType;
        var lastTask;
        var lastIndex = 0;

        for(let i=0; i<this.tasks.length; i++){
            console.log(i, this.splitCondition(i, lastTask, lastType), lastTask,  this.tasks[i]);
            if(this.splitCondition(i, lastTask, lastType)){
                
                //console.log(this.tasks[i].type != lastType, this.tasks[i].type != lastTask && (this.tasks[i].type==taskType.singleChoice || this.tasks[i].type==taskType.multipleChoice));
                let newTest = new Test(this.title + " - " + result.length);

                for(let j=lastIndex; j<=i; j++) {
                    newTest.addTask(this.tasks[j]);
                }
                
                result[result.length] = newTest;

                lastIndex = i+1;

                lastTask = null;
            
            }

            if(this.tasks[i].type != taskType.paragraph) lastTask = this.tasks[i].type;
            lastType = this.tasks[i].type;

        }
        if(lastIndex != this.tasks.length-1){
            let newTest = new Test(this.title + " - " + result.length);

                for(let j=lastIndex; j<this.tasks.length; j++) {
                    newTest.addTask(this.tasks[j]);
                }
            if(newTest.valid) result[result.length] = newTest;
        }
        console.log("Array was: ");
        console.log(this.tasks);
        console.log("Compatibility mode split into the following elements: ");
        console.log(result);

        for(let i=0; i<result.length; i++){
            qti[i] = result[i].toQTI();
        }
        return result;
    }


    toQTI(){
        // converts test to xml document for ONYX
        
        var xmlDoc = document.implementation.createDocument("", "", null);
        
        var main = xmlDoc.createElementNS(ns, "assessmentItem");
        main.setAttribute("title", this.title);
        
        
        
        main.setAttribute("identifier", idGen());

        //main.setAttributeNS("qti", "xlmns", this.link);

        console.log(main);

        var taskcopy = this.tasks;
        var response;
        for(let i=0, lastType=taskType.paragraph; i<this.tasks.length; i++){
            
            if(this.tasks[i].type != taskType.paragraph) if(this.tasks[i].type != lastType || this.tasks[i].type == taskType.text || this.tasks[i].type == taskType.inlineChoice){
                if(response) main.appendChild(response);
                lastType = this.tasks[i].type;
                response = xmlDoc.createElementNS(ns, "responseDeclaration");
                response.setAttribute("identifier", "RESPONSE_"+i);
                response.setAttribute("baseType", "identifier")

                let cardinality;
                if(this.tasks[i].type == taskType.multipleChoice) cardinality = "multiple";
                else cardinality = "single";
                response.setAttribute("cardinality", cardinality);

                if(this.tasks[i].type == taskType.text){
                    let correct = xmlDoc.createElementNS(ns, "correctResponse");
                    let value = xmlDoc.createElementNS(ns, "value");
                    value.innerHTML = ToHTML(this.tasks[i].text);
                    correct.appendChild(value);
                    response.appendChild(correct);
                } else if(this.tasks[i].type == taskType.inlineChoice){
                    let correct = xmlDoc.createElementNS(ns, "correctResponse");
                    for(var j=0; j<this.tasks[i].text.length; j++){
                        //alert(this.tasks[i].text[j].name);
                        if(this.tasks[i].text[j].isCorrect) {
                            alert("correct");
                            let value = xmlDoc.createElementNS(ns, "value");
                            value.innerHTML = this.tasks[i].text[j].name;
                            correct.appendChild(value);
                        }
                    }
                    response.appendChild(correct);
                }

            } if((this.tasks[i].type == taskType.singleChoice || this.tasks[i].type == taskType.multipleChoice) && this.tasks[i].isCorrect) {
                if(response.getElementsByTagName("correctResponse").length<=0){
                    response.appendChild(xmlDoc.createElementNS(ns, "correctResponse"));
                    console.log("Created missing correctResponse!");
                }
                
                let value = xmlDoc.createElementNS(ns, "value");
                value.innerHTML = "ID_" + i;
                console.log("Data added:");
                console.log(value.innerText);
                console.log(this.tasks[i].text);

                response.getElementsByTagName("correctResponse")[0].appendChild(value);
            }
        }

        if(response) main.appendChild(response);
        let body = xmlDoc.createElementNS(ns, "itemBody");
        let currParagraph=xmlDoc.createElementNS(ns, "p");
        for(let i=0; i<this.tasks.length;){
            let entry;
            console.log("Starting switch... ", i);
            switch(this.tasks[i].type){
                case taskType.text : entry = xmlDoc.createElementNS(ns, "textEntryInteraction");
                                     entry.setAttribute("responseIdentifier", "RESPONSE_"+i);
                                     console.log("Text entry: ", entry.outerHTML);
                                     currParagraph.innerHTML+=entry.outerHTML;
                                     console.log(this.tasks[i]);
                                     i++;
                                     
                                     break;
                case taskType.inlineChoice : entry = xmlDoc.createElementNS(ns, "inlineChoiceInteraction");
                                             entry.setAttribute("responseIdentifier", "RESPONSE_"+i);
                                             for(var j=0; j<this.tasks[i].text.length; j++){
                                                 var choice = xmlDoc.createElementNS(ns, "inlineChoice");
                                                 choice.setAttribute("identifier", this.tasks[i].text[j].name);
                                                 choice.innerHTML = ToHTML(this.tasks[i].text[j].name);
                                                 entry.appendChild(choice);
                                             }
                                             currParagraph.innerHTML+=entry.outerHTML;
                                             i++;
                                             break;
                case taskType.multipleChoice : case taskType.singleChoice : if(currParagraph.innerHTML) body.appendChild(currParagraph);
                                               currParagraph = xmlDoc.createElementNS(ns, "p");
                                               entry = xmlDoc.createElementNS(ns, "choiceInteraction");
                                               entry.setAttribute("responseIdentifier", "RESPONSE_"+i);
                                               var cardinality = 1;
                                               if(this.tasks[i].type == taskType.multipleChoice) cardinality = 0;
                                               entry.setAttribute("maxChoices", cardinality);
                                               for(; i<this.tasks.length; i++){
                                                if(!(this.tasks[i].type == taskType.singleChoice || this.tasks[i].type == taskType.multipleChoice)) break;
                                                console.log("Adding to MC/ SC: ", this.tasks[i].text);
                                                let choice = xmlDoc.createElementNS(ns, "simpleChoice");
                                                choice.setAttribute("identifier", "ID_"+i);
                                                let p = xmlDoc.createElementNS(ns, "p");
                                                p.innerHTML=ToHTML(this.tasks[i].text);
                                                choice.appendChild(p);
                                                entry.appendChild(choice);
                                               }
                                               body.appendChild(entry);
                                               console.log(this.tasks[i]);
                                               
                                               break;
                case taskType.paragraph : if(this.tasks[i].isCorrect && this.tasks[i].text){
                                           body.appendChild(currParagraph);
                                           currParagraph = xmlDoc.createElementNS(ns, "p");
                                           currParagraph.innerHTML = ToHTML(this.tasks[i].text);
                                          } else {
                                            currParagraph.innerHTML += ToHTML(this.tasks[i].text);
                                          }
                                          console.log(this.tasks[i]);
                                          i++;
                                          
                                          break;
                default: console.log("Something went wrong.... ", this.tasks[i].type); i++; break;

            }
        }
        if(currParagraph.innerHTML) body.appendChild(currParagraph);
        main.appendChild(body);
        xmlDoc.appendChild(main);
       // xmlDoc.appendChild(node);
        console.log(xmlDoc.childNodes);
        var paragraphs = xmlDoc.querySelectorAll("p");
        
        
        //console.log(addResponseProcessing(xmlDoc));
        return xmlDoc;
    }
   

}

function readLine(array, index){
    let result="";
    console.log("Performing read line between ", array.length, index);
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
    
    // imports Lia Text and creates Tests in an array
    console.log("importing lia for read");
    let array = Array.from(lia);
    console.log(array);
    let currPage = "";
    let title = "";
    let result = [];
    let hasTitle = false;
    for(var i=0; i<array.length; i++){
        //different condtions could be set here!
        if((array[i] == "#" && array[i-1] != "\\" ) || i==array.length-1){
            if(i==array.length-1) currPage+=array[i];
            result[result.length] = parsePage(currPage, new Test(title));
            currPage = "";
            title = "";  
            hasTitle = false;
        } else{
            if(array[i]=="\n") hasTitle = true;
            if(hasTitle) {
                switch(array[i]){
                    case "\r" : currPage += ""; break;
                    case "\t" : currPage += "    "; break;
                    default: currPage += array[i]; 
                }
            }
            else title += array[i];
            
        }
    }
    console.log(result);

    return result;
    
}

function parsePage(text, test){

    // parses a slide in the lia script, returns a test
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
                                 else test.addTask(new Task(taskType.text, false, array[i+2])); break;
                        default : console.log("Text Task detected");
                                  let k=0;
                                  let text ="";
                                  for(let l=linestart+1; l<i; l++){
                                    text+=array[l];
                                  }
                                  test.addTask(new Task(taskType.paragraph, false, text));
                                  text="";
                                  if(i+2<j) for(k=i+2; k<j; k++) text += array[k];
                                  test.addTask(textHandler(text)); 
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
            console.log("Paragraph: ", readLine(array, i));
            
            test.addTask(new Task(taskType.paragraph, true, readLine(array, linestart+1)));
            linestart = i;
        }
    }
    console.log("Finished reading");
    

    
    console.log(test);
    return test;
}