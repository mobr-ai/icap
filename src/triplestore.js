import { Store, parse, SPARQLToQuery } from 'rdflib'

//in-memory triplestore
var tStore

function initStore(iconto) {
    tStore = new Store()
    var uri = 'http://www.mobr.ai/ontologies/iconto#'
    var mimeType = 'text/turtle'

    try {
        parse(iconto, tStore, uri, mimeType)
        console.log("parse done")

    } catch (err) {
        console.log(err)
    }
}


//function match() {
    // tStore.query(query, result => {
    //     console.log("result")
    //     console.log(result["?s"].value)
    // })
    // const allTriples = tStore.statementsMatching(undefined, undefined, undefined);
    // allTriples.forEach(function(triple) {
    //     if(triple.object.termType === "NamedNode") {
    //         console.log('<' + triple.object.uri) + '>';
    //     }
    //     else  {
    //         console.log('\'' + triple.object.value + '\'');
    //     }
    // })
//}


function queryStore(strSparql) {
    if (tStore.length == 0) {
        console.log("triplestore is empty")
        return ""
    }
    console.log("triplestore size is")
    console.log(tStore.length)

    try {
        const query = SPARQLToQuery(strSparql, null, tStore)
        if (query === false) {
            console.log("invalid query")
            return "invalid sparql query"
        }
        console.log(query)
        var vArr = []
        const vars = query["vars"]
        for (var i=0; i < vars.length; i++) {
            vArr.push("?" + vars[i]["value"])
        }

        if (!vArr.length) {
            return ""
        }

        const res = tStore.querySync(query)
        var strRes = "{"
        for (var i=0; i < res.length; i++) {
            if (strRes != "{") {
                strRes = strRes + ", "
            }

            var strRow = ""
            for (var j=0; j < vArr.length; j++) {
                if (res[i].hasOwnProperty(vArr[j])) {
                    const key = vArr[j]
                    if (strRow != "") {
                        strRow = strRow + ", "
                    }
                    strRow = strRow + '"' + key + '": "' + res[i][key]["value"] + '"'    
                }
            }            
            if (strRow != "") {
                strRes = strRes + i.toString() + ": {" + strRow + "}"
            }    
        }
        return strRes + "}"

    } catch (err) {
        console.log(err)
    }
    return ""
}

export {initStore, queryStore}
