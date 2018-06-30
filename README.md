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

In the directory where the repository is, run either   

    * node ./app.js
    * nodemon ./app.js

Now, navigate to the following URL : http://localhost:8080

The default URL is set to localhost with port # 8080.

## TODO
    * User environment file for port (default is 8000).
    * Write a better README :)
