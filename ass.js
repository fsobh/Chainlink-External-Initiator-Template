
const axios = require('axios')
const CHAINLINK_ACCESS_KEY = "759ddd9987374a13909481de152b3fed"
const CHAINLINK_ACCESS_SECRET = "J9YYutWmAbSKCiXNBcAHKSsDOAMpYQR3qO1vBoDY3l0IEf+yZzWXpBDdMXRu1cbA"
axios({
  method: 'post',
  url: `http://localhost:6688/v2/specs/accb22ccc7014267830c93cd48aff89e/runs`,
  data: {"foo" : "ass"},
  headers: {
      'Content-Type': 'application/json',
    'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
    'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET
  },
})
.then(e => {
  console.log('DONE')
})
.catch(e => {
  console.log(e)
})