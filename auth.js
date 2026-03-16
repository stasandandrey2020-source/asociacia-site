export async function onRequestPost({ request, env }) {
  const { action, email, password, fullName, phone, code } = await request.json();
  
  try {
    if (action === 'register') {
      if (code !== '000000') return new Response('Код неверный', { status: 400 });
      
      const { rows } = await env.DB.prepare(
        `INSERT INTO users (full_name, phone, email, password, role) 
         VALUES ($1, $2, $3, $4, 'user') RETURNING *`
      ).bind(fullName, phone, email, password).run();
      
      return new Response(JSON.stringify({ success: true, user: rows[0] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'login') {
      const { rows } = await env.DB.prepare(
        `SELECT * FROM users WHERE email = $1 AND password = $2`
      ).bind(email, password).run();
      
      if (rows.length === 0) {
        return new Response('Неверные данные', { status: 401 });
      }
      
      return new Response(JSON.stringify({ success: true, user: rows[0] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
