export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Aseguramos compatibilidad entre entornos
        const body =
            req.body ||
            (await new Promise((resolve) => {
                let data = '';
                req.on('data', (chunk) => (data += chunk));
                req.on('end', () => resolve(JSON.parse(data || '{}')));
            }));

        const { claves, notas, resumen } = body;

        const prompt = `
Genera 5 preguntas de opción múltiple sobre el siguiente contenido de apuntes del método Cornell.
Cada pregunta debe tener 4 opciones (A, B, C, D) y especificar cuál es la correcta.
Usa lenguaje claro y educativo.

Palabras clave: ${claves || 'Ninguna'}
Notas principales: ${notas || 'Ninguna'}
Resumen: ${resumen || 'Ninguno'}

Devuelve SOLO un JSON válido como este:
[
  { "pregunta": "¿Qué es X?", "opciones": ["A", "B", "C", "D"], "correcta": "A" }
]
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            }),
        });

        const data = await response.json();

        const content = data.choices?.[0]?.message?.content || '[]';
        let preguntas = [];

        try {
            preguntas = JSON.parse(content);
        } catch {
            // Si el modelo devuelve texto con formato, intentamos extraer JSON
            const match = content.match(/\[[\s\S]*\]/);
            if (match) preguntas = JSON.parse(match[0]);
        }

        return res.status(200).json({ preguntas });
    } catch (error) {
        console.error('Error generando quiz:', error);
        return res.status(500).json({ error: 'Error generando el quiz' });
    }
}
