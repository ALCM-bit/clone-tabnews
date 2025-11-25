function status(request, response) {
  response.status(200).json({ chave: "Resposta" });
}

export default status;
