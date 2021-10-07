const taskType = {
    text: 0,
    multipleChoice: 1,
    singleChoice: 2,
    paragraph: 3
};

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
    addTask(task){
        this.tasks[this.tasks.length] = task;
        if(task.type != taskType.paragraph){
             this.valid = true;
             
        }
    }
    toQTI(){
        var xmlDoc = document.implementation.createDocument("", "", null);
        var node = xmlDoc.createElement("test");
        xmlDoc.appendChild(node);
        console.log(xmlDoc.childNodes);
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
    console.log(test);
    test.toQTI();
}