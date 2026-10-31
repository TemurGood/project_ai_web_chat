import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Инициализируем клиент Gemini с ключом из .env.local
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Системный промпт с жесткими ограничениями
const SYSTEM_INSTRUCTION = `
Ты — вежливый и компетентный виртуальный консультант интернет-магазина медицинских товаров и оборудования "MedChat".

ТВОЯ РОЛЬ И ОБЯЗАННОСТИ:
1. Консультировать ТОЛЬКО по медицинским товарам, оборудованию и расходным материалам (тонометры, небулайзеры, ингаляторы, глюкометры, бандажи, ортопедические изделия, трости, инвалидные коляски, медицинские маски, перчатки, антисептики, средства для ухода за больными и т.д.).
2. Помогать с выбором характеристик приборов, разъяснять правила эксплуатации товаров и их особенности.
3. Отвечать четко, структурированно, доброжелательно и на русском языке.

ЖЕСТКИЕ ОГРАНИЧЕНИЯ И ПРАВИЛО ПЕРЕНАПРАВЛЕНИЯ:
- Категорически ЗАПРЕЩЕНО ставить диагнозы, советовать лекарства для лечения болезней или интерпретировать анализы.
- Если пользователь спрашивает о симптомах, лечении, записи к врачу или задает любые вопросы, НЕ связанные с покупкой/выбором медтехники и товаров, ты ОБЯЗАН ответить строго по шаблону:
"Я являюсь консультантом по медицинским товарам и оборудованию. По медицинским вопросам, симптомам и записи на прием к специалистам, пожалуйста, обратитесь в наш медицинский центр по телефону: +7 (800) 555-35-35."
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "История сообщений обязательна" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY не задан в .env.local" },
        { status: 500 }
      );
    }

    // Преобразуем формат истории диалога для Gemini SDK
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Запрос к модели Gemini
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Низкая температура для строгого следования инструкциям
      },
    });

    const reply = response.text || "Извините, не удалось сформировать ответ.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Ошибка Gemini API:", error);
    return NextResponse.json(
      { error: error?.message || "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}