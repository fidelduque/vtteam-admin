/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
 const AWS = require("aws-sdk");

 exports.handler = async (event) => {
     console.log(`EVENT: ${JSON.stringify(event)}`);
     const documentClient = new AWS.DynamoDB.DocumentClient();
     const params = {
     TableName : process.env.ADMINTABLE,
         Key: {
             type: 'brand',
             key: event.Details.ContactData.SystemEndpoint.Address,
         }
     };
     const data = await documentClient.get(params).promise();
     if(data.Item) {
         console.log(data.Item);
         if (data.Item.open) {
            return { 'isOpen': true }   
         }
         return { 'isOpen': false }
     }
     return {
         'lob': 'not found'
     };
 };
 