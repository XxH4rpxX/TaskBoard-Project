import { API_BASE_URL } from "../../config/apiConfig.js";

const taskboard = document.getElementById("taskboard");
const boardSelect = document.getElementById("boardSelect");
const themeToggle = document.getElementById("themeToggle");
const addColumnButton = document.getElementById("addColumn");


themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});


async function loadBoards() {
  try {
    const response = await fetch(`${API_BASE_URL}/Boards`);
    const boards = await response.json();

    boards.forEach((board) => {
      const option = document.createElement("option");
      option.value = board.Id;
      option.textContent = board.Name;
      boardSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar quadros:", error);
  }
}


boardSelect.addEventListener("change", async () => {
  const boardId = boardSelect.value;
  if (!boardId) return;

  taskboard.innerHTML = ""; 

  try {
    const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${boardId}`);
    const columns = await response.json();

    columns.forEach((column) => {
      createColumn(column.Name, column.Id, boardId);
    });
  } catch (error) {
    console.error("Erro ao carregar colunas:", error);
  }
});


function createColumn(name, columnId, boardId) {
  const column = document.createElement("div");
  column.className = "column";
  column.innerHTML = `
    <h3>${name}</h3>
    <div class="tasks" id="tasks-${columnId}"></div>
    <button class="add-task" data-column-id="${columnId}">Nova Tarefa</button>
    <button class="delete-column" data-column-id="${columnId}">Excluir Coluna</button>
  `;


  column.querySelector(".add-task").addEventListener("click", () => {
    const taskTitle = prompt("Digite o título da nova tarefa:");
    if (taskTitle) createTask(columnId, taskTitle);
  });


  column.querySelector(".delete-column").addEventListener("click", async () => {
    const confirmDelete = confirm("Tem certeza que deseja excluir esta coluna?");
    if (confirmDelete) await deleteColumn(columnId);
  });

  taskboard.appendChild(column);
  loadTasks(columnId);
}


async function loadTasks(columnId) {
  const tasksContainer = document.getElementById(`tasks-${columnId}`);
  tasksContainer.innerHTML = ""; // Clear current tasks

  try {
    const response = await fetch(`${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
    const tasks = await response.json();

    tasks.forEach((task) => {
      const taskElement = createTaskElement(task.Title, task.Id, columnId);
      tasksContainer.appendChild(taskElement);
    });
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
}


function createTaskElement(title, taskId, columnId) {
  const task = document.createElement("div");
  task.className = "task";
  task.innerHTML = `
    <span>${title}</span>
    <button class="edit-task" data-task-id="${taskId}">Editar</button>
    <button class="delete-task" data-task-id="${taskId}">Excluir</button>
  `;


  task.querySelector(".edit-task").addEventListener("click", async () => {
    const newTitle = prompt("Digite o novo título da tarefa:", title);
    if (newTitle) await updateTask(taskId, newTitle, columnId);
  });

  
  task.querySelector(".delete-task").addEventListener("click", async () => {
    const confirmDelete = confirm("Tem certeza que deseja excluir esta tarefa?");
    if (confirmDelete) await deleteTask(taskId, columnId);
  });

  return task;
}


async function createTask(columnId, title) {
  try {
    const response = await fetch(`${API_BASE_URL}/Task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Id: 0, 
        ColumnId: columnId,
        Title: title,
        Description: "",
        IsActive: true,
        CreatedBy: 1, 
        UpdatedBy: 1, 
      }),
    });

    if (response.ok) {
      loadTasks(columnId);
    } else {
      console.error("Erro ao criar tarefa:", await response.text());
    }
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
  }
}


async function updateTask(taskId, newTitle, columnId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Task`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Id: taskId,
        ColumnId: columnId,
        Title: newTitle,
        Description: "",
        IsActive: true,
        CreatedBy: 1, 
        UpdatedBy: 1,
      }),
    });

    if (response.ok) {
      loadTasks(columnId);
    } else {
      console.error("Erro ao atualizar tarefa:", await response.text());
    }
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
  }
}


async function deleteTask(taskId, columnId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Task?TaskId=${taskId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadTasks(columnId);
    } else {
      console.error("Erro ao excluir tarefa:", await response.text());
    }
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
  }
}


addColumnButton.addEventListener("click", async () => {
  const boardId = boardSelect.value;
  if (!boardId) {
    alert("Selecione um quadro primeiro!");
    return;
  }

  const columnName = prompt("Digite o nome da nova coluna:");
  if (columnName) {
    try {
      const response = await fetch(`${API_BASE_URL}/Column`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id: 0, 
          BoardId: boardId,
          Name: columnName,
          Position: 0, 
          IsActive: true,
          CreatedBy: 1, 
          UpdatedBy: 1, 
        }),
      });

      if (response.ok) {
        console.log("Coluna criada com sucesso!");
        boardSelect.dispatchEvent(new Event("change")); 
      } else {
        console.error("Erro ao criar coluna:", await response.text());
      }
    } catch (error) {
      console.error("Erro ao criar coluna:", error);
    }
  }
});


async function deleteColumn(columnId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Column?ColumnId=${columnId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Coluna excluída com sucesso!");
      boardSelect.dispatchEvent(new Event("change")); // Recarrega o quadro
    } else {
      console.error("Erro ao excluir coluna:", await response.text());
    }
  } catch (error) {
    console.error("Erro ao excluir coluna:", error);
  }
}


document.body.classList.add("light");
loadBoards();


const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
  localStorage.clear(); // Clear local storage
  sessionStorage.clear(); // Clear session storage
  window.location.href = "./index.html"; // Redirect to login page
});


const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.email) {
  window.location.href = "login.html"; // Redirect if not logged in
} else {
  const userEmailElement = document.querySelector(".user-controls span");
  userEmailElement.textContent = user.email;
}
