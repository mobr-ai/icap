import {initStore, queryStore} from "../triplestore.mjs"
import { getLatestTransactions } from '../etl/data_extraction/icpExplorer.mjs'
import { transactionsToStr } from '../etl/data_processing/transaction.mjs'

import { readFile } from 'fs/promises'
import test from "node:test"
import assert from "node:assert"

/**
 * tests iconto ontology injection and triplestore query
 */
test('knowledge injection and query', async (t) => {
    const invalidTurtle = `
        InvalidTurtle a owl:class .
        NoPrefix rdfs:subClassOf InvalidTurtle .
    `
    var initialized = initStore(invalidTurtle)
    assert.ok(initialized == false)

    const strICOnto = await readFile("src/iconto/main.ttl", 'utf8')
    initialized = initStore(strICOnto)
    assert.ok(initialized)

    const res = queryStore("select ?s ?p ?o where { ?s ?p ?o . }")
    assert.ok(res.length > 0)
})

/**
 * tests transaction etl mechanisms and sparql query
 */
test('transaction etl and sparql query', async (t) => {
    const numberOfTransaction = 10
    const txs = await getLatestTransactions(numberOfTransaction)
    assert.ok(numberOfTransaction == txs.length)

    const strTrans = transactionsToStr(txs)
    assert.ok(strTrans.length > 0)

    const strICOnto = await readFile("src/iconto/main.ttl", 'utf8')
    const initialized = initStore(strICOnto + " \n " + strTrans)
    assert.ok(initialized)

    const strSparql = `
        PREFIX iconto: <http://www.mobr.ai/ontologies/iconto#>
        SELECT ?t WHERE { ?t a iconto:Transaction . }
    `
    const res = queryStore(strSparql)
    assert.ok(res.length > 0)
    
    const jres = JSON.parse(res)
    assert.ok(Object.keys(jres).length == numberOfTransaction)
})
