
-D flag specifies the dev dependency and these files will not be used in production since these contain only declaration file which are not required to run the application in production . 


1) Create Typescript Project

```bash

npm install typescript -D
npm init -y
npx tsc --init

```

2) Change rootDir and outDir in tsconfig.json

"rootDir": "./src",
"outDir": "./dist",

3) Install Express and with its types (for Typescript) for Backend Server in dev mode (-D)

https://www.npmjs.com/package/@types/express

```bash

npm install -D @types/express

```

# Importing Express in your project

```typescript 
import express from "express"  ;    // typescript way of importing
// const express = require("express") ;  // does not provide types and intellisense in typescript

```

# To create a declaration file (library)
.d.ts -> file in which we specify the types of our library
-> only this file is published to npm when we publish our library


4) moongose install

```bash
npm install mongoose
```

4) jsonwebtoken install

```bash
npm install @types/jsonwebtoken
```

5) zod install

```bash
npm install zod
```

6) bcrypt install

```bash
npm install @types/bcrypt
```

7) dotenv install

```bash
npm install dotenv
```
# how to use 

```typescript
import * as dotenv from 'dotenv' ;
dotenv.config() ;   // to load the .env file
const PORT = process.env.PORT ;

```

8) cheerio install -> for parsing html in embeddings 

```
npm i cheerio
```

9) axios install 

```
npm i axios @types/axios
```

10) voyageAI install

```
npm i voyageai
```

11) cors install

```bash
npm install @types/cors
```

12) To run the Project Do : 

```bash
npm run dev
```