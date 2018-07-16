# CryptocurrencyTracker
Tracking cryptocurrency chains.

## Dependencies
1. If you do not have the AWS CLI installed on your machine already, follow the instructions here: https://docs.aws.amazon.com/cli/latest/userguide/installing.html

    a. Test that the AWS CLI was installed correctly by running
* aws --version

    b. Install the AWS SDK for JavaScript in Node.js with
* npm install aws-sdk

2. Set up DynamoDB Local by following the instructions here: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

3. Clone the repository.

## How to Run
Run DynamoDB Local.

Use the two scripts in the /scripts subdirectory to create the necessary tables in your local environment. From the base directory:

    * node ./scripts/createMarketChainDataTable.js
    * node ./scripts/createMarketChainNamesTable.js

We included POST methods that you can use to generate your own data in your local DynamoDB environment. Uncomment out the postValidMarket and postMarketData function definitions in database-wrapper.js and calls in main-table.js to generate data. These will put data into the above tables.

In the directory where the repository is, run either   

    * node ./app.js
    * nodemon ./app.js

Now, navigate to the following URL : http://localhost:3000

The default URL is set to localhost with port 3000.

## TODO
    * Get constant domain name
    * Run lambda functions
