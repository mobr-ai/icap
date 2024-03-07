const icpName = "Internet Computer"
const icpNetwork = "00000000000000020101"

const icpExplorer = "https://www.icpexplorer.org"
const icpRosetaApi = "rosetta-api.internetcomputer.org"
const icpRosetaApiURL = "https://" + icpRosetaApi 

const icpNetowrkIdentifier = {
    'blockchain': icpName,
    'network': icpNetwork
}

const icpExplorerHeaders = {
    "authority": icpRosetaApi,
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json;charset=UTF-8",
    "origin": icpExplorer,
    "referer": icpExplorer,
    "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

async function httpRequest(endpoint, params) {
    const requestOptions = {
        method: 'POST',
        headers: icpExplorerHeaders,
        body: JSON.stringify(params)
    }
    return await fetch(icpRosetaApiURL + endpoint, requestOptions)
}

async function getCurrentBlockIndex() {
    const rawResp = await httpRequest("/network/status", {
        "network_identifier": icpNetowrkIdentifier
    })
    if (rawResp.status != 200) {
        return -1
    }

    const resp = await rawResp.json()
    if (resp.hasOwnProperty("current_block_identifier")) {
        if (resp["current_block_identifier"].hasOwnProperty("index")) {
            return resp["current_block_identifier"]["index"]
        }
    }
    return -1
}

async function getBlock(blockIndex) {
    const rawResp = await httpRequest("/block", {
        "network_identifier": icpNetowrkIdentifier,
        "block_identifier": {
            "index": blockIndex
        }
    })
    if (rawResp.status != 200) {
        console.log("get block invalid status")
        console.log(rawResp)
        return null
    }

    return await rawResp.json()
}

function extractTransactionFromBlock(blockData) {
    if (blockData.hasOwnProperty("block")) {
        if (blockData["block"].hasOwnProperty("transactions")) {
            const tx = blockData["block"]["transactions"]
            if (tx.length == 1) {
                const txHash = tx[0]["transaction_identifier"]["hash"]
                const txTs = tx[0]["metadata"]["timestamp"]
                const ops = tx[0]["operations"]
                if (ops.length == 3) {
                    if (ops[0]["type"] == "TRANSACTION" && ops[2]["type"] == "FEE") {
                        return {
                            "hash": txHash,
                            "from": ops[0]["account"]["address"],
                            "to": ops[1]["account"]["address"],
                            "type": "transfer",
                            "status": ops[1]["status"].toLowerCase(),
                            "amount": ops[1]["amount"]["value"],
                            "fee": ops[2]["amount"]["value"].replaceAll("-", ""),
                            "timestamp": txTs
                        }
                    }
                    else {
                        console.log("!ops")
                        console.log(ops.length)
                        console.log(ops)
                    }
                }
                else {
                    console.log("invalid op count")
                    console.log(ops.length)
                    console.log(ops)
                }
            }
            else {
                console.log("invalid tx count")
                console.log(tx)
            }
        }
        else {
            console.log("transactions property not found")
        }
    }
    else {
        console.log("block property not found")
        console.log(blockData)
    }
    return null
}

export async function getLatestTransactions(limit=10) {
    var transactions = []
    var currentIndex = await getCurrentBlockIndex()

    while (transactions.length < limit) {
        if (currentIndex < 0) {
            return transactions
        }
        const blockData = await getBlock(currentIndex)
        if (blockData) {
            const tx = extractTransactionFromBlock(blockData)
            if (tx) {
                transactions.push(tx)
            }
        }
        currentIndex = currentIndex - 1
    }
    return transactions
}

export default {getLatestTransactions}
