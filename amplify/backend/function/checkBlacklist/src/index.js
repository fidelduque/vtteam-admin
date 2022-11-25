const AWS = require("aws-sdk");

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
     const documentClient = new AWS.DynamoDB.DocumentClient();
     const params = {
     TableName : process.env.ADMINTABLE,
         Key: {
             type: 'blacklist',
             key: event.Details.ContactData.CustomerEndpoint.Address,
         }
     };
     const data = await documentClient.get(params).promise();
     if(data.Item) {
         console.log(data.Item);
         const currentBrand = event.Details.ContactData.Attributes.lob;
         const configBrands = data.Item.brand.split(",");
         if(data.Item.brand ==="all" ||  configBrands.includes(currentBrand))
            return { 'blacklisted': 'true' }
     }
     return {
         'blacklisted': 'false'
     };
};
