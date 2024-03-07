# this is a draft version of ICAP etl mechanisms

## to use its functionalities as example:
```javascript
//prints turtle specification for the latest 10 ICP transactions
import { getLatestTransactions } from './data_extraction/icpExplorer.mjs'
import { transactionsToStr } from './data_processing/transaction.mjs'

const txs = await getLatestTransactions()
console.log(transactionsToStr(txs))
```
