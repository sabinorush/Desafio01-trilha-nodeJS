const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//middleware para verificação usuário existente.
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found!' });
  }

  request.user = user; //Criando request de user para reutilizar nas rotas.
  return next();

}


//criar de usuário;
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists!' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

//Listar tarefas de um usuário
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);

});

//Criar nova tarefa
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

//Atualizando tarefa
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' });
  };

  todo.done = true;

  return response.json(todo);
});

//deletar todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  };

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;

