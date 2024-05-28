const socket = io()

socket.on('evento_para_todos', data => {
    console.log(data)
})