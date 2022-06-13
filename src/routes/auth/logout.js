export function post(req, res) {
  delete req.session.user;
  // return "logout";
  res.end(JSON.stringify({ ok: true }));
}
