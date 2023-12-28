import { Canister, query, text, update, Void } from 'azle'
import { initStore, queryStore } from './triplestore.js'

// This is a global variable that is stored on the heap
let iconto = ''

export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getOntology: query([], text, () => {
        return iconto
    }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    setOntology: update([text], Void, (newOntology) => {
        iconto = newOntology
        initStore(iconto)
    }),
    sparqlQuery: query([text], text, (strSparql) => {
        const bindings = queryStore(strSparql)
        console.log(bindings)
        return bindings
    })
})

// PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX ponto: <http://www.mobr.ai/ontologies/ponto#> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> SELECT ?s WHERE { ?s ?p ?o . }
