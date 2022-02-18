let AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
});

let tableName = process.env.EI_TABLE;

module.exports = {
    ListAll: async function () {
        try {
            let docClient = new AWS.DynamoDB.DocumentClient();

            var params = {
                TableName: tableName,
            };

            let results = await docClient.scan(params).promise();
            let jobs = results.Items;
            if (!Array.isArray(jobs)) jobs = [];

            return jobs;
        } catch (err) {
            console.error("Jobs List All Error:", err);
            throw new Error("Jobs List All Error");
        }
    },
    Get: async function (ID) {
        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient({
                apiVersion: "2012-08-10",
            });

            let params = {
                TableName: tableName,
                Key: { JOB_ID: ID },
            };

            let result = await dynamoDB.get(params).promise();

            if (result.Item) return result.Item;
            else return false;
        } catch (err) {
            console.error("Job Get Error:", err);
            throw new Error("Job Get Error");
        }
    },


    Save: async function (Job) {
        try {
            let dynamoDB = new AWS.DynamoDB.DocumentClient({
                apiVersion: "2012-08-10",
            });

           
            
            if(!Job.JOB_ID)
                throw new Error("JOB_ID is required");
           
            if(!Job.NODE_IP)
                throw new Error("NODE_IP is required");

            if(!Job.JOB_NAME)
                throw new Error("JOB_NAME is required");

            if(!Job.EI_NAME)
                throw new Error("EI_NAME is required");

            const parameters = {
                TableName: tableName,
                Item: Job,
            };

            await dynamoDB.put(parameters).promise();

            return Job;
        } catch (err) {
            console.error("Job Save Error:", err);
            throw new Error("Job Save Error");
        }
    },


    GetBy: async function (attribute, value){
 
        try {

            if (!attribute)
                throw new Error("Attribute Missing")

            if (typeof attribute !== 'string')
                throw new Error("Attribute not a String")

            attribute = attribute.toLowerCase()    

            if (attribute !== 'name' && attribute !== 'ip' && attribute !== 'id' && attribute !== 'both' )
                throw new Error("Not a valid attribute to Query by")
            
            if(!value)
                throw new Error("Value is missing")   
            
            if(attribute === 'both')
                if (!value.ip || !value.name)
                    throw new Error("Missing Attribute values ( ip / name) for query by `both`")     
       
            let dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: "2012-08-10"});

         
            let record = false;

            switch(attribute){

                case 'name' : 

                const params1 = {
                    TableName: tableName,
                    IndexName : "NAME_IDX",
                    KeyConditionExpression : "#key = :condition",
                    ExpressionAttributeNames : {
                        "#key": "JOB_NAME"
                    },
                    ExpressionAttributeValues: {
                        ":condition": value,
                      }
                }

                const result_x = await dynamoDB.query(params1).promise();
                if (result_x && result_x.Items && result_x.Items[0])
                        record = result_x.Items[0]

                    break;

                case 'ip'   :

                    const params2 = {
                        TableName: tableName,
                        IndexName : "IP_IDX",
                        KeyConditionExpression : "#key = :condition",
                        ExpressionAttributeNames : {
                            "#key": "NODE_IP"
                        },
                        ExpressionAttributeValues: {
                            ":condition": value,
                          }
                    }

                    const result_y = await dynamoDB.query(params2).promise();
                    if (result_y && result_y.Items && result_y.Items[0])
                        record = result_y.Items[0]

                    break;

                case 'both'   :

                    const params3 = {
                        TableName: tableName,
                        IndexName : "NAME_IDX",
                        KeyConditionExpression : "#key = :condition",
                        FilterExpression: 'NODE_IP = :ip',
                        ExpressionAttributeNames : {
                            "#key": "JOB_NAME"
                        },
                        ExpressionAttributeValues: {
                            ":condition": value.name,
                            ":ip" : value.ip
                          }
                    }
    
                    const result_z = await dynamoDB.query(params3).promise();

                    if (result_z && result_z.Items && result_z.Items[0])
                        record = result_z.Items[0]
    
                    break;

                case 'id'   :

                    const params = {
                        TableName: tableName,
                        Key: { JOB_ID: value }
                    }

                    const result = await dynamoDB.get(params).promise();

                    if (result.Item) record = result.Item;

                    break;

                default :
                    record = false;
            }
       

        return record;
       

    } catch (error) {
            console.error(error)
            return false
    }
    
    }
};