import { icap } from "../../declarations/icap";
import Prism from 'prismjs';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-turtle';
import 'prismjs/components/prism-sparql';

function addElement(el, elClass=null) {
  // get current selection and its range
  const selection = window.getSelection();
  const range = selection.getRangeAt(0); 

  // create element node
  const elNode = document.createElement(el);
  if(elClass){
    elNode.classList.add(elClass);
  }

  // insert <element> at current cursor position
  range.insertNode(elNode);

  // set the start of the range to the position after <element>
  range.setStartAfter(elNode);

  // collapse the range to the position after <element>
  range.collapse(true);

  // remove any existing ranges from the selection
  selection.removeAllRanges();

  // add the modified range to the selection
  selection.addRange(range);
}

function saveCaretPosition(context){
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  range.setStart(  context, 0 );
  var len = range.toString().length;

  return function restore(){
      var pos = getTextNodeAtPosition(context, len);
      selection.removeAllRanges();
      var range = new Range();
      range.setStart(pos.node ,pos.position);
      selection.addRange(range);

  }
}

function getTextNodeAtPosition(root, index){
  const NODE_TYPE = NodeFilter.SHOW_TEXT;
  var treeWalker = document.createTreeWalker(root, NODE_TYPE, function next(elem) {
      if(index > elem.textContent.length){
          index -= elem.textContent.length;
          return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT;
  });
  var c = treeWalker.nextNode();
  return {
      node: c? c: root,
      position: index
  };
}

function highlight(event){
  var restoreCaret = saveCaretPosition(event.srcElement);

  // The sparql snippet to highlight as a string
  let query = document.getElementById("query").innerText;
  console.log("Formatting str=" + query);
  
  // Returns a highlighted HTML string
  const html = Prism.highlight(query, Prism.languages.sparql, 'sparql');

  // Set formated html
  document.getElementById("query").innerHTML = '<div><pre><code>'+html+'</code></pre></div>';

  restoreCaret();
}

function displayResults(result){
  if(!result || result == ""){
    result = "{}";
  }
  let json = JSON.parse(result);
  let resultSection = document.getElementById("results");
  let table = document.getElementById('result-table');

  // clear any previous results
  let msg = document.getElementsByClassName("result-msg")[0];
  if(msg){
    msg.remove();
  }
  while(table.firstChild){
    table.removeChild(table.firstChild);
  }

  // create headers
  if(Object.keys(json).length){
    let headerLabels = Object.keys(json[0]);
    headerLabels.unshift('#')
    let row = document.createElement("tr");
    for (var i in headerLabels){
      let hcell = document.createElement("th");
      hcell.innerHTML = headerLabels[i];
      row.appendChild(hcell);
    }
    table.appendChild(row);

    // create rows
    for (var i in json) {
      row = document.createElement("tr");
      let rowData = Object.values(json[i]);
      let tcell = document.createElement("td");
      tcell.innerHTML = Number(i)+1;
      row.appendChild(tcell);
      for (var d in rowData) {
        tcell = document.createElement("td");
        tcell.innerHTML = rowData[d];
        row.appendChild(tcell);
      }
      table.appendChild(row);
    }

    // show table
    document.getElementById("result-table").style.display = '';
  }
  else {
    // hide table
    document.getElementById("result-table").style.display = 'none';

    // create result msg
    let msg = document.createElement('p');
    msg.classList.add('result-msg')
    msg.innerHTML = "No results for this query!";
    resultSection.appendChild(msg);
  }
}

var animate = true;
function toggleAnimation(){
  if(!animate){
    document.querySelector("ul").style.display = "";
    document.querySelector("#toggle-animation").innerHTML = "Hide Background";
    animate = true;
  }
  else {
    document.querySelector("ul").style.display = "none";
    document.querySelector("#toggle-animation").innerHTML = "Show Background";
    animate = false;
  }
}

// add event handlers
window.onload = () => {
  const img = document.getElementById("logo");
  if(img.complete){
    document.getElementById("logo").style.display = "block";
    document.getElementById("logo").style.visibility = "visible";
  } else {
    img.onload = () => {
      document.getElementById("logo").style.display = "block";
      document.getElementById("logo").style.visibility = "visible";
    }
  }
}
// img.addEventListener("mouseover", function(evt){
//   this.src='icap.gif';
// });
// img.addEventListener("mouseout", function(evt){
//   this.src='icap.png';
// });

document.getElementById("query").addEventListener("keydown", function (evt) {
  if (evt.key == "Enter" && !evt.shiftKey) {
    evt.preventDefault();
    addElement('br');
  }
  else if(evt.key == "Tab"){
    evt.preventDefault();
    addElement('span', 'tab');
  }
});

document.getElementById("query").addEventListener("input", highlight);

document.getElementById("toggle-animation").addEventListener("click", toggleAnimation);

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");

  const query = document.getElementById("query").textContent;

  button.setAttribute("disabled", true);

  // interact with backend, calling the query method
  const result = await icap.sparqlQuery(query);

  button.removeAttribute("disabled");

  // format results
  displayResults(result);

  return false;
});
