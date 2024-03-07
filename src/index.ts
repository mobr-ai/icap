import { Canister, query, text, update, Void } from 'azle'
import { initStore, queryStore } from './triplestore.mjs'

// in-memory turtle specification
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
