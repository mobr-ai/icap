import { getLatestTransactions } from '../src/etl/data_extraction/rosettaicp.mjs'
import { transactionsToStr } from '../src/etl/data_processing/transaction.mjs'


const numberOfTransaction = 10
const txs = await getLatestTransactions(numberOfTransaction)
const strTrans = transactionsToStr(txs)
console.log(strTrans)