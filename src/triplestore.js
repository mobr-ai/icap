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

function getLimit(strSparql) {
    var limit = 0
    const lss = strSparql.toLowerCase()
    const slss = lss.split("limit")
    if (slss.length == 2) {
        limit = Number(slss[1].trim())
    }
    return limit
}

function getOrderBy(strSparql, hasLimit) {
    var orderBy = ''
    var desc = false
    var lss = strSparql.toLowerCase()
    if (hasLimit) {
        lss = lss.split("limit")[0]
    }
    const slss = lss.split("order by")
    if (slss.length == 2) {
        orderBy = slss[1].trim()
        if (orderBy.search("desc") >= 0) {
            desc = true
            orderBy = orderBy.replace("desc(", "").replace(")", "")
        }
    }
    return [orderBy, desc]
}

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

        var vArr = []
        const vars = query["vars"]
        for (var i=0; i < vars.length; i++) {
            vArr.push("?" + vars[i]["value"])
        }

        if (!vArr.length) {
            console.log("query has no variable spec")
            return ""
        }

        var limit = getLimit(strSparql)
        const res = tStore.querySync(query)
        const orderBy = getOrderBy(strSparql, limit > 0)
        var sortedRes = res
        if (orderBy[0] != '') {
            const sortBy = orderBy[0]
            const desc = orderBy[1]
            if (desc) {
                sortedRes = res.sort((b, a) => a[sortBy] - b[sortBy])
            }
            else {
                sortedRes = res.sort((a, b) => a[sortBy] - b[sortBy])
            }            
        }
        if (limit == 0) {
            limit = sortedRes.length
        }
        var strRes = "{"
        for (var i=0; i < limit; i++) {
            if (strRes != "{") {
                strRes = strRes + ", "
            }

            var strRow = ""
            for (var j=0; j < vArr.length; j++) {
                if (sortedRes[i].hasOwnProperty(vArr[j])) {
                    const key = vArr[j]
                    if (strRow != "") {
                        strRow = strRow + ", "
                    }
                    strRow = strRow + '"' + key + '": "' + sortedRes[i][key]["value"] + '"'    
                }
            }
            if (strRow != "") {
                strRes = strRes + '"' + i.toString() + '"' + ": {" + strRow + "}"
            }    
        }
        return strRes + "}"

    } catch (err) {
        console.log(err)
    }
    return ""
}

export {initStore, queryStore}
