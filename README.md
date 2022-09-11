# Bracket Coding Challenge

This repository serves as a starting point for the Bracket interview/coding challenge.

### **Instructions:**

Bracket syncs data sources to reflect the same records in two places. As a result, Bracket engineers often have to write code 
that performs standard CRUD operations on new data sources. In this repository, you'll see example code to...

1) Read data from Airtable
2) Transform the data to a data source agnostic object (i.e. a POJO with just the data and the respective fields)
3) Write back to Airtable

Your goals of the challenge are as follows: 

1) Complete the script in `get-all-airtable-data-and-push-to-new-data-source.ts` with a new data 
source. You can locate the specific tasks by finding the two "TODO:" comments that need to completed in that file. 
As you complete this challenge consider edge cases and how they would be handled. Feel free to use any open source library to connect to this new data source. For example, when connecting to postgres, some may use https://node-postgres.com/ while others may choose https://knexjs.org/
2) Add test cases to make sure the code is running as expected. We believe that well-tested and well-named code should speak for itself, so you shouldn't feel obliged to write comments. 
3) Bonus points: The example/template code is far from perfect. If you'd like to change anything in the repo to complete the task--please do! 
We will give extra credit to any thought on any design decisions that have a thoughtful explanation. 

When you are ready to submit, you can either make a PR to a fork of this repo and tag @kunalrgarg as a reviewer or send you changes via email as a zip file to eng@usebracket.com with the subject line: "Bracket Take Home <Full Name>"

Feel free to email eng@usebracket.com with any questions!

### **Environment Setup:**
Open a terminal window at this repository's directory then run the following command:
```
$ npm install
```

Then run the following command to continually compile the typscript project (you can keep this window open to watch changes): 
```
$ npm run watch-ts
```

to run individual operational queries run the following: 
```
node dist/src/scripts/<query name> --<param>=<value>

e.g.
node dist/src/scripts/get-all-airtable-data-and-push-to-new-data-source.js --apiKey='key1234654153' --baseId='app23iuI9J34G82'
```

to run tests:
```
$ npm run test
```
