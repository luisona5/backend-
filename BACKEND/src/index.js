import app from './server.js'
import connection from './database.js';

// Conectar a la base de datos
connection()

const PORT = app.get('port');

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

