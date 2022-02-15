var express = require('express');
var request = require("request")
const serverless = require('serverless-http');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Define some constants
const CHAINLINK_ACCESS_KEY = "4135b2fd3d0f48289313f4dafb27b637"
const CHAINLINK_ACCESS_SECRET = "MG2ExUNQ3AcGtbbBobQwrFkx5g2OBLC5Nn8Y0Ridr4YQnFiZ7tYTlMdt8ChpxVhU"
const CHAINLINK_IP = "18.221.103.144"

//test2 ║ https://18.221.103.144:8080/jobs ║ 7162771605dd46e092c3bdb7c2dc0e8a ║ HsgGs0SG7joFkbt66wyqFRdEIZqp0fxQ1M32Ik9/UztGV24rm6p/9iGov4bh0Xud ║ p8b3gto+SzcaJkVAlQyCByqJLEAZuLJoF72+9fRQDOEORgG+DuhDhMH2HGQ17uHO ║ I5tHL6PU+DKqJNAP36xo3YtV0TzIzm65mPrgmEgVhnSoff5a2j5CINsT2bHNasfe

//test3 ║ https://av6fn434i1.execute-api.us-east-2.amazonaws.com/dev/ ║ 4135b2fd3d0f48289313f4dafb27b637 ║ MG2ExUNQ3AcGtbbBobQwrFkx5g2OBLC5Nn8Y0Ridr4YQnFiZ7tYTlMdt8ChpxVhU ║ qylbTiWdYv36CSOwW7YivB2cbnNBqSWq3OOhljhXQhV1rW4CYTakYVRxXpiaMMmd ║ nc5QFpbucP2wf5q7U7aC+5Hez/vfH2mBRoUzJPklQBSR5CsGm00KuZBCwfyJBV31
var job_ids = []

/** Health check endpoint */
app.get('/', function (req, res) {
   res.sendStatus(200);
})

/** Called by chainlink node when a job is created using this external initiator */
app.post('/jobs', function (req, res) {
    //Recieves info from node about the job id
    job_ids.push(req.body.jobId) //save the job id
    res.sendStatus(200);
 })

/** Called by chainlink node when running the job */ 
app.get("/temp", function(req, res) {
    res.send({'temp': 42})
});

app.get("/fuk", function(req, res) {
    callChainlinkNode()
    res.send({'temp': callChainlinkNode()})
});
/** Function to call the chainlink node and run a job */
function callChainlinkNode(job_id ) {
    var url_addon = '/v2/specs/'+ job_id + '/runs'
    request.post({
        headers: {'content-type' : 'application/json', 'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
        'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET},
        url:     CHAINLINK_IP+url_addon,
        body:    ""
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