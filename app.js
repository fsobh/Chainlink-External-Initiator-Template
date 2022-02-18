var express = require('express');
var axios = require("axios")
const serverless = require('serverless-http');
const JobAPI = require("./JobAPI")
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Define some constants
const CHAINLINK_ACCESS_KEY = process.env.CHAINLINK_ACCESS_KEY
const CHAINLINK_ACCESS_SECRET = process.env.CHAINLINK_ACCESS_SECRET


/** Health check endpoint */
app.get('/', function (req, res) {

   res.sendStatus(200);
})

/** Called by chainlink node when a job is created using this external initiator */
app.post('/', async function  (req, res) {
    //Recieves info from node about the job id

    try {
        
    
    const request = JSON.parse(JSON.stringify(req.body));
    console.log(request)

    if (!request.jobId)
        throw new Error("Job ID Required");

    if(!request.type)
        throw new Error("Initiator name was not Provided");
    
    if(!request.params || !request.params.jobName)
        throw new Error("Job Spec must send `jobName` in initial request");
    
    if(!req.ip)
        throw new Error("Node IP is required");
        

    await JobAPI.Save({
        JOB_NAME : request.params.jobName,
        JOB_ID : request.jobId ,
        EI_NAME : request.type,
        NODE_IP : `http://${req.ip}`
    })
   
    res.sendStatus(200);

} catch (error) {
      console.log(error)
    res.send({'error' : error}).sendStatus(500)
}
 })


app.get("/test", async function  (req, res) {
    
    const JOB = await JobAPI.GetBy('name','job-4')

    if(JOB && JOB.JOB_ID && JOB.NODE_IP){
       await callChainlinkNode(JOB)
        res.sendStatus(200)

    }else
        res.sendStatus(500)
});


//https://av6fn434i1.execute-api.us-east-2.amazonaws.com/dev/test

/** Function to call the chainlink node and run a job */
async function callChainlinkNode(job) {

    const CL_DOCKER_PORT = '6688';

    

    const URL = `${job.NODE_IP}:${CL_DOCKER_PORT}/v2/jobs/${job.JOB_ID}/runs` //this is the URL to hit. if your running your ndocker instance of CL on another port, make sure to change it here. default is usually 6688

    console.log(CHAINLINK_ACCESS_KEY,CHAINLINK_ACCESS_SECRET,URL)
    
    let data = {verified : true}
    await axios.post( URL, {
        headers: {

            'content-type' : 'application/json',
            'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
            'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET
        },
       data
    })      
    .then((response) => {
        console.log(response.data)
        return true
    })
    .catch((error) => {
        console.log(error.message)
        return false
    })

   
}

module.exports.handler = serverless(app);