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
    return i+1;
}


function importLia(){
    var active = [];
    console.log("script loaded");
    text="Füllen Sie \n die [[Lücke]] aus. \n    Eine Frage: \n [[x]] Erstens  \n [[X]] Zweitens \n [[]] Drittens \n [[ ]] Viertens \n  Bewertung: \n [()] Gut \n [(x)] Schlecht";
    let result = "";
    let array = Array.from(text);
    console.log(array);
    console.log("starting read");
    for(let i=0; i<array.length; i++){
        if(array[i]=="[" && array[i+1]=="["){
            for(let j=i; j<array.length; j++){
                if((array[j]=="]" && array[j+1]=="]")){
                    switch(j-i){
                        case 2 : active[active.length] = new Task(taskType.multipleChoice, false, readLine(array, j+2)); break;
                        case 3 : if(!array[i+2].localeCompare("x", undefined, { sensitivity: 'accent' })) result+= active[active.length] = new Task(taskType.multipleChoice, true, readLine(array, j+2));
                                 else if(array[i+2]==" ") active[active.length+1] = new Task(taskType.multipleChoice, false, readLine(array, j+2));
                                 else active[active.length] = new Task(taskType.text, false, array[i+2]); break;
                        default : result+="Lücke: ";
                                  let text ="";
                                  
                                  if(i+2<j) for(let k=i+2; k<j; k++) text += array[k];
                                  active[active.length+1] = new Task(taskType.text, false, text); break;
                                
                    }
                    i=nextLine(array, i);
                    break;
                } 
            }
        } else if(array[i]=="[" && array[i+1]=="("){
            for(let j=i; j<array.length; j++){
                if(array[j]==")" && array[j+1]=="]" && j-i < 4){
                    switch(j-i){
                        case 2 : active[active.length] = new Task(taskType.singleChoice, false, readLine(array, j+2)); break;
                        case 3 : if(!array[i+2].localeCompare("x", undefined, { sensitivity: 'accent' })) active[active.length] = new Task(taskType.singleChoice, true, readLine(array, j+2));
                                 else if(array[i+2] == " ") active[active.length] = new Task(taskType.singleChoice, false, readLine(array, j+2)); break;
                    }
                    i=nextLine(array, i);
                }
            }
        } else {
            active[active.length] = new Task(taskType.paragraph, false, readLine(array, i));
            i = nextLine(array, i);
        }
    }
    console.log(result);
    console.log(active);
}