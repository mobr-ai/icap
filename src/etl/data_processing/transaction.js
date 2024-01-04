const icPrefix    = "iconto:"
const txInd       = icPrefix + "Transaction"
const txHasHash   = icPrefix + "hasTransactionHash"
const txHasFrom   = icPrefix + "hasTransactionFrom"
const txHasTo     = icPrefix + "hasTransactionTo"
const txHasType   = icPrefix + "hasTransactionType"
const txHasStatus = icPrefix + "hasTransactionStatus"
const txHasAmount = icPrefix + "hasTransactionAmount"
const txHasFee    = icPrefix + "hasTransactionFee"
const txHasTs     = icPrefix + "hasTransactionTimestamp"

const icpDecimals = 8

function convertICPValue(bigIntString) {
    // Ensure the input is a string
    bigIntString = String(bigIntString);
  
    // If the string has less than icpDecimals characters, fill with leading zeros
    while (bigIntString.length < icpDecimals) {
      bigIntString = '0' + bigIntString;
    }
  
    // Extract the integer and decimal parts
    const integerPart = bigIntString.slice(0, -icpDecimals) || '0';
    const decimalPart = bigIntString.slice(-icpDecimals);
  
    // Combine them to form the float number
    const floatValue = parseFloat(`${integerPart}.${decimalPart}`);
  
    return floatValue.toFixed(icpDecimals); // Ensure decimals precision
}

function convertToXSDDTS(timestamp) {
    // Create a new Date object using the timestamp (in milliseconds)
    const date = new Date(Number(timestamp) / 1000000)
  
    // Get the individual components of the date and time
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Month is zero-indexed
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
  
    // Construct the XSD dateTimeStamp string
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

function transactionToStr(tx) {
    const txAmount = convertICPValue(tx["amount"])
    const txFee = convertICPValue(tx["fee"])
    const txTs = convertToXSDDTS(tx["timestamp"])
    return `${icPrefix}${tx["hash"]} a ${txInd} ;\n` +
        `${txHasHash} "${tx["hash"]}" ;\n` +
        `${txHasFrom} "${tx["from"]}" ;\n` +
        `${txHasTo} "${tx["to"]}" ;\n` +
        `${txHasType} "${tx["type"]}" ;\n` +
        `${txHasStatus} "${tx["status"]}" ;\n` +
        `${txHasAmount} ${txAmount} ;\n` +
        `${txHasFee} ${txFee} ;\n` +
        `${txHasTs} "${txTs}" .\n`
}

function transactionsToStr(txs) {
    var strTurtleTxs = ""
    for (var i=0; i<txs.length;i++) {
        strTurtleTxs += transactionToStr(txs[i])
    }
    return strTurtleTxs
}

export {transactionsToStr}