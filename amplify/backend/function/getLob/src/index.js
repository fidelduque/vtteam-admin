/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	ADMINTABLE
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require("aws-sdk");

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
    TableName : 'adminTable-dev',
        Key: {
            type: 'brand',
            key: event.Details.ContactData.SystemEndpoint.Address,
        }
    };
    const data = await documentClient.get(params).promise();
    if(data.Item) {
        console.log(data.Item);
        return { 'lob': data.Item.name, 
        'contactLens': data.Item.contactlens,   
        'isOpen': data.Item.open };
    }
    return {
        'lob': 'not found'
    };
};
