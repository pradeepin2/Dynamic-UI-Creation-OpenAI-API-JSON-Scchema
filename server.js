require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
app.use(express.static('public'));
app.use(express.json());

app.post('/api/fetch', async (req, res) => {
    const tools = [
        {
          "type": "function",
          "function": {
            "name": "generate_ui",
            "description": "Generate UI",
            "parameters": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum":["div", "button", "header", "section", "input", "form", "fieldset", "legend"]
                },
                "label":{
                    "type":"string"
                },
                "children": {
                    "type": "array",
                    "items": {
                       "$ref": "#",
                     }
                },
                "attributes":{
                    "type": "array", 
                    "items": {
                        "$ref": "#/$defs/attribute" 
                     }
                }
              },
              "required": ["type"],
              "$defs": {
                "attribute": {
                    "type": "object",
                    "properties":{
                        "name": { "type": "string"},
                        "value": {"type":"string"}
                   }
                }
              },
              additionalProperties: false
            }
          }
        }
    ];
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o",
        messages: [{ role: "system", content: "You are a UI generator AI. Convert the user input into a UI." }, { role: "user", content: req.body.prompt }],
        tools: tools
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    console.error('Error in response of OpenAI API:', response.data.choices[0].message? JSON.stringify(response.data.choices[0].message, null, 2) : error.message);
    const toolCalls = response.data.choices[0].message.tool_calls;
    let messageContent = '';
    if(toolCalls){
        toolCalls.forEach((functionCall, index)=>{
            if(index === toolCalls.length-1){
                messageContent += functionCall.function.arguments;
            }else{
                messageContent += functionCall.function.arguments+",";
            }
        });
    }
    res.json({ message: messageContent });

});

app.listen(PORT, () => {});