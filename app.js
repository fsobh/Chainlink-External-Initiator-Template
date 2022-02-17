var express = require('express');
var request = require("request")
const serverless = require('serverless-http');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Define some constants
const CHAINLINK_ACCESS_KEY = "57f2083190814bfcb8d7ed7250391562"
const CHAINLINK_ACCESS_SECRET = "HEYiVHpLoY9Uj9AtLbFdg0nTaJVr3JeUxw3jACbpgjpHTjgV43TEvHlRWgjXpGNB"
const CHAINLINK_IP = "http://3.145.150.81:6688/v2/jobs/"

//  due-dilly-hook ║ https://av6fn434i1.execute-api.us-east-2.amazonaws.com/dev ║ 57f2083190814bfcb8d7ed7250391562 ║ HEYiVHpLoY9Uj9AtLbFdg0nTaJVr3JeUxw3jACbpgjpHTjgV43TEvHlRWgjXpGNB ║ yb1qDrzbd29EDaArPV9BbhgsXhLdut0+IWLB2uVeMjhhclF10Ag/CiCC4oF/9au4 ║ Y1yCZIAxkiWYYNNAdxs3s0McSBfzTQKhfjqsxBaICmnbTqwSl3U8i8R8F6/ElDQS
var job_ids = []

/** Health check endpoint */
app.get('/', function (req, res) {
    console.log("fooker",req)
   res.sendStatus(200);
})

/** Called by chainlink node when a job is created using this external initiator */
app.post('/', function (req, res) {
    //Recieves info from node about the job id
    console.log("fooker2",req.body)
    job_ids.push(req.body.jobId) //save the job id
    res.sendStatus(200);
 })

/** Called by chainlink node when running the job */ 
app.get("/temp", function(req, res) {
    res.send({'temp': job_ids})
});

app.get("/fuk", function(req, res) {
    
    res.send({'temp': callChainlinkNode(job_ids[0])})
});
/** Function to call the chainlink node and run a job */
function callChainlinkNode(job_id ) {
    var url_addon = `${job_id}/runs`
    request.post({
        headers: {'content-type' : 'application/json', 'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
        'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET},
        url:     CHAINLINK_IP+url_addon,
        body:    {verified : true}
      }, function(error, response, body){
        console.log(response)
        if(error)
            return error;
        return response
      });
    return 'ass'
}
// //test-web-hook
// EI_CHAINLINKURL=https://18.221.103.144/jobs
// EI_IC_ACCESSKEY=eccd041d5cba479299d49da948a51163
// EI_IC_SECRET=2UyVhtSMqVOanXAfYRBj/9Vl8RGjSZCrqhOEZBxeJOVj6FXlgKX9HXbsjPfvY23b
// EI_CI_ACCESSKEY=2uTyjhj0k0BMkSu/qjBrdQP1rfLlhPAV4cKdajFKJY1amqozMOPHY1eig2vo2pK9
// EI_CI_SECRET=MTLc+biaxlRTvB1ATMtd5dJz22M7Mwncrp2bAUyWzDBGdRlzhC+o/XTRFRq0wxs1

//DEFINE SOME POLLING FUNCTION / SUBSCRIBE TO SOME WEBHOOK / DEFINE WHEN TO CALL CHAINLINK NODE

// var server = app.listen(process.env.PORT || 3002, function () {
//     var port = server.address().port;
//     console.log("App now running on port", port);
// });
module.exports.handler = serverless(app);