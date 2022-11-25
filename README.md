# Connect Admin App
## Coding Exercise for VT Team

This is a simple app created as a coding exercise for VT Team using React and NodeJS.

For this project I took the liberty of choosing Amplify as tool to build the code. I wanted to take the chance to learn something new while working on it. 

The project is divided into two main folders:
### Admin: 
This folder contains all the Amplify configurations and backend code, plus the frontend code.

**frontend code** is located under the **src** folder.

To run it locally you just need to run this command from the admin folder
```sh 
 npm install
 npm start
```
The url for testing is:
https://d1bwdj2cifzw5l.cloudfront.net/

## Features you can edit on this folder
- Company level configuration: Prompts and Open switch.
- Brand level configuration: Phone number, brand name, open switch and contact lens switch.
- Blacklist configuration: block numbers to contact any brand or the whole company.

**amplify folder** Here you'll find all the backend code and configuration made through the AWS Amplify solution.

## Features you can edit on this folder

- Add a api: 
```sh
amplify add api
```
- Add lambda functions:
```sh
amplify add function
```
- Add new dynamo tables:
```sh
amplify add storage
```

- Add Authorization process:
```sh
amplify add auth
```

For any other information contact me through: fidelduque@gmail.com