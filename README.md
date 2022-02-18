<p align="center">
    <a href="https://chain.link/" title="chainlink">
        <img  height=230px src="https://cryptologos.cc/logos/chainlink-link-logo.png?v=021" alt="chainlink logo">
    </a>
</p>

<div align="center">

# Chain Link External Inititator Template
### *AWS Lambda Ready*


[![JavaScript](https://img.shields.io/badge/JavaScript-ES9-%23FFFF00)](https://img.shields.io/badge/JavaScript-ES9-%23FFFF00)    [![Node](https://img.shields.io/badge/NodeJS-v14.0.1-brightgreen)](https://img.shields.io/badge/NodeJS-v14.x.x-brightgreen) 
 [![AWS](https://img.shields.io/badge/AWS-Cloud%20provider-orange)](https://img.shields.io/badge/AWS-Cloud%20provider-orange) [![chainlink](https://img.shields.io/badge/Chain%20Link-v1.0.1-%23375BD2)](https://img.shields.io/badge/Chain%20Link-v1.0.1-%23375BD2)
[![serverless](https://img.shields.io/badge/Serverless-v3.1.1-red)](https://img.shields.io/badge/Serverless-v3.1.1-red) [![express](https://img.shields.io/badge/Express-%5E4.17.2-green)](https://img.shields.io/badge/Express-%5E4.17.2-green)
[![Dynamo](https://img.shields.io/badge/DynamoDB-Database-blue)](https://img.shields.io/badge/DynamoDB-Database-blue) [![Lambda](https://img.shields.io/badge/Lambda-service-%20%09%23a26c2f)](https://img.shields.io/badge/Lambda-service-%20%09%23a26c2f)
</div>


## Pre-Deployment
#### 1) Install the [Serverless Framework](https://www.serverless.com/)  globally

```bash
  npm install serverless -g 
```

#### 2) Install dependencies using [Node Package Manager](https://www.npmjs.com/)

```bash
  npm install 
```
#### 3) Create a ```.env``` file : 
> **Note:** Ensure these values are safely stored and are **NOT public**.
```bash
  CHAINLINK_ACCESS_KEY=<Your EI Access Key>
  CHAINLINK_ACCESS_SECRET=<Your EI Secret>
```
## Deployment

####  Deploy service using serverless: 
> **Note:** Ensure You have configured you Serverless CLI to use your AWS *ACCESS KEY* and *SECRET KEY* with the appropriate permissions to deploy.
```bash
  sls deploy
```

##


## API Reference

#### Health Check

```http
  GET https://<your-aws-api-url>/
```
#### Job Registration (called by CL node when Job Spec is created)

```http
  POST https://<your-aws-api-url>/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `jobId`      | `string` | **Required**. The External JOB ID of the Job Spec (on CL node). **This is automatically populated and sent at time of job registration** |
| `type`       | `string` | **Required**. The Name of the External Inititator admin created on the Node via Chainlink CLI. **This is automatically populated and sent at time of job registration**  |
| `params`     | `JSON Object` | **Required**. Any `spec` params that are sent when the job is registered. (these are written in your job spec file)  |
| `params.jobName`     | `String` | **Required**. The unique name of the Job Spec file. (the value of the name field in your job spec). **You must specify this in your job spec** |
| `ip`     | `string` | **Required**. The IP Address of the Node thats registering the JOB. **This is automatically populated and sent at time of job registration**    |


### Example of a valid Job Spec :

```toml
type = "webhook"
schemaVersion = 1
name = "job-1"
externalJobID = "unique-external-job-id" # you can pre-define it or just have the node auto generate one for you at creation by removing the attribute from your job spec
externalInitiators = [
  { name = "name-of-your-ei-on-your node", spec = "{\"jobName\": \"job-1\"}" }

]
observationSource = """
    parse_request  [type="jsonparse" path="foo" data="$(jobRun.requestBody)"]


    parse_request 
"""
```

