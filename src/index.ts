import { Canister, query, text, update, Void } from 'azle'
import { initStore, queryStore } from './triplestore.mjs'

// in-memory turtle specification
let iconto = ''

export default Canister({
    // Returns the in-memory ontology specification
    getOntology: query([], text, () => {
        return iconto
    }),
    // Sets a new ontology and (re)initializes the triplestore
    setOntology: update([text], Void, (newOntology) => {
        iconto = newOntology
        initStore(iconto)
    }),
    // Query the triplestore using SPARQL specification
    sparqlQuery: query([text], text, (strSparql) => {
        const bindings = queryStore(strSparql)
        console.log(bindings)
        return bindings
    })
})
