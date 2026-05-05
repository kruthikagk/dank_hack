const express = require('express');
   const { GoogleGenerativeAI } = require("@google/generative-ai");
   require('dotenv').config();

   const app = express();
   app.use(express.json());

   const genAI = new GoogleGenerativeAI(process.env.API_KEY);

   app.post('/chat', async (req, res) => {
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     const chat = model.startChat();
     
     const result = await chat.sendMessage(req.body.message);
     const response = await result.response;
     res.json({ text: response.text() });
   });

   app.listen(3000, () => console.log('Server running on port 3000'));
