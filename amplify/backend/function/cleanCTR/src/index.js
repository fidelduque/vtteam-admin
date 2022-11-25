const AWS = require("aws-sdk");


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const connect = new AWS.Connect();
    let params = {
        InitialContactId:  event.Details.ContactData.ContactId,
        InstanceId: process.env.CONNECT_INSTANCE_ID
    }
    const requiredAttr = event.Details.Parameters.requiredAttr?.split(",");
    let contactAttributes = await connect.getContactAttributes(params).promise();
    Object.keys(contactAttributes.Attributes).forEach(item=> {
        if(!requiredAttr.includes(item)){
            console.log(contactAttributes.Attributes[item])
            contactAttributes.Attributes[item] = '';
        }
    })
    params['Attributes'] = contactAttributes.Attributes;
    await connect.updateContactAttributes(params).promise();

    return {
        updated: 'true'
    }
};
