const socket = io()

socket.on('evento_para_todos', data => {
    console.log(data)
})

async function addToCart(productId) {
    try {
        const response = await fetch(`/api/carts/products/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.status === 'success') {
            console.log('Producto agregado al carrito');
            socket.emit('cartUpdated', result.cart); 
        } else {
            console.error('Error al agregar producto al carrito');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}