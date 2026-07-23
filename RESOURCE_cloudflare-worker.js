export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    let userInput = {};

    try {
      const bodyText = await request.text();

      if (bodyText) {
        userInput = JSON.parse(bodyText);
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body. Send a JSON object like {"messages":[...]}' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!userInput.messages || !Array.isArray(userInput.messages) || userInput.messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Please send a JSON body with a messages array.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const requestBody = {
      model: 'gpt-4o',
      messages: userInput.messages,
      max_completion_tokens: 300,
      temperature: 0.8,
      frequency_penalty: 0.7,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};