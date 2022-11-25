

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 const AWS = require("aws-sdk");

 exports.handler = async (event) => {
     console.log(`EVENT: ${JSON.stringify(event)}`);
     const documentClient = new AWS.DynamoDB.DocumentClient();
     const params = {
     TableName : process.env.ADMINTABLE,
     KeyConditionExpression: '#dynobase_type = :key',
     ExpressionAttributeValues: {
        ':key' : 'prompt'
    },
    ExpressionAttributeNames: { "#dynobase_type": "type" }
     };
     const data = await documentClient.query(params).promise();
     if(data.Items) {
         let returnObj = {};
         await data.Items.forEach(item => {
             returnObj[item.key] = item.prompt;
         })
         return returnObj;
     }
     return {
         'result': 'not found'
     };
 };
 