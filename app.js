var express = require('express');
var axios = require("axios")
const serverless = require('serverless-http');
const JobAPI = require("./JobAPI")
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const Logger = require("aws-logging");


const CHAINLINK_ACCESS_KEY = process.env.CHAINLINK_ACCESS_KEY
const CHAINLINK_ACCESS_SECRET = process.env.CHAINLINK_ACCESS_SECRET

Logger.config.update({
  
    mailList : [process.env.RECIEVER_EMAIL_1],
    sourceEmail : process.env.SOURCE_EMAIL,
    notifyOnSeverityLevel : 5,
    serviceName : process.env.SERVICE_NAME,
    enableNotifications : true,
    region:"us-east-2",
    accessKeyId : process.env.KEY,
    secretAccessKey : process.env.SECRET

})

/** Health check endpoint */
app.get('/', async function (req, res) {

    try {

        await Logger.log("Health Check ran", 1, {request : {body : JSON.parse(JSON.stringify(req.body))}});
        res.sendStatus(200);
        
    } catch (error) {
        
        await Logger.error(error.message,3,
            {
                stack : error.stack,
                error : String(error)
            });
        res.send({'error' : error}).sendStatus(500);
    }

})

/** Called by chainlink node when a job is created using this external initiator */
app.post('/', async function  (req, res) {
    //Recieves info from node about the job id

    try {
        
    
    const request = JSON.parse(JSON.stringify(req.body));
    

    if (!request.jobId)
        throw new Error("Job ID Required");

    if(!request.type)
        throw new Error("Initiator name was not Provided");
    
    if(!request.params || !request.params.jobName)
        throw new Error("Job Spec must send `jobName` in initial request");
    
    if(!req.ip)
        throw new Error("Node IP is required");
        
    const newJob = 
        {
            JOB_NAME : request.params.jobName,
            JOB_ID : request.jobId ,
            EI_NAME : request.type,
            NODE_IP : `http://${req.ip}`
        }
    
    await JobAPI.Save(newJob)

    await Logger.log(`New Job Saved : ${newJob.JOB_ID}`,1, newJob);
   
    res.sendStatus(200);

} catch (error) {
    await Logger.error(error.message,3,
        {
            stack : error.stack,
            error : String(error)
        });
      res.send({'error' : error}).sendStatus(500);
}
 })


app.get("/test", async function  (req, res) {
    try {
        
    
    const JOB = await JobAPI.GetBy('name','job-4');

    if(JOB && JOB.JOB_ID && JOB.NODE_IP){
       await callChainlinkNode(JOB);
       await Logger.log(`Testing Job : ${JOB.JOB_ID}`,1, JOB);
        res.sendStatus(200);

    }else{

        await Logger.error(`Job not found  : ${"your-job-name-here"}`,3);
        res.sendStatus(500);
        
    }
    } catch (error) {
        await Logger.error(error.message,3,
            {
                stack : error.stack,
                error : String(error)
            });
        }
    });

/** Function to call the chainlink node and run a job */
async function callChainlinkNode(job) {

    try {
        
    
    const CL_DOCKER_PORT = '6688';

    

    const URL = `${job.NODE_IP}:${CL_DOCKER_PORT}/v2/jobs/${job.JOB_ID}/runs`; //this is the URL to hit. if your running your ndocker instance of CL on another port, make sure to change it here. default is usually 6688

    console.log(CHAINLINK_ACCESS_KEY,CHAINLINK_ACCESS_SECRET,URL);
    
    let data = {verified : true};

    await axios.post( URL, data,
        {
         headers : {
            'Content-Type': 'application/json',
            'X-Chainlink-EA-AccessKey': CHAINLINK_ACCESS_KEY,
            'X-Chainlink-EA-Secret': CHAINLINK_ACCESS_SECRET
         }
        })      
    .then(async (response) => {
        await Logger.log(`Triggering CL Webhook at ${URL}`,1,{
            response : response.data,
            node_ip  : job.NODE_IP,
            port     : CL_DOCKER_PORT, 
            jobId    : job.JOB_ID
        });
        console.log(response.data);
        return true;
    })
    .catch(async (error) => {
        await Logger.error(error.message,3,
            {
                stack : error.stack,
                error : String(error)
            });
        return false;
    })
} catch (error) {
    await Logger.error(error.message,3,
        {
            stack : error.stack,
            error : String(error)
        });
    return false;
}
   
}

module.exports.handler = serverless(app);