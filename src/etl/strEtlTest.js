import { getLatestTransactions } from './data_extraction/icpExplorer.js'
import { transactionsToStr } from './data_processing/transaction.js'

const txs = await getLatestTransactions()
console.log(transactionsToStr(txs))
