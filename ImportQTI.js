function parseParagraph(paragraph, xmlDoc){
	let children = paragraph.childNodes;
	console.log(children.length);
	let result = "";
	for(let i=0; i<children.length; i++){
		console.log("Reading " + children[i].tagName);
		if(children[i].tagName != "textEntryInteraction") {
			result += children[i].innerHTML??children[i].textContent;
			console.log("adding "+children[i].innerHTML??children[i].textContent);
		}
		else{
			
			result += "[[" + xmlDoc.querySelector("responseDeclaration[identifier=" + CSS.escape(children[i].getAttribute("responseIdentifier")) + "] > correctResponse > value").textContent + "]]";
			
		}
	}
	return result + "\n";
}


function XMLDOM(file){
	let result = "";
	console.log("running file parser");
	let parser = new DOMParser (),
			xmlDoc = parser.parseFromString (file, 'text/xml');
			console.log(xmlDoc);
			console.log("doc parsed");
			
			
			let array1 = xmlDoc.getElementsByTagName("itemBody");
			console.log("array length " + array1.length);
			let array = array1[0].getElementsByTagName("*");
			for(let i=0; i<array.length; i++){
				console.log("detected " + array[i].tagName);
				if(array[i].tagName == "p") result += parseParagraph(array[i], xmlDoc);
				else if(array[i].tagName == "choiceInteraction"){
					// start of choiceInteraction Parser
					console.log("choiceIneraction detected");
					if(array[i].maxChoices == "1"){
						var ob = "(";
						var cb = ")";
					} 
					else
					{
						var ob = "[";
						var cb = "]";
					}
					let answers = array[i].getElementsByTagName("simpleChoice");
					console.log(answers.length + " answers detected");
					for(let j=0; j<answers.length; j++){
						console.log("id is "+array[i].getAttribute("responseIdentifier") + " on answer " + answers[j].getAttribute("identifier"));
						
						let corrects = xmlDoc.querySelectorAll("responseDeclaration[identifier=" + CSS.escape(array[i].getAttribute("responseIdentifier")) + "] > correctResponse > value");
						console.log("Query found " + corrects.length + " correct answers");
						let space = " ";
						for(let k=0; k<corrects.length; k++){
							console.log("Checking answer " + answers[j].getAttribute("identifier") + " and " + corrects[k].textContent);
							if(answers[j].getAttribute("identifier") == corrects[k].textContent){
								space = "x";
								console.log("Answer with ID " + answers[j].getAttribute("identifier") +" is correct");
								
							}
						}
						result += "[" + ob + space + cb + "] " + answers[j].innerHTML + "\n";
					}
				}
				//end of choiceInteraction parser
				
			}

		console.log(result);
		return result;
}

