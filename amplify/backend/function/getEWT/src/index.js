

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const timeInMinutes = Math.ceil(event.Details.Parameters.timeInSeconds / 60);
    return {
        'timeInMinutes': timeInMinutes
    };
};
