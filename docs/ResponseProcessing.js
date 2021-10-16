

function addResponseProcessing(xmlDoc){
    var declaration = xmlDoc.getElementsByTagName("responseDeclaration");
    var responses = xmlDoc.querySelectorAll("[responseIdentifier]");
    var responseIDs = [];
    var body = xmlDoc.getElementsByTagName("itemBody")[0];
    var assessment = xmlDoc.getElementsByTagName("assessmentItem")[0];
    var scoreCounter = 0;

    for(var ID of responses){
        responseIDs[responseIDs.length] = ID.getAttribute("responseIdentifier");
    }

    

    for(var i=0; i<declaration.length; i++){
        if(responseIDs.includes(declaration[i].getAttribute("identifier"))){
            var node = xmlDoc.createElementNS(ns, "outcomeDeclaration");
            var child = xmlDoc.createElementNS(ns, "defaultValue");
            var value = xmlDoc.createElementNS(ns, "value");
            value.innerHTML = "0";
            child.appendChild(value);
            node.appendChild(child);

            node.setAttribute("identifier", "SCORE_"+i);
            node.setAttribute("cardinality", "single");
            node.setAttribute("baseType", "float");
            assessment.insertBefore(node, body);

        }
    }

    var node = xmlDoc.createElementNS(ns, "outcomeDeclaration");
            var child = xmlDoc.createElementNS(ns, "defaultValue");
            var value = xmlDoc.createElementNS(ns, "value");
            value.innerHTML = "0";
            child.appendChild(value);
            node.appendChild(child);
            
            node.setAttribute("identifier", "SCORE");
            node.setAttribute("cardinality", "single");
            node.setAttribute("baseType", "float");
            assessment.insertBefore(node, body);
    
    


    var processing = xmlDoc.createElementNS(ns, "responseProcessing");
    var generalSum = xmlDoc.createElementNS(ns, "sum");
    for(var i=0; i<declaration.length; i++){
        if(responseIDs.includes(declaration[i].getAttribute("identifier"))){
            var condition = xmlDoc.createElementNS(ns, "responseCondition");
            var rIf = xmlDoc.createElementNS(ns, "responseIf");
            var isNull = xmlDoc.createElementNS(ns, "isNull");
            var match = xmlDoc.createElementNS(ns, "match");
            var variable = xmlDoc.createElementNS(ns, "variable");
            var correct = xmlDoc.createElementNS(ns, "correct");
            var sum = xmlDoc.createElementNS(ns, "sum");
            var outcome = xmlDoc.createElementNS(ns, "setOutcomeValue");
            var baseValue = xmlDoc.createElementNS(ns, "baseValue");

            

            baseValue.setAttribute("baseType", "float");
            baseValue.innerHTML = "1";

            
            variable.setAttribute("identifier", "RESPONSE_"+i);
            correct.setAttribute("identifier", "RESPONSE_"+i);
            match.appendChild(variable);
            match.appendChild(correct);

            outcome.setAttribute("identifier", "SCORE_"+i);
            outcome.appendChild(baseValue);

            rIf.appendChild(match);
            rIf.appendChild(outcome);
            
            condition.appendChild(rIf);
            processing.appendChild(condition);

            variable.setAttribute("identifier", "SCORE_" + i);
            generalSum.appendChild(variable);
            scoreCounter ++;
            
        }
        
        
    }

    node = xmlDoc.createElementNS(ns, "outcomeDeclaration");
        var score = xmlDoc.createElementNS(ns, "value");
        score.innerHTML = scoreCounter.toString();
        node.setAttribute("identifier", "MAXSCORE");
        node.appendChild(score);
        assessment.insertBefore(node, body);

    var generalCondition = xmlDoc.createElementNS(ns, "responseCondition");
    var generalOutcome = xmlDoc.createElementNS(ns, "setOutcomeValue");
    generalOutcome.setAttribute("identifier", "SCORE");
    generalOutcome.appendChild(generalSum);
    generalCondition.appendChild(generalOutcome);

    processing.appendChild(generalCondition);

    assessment.appendChild(processing);

    
}