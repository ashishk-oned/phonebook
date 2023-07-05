const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

//data 
const MAX = 10**6;
let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];
let phonebookIds = phonebook.reduce((a,x)=>a.add(Number(x.id)),new Set());
let phonebookNames = phonebook.reduce((a,x)=>a.add(x.name),new Set());
//Utility Functions


function genId(){
  let newId = Math.floor(Math.random()*MAX);

  while (phonebookIds.has(newId)){
    newId = Math.floor(Math.random()*MAX);
  }
  return newId;
}
//middeware functions
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
morgan.token('postlog',function(request,response){
  return request.method === 'POST'
                      ?JSON.stringify(request.body)
                      :'\b'

});



//backend
//initiaite server and middleware
const app = express();
app.use(express.json());
// app.use(requestLogger);
// app.use(unknownEndpoint);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postlog'));
app.use(cors());
app.use(express.static('dist'));

//welcome page
app.get('/', (request, response) => {
    console.log(phonebook.map(x=>x.id))
    // response.send('<h1>Hello World!</h1>');
    response.sendFile('index.html');
  })
;
//phonebook endpoint
app.get('/api/persons',(request,response)=>{
    response.json(phonebook);
})
;
//info
app.get('/info',(request,response)=>{
    const number = phonebook.length;
    const time = new Date();
    let text = `Phonebook has info for ${number} people `;
    text += "<br>";
    text +=  `${time}`;
    response.send(text);
});

//phonebook entries
app.get('/api/persons/:id',(request,response) => {
  const id = Number(request.params.id);
  const person = phonebook.find( x=>x.id===id );
  console.log(person);
  if (person){
    response.json(person);
  }
  else {
    response.status(404).end();
  }
});

//delete phonebook entries
app.delete('/api/persons/:id',(request,response) => {
  const id = Number(request.params.id);
  const name = phonebook.find(entry=>entry.id == id).name;
  phonebook = phonebook.filter(x=>x.id!=id);
  phonebookIds.delete(id);
  phonebookNames.delete(name);

  console.log(phonebook.map(x=>x.id));
  response.status(204).end();
});

//add new entries to phonebook

app.post('/api/persons',(request,response) => {
  //console.log(request);
  const id = String(genId());
  const name = request.body.name;
  const number = request.body.number;

  if (number && name && !phonebookNames.has(name)) {
    const phonebookNewEntry = {
      id,
      name,
      number 
    };
    phonebook = phonebook.concat(phonebookNewEntry);
    phonebookIds.add(Number(id));
    phonebookNames.add(name);
    console.log(phonebookNewEntry);
    response.json(phonebookNewEntry);
  }
  else {
    const msg = phonebookNames.has(name) 
                ?   "The name must be unique"
                :   "Some information missing" ;
    
    return response.status(400).json({
      error:msg
    })
  }
})

const PORT = process.env.PORT||3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);