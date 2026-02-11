let contador = 0;

module.exports = async function (context, req) {
  contador++;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { numero: contador }
  };
};
