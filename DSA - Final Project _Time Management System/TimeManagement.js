
        // for time clock
        setInterval(() => {
            document.getElementById('timer').textContent = new Date().toLocaleTimeString();
        }, 1000);

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let finishedTasks = JSON.parse(localStorage.getItem('finishedTasks')) || [];
        let editingTaskIndex = null;

        function openTaskModal(index = null) {
            editingTaskIndex = index;
            const modal = document.getElementById('taskModal');
            if (index !== null) {
                const task = tasks[index];
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description;
                document.getElementById('taskStartTime').value = task.startTime;
                document.getElementById('taskEndTime').value = task.endTime;
                document.getElementById('taskDate').value = task.date;
                document.getElementById('taskPriority').value = task.priority;
            } else {
                document.querySelectorAll('#taskModal input, #taskModal select').forEach(e => e.value = "");
            }
            modal.classList.add('show');
            document.getElementById('overlay').classList.add('show');
        }

        function closeTaskModal() {
            document.getElementById('taskModal').classList.remove('show');
            document.getElementById('overlay').classList.remove('show');
        }

        function saveTask() {
            const task = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                startTime: document.getElementById('taskStartTime').value,
                endTime: document.getElementById('taskEndTime').value,
                date: document.getElementById('taskDate').value,
                priority: document.getElementById('taskPriority').value,
                timer: calculateTimer(document.getElementById('taskStartTime').value, document.getElementById('taskEndTime').value)
            };
            if (editingTaskIndex !== null) tasks[editingTaskIndex] = task;
            else tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            closeTaskModal();
        }

        function calculateTimer(startTime, endTime) {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            return (endH * 60 + endM - startH * 60 - startM) * 60; 
        }

        function renderTasks() {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = tasks.map((task, i) => `
                <div class="task-item ${task.priority}">
                    <div>
                        <strong>${task.title}</strong> - ${task.description} (${task.startTime} - ${task.endTime})
                    </div>
                    <div>Date: ${task.date}</div>
                    <div>Priority: ${task.priority}</div>
                    <div>Remaining Time: ${formatTime(task.timer)}</div>
                    <div>
                        <button class="finish-btn" onclick="finishTask(${i})">Finish</button>
                        <button class="edit-btn" onclick="openTaskModal(${i})">Edit</button>
                        <button class="delete-btn" onclick="deleteTask(${i})">Delete</button>
                        <button class="start-btn" onclick="startTask(${i})">Start</button>
                        <button class="stop-btn" onclick="stopTask(${i})">Stop</button>
                    </div>
                </div>
            `).join("");
        }

            function stopTask(index) {
            const task = tasks[index];
            if (task.interval) {
                clearInterval(task.interval);  
                task.interval = null;           
                localStorage.setItem('tasks', JSON.stringify(tasks));  
                renderTasks();  
            }
        }

            function viewTaskList(filter = "day") {
                const today = new Date();
                const taskList = document.getElementById('taskList');
                let filteredTasks = tasks;

                if (filter === "day") {
                    const selectedDate = today.toISOString().split('T')[0]; 
                    filteredTasks = tasks.filter(task => task.date === selectedDate); 
                } else if (filter === "week") {
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    const weekEnd = new Date(today.setDate(today.getDate() + 6)); 
                    filteredTasks = tasks.filter(task => {
                        const taskDate = new Date(task.date); 
                        return taskDate >= weekStart && taskDate <= weekEnd; 
                    });
                }

            
                taskList.innerHTML = filteredTasks.map(task => `
                    <div class="task-item ${task.priority}">
                        <div>
                            <strong>${task.title}</strong> - ${task.description} (${task.startTime} - ${task.endTime})
                        </div>
                        <div>Date: ${task.date}</div>
                        <div>Priority: ${task.priority}</div>
                    </div>
                `).join("");
    }

        // to clear finished task
        function renderFinishedTasks() {
            const finishedList = document.getElementById('finishedList');
            finishedList.innerHTML = finishedTasks.map(task => `
                <div class="task-item ${task.priority}">
                    <div>
                        <strong>${task.title}</strong> - ${task.description} (${task.startTime} - ${task.endTime})
                    </div>
                    <div>Date: ${task.date}</div>
                    <div>Priority: ${task.priority}</div>
                </div>
            `).join("");
        }

        function clearAllFinishedList() {
            localStorage.removeItem('finishedTasks'); 
            finishedTasks = []; 
            renderFinishedTasks(); 
        }

        // to clear finished task
        //   clearAllFinishedList()

        function startTask(index) {
            const task = tasks[index];
            if (!task.interval && task.timer > 0) {
                task.interval = setInterval(() => {
                    if (task.timer > 0) {
                        task.timer--;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        renderTasks();
                    } else {
                        clearInterval(task.interval);
                        task.interval = null;
                    }
                }, 1000);
            }
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            const remainingSeconds = seconds % 60;
            return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        function deleteTask(index) {
            tasks.splice(index, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }

        function finishTask(index) {
            const task = tasks.splice(index, 1)[0];
            finishedTasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('finishedTasks', JSON.stringify(finishedTasks));
            renderTasks();
            renderFinishedTasks();
        }

        function searchTasks() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const taskList = document.getElementById('taskList');

        const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
        );

        taskList.innerHTML = filteredTasks.map((task, index) => `
            <div class="task-item ${task.priority}">
            <div>
                <strong>${task.title}</strong> - ${task.description} (${task.startTime} - ${task.endTime})
            </div>
            <div>Date: ${task.date}</div>
            <div>Priority: ${task.priority}</div>
            <div>Remaining Time: ${formatTime(task.timer)}</div>
            <div>
                <button class="finish-btn" onclick="finishTask(${index})">Finish</button>
                <button class="edit-btn" onclick="openTaskModal(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
                <button class="start-btn" onclick="startTask(${index})">Start</button>
            </div>
        </div>
        `).join("");

        }
        document.addEventListener('DOMContentLoaded', () => {
            renderTasks();
            renderFinishedTasks();
        });
