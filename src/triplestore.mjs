import { Store, parse, SPARQLToQuery } from 'rdflib'

//in-memory triplestore
var tStore


/**
 * Initializes the triplestore with the given knowledge representation
 * @param {string} iconto - The ontology representation in turtle format
 * @returns {boolean} true is the ontology was parsed succesfully, false otherwise
 */
export function initStore(iconto) {
    tStore = new Store()
    var uri = 'http://www.mobr.ai/ontologies/iconto#'
    var mimeType = 'text/turtle'

    try {
        parse(iconto, tStore, uri, mimeType)
        return true

    } catch (err) {
        return false
    }
}

/**
 * Extracts the LIMIT amount from the given SPARQL query.
 * Useful since rdflib does not support queries with LIMIT.
 * @param {string} strSparql - SPARQL query
 * @returns {int} Limit specified in the SPARQL query. 0 if a LIMIT was not specified
 */
function getLimit(strSparql) {
    var limit = 0
    const lss = strSparql.toLowerCase()
    const slss = lss.split("limit")
    if (slss.length == 2) {
        limit = Number(slss[1].trim())
    }
    return limit
}

/**
 * Extracts the order by parameters from the given SPARQL query.
 * @param {string} strSparql - SPARQL query
 * @param {boolean} hasLimit - If the given SPARQL query has a LIMIT statement in it (see getLimit)
 * @returns {Array} Array with the order by and if it is desc or not
 */
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


/**
 * Executes a SPARQL query
 * @param {string} strSparql - SPARQL query
 * @returns {string} JSON representation of the query result
 */
export function queryStore(strSparql) {
    if (!tStore || tStore.length == 0) {
        console.log("triplestore is empty")
        return ""
    }

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

/**
 * A module to represent the key operations in a triplestore: knowledge injection and queries
 * @module triplestore
 * @exports initStore
 * @exports queryStore
 */
export default {initStore, queryStore}
